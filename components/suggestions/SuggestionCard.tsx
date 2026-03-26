import { ArrowsPointingInIcon, ChatBubbleOvalLeftIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

import AuthorBadge from '@/components/suggestions/AuthorBadge';
import Badge from '@/components/ui/Badge';
import VoteControl from '@/components/voting/VoteControl';
import { formatAbsoluteDate, timeAgo } from '@/lib/timeago';
import type { Suggestion } from '@/types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  workspaceSlug?: string;
  commentsCount?: number;
}

export default function SuggestionCard({ suggestion, workspaceSlug, commentsCount }: SuggestionCardProps) {
  const dynamicStatus = suggestion.expand?.status_id;
  const statusColor = dynamicStatus?.color || '#3b82f6';
  const statusLabel = dynamicStatus?.name || 'Открыто';

  const categoryName = suggestion.expand?.category_id?.name || 'Без категории';
  const categoryIcon = suggestion.expand?.category_id?.icon || '📋';

  const authorName = suggestion.expand?.author?.name || 'Аноним';
  const authorAvatar = suggestion.expand?.author?.avatar;

  return (
    <article 
      className={`suggestion-card${suggestion.pinned ? ' suggestion-pinned' : ''}`} 
      id={`suggestion-${suggestion.id}`}
      style={{ opacity: suggestion.merged_into ? 0.6 : 1 }}
    >
      <VoteControl 
        suggestionId={suggestion.id} 
        initialVotesCount={suggestion.votes_count ?? 0}
        authorId={suggestion.author || ''}
      />

      {/* Content column — wrapped in Link */}
      <Link href={suggestion.merged_into ? `/w/${workspaceSlug || suggestion.workspace_id}/suggestions/${suggestion.merged_into}` : `/w/${workspaceSlug || suggestion.workspace_id}/suggestions/${suggestion.id}`} className="card-content suggestion-card-link">
        <div className="card-header">
          <div className="card-badges">
            {suggestion.merged_into && (
              <Badge variant="amber" size="sm" className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20">
                <ArrowsPointingInIcon style={{ width: '12px', height: '12px' }} />
                Объединено
              </Badge>
            )}
            {suggestion.pinned && !suggestion.merged_into && (
              <Badge variant="indigo" size="sm" className="flex items-center gap-1">
                <MapPinIcon style={{ width: '12px', height: '12px' }} />
                Закреплено
              </Badge>
            )}
            <Badge variant="zinc" size="md" className="bg-zinc-500/10 border-zinc-500/20 text-zinc-400">
              {categoryIcon} {categoryName}
            </Badge>
            <Badge
              variant="zinc"
              size="md"
              showDot
              style={{ 
                color: statusColor,
                background: `${statusColor}15`,
                borderColor: `${statusColor}33`,
              }}
            >
              {statusLabel}
            </Badge>
          </div>
        </div>

        <h3 className="card-title">{suggestion.title}</h3>

        {suggestion.description && (
          <p className="card-description-clamp">
            {suggestion.description.replace(/[#*_~`>\[\]()!]/g, '').slice(0, 150)}
          </p>
        )}

        <div className="card-footer">
          <AuthorBadge 
            authorId={suggestion.author || ''}
            authorName={authorName}
            authorAvatar={authorAvatar}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
            {typeof commentsCount === 'number' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <ChatBubbleOvalLeftIcon style={{ width: '14px', height: '14px' }} />
                {commentsCount}
              </span>
            )}
            <time className="card-date" dateTime={suggestion.created} title={formatAbsoluteDate(suggestion.created)}>
              {timeAgo(suggestion.created)}
            </time>
          </div>
        </div>
      </Link>
    </article>
  );
}

