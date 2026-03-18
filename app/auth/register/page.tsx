'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PasswordField from '@/components/PasswordField';

export default function RegisterPage() {
  const { user, isLoading, register } = useAuth();
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

  const handleSubmit = async (e: FormEvent) => {
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
    } catch (err: any) {
      if (err?.status === 400 || err?.message?.includes('duplicate')) {
        setError('Пользователь с таким email уже существует или данные неверны');
      } else {
        const message = err instanceof Error ? err.message : 'Ошибка при регистрации';
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="auth-container">
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
              onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
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

        <div className="auth-footer">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login">Войти</Link>
        </div>
      </div>
    </div>
  );
}
