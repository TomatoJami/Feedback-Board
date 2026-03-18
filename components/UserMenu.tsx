'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { POCKETBASE_URL } from '@/lib/pocketbase';

// Deterministic color from user ID
function getAvatarColor(id: string): string {
  const colors = [
    '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!user) return null;

  const color = getAvatarColor(user.id);
  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        className="user-avatar-btn"
        onClick={() => setOpen(!open)}
        style={{ 
          background: user.avatar ? 'transparent' : color,
          padding: 0,
          overflow: 'hidden'
        }}
        title={user.name || user.email}
        id="user-menu-btn"
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={`${POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`} 
            alt={user.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : initial}
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-header">
            <div className="user-dropdown-avatar" style={{ 
              background: user.avatar ? 'transparent' : color,
              padding: 0,
              overflow: 'hidden'
            }}>
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={`${POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`} 
                  alt={user.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : initial}
            </div>
            <div>
              <div className="user-dropdown-name">{user.name || 'Пользователь'}</div>
              <div className="user-dropdown-email">{user.email}</div>
            </div>
          </div>

          <div className="user-dropdown-divider" />

          <Link
            href="/auth/settings"
            className="user-dropdown-item"
            onClick={() => setOpen(false)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Настройки
          </Link>

          <div className="user-dropdown-divider" />

          <button
            className="user-dropdown-item user-dropdown-logout"
            onClick={() => { logout(); setOpen(false); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
