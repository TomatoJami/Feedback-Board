import React, { useState } from 'react';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { logger } from '@/lib/logger';
import type { SuggestionComment } from '@/types';

// Deterministic color from string
function getColor(id: string): string {
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

interface CommentItemProps {
  comment: SuggestionComment;
  allComments: SuggestionComment[];
  authorId: string;
  user: any;
  userVotes: Record<string, 'upvote' | 'downvote' | null>;
  onVote: (id: string, type: 'upvote' | 'downvote') => Promise<void>;
  onReply: (userId: string, text: string, parentId: string) => Promise<any>;
}

export default function CommentItem({ comment, allComments, authorId, user, userVotes, onVote, onReply }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const cUser = comment.expand?.user;
  const cName = cUser?.name || 'Аноним';
  const cColor = getColor(comment.user);
  const isAuthor = comment.user === authorId;
  const isAdmin = cUser?.role === 'admin';
  const replies = allComments.filter(c => c.parent_id === comment.id);
  const currentVote = userVotes[comment.id];
  const score = (comment.upvotes || 0) - (comment.downvotes || 0);

  const handleReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !replyText.trim() || isSending) return;
    setIsSending(true);
    try {
      await onReply(user.id, replyText.trim(), comment.id);
      setReplyText('');
      setShowReply(false);
    } catch (err) {
      logger.error('Reply failed:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCommentVote = async (type: 'upvote' | 'downvote') => {
    if (!user) return;
    if (user.id === comment.user) {
      const toast = (await import('react-hot-toast')).default;
      toast.error('Вы не можете голосовать за свой комментарий');
      return;
    }
    await onVote(comment.id, type);
  };

  return (
    <div className={`comment-group ${comment.parent_id ? 'is-reply' : ''}`}>
      <div className={`comment-card ${isAuthor ? 'is-author' : ''} ${isAdmin ? 'is-admin' : ''}`}>
        <div className="comment-header">
          <div className="comment-user">
            <div className="comment-avatar" style={{ 
              background: cUser?.avatar ? 'transparent' : cColor,
              overflow: 'hidden',
              padding: 0
            }}>
              {cUser?.avatar ? (
                <img 
                  src={`${POCKETBASE_URL}/api/files/users/${cUser.id}/${cUser.avatar}`} 
                  alt={cName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : cName.charAt(0).toUpperCase()}
            </div>
            <span className="comment-name">{cName}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginLeft: '4px' }}>
              {cUser?.expand?.prefixes?.map((prefix: any, idx: number) => (
                <span key={idx} style={{ 
                  color: prefix.color, 
                  fontSize: '0.6rem', 
                  fontWeight: 800, 
                  textTransform: 'uppercase',
                  background: `${prefix.color}15`,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  border: `1px solid ${prefix.color}33`,
                }}>
                  {prefix.name}
                </span>
              ))}
            </div>
            {isAuthor && <span className="detail-author-badge badge-author">Автор</span>}
            {isAdmin && <span className="detail-author-badge badge-admin">Админ</span>}
          </div>
          <time className="comment-date" dateTime={comment.created}>
            {new Date(comment.created).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>
        
        <p className="comment-text">{comment.text}</p>
        
        <div className="comment-actions">
          <div className="comment-votes">
            <button 
              className={`c-vote-btn ${currentVote === 'upvote' ? 'voted-up' : ''}`}
              onClick={() => handleCommentVote('upvote')}
              disabled={!user || user.id === comment.user}
              title={user?.id === comment.user ? 'Вы не можете голосовать за свой комментарий' : 'Нравится'}
              style={user?.id === comment.user ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
            <span className={`c-vote-score ${score > 0 ? 'pos' : score < 0 ? 'neg' : ''}`}>
              {score > 0 ? `+${score}` : score}
            </span>
            <button 
              className={`c-vote-btn ${currentVote === 'downvote' ? 'voted-down' : ''}`}
              onClick={() => handleCommentVote('downvote')}
              disabled={!user || user.id === comment.user}
              title={user?.id === comment.user ? 'Вы не можете голосовать за свой комментарий' : 'Не нравится'}
              style={user?.id === comment.user ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>
          </div>

          {user && (
            <button 
              className="comment-reply-btn" 
              onClick={() => setShowReply(!showReply)}
            >
              Ответить
            </button>
          )}
        </div>

        {showReply && (
          <form className="comment-reply-form" onSubmit={handleReplySubmit}>
            <input
              autoFocus
              className="comment-input small"
              placeholder={`Ответить пользователю ${cName}...`}
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplyText(e.target.value)}
              required
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="comment-send small" disabled={isSending}>
                {isSending ? '...' : 'Ответить'}
              </button>
              <button type="button" className="comment-cancel small" onClick={() => setShowReply(false)}>
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>

      {replies.length > 0 && (
        <div className="comment-replies">
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              allComments={allComments}
              authorId={authorId}
              user={user}
              userVotes={userVotes}
              onVote={onVote}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
