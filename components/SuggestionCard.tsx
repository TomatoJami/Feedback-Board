'use client';

import React from 'react';
import Link from 'next/link';
import { useVote } from '@/hooks/useVote';
import { useAuth } from '@/hooks/useAuth';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import type { Suggestion } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  Open: '#3b82f6',
  Planned: '#a855f7',
  In_Progress: '#f59e0b',
  Completed: '#10b981',
};



interface SuggestionCardProps {
  suggestion: Suggestion;
}

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const { user } = useAuth();
  const { voteType, isRevocable, remainingSeconds, isLoading, vote, revokeVote } = useVote(suggestion.id);

  const dynamicStatus = suggestion.expand?.status_id;
  const isLegacyOpen = !suggestion.status || suggestion.status.toLowerCase() === 'open';
  const statusColor = dynamicStatus?.color || (!isLegacyOpen ? STATUS_COLORS[suggestion.status] : null) || '#6b7280';
  const statusLabel = dynamicStatus?.name || (!isLegacyOpen ? suggestion.status.replace('_', ' ') : 'Без статуса');
  
  const categoryName = suggestion.expand?.category_id?.name || 'Без категории';
  const categoryIcon = suggestion.expand?.category_id?.icon || '📋';

  const authorName = suggestion.expand?.author?.name || 'Аноним';
  const score = suggestion.votes_count ?? 0;
  const scoreClass = score > 0 ? 'positive' : score < 0 ? 'negative' : 'zero';

  return (
    <article className="suggestion-card" id={`suggestion-${suggestion.id}`}>
      {/* Vote column */}
      <div className="vote-column" onClick={(e) => e.preventDefault()}>
        <button
          className={`vote-btn ${voteType === 'upvote' ? 'voted' : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); vote('upvote', suggestion.author); }}
          disabled={!user || isLoading || user.id === suggestion.author}
          title={!user ? 'Войдите, чтобы голосовать' : user.id === suggestion.author ? 'Вы не можете голосовать за свое предложение' : 'Upvote'}
          style={user?.id === suggestion.author ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <svg className="vote-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>

        <span className={`vote-score ${scoreClass}`}>{score}</span>

        <button
          className={`vote-btn-down ${voteType === 'downvote' ? 'voted' : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); vote('downvote', suggestion.author); }}
          disabled={!user || isLoading || user.id === suggestion.author}
          title={!user ? 'Войдите, чтобы голосовать' : user.id === suggestion.author ? 'Вы не можете голосовать за свое предложение' : 'Downvote'}
          style={user?.id === suggestion.author ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <svg className="vote-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>

        {isRevocable && (
          <button
            className="revoke-btn"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); revokeVote(); }}
            title="Отменить голос"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 14l-4-4 4-4" />
              <path d="M5 10h11a4 4 0 010 8h-1" />
            </svg>
            <span className="revoke-timer">{remainingSeconds}с</span>
          </button>
        )}
      </div>

      {/* Content column — wrapped in Link */}
      <Link href={`/suggestions/${suggestion.id}`} className="card-content suggestion-card-link">
        <div className="card-header">
          <div className="card-badges">
            <span className="category-badge">
              {categoryIcon} {categoryName}
            </span>
            <span 
              className="status-badge" 
              style={{ 
                '--status-color': statusColor,
                display: 'inline-flex',
                alignItems: 'center',
                flexDirection: 'row',
                gap: '8px',
                whiteSpace: 'nowrap'
              } as React.CSSProperties}
            >
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-color)', flexShrink: 0 }} />
              {statusLabel}
            </span>
          </div>
        </div>

        <h3 className="card-title">{suggestion.title}</h3>

        <div className="card-footer">
          <div className="card-author">
            <div className="author-avatar-placeholder" style={{ 
              background: suggestion.expand?.author?.avatar ? 'transparent' : '#3f3f46',
              overflow: 'hidden',
              padding: 0
            }}>
              {suggestion.expand?.author?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={`${POCKETBASE_URL}/api/files/users/${suggestion.expand.author.id}/${suggestion.expand.author.avatar}`} 
                  alt={authorName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : authorName.charAt(0).toUpperCase()}
            </div>
            <span className="author-name">{authorName}</span>
          </div>
          <time className="card-date" dateTime={suggestion.created}>
            {new Date(suggestion.created).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </time>
        </div>
      </Link>
    </article>
  );
}
