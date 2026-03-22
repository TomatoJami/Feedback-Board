import React from 'react';

export default function SuggestionSkeleton() {
  return (
    <article className="suggestion-card border border-white/5 bg-white/[0.02]" style={{ cursor: 'default' }}>
      <div className="vote-column" style={{ opacity: 0.5 }}>
        <div className="w-8 h-8 bg-white/10 rounded-xl mb-3 animate-pulse" />
        <div className="w-4 h-5 bg-white/10 rounded animate-pulse" />
        <div className="w-8 h-8 bg-white/10 rounded-xl mt-3 animate-pulse" />
      </div>

      <div className="card-content py-1">
        <div className="card-header mb-4">
          <div className="card-badges flex gap-2">
            <div className="w-24 h-7 bg-white/10 rounded-full animate-pulse" />
            <div className="w-20 h-7 bg-white/10 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="w-3/4 h-6 bg-white/10 rounded mt-2 mb-3 animate-pulse" />
        <div className="w-1/2 h-4 bg-white/5 rounded mb-8 animate-pulse" />

        <div className="card-footer mt-auto pt-4 border-t border-white/5">
          <div className="card-author flex items-center gap-3">
            <div className="w-6 h-6 bg-white/10 rounded-full animate-pulse shrink-0" />
            <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="w-20 h-4 bg-white/10 rounded ml-auto animate-pulse" />
        </div>
      </div>
    </article>
  );
}
