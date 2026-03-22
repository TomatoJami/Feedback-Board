'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useRealtimeSuggestions } from '@/hooks/useRealtimeSuggestions';
import { useCategories } from '@/hooks/useCategories';
import { useStatuses } from '@/hooks/useStatuses';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import pb, { POCKETBASE_URL } from '@/lib/pocketbase';
import SuggestionCard from '@/components/SuggestionCard';
import SuggestionSkeleton from '@/components/SuggestionSkeleton';
import HomeHeader from '@/components/HomeHeader';
import FilterSection from '@/components/FilterSection';
import EmptyState from '@/components/EmptyState';

type CategoryFilter = 'All' | 'Mine' | string; // id of category
type StatusFilter = 'All' | string; // id or standard value
type SortSortSelection = 'votes' | 'newest' | 'oldest';


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
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'moderator' | 'user' | null>(null);

  React.useEffect(() => {
    async function checkAccess() {
      try {
        const ws = await pb.collection('workspaces').getFirstListItem(`slug = "${workspaceId}"`, { requestKey: null });

        if (user) {
          const member = await pb.collection('workspace_members').getFirstListItem(
            `workspace = "${ws.id}" && user = "${user.id}"`,
            { requestKey: null }
          ).catch(() => null);
          if (member) setUserRole(member.role as any);
        }

        setCheckingAccess(false);
      } catch (err: any) {
        if (!user) {
          router.push('/auth/login');
        } else {
          router.push('/');
        }
      }
    }
    if (!authLoading) checkAccess();
  }, [workspaceId, user, authLoading, router]);

  const filteredSuggestions = useMemo(() => {
    let result = suggestions.filter((s) => {
      const categoryMatch =
        categoryId === 'All' ||
        (categoryId === 'Mine' ? (user && s.author === user.id) : s.category_id === categoryId);

      const suggestionEffectiveStatus = s.status_id || 'None';
      const statusMatch = status === 'All' || suggestionEffectiveStatus === status;

      return categoryMatch && statusMatch;
    });

    // Sorting
    return result.sort((a, b) => {
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
  }, [suggestions, categoryId, status, user, sortBy]);

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
      />

      <div className="suggestions-list grid gap-6">
        {filteredSuggestions.length === 0 ? (
          <EmptyState
            isMine={isMine}
            isAdmin={userRole === 'admin' || user?.role === 'admin'}
            workspaceSlug={workspaceId}
          />
        ) : (
          filteredSuggestions.map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} workspaceSlug={workspaceId} />
          ))
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