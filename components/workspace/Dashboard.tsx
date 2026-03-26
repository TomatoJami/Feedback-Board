'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import GlobalHomeHeader from '@/components/workspace/GlobalHomeHeader';
import WorkspaceFilterSection from '@/components/workspace/WorkspaceFilterSection';
import WorkspaceList from '@/components/workspace/WorkspaceList';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'mine' | 'invited'>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="w-full py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">

        {/* Header and Filters stacked vertically */}
        <GlobalHomeHeader filterType={filterType}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
            {/* Search Input */}
            <div className="relative w-full max-w-lg">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Поиск по пространствам..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full transition-all outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px 12px 42px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div className="flex-shrink-0">
              <WorkspaceFilterSection
                filterType={filterType}
                setFilterType={setFilterType}
                user={user as User}
              />
            </div>
          </div>
        </GlobalHomeHeader>

        {/* Main Content Area */}
        <div className="mt-4">
          <WorkspaceList filterType={filterType} search={debouncedSearch} />
        </div>

      </div>
    </div>
  );
}
