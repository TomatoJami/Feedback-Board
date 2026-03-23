import React from 'react';

import SuggestionSkeleton from '@/components/SuggestionSkeleton';

export default function Loading() {
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
