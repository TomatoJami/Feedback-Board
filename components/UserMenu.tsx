'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { getAvatarColor } from '@/lib/utils';


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
          {(!user.plan || user.plan === 'free') && (
            <Link 
              href="/auth/settings"
              onClick={() => setOpen(false)}
              className="m-2 p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/5 hover:border-indigo-500/30 transition-all group/banner relative overflow-hidden block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 opacity-0 group-hover/banner:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Pro Plan</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500 text-white font-bold leading-none transform group-hover/banner:scale-110 transition-transform">Get 20% Off</span>
              </div>
              <div className="text-[13px] font-bold text-white mb-0.5 group-hover/banner:text-indigo-300 transition-colors">Улучшить до Pro</div>
              <div className="text-[11px] text-zinc-500 leading-tight">Разблокируйте приватные доски и кастомные роли</div>
            </Link>
          )}

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
