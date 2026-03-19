'use client';

import React, { useState } from 'react';
import WorkspaceList from '@/components/WorkspaceList';
import GlobalHomeHeader from '@/components/GlobalHomeHeader';
import WorkspaceFilterSection from '@/components/WorkspaceFilterSection';
import { useAuth } from '@/hooks/useAuth';

export default function GlobalHome() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'mine' | 'invited'>('all');

  return (
    <div className="w-full max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        
        {/* Header and Filters stacked vertically */}
        <div className="flex flex-col gap-2">
          <GlobalHomeHeader filterType={filterType} />
          <WorkspaceFilterSection
            filterType={filterType}
            setFilterType={setFilterType}
            user={user}
          />
        </div>

        {/* Main Content Area */}
        <div className="mt-4">
          <WorkspaceList filterType={filterType} />
        </div>

      </div>
    </div>
  );
}
