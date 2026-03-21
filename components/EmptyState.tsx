import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  isMine: boolean;
  isAdmin?: boolean;
  workspaceSlug?: string;
}

export default function EmptyState({ isMine, isAdmin, workspaceSlug }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-10 py-24 sm:py-32 text-center bg-zinc-900/40 rounded-[32px] border border-white/5 mt-8">
      <span className="text-5xl mb-6">{isMine ? '📝' : '🔍'}</span>
      <h3 className="text-2xl font-bold text-white">
        {isMine ? 'У вас пока нет предложений' : 'Ничего не найдено'}
      </h3>
      <p className="text-zinc-500 max-w-sm mx-auto mt-4 text-lg leading-relaxed">
        {isMine
          ? 'Создайте своё первое предложение!'
          : 'Попробуйте изменить фильтры или станьте первым, кто предложит идею!'}
      </p>

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
