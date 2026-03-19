'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import pb from '@/lib/pocketbase';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { useAuth } from '@/hooks/useAuth';
import { useVote } from '@/hooks/useVote';
import { useComments } from '@/hooks/useComments';
import toast from 'react-hot-toast';
import type { Suggestion, SuggestionComment } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  Open: '#3b82f6',
  Planned: '#a855f7',
  In_Progress: '#f59e0b',
  Completed: '#10b981',
};



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

export default function SuggestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user } = useAuth();
  const { voteType, isRevocable, remainingSeconds, isLoading: voteLoading, vote, revokeVote } = useVote(id);
  const { comments, isLoading: commentsLoading, userVotes, addComment, voteComment } = useComments(id);

  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  
  // Deletion logic
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const record = await pb.collection('suggestions').getOne<Suggestion>(id, {
          expand: 'author,category_id',
          requestKey: null,
        });
        setSuggestion(record);
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    setSending(true);
    try {
      await addComment(user.id, commentText.trim());
      
      // Notify author if the commenter is not the author
      if (suggestion && suggestion.author !== user.id) {
        await pb.collection('notifications').create({
          user: suggestion.author,
          message: `Новый комментарий к вашему предложению "${suggestion.title}": ${commentText.trim().substring(0, 50)}${commentText.length > 50 ? '...' : ''}`,
          read: false,
        });
      }

      setCommentText('');
      toast.success('Комментарий добавлен!');
    } catch (err: any) {
      console.error('Comment failed:', err);
      toast.error('Ошибка при добавлении комментария');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!suggestion || deleteInput !== suggestion.title || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await pb.collection('suggestions').delete(id);
      toast.success('Предложение удалено');
      router.push('/');
    } catch (err: any) {
      console.error('Delete failed:', err);
      toast.error('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-container">
        <div className="h-10 w-32 bg-white/5 animate-pulse rounded-lg mb-6" />
        <div className="h-64 bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!suggestion) return null;

  const statusColor = STATUS_COLORS[suggestion.status] ?? '#6b7280';
  const statusLabel = suggestion.status.replace('_', ' ');
  const categoryName = suggestion.expand?.category_id?.name || 'Без категории';
  const categoryIcon = suggestion.expand?.category_id?.icon || '📋';
  const authorName = suggestion.expand?.author?.name || 'Аноним';
  const authorId = suggestion.author;
  const authorRole = suggestion.expand?.author?.role;
  const authorColor = getColor(authorId);
  const score = suggestion.votes_count ?? 0;
  const scoreClass = score > 0 ? 'positive' : score < 0 ? 'negative' : 'zero';

  const imageUrl = suggestion.image
    ? `${POCKETBASE_URL}/api/files/suggestions/${suggestion.id}/${suggestion.image}`
    : null;

  return (
    <div className="detail-container">
      <Link href="/" className="detail-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Назад к предложениям
      </Link>

      <div className="detail-card">
        {/* Author at top */}
        <div className="detail-author" style={{ marginBottom: '16px' }}>
          <div className="detail-author-avatar" style={{ 
            background: suggestion.expand?.author?.avatar ? 'transparent' : authorColor,
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
          <span className="detail-author-name">{authorName}</span>
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

        <div className="detail-meta">
          <span className="category-badge">
            {categoryIcon} {categoryName}
          </span>
          <span className="status-badge" style={{ '--status-color': statusColor } as React.CSSProperties}>
            {statusLabel}
          </span>
        </div>

        <h1 className="detail-title">{suggestion.title}</h1>

        {suggestion.description && (
          <div
            className="detail-description"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(suggestion.description) }}
          />
        )}

        {imageUrl && (
          <div className="detail-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={suggestion.title} />
          </div>
        )}

        {/* Vote block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="vote-column" style={{ flexDirection: 'row', gap: '8px' }}>
            <button
              className={`vote-btn ${voteType === 'upvote' ? 'voted' : ''}`}
              onClick={() => vote('upvote', suggestion.author)}
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
              onClick={() => vote('downvote', suggestion.author)}
              disabled={!user || voteLoading || user.id === suggestion.author}
              title={user?.id === suggestion.author ? 'Вы не можете голосовать за свое предложение' : 'Downvote'}
              style={user?.id === suggestion.author ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <svg className="vote-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>

            {isRevocable && (
              <button className="revoke-btn" onClick={revokeVote}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 14l-4-4 4-4" />
                  <path d="M5 10h11a4 4 0 010 8h-1" />
                </svg>
                <span className="revoke-timer">{remainingSeconds}с</span>
              </button>
            )}
          </div>

          {(user?.id === suggestion.author && suggestion.status === 'Open') && (
            <button 
              className="detail-delete-btn"
              onClick={() => setShowDeleteModal(true)}
              style={{ marginLeft: 'auto', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
              </svg>
              Удалить
            </button>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="comments-section">
        <h2 className="comments-title">
          Комментарии {comments.length > 0 && `(${comments.length})`}
        </h2>

        {user && (
          <form className="comment-form" onSubmit={handleComment} style={{ marginBottom: '24px' }}>
            <input
              className="comment-input"
              placeholder="Написать комментарий..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
            <button
              type="submit"
              className="comment-send"
              disabled={sending || !commentText.trim()}
            >
              {sending ? '...' : 'Отправить'}
            </button>
          </form>
        )}

        {commentsLoading ? (
          <div className="comments-empty">Загрузка...</div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">Пока нет комментариев. Будьте первым!</div>
        ) : (
          <div className="comments-list">
            {comments
              .filter(c => !c.parent_id)
              .map(comment => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  allComments={comments}
                  authorId={authorId}
                  user={user}
                  userVotes={userVotes}
                  onVote={voteComment}
                  onReply={addComment}
                />
              ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-white mb-2">Удалить предложение?</h3>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              Это действие необратимо. Пожалуйста, введите название предложения для подтверждения: <br/>
              <strong className="text-zinc-200 select-all">{suggestion.title}</strong>
            </p>
            
            <input
              type="text"
              className="w-full bg-black border border-white/10 rounded-xl p-4 mb-6 outline-none focus:border-red-500 transition-all text-white placeholder:text-zinc-700"
              placeholder="Введите название..."
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              autoFocus
            />

            <div className="flex gap-4">
              <button
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-zinc-400 font-semibold hover:bg-white/10 transition-all"
                onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }}
              >
                Отмена
              </button>
              <button
                className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleteInput !== suggestion.title || isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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

function CommentItem({ comment, allComments, authorId, user, userVotes, onVote, onReply }: CommentItemProps) {
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

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !replyText.trim() || isSending) return;
    setIsSending(true);
    try {
      await onReply(user.id, replyText.trim(), comment.id);
      setReplyText('');
      setShowReply(false);
    } catch (err) {
      console.error('Reply failed:', err);
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
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={`${POCKETBASE_URL}/api/files/users/${cUser.id}/${cUser.avatar}`} 
                  alt={cName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : cName.charAt(0).toUpperCase()}
            </div>
            <span className="comment-name">{cName}</span>
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
              onChange={(e) => setReplyText(e.target.value)}
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
