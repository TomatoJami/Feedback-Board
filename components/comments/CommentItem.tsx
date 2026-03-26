'use client';

import { ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import React, { useEffect,useState } from 'react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import Badge from '@/components/ui/Badge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import MarkdownEditor from '@/components/ui/MarkdownEditor';
import type { CommentPendingVote } from '@/hooks/useComments';
import { logger } from '@/lib/logger';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { formatAbsoluteDate, timeAgo } from '@/lib/timeago';
import { getAvatarColor } from '@/lib/utils';
import type { SuggestionComment, User, UserPrefix } from '@/types';

// Deterministic color from string

interface CommentItemProps {
  comment: SuggestionComment;
  allComments: SuggestionComment[];
  user: User | null;
  userVotes: Record<string, 'upvote' | 'downvote' | null>;
  pendingVotes: Record<string, CommentPendingVote>;
  onVote: (id: string, type: 'upvote' | 'downvote') => Promise<void>;
  onReply: (userId: string, text: string, parentId: string) => Promise<SuggestionComment | unknown>;
  onUpdate: (id: string, text: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
  workspaceRole?: 'admin' | 'moderator' | 'user' | null;
  isAdmin?: boolean;
  workspaceId?: string;
  authorPrefixes?: UserPrefix[];
  isSuggestionAuthor?: boolean;
  suggestionAuthorId?: string;
}

export default function CommentItem({ 
  comment, 
  allComments, 
  user, 
  userVotes, 
  pendingVotes,
  onVote, 
  onReply, 
  onUpdate,
  onDelete,
  workspaceRole,
  isAdmin = false,
  workspaceId,
  authorPrefixes,
  isSuggestionAuthor = false,
  suggestionAuthorId
}: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isUpdating, setIsUpdating] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Check if 5 minutes passed since comment creation
    const checkCanEdit = () => {
      if (!user || user.id !== comment.user) {
        setCanEdit(false);
        return;
      }
      const created = new Date(comment.created).getTime();
      const now = new Date().getTime();
      const diffMs = now - created;
      const fiveMinutesMs = 5 * 60 * 1000;
      setCanEdit(diffMs < fiveMinutesMs);
    };

    checkCanEdit();
    const timer = setInterval(checkCanEdit, 10000); // Check every 10s
    return () => clearInterval(timer);
  }, [comment.created, comment.user, user]);

  const cUser = comment.expand?.user;
  const cName = cUser?.name || 'Аноним';
  const cColor = getAvatarColor(comment.user || '');
  
  // Roles check for badges
  const isCommentUserGlobalAdmin = cUser?.role === 'admin';
  
  // Can current user delete?
  const isModerator = workspaceRole === 'moderator' || workspaceRole === 'admin';
  const canDelete = isAdmin || isModerator;

  const replies = allComments.filter(c => c.parent_id === comment.id);
  const currentVote = userVotes[comment.id];
  const score = (comment.upvotes || 0) - (comment.downvotes || 0);
  const pending = pendingVotes[comment.id];

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyText.trim() || isSending) return;
    setIsSending(true);
    try {
      await onReply(user.id, replyText.trim(), comment.id);
      setReplyText('');
      setShowReply(false);
      toast.success('Ответ отправлен');
    } catch (err) {
      logger.error('Reply failed:', err);
      toast.error('Ошибка при отправке');
    } finally {
      setIsSending(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim() || isUpdating) return;
    setIsUpdating(true);
    try {
      await onUpdate(comment.id, editText.trim());
      setIsEditing(false);
      toast.success('Комментарий обновлен');
    } catch (__err) {
      toast.error('Ошибка при обновлении');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(comment.id);
      toast.success('Комментарий удален');
    } catch (_err) {
      toast.error('Ошибка при удалении');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleCommentVote = async (type: 'upvote' | 'downvote') => {
    if (!user) return;
    if (user.id === comment.user) {
      toast.error('Вы не можете голосовать за свой комментарий');
      return;
    }
    await onVote(comment.id, type);
  };

  return (
    <div className={`comment-group ${comment.parent_id ? 'is-reply' : ''}`}>
      <div className={`comment-card ${isSuggestionAuthor ? 'is-author' : ''} ${isCommentUserGlobalAdmin ? 'is-admin' : ''}`}>
        <div className="comment-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
          {comment.merged_from_suggestion && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              width: 'fit-content'
            }}>
              <ArrowsPointingInIcon style={{ width: '12px', height: '12px' }} />
              Перенесено из: {comment.merged_from_suggestion}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div className="comment-user">
              <div className="comment-avatar" style={{ 
                background: cUser?.avatar ? 'transparent' : cColor,
                overflow: 'hidden',
                padding: 0
              }}>
                {cUser?.avatar ? (
                  <Image 
                    src={`${POCKETBASE_URL}/api/files/users/${cUser.id}/${cUser.avatar}`} 
                    alt={cName} 
                    width={32}
                    height={32}
                    unoptimized
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : cName.charAt(0).toUpperCase()}
              </div>
              <span className="comment-name">{cName}</span>
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
              {isSuggestionAuthor && (
                <Badge variant="indigo" size="sm" style={{ marginLeft: '6px' }}>Автор</Badge>
              )}
              {isCommentUserGlobalAdmin && (
                <Badge variant="amber" size="sm" style={{ marginLeft: '6px' }}>Админ</Badge>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <time className="comment-date" dateTime={comment.created} title={formatAbsoluteDate(comment.created)}>
                {timeAgo(comment.created)}
              </time>
              {canDelete && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="comment-delete-btn"
                  title="Удалить комментарий"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {isEditing ? (
          <div style={{ marginTop: '8px', marginBottom: '12px' }}>
            <MarkdownEditor 
              value={editText}
              onChange={setEditText}
              minHeight="80px"
              resizable={false}
              placeholder="Измените ваш комментарий..."
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={(e) => handleEditSubmit(e as unknown as React.FormEvent)} 
                disabled={isUpdating}
                style={{ fontSize: '0.8rem', padding: '6px 16px' }}
              >
                {isUpdating ? '...' : 'Сохранить'}
              </button>
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => setIsEditing(false)}
                style={{ fontSize: '0.8rem', padding: '6px 16px' }}
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="comment-text markdown-body">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{children}</a>,
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  return isInline 
                     ? <code className="bg-white/10 px-1 rounded text-indigo-300" {...props}>{children}</code>
                     : <pre className="bg-black/40 p-2 rounded overflow-x-auto text-[0.9em] mb-2 border border-white/5"><code className={className} {...props}>{children}</code></pre>;
                }
              }}
            >
              {comment.text}
            </ReactMarkdown>
          </div>
        )}
        
        <div className="comment-actions">
          <div className="comment-votes">
            <button 
              className={`c-vote-btn ${currentVote === 'upvote' ? 'voted-up' : ''}`}
              onClick={() => handleCommentVote('upvote')}
              disabled={!user || user?.id === comment.user}
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
              disabled={!user || user?.id === comment.user}
              title={user?.id === comment.user ? 'Вы не можете голосовать за свой комментарий' : 'Не нравится'}
              style={user?.id === comment.user ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>
            {pending && (
              <div className="vote-timer-ring" style={{ width: '28px', height: '28px' }} title="Вы можете изменить голос">
                <svg viewBox="0 0 36 36" className="vote-timer-svg">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="url(#timerGradientComment)" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${(pending.remainingSeconds / 15) * 97.4} 97.4`}
                    style={{ transition: 'stroke-dasharray 1s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                  />
                  <defs>
                    <linearGradient id="timerGradientComment" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="vote-timer-number" style={{ fontSize: '0.55rem' }}>{pending.remainingSeconds}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {user && (
              <button 
                className="comment-reply-btn" 
                onClick={() => setShowReply(!showReply)}
              >
                Ответить
              </button>
            )}

            {canEdit && !isEditing && (
              <button 
                className="comment-reply-btn" 
                onClick={() => setIsEditing(true)}
                style={{ color: 'var(--text-secondary)' }}
              >
                Изменить
              </button>
            )}
          </div>
        </div>

        {showReply && (
          <div className="comment-reply-form" style={{ marginTop: '12px' }}>
            <MarkdownEditor 
              value={replyText}
              onChange={setReplyText}
              minHeight="80px"
              resizable={false}
              placeholder={`Ответить пользователю ${cName}...`}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={(e) => handleReplySubmit(e as unknown as React.FormEvent)} 
                disabled={isSending}
                style={{ fontSize: '0.8rem', padding: '6px 16px' }}
              >
                {isSending ? '...' : 'Ответить'}
              </button>
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => setShowReply(false)}
                style={{ fontSize: '0.8rem', padding: '6px 16px' }}
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Удалить комментарий"
        message="Вы уверены, что хотите удалить этот комментарий? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {replies.length > 0 && (
        <div className="comment-replies">
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              allComments={allComments}
              user={user}
              userVotes={userVotes}
              pendingVotes={pendingVotes}
              onVote={onVote}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              workspaceRole={workspaceRole}
              isAdmin={isAdmin}
              workspaceId={workspaceId}
              suggestionAuthorId={suggestionAuthorId}
              isSuggestionAuthor={reply.user === suggestionAuthorId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
