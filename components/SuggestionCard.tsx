'use client';

import React from 'react';
import Link from 'next/link';
import { useVote } from '@/hooks/useVote';
import { useAuth } from '@/hooks/useAuth';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import Badge from '@/components/ui/Badge';
import type { Suggestion } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  Open: '#3b82f6',
  Planned: '#a855f7',
  In_Progress: '#f59e0b',
  Completed: '#10b981',
};

// Deterministic color from string
function getColor(id: string): string {
  if (!id) return '#3f3f46';
  const colors = [
    '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}


interface SuggestionCardProps {
  suggestion: Suggestion;
  workspaceSlug?: string;
}

export default function SuggestionCard({ suggestion, workspaceSlug }: SuggestionCardProps) {
  const { user } = useAuth();
  const { voteType, isRevocable, remainingSeconds, isLoading, vote, revokeVote, optimisticScore } = useVote(suggestion.id, suggestion.votes_count ?? 0);

  const dynamicStatus = suggestion.expand?.status_id;
  const statusColor = dynamicStatus?.color || '#3b82f6'; // Default blue for Open or missing
  const statusLabel = dynamicStatus?.name || 'Открыто';
  
  const categoryName = suggestion.expand?.category_id?.name || 'Без категории';
  const categoryIcon = suggestion.expand?.category_id?.icon || '📋';

  const authorName = suggestion.expand?.author?.name || 'Аноним';
  const score = optimisticScore;
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
      <Link href={`/w/${workspaceSlug || suggestion.workspace_id}/suggestions/${suggestion.id}`} className="card-content suggestion-card-link">
        <div className="card-header">
          <div className="card-badges">
            <Badge variant="zinc" size="md" className="bg-zinc-500/10 border-zinc-500/20 text-zinc-400">
              {categoryIcon} {categoryName}
            </Badge>
            <Badge 
              variant="zinc" 
              size="md" 
              style={{ paddingLeft: '10px' }}
            >
              <span style={{ 
                display: 'inline-block', 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: statusColor, 
                flexShrink: 0,
                marginRight: '6px',
                boxShadow: `0 0 8px ${statusColor}`
              }} />
              {statusLabel}
            </Badge>
          </div>
        </div>

        <h3 className="card-title">{suggestion.title}</h3>

        <div className="card-footer">
          <div className="card-author">
            <div className="author-avatar-placeholder" style={{ 
              background: suggestion.expand?.author?.avatar ? 'transparent' : getColor(suggestion.author || ''),
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
