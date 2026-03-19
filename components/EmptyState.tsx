import React from 'react';

interface EmptyStateProps {
  isMine: boolean;
}

export default function EmptyState({ isMine }: EmptyStateProps) {
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
    </div>
  );
}
