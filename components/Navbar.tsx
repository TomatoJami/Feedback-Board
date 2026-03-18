'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

export default function Navbar() {
  const { user, isAdmin, isLoading } = useAuth();

  return (
    <nav className="navbar" id="main-nav">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <svg className="navbar-logo" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
            <path d="M10 16l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <span className="navbar-title">Feedback Board</span>
        </Link>

        <div className="navbar-actions">
          {isLoading ? (
            <div className="navbar-skeleton" />
          ) : user ? (
            <>
              <Link href="/suggestions/new" className="btn btn-primary" id="new-suggestion-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Предложить
              </Link>

              {isAdmin && (
                <Link href="/admin" className="btn btn-ghost" id="admin-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                  Админ
                </Link>
              )}

              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <Link href="/auth/login" className="btn btn-primary" id="login-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
              Войти
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

