'use client';

import React, { useState } from 'react';
import WorkspaceList from '@/components/WorkspaceList';
import GlobalHomeHeader from '@/components/GlobalHomeHeader';
import WorkspaceFilterSection from '@/components/WorkspaceFilterSection';
import { useAuth } from '@/hooks/useAuth';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Landing Page Components
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import LivePreview from '@/components/landing/LivePreview';
import HowItWorks from '@/components/landing/HowItWorks';
import FAQ from '@/components/landing/FAQ';
import Reveal from '@/components/ui/Reveal';
import Pricing from '@/components/landing/Pricing';
import CTA from '@/components/landing/CTA';
import LandingFooter from '@/components/landing/Footer';

export default function GlobalHome() {
  const { user, isLoading } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'mine' | 'invited'>('all');
  const [search, setSearch] = useState('');

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

  // If NOT logged in, show the Landing Page
  if (!user) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden antialiased">
        <div className="relative z-10 w-full flex flex-col items-center pt-24 pb-2 px-6 gap-16 text-zinc-400">
          <Reveal delay={0.1}><Hero /></Reveal>
          <Reveal delay={0.2}><Features /></Reveal>
          <Reveal delay={0.3}><LivePreview /></Reveal>
          <Reveal delay={0.4}><HowItWorks /></Reveal>
          <Reveal delay={0.5}><Pricing /></Reveal>
          <Reveal delay={0.6}><FAQ /></Reveal>
          <Reveal delay={0.7}><CTA /></Reveal>
          <div className="w-full flex flex-col items-center gap-0">
            <div className="w-full max-w-7xl mx-auto px-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
            <LandingFooter />
          </div>
        </div>
      </div>
    );
  }

  // If logged in, show the Dashboard
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

            <WorkspaceFilterSection
              filterType={filterType}
              setFilterType={setFilterType}
              user={user}
            />
          </div>
        </GlobalHomeHeader>

        {/* Main Content Area */}
        <div className="mt-4">
          <WorkspaceList filterType={filterType} search={search} />
        </div>

      </div>
    </div>
  );
}
