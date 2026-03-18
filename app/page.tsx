'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useRealtimeSuggestions } from '@/hooks/useRealtimeSuggestions';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import SuggestionCard from '@/components/SuggestionCard';
import type { SuggestionStatus } from '@/types';

type CategoryFilter = 'All' | 'Mine' | string; // id of category
type StatusFilter = 'All' | SuggestionStatus;

function HomeContent() {
  const { suggestions, isLoading: suggestionsLoading } = useRealtimeSuggestions();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { user } = useAuth();

  const [categoryId, setCategoryId] = useState<CategoryFilter>('All');
  const [status, setStatus] = useState<StatusFilter>('All');

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => {
      const categoryMatch =
        categoryId === 'All' ||
        (categoryId === 'Mine' ? (user && s.author === user.id) : s.category_id === categoryId);
      const statusMatch = status === 'All' || s.status === status;
      return categoryMatch && statusMatch;
    });
  }, [suggestions, categoryId, status, user]);

  const isMine = categoryId === 'Mine';
  const isLoading = suggestionsLoading || categoriesLoading;

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
    <div className="flex flex-col gap-8">
      <div className="page-header flex-col items-start gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isMine ? 'Мои предложения' : 'Предложения'}
          </h1>
          <p className="text-zinc-400">
            {isMine
              ? 'Все предложения, которые вы создали.'
              : 'Помогайте нам становиться лучше, голосуя за любимые идеи.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Category Filters */}
        <div className="filters-bar">
          <button
            className={`filter-chip ${categoryId === 'All' ? 'active' : ''}`}
            onClick={() => setCategoryId('All')}
          >
            Все
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`filter-chip ${categoryId === c.id ? 'active' : ''}`}
              onClick={() => setCategoryId(c.id)}
            >
              {c.icon && <span style={{ marginRight: '6px' }}>{c.icon}</span>}
              {c.name}
            </button>
          ))}
          {user && (
            <button
              className={`filter-chip ${categoryId === 'Mine' ? 'active' : ''}`}
              onClick={() => setCategoryId('Mine')}
            >
              📝 Мои
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="filters-bar">
          <button
            className={`filter-chip ${status === 'All' ? 'active' : ''}`}
            onClick={() => setStatus('All')}
          >
            Любой статус
          </button>
          {(['Open', 'Planned', 'In_Progress', 'Completed'] as SuggestionStatus[]).map((s) => (
            <button
              key={s}
              className={`filter-chip ${status === s ? 'active' : ''}`}
              onClick={() => setStatus(s)}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="suggestions-list grid gap-6">
        {filteredSuggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/40 rounded-3xl border border-white/5">
            <span className="text-4xl mb-4">{isMine ? '📝' : '🔍'}</span>
            <h3 className="text-xl font-semibold">
              {isMine ? 'У вас пока нет предложений' : 'Ничего не найдено'}
            </h3>
            <p className="text-zinc-500 max-w-xs mx-auto mt-2">
              {isMine
                ? 'Создайте своё первое предложение!'
                : 'Попробуйте изменить фильтры или станьте первым, кто предложит идею!'}
            </p>
          </div>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
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