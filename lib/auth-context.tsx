'use client';

import { usePathname,useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useRef,useState } from 'react';
import toast from 'react-hot-toast';

import { clearAuthCookie, syncAuthCookie } from '@/lib/auth/cookie-sync';
import { logger } from '@/lib/logger';
import pb from '@/lib/pocketbase';
import * as authService from '@/lib/services/auth.service';
import type { User } from '@/types';

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
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLoggingOut = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth on mount
  useEffect(() => {
    async function initAuth() {
      if (isLoggingOut.current) return;
      try {
        if (pb.authStore.isValid) {
          const authData = await authService.refreshAuth();
          setUser(authService.mapAuthRecord(authData.record));
          syncAuthCookie();
        } else {
          setUser(null);
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
          authService.clearAuth();
          setUser(null);
        } else {
          // Use cached auth record as fallback
          const record = pb.authStore.record;
          if (record) {
            setUser(authService.mapAuthRecord(record));
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(authService.mapAuthRecord(record));
      syncAuthCookie();
    });

    return () => { unsubscribe(); };
  }, []);

  const loginWithPassword = useCallback(async (email: string, password: string) => {
    try {
      await authService.loginWithPassword(email, password);
      syncAuthCookie();
      toast.success('С возвращением!');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'status' in err && err.status === 400) {
        toast.error('Неправильный email или пароль');
      } else {
        toast.error('Ошибка входа');
      }
      throw err;
    }
  }, []);

  const loginWithOAuth = useCallback(async () => {
    try {
      const methods = await pb.collection('users').listAuthMethods();
      logger.info(`Available auth methods in PB: ${JSON.stringify(methods, null, 2)}`);

      logger.info('Starting OAuth2 flow with provider: google');
      const response = await authService.loginWithOAuth();
      logger.info(`OAuth2 response received: ${JSON.stringify(response, null, 2)}`);
      syncAuthCookie();
    } catch (err: unknown) {
      logger.error(`OAuth2 FULL ERROR details: ${JSON.stringify(err, null, 2)}`);
      logger.error('OAuth2 login failed:', err);
      throw err;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, passwordConfirm: string) => {
    try {
      await authService.registerUser(name, email, password, passwordConfirm);
      syncAuthCookie();
      toast.success('Регистрация успешна!');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'status' in err && err.status === 400) {
        toast.error('Некорректные данные или пользователь уже существует');
      } else {
        toast.error('Ошибка регистрации');
      }
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    isLoggingOut.current = true;
    authService.clearAuth();
    setUser(null);
    clearAuthCookie();
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
