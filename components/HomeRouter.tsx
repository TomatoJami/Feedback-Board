'use client';

import React from 'react';

import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/hooks/useAuth';

/**
 * Client-side router that shows either Landing page or Dashboard
 * based on auth state. The Landing page content is passed as children
 * from the Server Component parent.
 */
export default function HomeRouter({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // While auth is loading, show a skeleton
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-20 w-3/4 bg-white/5 rounded-2xl" />
          <div className="h-64 w-full bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  // If logged in, show Dashboard
  if (user) {
    return <Dashboard />;
  }

  // If not logged in, render the Landing page (passed as children from Server Component)
  return <>{children}</>;
}
