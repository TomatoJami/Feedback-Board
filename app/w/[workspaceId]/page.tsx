'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import FilterSection from '@/components/suggestions/FilterSection';
import SuggestionCard from '@/components/suggestions/SuggestionCard';
import SuggestionSkeleton from '@/components/suggestions/SuggestionSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import HomeHeader from '@/components/workspace/HomeHeader';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useRealtimeSuggestions } from '@/hooks/useRealtimeSuggestions';
import { useStatuses } from '@/hooks/useStatuses';
import { useWorkspaceRole } from '@/hooks/useWorkspaceRole';
import pb from '@/lib/pocketbase';

type CategoryFilter = 'All' | 'Mine' | string; // id of category
type StatusFilter = 'All' | string; // id or standard value
type SortSortSelection = 'votes' | 'newest' | 'oldest';

const PAGE_SIZE = 20;

function HomeContent() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;

  const { suggestions, isLoading: suggestionsLoading } = useRealtimeSuggestions(workspaceId);
  const { categories, isLoading: categoriesLoading } = useCategories(workspaceId);
  const { statuses, isLoading: statusesLoading } = useStatuses(workspaceId);
  const { user, isLoading: authLoading } = useAuth();

  const [categoryId, setCategoryId] = useState<CategoryFilter>('All');
  const [status, setStatus] = useState<StatusFilter>('All');
  const [sortBy, setSortBy] = useState<SortSortSelection>('votes');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(true);
  const { role: workspaceRole, isOwner: isWorkspaceOwner, isFrozen } = useWorkspaceRole(workspaceId);

  // Comment counts
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    async function checkAccess() {
      try {
        await pb.collection('workspaces').getFirstListItem(`slug = "${workspaceId}"`, { requestKey: null });
        setCheckingAccess(false);
      } catch (__err: unknown) {
        if (!user) {
          router.push('/auth/login');
        } else {
          router.push('/');
        }
      }
    }
    if (!authLoading) checkAccess();
  }, [workspaceId, user, authLoading, router]);

  // Fetch comment counts
  useEffect(() => {
    if (suggestions.length === 0) return;
    (async () => {
      try {
        const records = await pb.collection('comments').getFullList({
          fields: 'suggestion',
          filter: suggestions.map(s => `suggestion = "${s.id}"`).join(' || '),
          requestKey: null,
        });
        const counts: Record<string, number> = {};
        for (const r of records) {
          counts[r.suggestion] = (counts[r.suggestion] || 0) + 1;
        }
        setCommentCounts(counts);
      } catch (_err) {
        // non-critical, skip
      }
    })();
  }, [suggestions]);

  const filteredSuggestions = useMemo(() => {
    const result = suggestions.filter((s) => {
      const categoryMatch =
        categoryId === 'All' ||
        (categoryId === 'Mine' ? (user && s.author === user.id) : s.category_id === categoryId);

      const suggestionEffectiveStatus = s.status_id || 'None';
      const statusMatch = status === 'All' || suggestionEffectiveStatus === status;

      const searchMatch = !debouncedSearch ||
        s.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(debouncedSearch.toLowerCase());

      return categoryMatch && statusMatch && searchMatch;
    });

    // Sorting
    const sorted = result.sort((a, b) => {
      if (sortBy === 'votes') {
        const scoreA = (a.votes_count || 0);
        const scoreB = (b.votes_count || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      }
      if (sortBy === 'newest') {
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created).getTime() - new Date(b.created).getTime();
      }
      return 0;
    });

    // Pinned always on top
    const pinned = sorted.filter(s => s.pinned);
    const unpinned = sorted.filter(s => !s.pinned);
    return [...pinned, ...unpinned];
  }, [suggestions, categoryId, status, user, sortBy, debouncedSearch]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [categoryId, status, sortBy, debouncedSearch]);

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filteredSuggestions.length));
  }, [filteredSuggestions.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const visibleSuggestions = filteredSuggestions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSuggestions.length;

  const isMine = categoryId === 'Mine';
  const isLoading = suggestionsLoading || categoriesLoading || statusesLoading || checkingAccess;

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-12">
        <div className="h-12 w-64 bg-zinc-800/50 animate-pulse rounded-xl" />
        <div className="h-14 w-full bg-zinc-800/50 animate-pulse rounded-xl" />
        <div className="suggestions-list grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SuggestionSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-12">
      {isFrozen && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: '#ef4444', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0110 0v4"></path>
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fca5a5' }}>Пространство заморожено</h3>
            <p style={{ fontSize: '0.9rem', color: '#fecaca' }}>Новые предложения временно не принимаются. Вы можете просматривать и голосовать за существующие.</p>
          </div>
        </div>
      )}
      <HomeHeader isMine={isMine} />
      <FilterSection
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        status={status}
        setStatus={setStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        statuses={statuses}
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="suggestions-list grid gap-6">
        {filteredSuggestions.length === 0 ? (
          <EmptyState
            isMine={isMine}
            isAdmin={isWorkspaceOwner || workspaceRole === 'admin'}
            workspaceSlug={workspaceId}
          />
        ) : (
          <>
            {visibleSuggestions.map((suggestion, index) => (
              <div key={suggestion.id} style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}>
                <SuggestionCard
                  suggestion={suggestion}
                  workspaceSlug={workspaceId}
                  commentsCount={commentCounts[suggestion.id]}
                />
              </div>
            ))}
            {hasMore && (
              <div ref={sentinelRef} style={{ height: '1px' }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="w-full flex flex-col gap-12">
        <div className="h-12 w-64 bg-zinc-800/50 animate-pulse rounded-xl" />
        <div className="h-14 w-full bg-zinc-800/50 animate-pulse rounded-xl" />
        <div className="suggestions-list grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SuggestionSkeleton key={i} />
          ))}
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}