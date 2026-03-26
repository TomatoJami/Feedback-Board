import { MapPinIcon, PencilIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import AuthorBadge from '@/components/suggestions/AuthorBadge';
import Badge from '@/components/ui/Badge';
import { formatAbsoluteDate, timeAgo } from '@/lib/timeago';
import type { Suggestion, User, UserPrefix } from '@/types';

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
  isPending: boolean;
  remainingSeconds: number;
  voteLoading: boolean;
  user: User | null;
  onVote: (type: 'upvote' | 'downvote', authorId: string) => void;
  onShowDelete: () => void;
  showDeleteBtn: boolean;
  authorPrefixes?: UserPrefix[];
  onEdit?: () => void;
  showEditBtn?: boolean;
  onTogglePin?: () => void;
  showPinBtn?: boolean;
}

export default function SuggestionDetailCard({
  suggestion,
  authorName,
  authorColor: _authorColor,
  authorRole,
  statusLabel,
  statusColor,
  categoryName,
  categoryIcon,
  imageUrl,
  score,
  scoreClass,
  voteType,
  isPending,
  remainingSeconds,
  voteLoading,
  user,
  onVote,
  onShowDelete,
  showDeleteBtn,
  authorPrefixes,
  onEdit,
  showEditBtn,
  onTogglePin,
  showPinBtn,
}: SuggestionDetailCardProps) {
  return (
    <div className="detail-card">
      {/* Title, Category, and Status at top */}
      <div className="detail-header-row">
        <div className="detail-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {suggestion.pinned && (
              <MapPinIcon style={{ width: '20px', height: '20px', color: '#6366f1', flexShrink: 0 }} />
            )}
            <h1 className="detail-title" style={{ margin: 0, lineHeight: 1.2 }}>{suggestion.title}</h1>
          </div>
          <Badge variant="zinc" size="md">
            {categoryIcon} {categoryName}
          </Badge>
        </div>
        <Badge 
          variant="zinc"
          size="md" 
          showDot 
          style={{ 
            color: statusColor,
            background: `${statusColor}15`,
            borderColor: `${statusColor}33`,
            flexShrink: 0
          }}
        >
          {statusLabel}
        </Badge>
      </div>

      {/* Author details */}
      <div className="detail-author" style={{ marginBottom: '16px' }}>
        <AuthorBadge 
          authorId={suggestion.author || ''}
          authorName={authorName}
          authorAvatar={suggestion.expand?.author?.avatar}
        />
        {authorPrefixes && authorPrefixes.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
            {authorPrefixes.map((p) => (
              <span
                key={p.id}
                className="prefix-badge"
                style={{
                  backgroundColor: `${p.color}15`,
                  color: p.color,
                  border: `1px solid ${p.color}30`
                }}
              >
                {p.name}
              </span>
            ))}
          </div>
        )}
        {authorRole === 'admin' && (
          <Badge variant="amber" size="sm" className="ml-1">Админ</Badge>
        )}
        <Badge variant="indigo" size="sm" className="ml-1">Автор</Badge>
        <time className="card-date" style={{ marginLeft: 'auto' }} dateTime={suggestion.created} title={formatAbsoluteDate(suggestion.created)}>
          {timeAgo(suggestion.created)}
        </time>
        {suggestion.created !== suggestion.updated && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.6 }} title={`Изменено: ${formatAbsoluteDate(suggestion.updated)}`}>
            (ред.)
          </span>
        )}
      </div>

      {suggestion.description && (
        <div className="detail-description markdown-body">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline" />,
              code: ({ className, children, ...props }) => {
                const isInline = !className;
                return isInline 
                   ? <code className="bg-white/10 px-1 rounded text-indigo-300" {...props}>{children}</code>
                   : <pre className="bg-black/40 p-4 rounded-xl overflow-x-auto text-[0.85em] mb-4 border border-white/10"><code className={className} {...props}>{children}</code></pre>;
              },
              // eslint-disable-next-line @next/next/no-img-element
              img: ({node: _node, ...props}) => <img alt={props.alt || ''} className="rounded-xl max-w-full h-auto border border-white/10 mb-6 shadow-2xl" {...props} />
            }}
          >
            {suggestion.description}
          </ReactMarkdown>
        </div>
      )}

      {imageUrl && (
        <div className="detail-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={suggestion.title} />
        </div>
      )}

      {/* Vote block */}
      <div className="detail-vote-row">
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

          {isPending && (
            <div className="vote-timer-ring" title="Вы можете изменить голос">
              <svg viewBox="0 0 36 36" className="vote-timer-svg">
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.15)"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="url(#timerGradientDetail)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(remainingSeconds / 15) * 97.4} 97.4`}
                  style={{ transition: 'stroke-dasharray 1s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
                <defs>
                  <linearGradient id="timerGradientDetail" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="vote-timer-number">{remainingSeconds}</span>
            </div>
          )}
        </div>

        {showDeleteBtn && (
          <button 
            className="danger-btn"
            onClick={onShowDelete}
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
        {showEditBtn && onEdit && (
          <button 
            className="btn btn-ghost"
            onClick={onEdit}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <PencilIcon style={{ width: '16px', height: '16px' }} />
            Редактировать
          </button>
        )}
        {showPinBtn && onTogglePin && (
          <button
            className="btn btn-ghost"
            onClick={onTogglePin}
            style={{ fontSize: '0.85rem', padding: '8px 16px', color: suggestion.pinned ? '#6366f1' : undefined }}
          >
            <MapPinIcon style={{ width: '16px', height: '16px' }} />
            {suggestion.pinned ? 'Открепить' : 'Закрепить'}
          </button>
        )}
      </div>
    </div>
  );
}
