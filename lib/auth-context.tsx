'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';
import pb from '@/lib/pocketbase';
import { logger } from './logger';
import type { User } from '@/types';
import type { AuthRecord } from 'pocketbase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  loginWithOAuth: () => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  loginWithPassword: async () => {},
  loginWithOAuth: async () => {},
  register: async () => {},
  logout: async () => {}, // Changed to async to match standard if needed, or keeping it void
});

function mapAuthRecord(record: AuthRecord | null): User | null {
  if (!record) return null;
  return {
    id: record.id,
    collectionId: record.collectionId,
    collectionName: record.collectionName,
    email: record.email ?? '',
    name: record.name ?? '',
    avatar: record.avatar ?? '',
    role: (record as any).role ?? 'user',
    status: (record as any).status ?? 'active',
    plan: (record as any).plan ?? 'free',
    created: record.created,
    updated: record.updated,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLoggingOut = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  const syncCookie = useCallback(() => {
    if (typeof document !== 'undefined') {
      if (pb.authStore.isValid && pb.authStore.token && pb.authStore.record) {
        // Build a minimal cookie that fits within the 4KB browser limit.
        // exportToCookie() includes the entire user record and easily exceeds 4KB.
        const minimalData = JSON.stringify({
          token: pb.authStore.token,
          record: {
            id: pb.authStore.record.id,
            collectionId: pb.authStore.record.collectionId,
            role: (pb.authStore.record as any).role ?? 'user',
            status: (pb.authStore.record as any).status ?? 'active',
            plan: (pb.authStore.record as any).plan ?? 'free',
          },
        });
        document.cookie = `pb_auth=${encodeURIComponent(minimalData)}; path=/; SameSite=Lax; max-age=2592000`;
      } else {
        // Clear cookie when not authenticated
        document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    }
  }, []);

  useEffect(() => {
    async function initAuth() {
      if (isLoggingOut.current) return;
      try {
        if (pb.authStore.isValid) {
          const authData = await pb.collection('users').authRefresh({
             requestKey: null 
          });
          setUser(mapAuthRecord(authData.record));
          syncCookie();
        } else {
          setUser(null);
        }
      } catch (err: any) {
        // Only clear auth if the server explicitly rejected the token (401)
        // Any other error (network, abort, hard refresh) → keep cached session
        if (err?.status === 401) {
          pb.authStore.clear();
          setUser(null);
        } else {
          // Use cached auth record as fallback
          const record = pb.authStore.record;
          if (record) {
            setUser(mapAuthRecord(record));
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(mapAuthRecord(record));
      syncCookie();
    });

    return () => { unsubscribe(); };
  }, [syncCookie]);

  const loginWithPassword = useCallback(async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password);
      syncCookie();
      toast.success('С возвращением!');
    } catch (err: any) {
      if (err?.status === 400) {
        toast.error('Неправильный email или пароль');
      } else {
        toast.error('Ошибка входа');
      }
      throw err;
    }
  }, [syncCookie]);

  const loginWithOAuth = useCallback(async () => {
    try {
      const methods = await pb.collection('users').listAuthMethods();
      console.log('Available auth methods in PB:', JSON.stringify(methods, null, 2));

      console.log('Starting OAuth2 flow with provider: google');
      const response = await pb.collection('users').authWithOAuth2({ 
        provider: 'google',
        requestKey: null,
        createData: {
          role: 'user',
          status: 'active',
          plan: 'free',
          emailVisibility: true,
        }
      });
      console.log('OAuth2 response received:', response);
      syncCookie();
    } catch (err: any) {
      console.error('OAuth2 FULL ERROR details:', JSON.stringify(err, null, 2));
      logger.error('OAuth2 login failed:', err);
      throw err;
    }
  }, [syncCookie]);

  const register = useCallback(async (name: string, email: string, password: string, passwordConfirm: string) => {
    try {
      await pb.collection('users').create({
        name,
        email,
        password,
        passwordConfirm,
        emailVisibility: true,
        role: 'user',
        status: 'active',
        plan: 'free',
      });
      await pb.collection('users').authWithPassword(email, password);
      syncCookie();
      toast.success('Регистрация успешна!');
    } catch (err: any) {
      if (err?.status === 400) {
        toast.error('Некорректные данные или пользователь уже существует');
      } else {
        toast.error('Ошибка регистрации');
      }
      throw err;
    }
  }, [syncCookie]);

  const logout = useCallback(() => {
    isLoggingOut.current = true;
    pb.authStore.clear();
    setUser(null);
    if (typeof document !== 'undefined') {
      document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    toast.success('Вы вышли из системы');
    router.push('/');
    setTimeout(() => {
      isLoggingOut.current = false;
    }, 500);
  }, [router]);

  const isAdmin = user?.role === 'admin';

  // Handle blocked user redirection
  useEffect(() => {
    if (isLoading) return;
    
    if (user?.status === 'blocked') {
      if (pathname !== '/blocked') {
        router.replace('/blocked');
      }
    } else if (pathname === '/blocked') {
      // If not blocked but on /blocked page, go home
      router.replace('/');
    }
  }, [user, isLoading, router, pathname]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, loginWithPassword, loginWithOAuth, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
