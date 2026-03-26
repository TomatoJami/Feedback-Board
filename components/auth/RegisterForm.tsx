'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect,useState } from 'react';

import PasswordField from '@/components/ui/PasswordField';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterForm() {
  const { user, isLoading, register, loginWithOAuth } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleOAuth = async () => {
    setError('');
    try {
      await loginWithOAuth();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка OAuth2 авторизации';
      setError(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password, passwordConfirm);
      router.push('/');
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      if (error.status === 400 || error.message?.includes('duplicate')) {
        setError('Пользователь с таким email уже существует или данные неверны');
      } else {
        const message = error.message || 'Ошибка при регистрации';
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v-2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </div>
        <h1 className="auth-title">Регистрация</h1>
        <p className="auth-subtitle">Создайте аккаунт, чтобы начать</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="reg-name">Имя</label>
          <input
            id="reg-name"
            className="auth-input"
            type="text"
            placeholder="Ваше имя"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            className="auth-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <PasswordField
          id="reg-password"
          label="Пароль"
          value={password}
          onChange={setPassword}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Минимум 8 символов"
        />

        <PasswordField
          id="reg-password-confirm"
          label="Подтвердите пароль"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Повторите пароль"
        />

        <button
          type="submit"
          className="auth-submit"
          disabled={submitting}
        >
          {submitting ? 'Создание...' : 'Создать аккаунт'}
        </button>
      </form>

      <div className="auth-divider">или</div>

      <button
        className="auth-oauth-btn google"
        onClick={handleOAuth}
        type="button"
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Войти через Google
      </button>

      <div className="auth-footer">
        Уже есть аккаунт?{' '}
        <Link href="/auth/login">Войти</Link>
      </div>
    </div>
  );
}
