import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

interface GlobalHomeHeaderProps {
  filterType: 'all' | 'mine' | 'invited';
}

export default function GlobalHomeHeader({ filterType, children }: { filterType: 'all' | 'mine' | 'invited', children?: React.ReactNode }) {
  const { user } = useAuth();
  
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
    <div className="flex flex-col items-start gap-4 mb-4 w-full">
      <h1 className="text-3xl font-bold text-white">
        {titles[filterType]}
      </h1>

      <p className="text-zinc-400 max-w-2xl">
        {descriptions[filterType]}
      </p>

      <div className="flex flex-col gap-4 w-full">
        {children}
      </div>
    </div>
  );
}
