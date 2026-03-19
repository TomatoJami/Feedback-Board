'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PasswordField from '@/components/PasswordField';

export default function LoginPage() {
  const { user, isLoading, loginWithPassword, loginWithOAuth } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginWithPassword(email, password);
      router.push('/');
    } catch (err: any) {
      if (err?.status === 400 || err?.message?.includes('authenticate')) {
        setError('Неправильный email или пароль');
      } else {
        setError(err?.message || 'Ошибка входа');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async () => {
    setError('');
    try {
      await loginWithOAuth();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка OAuth2 авторизации';
      setError(message);
    }
  };

  if (isLoading) return null;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
          </div>
          <h1 className="auth-title">Вход</h1>
          <p className="auth-subtitle">Войдите, чтобы предлагать идеи и голосовать</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
            id="login-password"
            label="Пароль"
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="auth-submit"
            disabled={submitting}
          >
            {submitting ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="auth-divider">или</div>

        <button
          className="auth-oauth-btn"
          onClick={handleOAuth}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20M2 12h20" />
          </svg>
          Войти через Authentik
        </button>

        <div className="auth-footer">
          Нет аккаунта?{' '}
          <Link href="/auth/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
}
