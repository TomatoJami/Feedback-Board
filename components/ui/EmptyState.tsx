import { MagnifyingGlassIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

interface EmptyStateProps {
  isMine: boolean;
  isAdmin?: boolean;
  workspaceSlug?: string;
}

export default function EmptyState({ isMine, isAdmin, workspaceSlug }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-10 py-24 sm:py-32 text-center bg-zinc-900/40 rounded-[32px] border border-white/5 mt-8 mb-24">
      <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 relative group">
        <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {isMine ? (
          <PencilSquareIcon className="w-10 h-10 text-indigo-400 relative z-10" />
        ) : (
          <MagnifyingGlassIcon className="w-10 h-10 text-zinc-400 relative z-10" />
        )}
      </div>
      <h3 className="text-2xl font-bold text-white">
        {isMine ? 'У вас пока нет предложений' : 'Ничего не найдено'}
      </h3>
      <p className="text-zinc-500 max-w-sm mx-auto mt-4 text-lg leading-relaxed">
        {isMine
          ? 'Создайте своё первое предложение!'
          : 'Попробуйте изменить фильтры или станьте первым, кто предложит идею!'}
      </p>

      {workspaceSlug && (
        <div className="mt-8 flex justify-center w-full">
          <Link 
            href={`/w/${workspaceSlug}/suggestions/new`} 
            className="btn btn-primary w-full sm:w-auto"
            style={{ padding: '12px 28px', fontSize: '1rem', justifyContent: 'center' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon w-5 h-5 mr-2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Предложить идею
          </Link>
        </div>
      )}

      {isAdmin && workspaceSlug && !isMine && (
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link 
            href={`/w/${workspaceSlug}/admin`} 
            className="btn btn-ghost"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            Настроить категории
          </Link>
          <Link 
            href={`/w/${workspaceSlug}/admin`} 
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.9rem' }}
          >
            Настроить статусы
          </Link>
        </div>
      )}
    </div>
  );
}
