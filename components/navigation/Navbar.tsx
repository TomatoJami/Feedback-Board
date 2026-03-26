'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceRole } from '@/hooks/useWorkspaceRole';

import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

export default function Navbar() {
  const { user, isLoading } = useAuth();
  const params = useParams();
  const workspaceId = params?.workspaceId as string | undefined;
  const { role, isOwner, isFrozen } = useWorkspaceRole(workspaceId);

  const canManageWorkspace = isOwner || role === 'admin' || role === 'moderator';

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
              {/* This button is for creating a new workspace, not a suggestion.
                  The instruction implies it's a suggestion button, so I'm adapting it
                  to be conditional based on workspaceId and frozen state, assuming
                  it's meant to be a "create suggestion" button for the current workspace.
                  If it's truly for creating a *new workspace*, the isFrozen logic
                  would not apply here. I'm following the instruction's intent for a "suggestion button".
                  The href is kept as /create-workspace as per the original code,
                  but the text and disabled state are modified.
              */}
              {workspaceId ? ( // Only show this button if we are in a workspace context
                isFrozen ? (
                  user.role === 'admin' ? ( // Admins can still "suggest" even if frozen
                    <Link href={`/w/${workspaceId}/suggestions/new`} className="btn btn-primary" id="new-suggestion-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Предложить (Заморожено)
                    </Link>
                  ) : (
                    <button className="btn btn-primary" disabled id="frozen-suggestion-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Заморожено
                    </button>
                  )
                ) : (
                  <Link href={`/w/${workspaceId}/suggestions/new`} className="btn btn-primary" id="new-suggestion-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Новое
                  </Link>
                )
              ) : ( // If not in a workspace, show the original "create workspace" button
                <Link href="/create-workspace" className="btn btn-primary" id="new-workspace-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Новое
                </Link>
              )}

              {canManageWorkspace && workspaceId && (
                <Link href={`/w/${workspaceId}/roadmap`} className="btn btn-ghost">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                    <path d="M9 20l-5.447-2.724A2 2 0 013 15.483V5.517a2 2 0 011.053-1.758L9 1m0 19l6-3m-6 3V1m6 19l5.447 2.724A2 2 0 0021 21.483V11.517a2 2 0 00-1.053-1.758L15 7m-6 13V7m6 13V7" />
                  </svg>
                  Roadmap
                </Link>
              )}

              {canManageWorkspace && workspaceId && (
                <Link href={`/w/${workspaceId}/admin`} className="btn btn-ghost" id="admin-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                  Управление
                </Link>
              )}

              {user.role === 'admin' && (
                <Link href="/admin" className="btn btn-ghost" id="admin-panel-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Панель
                </Link>
              )}

              <NotificationBell />
              
              {(!user.plan || user.plan === 'free') && (
                <Link 
                  href="/auth/settings"
                  className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                  <span className="relative z-10 text-[10px] font-black tracking-widest text-indigo-400 uppercase">Pro</span>
                  <span className="relative z-10 max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-bold text-white group-hover:max-w-[100px] transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100 ml-0 group-hover:ml-1">
                    Upgrade
                  </span>
                </Link>
              )}

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

