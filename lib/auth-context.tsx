'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import pb from '@/lib/pocketbase';
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
    role: (record as unknown as Record<string, string>).role ?? 'user',
    created: record.created,
    updated: record.updated,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncCookie = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.cookie = pb.authStore.exportToCookie({ httpOnly: false, sameSite: 'Lax', path: '/' });
    }
  }, []);

  useEffect(() => {
    async function initAuth() {
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
      } catch (err) {
        console.error('Auth refresh failed:', err);
        pb.authStore.clear();
        setUser(null);
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
    await pb.collection('users').authWithPassword(email, password);
    syncCookie();
  }, [syncCookie]);

  const loginWithOAuth = useCallback(async () => {
    try {
      await pb.collection('users').authWithOAuth2({ 
        provider: 'oidc',
        requestKey: null,
      });
      syncCookie();
    } catch (err) {
      console.error('OAuth2 login failed:', err);
      throw err;
    }
  }, [syncCookie]);

  const register = useCallback(async (name: string, email: string, password: string, passwordConfirm: string) => {
    await pb.collection('users').create({
      name,
      email,
      password,
      passwordConfirm,
    });
    await pb.collection('users').authWithPassword(email, password);
    syncCookie();
  }, [syncCookie]);

  const logout = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
    if (typeof document !== 'undefined') {
      document.cookie = 'pb_auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, loginWithPassword, loginWithOAuth, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
