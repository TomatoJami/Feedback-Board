import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import type { Suggestion } from '@/types';

interface SuggestionDetailCardProps {
  suggestion: Suggestion;
  authorName: string;
  authorColor: string;
  authorRole?: string;
  statusLabel: string;
  statusColor: string;
  categoryName: string;
  categoryIcon: string;
  imageUrl: string | null;
  score: number;
  scoreClass: string;
  voteType: 'upvote' | 'downvote' | null;
  isRevocable: boolean;
  remainingSeconds: number;
  voteLoading: boolean;
  user: any;
  onVote: (type: 'upvote' | 'downvote', authorId: string) => void;
  onRevoke: () => void;
  onShowDelete: () => void;
  showDeleteBtn: boolean;
}

export default function SuggestionDetailCard({
  suggestion,
  authorName,
  authorColor,
  authorRole,
  statusLabel,
  statusColor,
  categoryName,
  categoryIcon,
  imageUrl,
  score,
  scoreClass,
  voteType,
  isRevocable,
  remainingSeconds,
  voteLoading,
  user,
  onVote,
  onRevoke,
  onShowDelete,
  showDeleteBtn,
}: SuggestionDetailCardProps) {
  return (
    <div className="detail-card">
      {/* Title, Category, and Status at top */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h1 className="detail-title" style={{ margin: 0, lineHeight: 1.2 }}>{suggestion.title}</h1>
          <span className="category-badge">
            {categoryIcon} {categoryName}
          </span>
        </div>
        <span 
          className="status-badge" 
          style={{ 
            '--status-color': statusColor, 
            flexShrink: 0,
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

      {/* Author details */}
      <div className="detail-author" style={{ marginBottom: '16px' }}>
        <div className="detail-author-avatar" style={{ 
          background: suggestion.expand?.author?.avatar ? 'transparent' : authorColor,
          overflow: 'hidden',
          padding: 0
        }}>
          {suggestion.expand?.author?.avatar ? (
            <img 
              src={`${POCKETBASE_URL}/api/files/users/${suggestion.expand.author.id}/${suggestion.expand.author.avatar}`} 
              alt={authorName} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : authorName.charAt(0).toUpperCase()}
        </div>
        <span className="detail-author-name">{authorName}</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginLeft: '4px' }}>
          {suggestion.expand?.author?.expand?.prefixes
            ?.filter((p: any) => p.workspace_id === suggestion.workspace_id || !p.workspace_id)
            .map((prefix: any, idx: number) => (
            <span key={idx} style={{ 
              color: prefix.color, 
              fontSize: '0.65rem', 
              fontWeight: 800, 
              textTransform: 'uppercase',
              background: `${prefix.color}15`,
              padding: '2px 6px',
              borderRadius: '4px',
              border: `1px solid ${prefix.color}33`,
            }}>
              {prefix.name}
            </span>
          ))}
        </div>
        {authorRole === 'admin' && (
          <span className="detail-author-badge badge-admin">Админ</span>
        )}
        <span className="detail-author-badge badge-author">Автор</span>
        <time className="card-date" style={{ marginLeft: 'auto' }} dateTime={suggestion.created}>
          {new Date(suggestion.created).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </time>
      </div>

      {suggestion.description && (
        <div
          className="detail-description"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(suggestion.description) }}
        />
      )}

      {imageUrl && (
        <div className="detail-image">
          <img src={imageUrl} alt={suggestion.title} />
        </div>
      )}

      {/* Vote block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="vote-column" style={{ flexDirection: 'row', gap: '8px' }}>
          <button
            className={`vote-btn ${voteType === 'upvote' ? 'voted' : ''}`}
            onClick={() => onVote('upvote', suggestion.author)}
            disabled={!user || voteLoading || user.id === suggestion.author}
            title={user?.id === suggestion.author ? 'Вы не можете голосовать за свое предложение' : 'Upvote'}
            style={user?.id === suggestion.author ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <svg className="vote-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>

          <span className={`vote-score ${scoreClass}`}>{score}</span>

          <button
            className={`vote-btn-down ${voteType === 'downvote' ? 'voted' : ''}`}
            onClick={() => onVote('downvote', suggestion.author)}
            disabled={!user || voteLoading || user.id === suggestion.author}
            title={user?.id === suggestion.author ? 'Вы не можете голосовать за свое предложение' : 'Downvote'}
            style={user?.id === suggestion.author ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <svg className="vote-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>

          {isRevocable && (
            <button className="revoke-btn" onClick={onRevoke}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14l-4-4 4-4" />
                <path d="M5 10h11a4 4 0 010 8h-1" />
              </svg>
              <span className="revoke-timer">{remainingSeconds}с</span>
            </button>
          )}
        </div>

        {showDeleteBtn && (
          <button 
            className="detail-delete-btn"
            onClick={onShowDelete}
            style={{ marginLeft: 'auto', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="trash-icon">
              <g className="trash-lid">
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </g>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
            Удалить
          </button>
        )}
      </div>
    </div>
  );
}
