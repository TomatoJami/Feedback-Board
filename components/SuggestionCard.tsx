import React from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import type { Suggestion } from '@/types';
import VoteControl from '@/components/voting/VoteControl';
import AuthorBadge from '@/components/suggestions/AuthorBadge';

interface SuggestionCardProps {
  suggestion: Suggestion;
  workspaceSlug?: string;
}

export default function SuggestionCard({ suggestion, workspaceSlug }: SuggestionCardProps) {
  const dynamicStatus = suggestion.expand?.status_id;
  const statusColor = dynamicStatus?.color || '#3b82f6';
  const statusLabel = dynamicStatus?.name || 'Открыто';

  const categoryName = suggestion.expand?.category_id?.name || 'Без категории';
  const categoryIcon = suggestion.expand?.category_id?.icon || '📋';

  const authorName = suggestion.expand?.author?.name || 'Аноним';
  const authorAvatar = suggestion.expand?.author?.avatar;

  return (
    <article className="suggestion-card" id={`suggestion-${suggestion.id}`}>
      <VoteControl 
        suggestionId={suggestion.id} 
        initialVotesCount={suggestion.votes_count ?? 0}
        authorId={suggestion.author || ''}
      />

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
                boxShadow: `0 0 8px ${statusColor}`
              }} />
              {statusLabel}
            </Badge>
          </div>
        </div>

        <h3 className="card-title">{suggestion.title}</h3>

        {suggestion.description && (
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            margin: '4px 0 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            opacity: 0.7,
          }}>
            {suggestion.description.replace(/[#*_~`>\[\]()!]/g, '').slice(0, 150)}
          </p>
        )}

        <div className="card-footer">
          <AuthorBadge 
            authorId={suggestion.author || ''}
            authorName={authorName}
            authorAvatar={authorAvatar}
          />
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

