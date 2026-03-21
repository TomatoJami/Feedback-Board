'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useRealtimeSuggestions } from '@/hooks/useRealtimeSuggestions';
import { useCategories } from '@/hooks/useCategories';
import { useStatuses } from '@/hooks/useStatuses';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import pb, { POCKETBASE_URL } from '@/lib/pocketbase';
import SuggestionCard from '@/components/SuggestionCard';
import HomeHeader from '@/components/HomeHeader';
import FilterSection from '@/components/FilterSection';
import EmptyState from '@/components/EmptyState';

type CategoryFilter = 'All' | 'Mine' | string; // id of category
type StatusFilter = 'All' | string; // id or standard value


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
  const [checkingAccess, setCheckingAccess] = useState(true);

  React.useEffect(() => {
    async function checkAccess() {
      try {
        await pb.collection('workspaces').getFirstListItem(`slug = "${workspaceId}"`, { requestKey: null });
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
    return suggestions.filter((s) => {
      const categoryMatch =
        categoryId === 'All' ||
        (categoryId === 'Mine' ? (user && s.author === user.id) : s.category_id === categoryId);
      
      // Determine the effective status for filtering
      const suggestionEffectiveStatus = s.status_id
        ? s.status_id
        : (s.status && s.status !== 'Open' ? s.status : 'None');

      const statusMatch = status === 'All' || suggestionEffectiveStatus === status;
        
      return categoryMatch && statusMatch;
    });
  }, [suggestions, categoryId, status, user]);

  const isMine = categoryId === 'Mine';
  const isLoading = suggestionsLoading || categoriesLoading || statusesLoading || checkingAccess;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 bg-white/5 animate-pulse rounded-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 w-full bg-white/5 animate-pulse rounded-2xl" />
        ))}
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
        categories={categories}
        statuses={statuses}
        user={user}
      />

      <div className="suggestions-list grid gap-6">
        {filteredSuggestions.length === 0 ? (
          <EmptyState isMine={isMine} />
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
      <div className="flex flex-col gap-6">
        <div className="h-10 w-48 bg-white/5 animate-pulse rounded-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 w-full bg-white/5 animate-pulse rounded-2xl" />
        ))}
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}