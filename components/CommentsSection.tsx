'use client';

import React, { useState } from 'react';
import CommentItem from '@/components/CommentItem';
import { useComments } from '@/hooks/useComments';
import { toast } from 'react-hot-toast';

import type { SuggestionComment } from '@/types';

interface CommentsSectionProps {
  suggestionId: string;
  user: any;
  isAdmin?: boolean;
  workspaceRole?: 'admin' | 'moderator' | 'user' | null;
  workspaceId?: string;
  suggestionAuthorId?: string;
}

export default function CommentsSection({ 
  suggestionId, 
  user, 
  isAdmin = false,
  workspaceRole = null,
  workspaceId,
  suggestionAuthorId
}: CommentsSectionProps) {
  const { 
    comments, 
    isLoading, 
    userVotes,
    memberPrefixes,
    addComment, 
    voteComment,
    updateComment,
    deleteComment
  } = useComments(suggestionId, workspaceId);

  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  const handleComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    setSending(true);
    try {
      await addComment(user.id, commentText);
      setCommentText('');
      toast.success('Комментарий добавлен');
    } catch (err) {
      toast.error('Ошибка при отправке');
    } finally {
      setSending(false);
    }
  };

  return (
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentText(e.target.value)}
            required
            style={{
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              color: 'white',
              fontSize: '0.9rem',
              marginBottom: '12px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending || !commentText.trim()}
              style={{ fontSize: '0.85rem', padding: '8px 20px' }}
            >
              {sending ? '...' : 'Отправить'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
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
                user={user}
                userVotes={userVotes}
                onVote={voteComment}
                onReply={addComment}
                onUpdate={updateComment}
                onDelete={deleteComment}
                workspaceRole={workspaceRole}
                isAdmin={isAdmin}
                workspaceId={workspaceId}
                authorPrefixes={memberPrefixes[comment.user]}
                isSuggestionAuthor={comment.user === suggestionAuthorId}
              />
            ))}
        </div>
      )}
    </div>
  );
}
