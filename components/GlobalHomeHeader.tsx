import React from 'react';

interface GlobalHomeHeaderProps {
  filterType: 'all' | 'mine' | 'invited';
}

export default function GlobalHomeHeader({ filterType }: GlobalHomeHeaderProps) {
  const titles = {
    all: 'Все пространства',
    mine: 'Мои пространства',
    invited: 'Доступные мне'
  };

  const descriptions = {
    all: 'Список всех публичных досок для обратной связи. Находите интересные продукты и делитесь идеями.',
    mine: 'Пространства, где вы являетесь владельцем.',
    invited: 'Закрытые или публичные пространства, в которые вас пригласили.'
  };

  return (
    <div className="page-header flex-col items-start gap-4 sm:flex-row sm:items-end mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">
          {titles[filterType]}
        </h1>
        <p className="text-zinc-400">
          {descriptions[filterType]}
        </p>
      </div>
    </div>
  );
}
