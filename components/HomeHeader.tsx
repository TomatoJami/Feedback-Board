import React from 'react';

interface HomeHeaderProps {
  isMine: boolean;
}

export default function HomeHeader({ isMine }: HomeHeaderProps) {
  return (
    <div className="page-header flex-col items-start gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {isMine ? 'Мои предложения' : 'Предложения'}
        </h1>
        <p className="text-zinc-400">
          {isMine
            ? 'Все предложения, которые вы создали.'
            : 'Помогайте нам становиться лучше, голосуя за любимые идеи.'}
        </p>
      </div>
    </div>
  );
}
