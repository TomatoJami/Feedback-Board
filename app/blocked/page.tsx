'use client';

import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { useAuth } from '@/hooks/useAuth';

export default function BlockedPage() {
  const { user, logout } = useAuth();

  // If user is not blocked (or not logged in), redirect to home
  // But wait, if they are not logged in, they shouldn't be here either.
  // Actually, we want this page to be accessible only to blocked users or as a destination for blocking.

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#ef4444'
        }}>
          <ShieldExclamationIcon style={{ width: '40px', height: '40px' }} />
        </div>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'white',
          marginBottom: '16px'
        }}>
          Доступ ограничен
        </h1>

        <p style={{
          color: '#a1a1aa',
          fontSize: '1rem',
          lineHeight: '1.6',
          marginBottom: '32px'
        }}>
          Ваш аккаунт ({user?.email}) был заблокирован администратором системы. 
          Если вы считаете, что это произошло по ошибке, пожалуйста, свяжитесь с поддержкой.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => logout()}
            style={{
              width: '100%',
              background: 'white',
              color: 'black',
              border: 'none',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Выйти из системы
          </button>
        </div>
      </div>
    </div>
  );
}
