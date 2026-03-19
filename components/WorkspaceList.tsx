'use client';

import React, { useMemo, useState } from 'react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useAuth } from '@/hooks/useAuth';
import WorkspaceCard from '@/components/WorkspaceCard';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface WorkspaceListProps {
  filterType: 'all' | 'mine' | 'invited';
}

export default function WorkspaceList({ filterType }: WorkspaceListProps) {
  const { workspaces, invitedWorkspaceIds, isLoading } = useWorkspaces();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter((w) => {
      const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
      
      let passFilter = false;
      if (filterType === 'all') {
        passFilter = !w.isPrivate || (user && w.owner === user.id) || invitedWorkspaceIds.includes(w.id);
      } else if (filterType === 'mine') {
        passFilter = !!(user && w.owner === user.id);
      } else if (filterType === 'invited') {
        passFilter = invitedWorkspaceIds.includes(w.id);
      }

      return matchesSearch && passFilter;
    });
  }, [workspaces, search, user, filterType, invitedWorkspaceIds]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 w-full bg-white/5 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      
      <div className="relative w-full max-w-lg">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkspaces.length === 0 ? (
          <div className="col-span-full py-16 text-center" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              <MagnifyingGlassIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Ничего не найдено</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Попробуйте изменить параметры поиска или создайте новое пространство.</p>
          </div>
        ) : (
          filteredWorkspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))
        )}
      </div>
    </div>
  );
}
