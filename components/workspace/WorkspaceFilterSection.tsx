import { Squares2X2Icon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import React from 'react';

import type { User } from '@/types';

interface WorkspaceFilterSectionProps {
  filterType: 'all' | 'mine' | 'invited';
  setFilterType: (type: 'all' | 'mine' | 'invited') => void;
  user: User | null;
}

export default function WorkspaceFilterSection({
  filterType,
  setFilterType,
  user
}: WorkspaceFilterSectionProps) {
  return (
    <div className="filters-bar">
      <button
        className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
        onClick={() => setFilterType('all')}
      >
        <Squares2X2Icon className="w-[14px] h-[14px]" /> Все
      </button>
      {user && (
        <React.Fragment>
          <button
            className={`filter-chip ${filterType === 'mine' ? 'active' : ''}`}
            onClick={() => setFilterType('mine')}
          >
            <UserIcon className="w-[14px] h-[14px]" /> Мои
          </button>
          <button
            className={`filter-chip ${filterType === 'invited' ? 'active' : ''}`}
            onClick={() => setFilterType('invited')}
          >
            <UserGroupIcon className="w-[14px] h-[14px]" /> Приглашен
          </button>
        </React.Fragment>
      )}
    </div>
  );
}
