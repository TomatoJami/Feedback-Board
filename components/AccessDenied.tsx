'use client';

import React from 'react';
import Link from 'next/link';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showLogin?: boolean;
  showHome?: boolean;
}

export default function AccessDenied({ 
  title = 'Доступ запрещён',
  message = 'У вас нет прав для просмотра этой страницы.',
  showLogin = false,
  showHome = true,
}: AccessDeniedProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '40px 20px',
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '20px',
        background: 'rgba(244, 63, 94, 0.1)',
        border: '1px solid rgba(244, 63, 94, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '8px',
      }}>
        {title}
      </h2>

      <p style={{
        fontSize: '0.95rem',
        color: 'var(--text-secondary)',
        maxWidth: '400px',
        lineHeight: 1.6,
        marginBottom: '32px',
      }}>
        {message}
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        {showHome && (
          <Link
            href="/"
            className="btn btn-ghost"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            На главную
          </Link>
        )}
        {showLogin && (
          <Link
            href="/auth/login"
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.9rem' }}
          >
            Войти
          </Link>
        )}
      </div>
    </div>
  );
}
