'use client';

import React, { useState } from 'react';
import CommentItem from '@/components/CommentItem';
import MarkdownEditor from '@/components/MarkdownEditor';
import { useComments } from '@/hooks/useComments';
import { toast } from 'react-hot-toast';
import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';

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
    pendingVotes,
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



      {isLoading ? (
        <div className="comments-empty">Загрузка...</div>
      ) : comments.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '32px'
        }}>
          <div style={{ marginBottom: '16px', opacity: 0.3 }}>
            <ChatBubbleOvalLeftIcon style={{ width: '48px', height: '48px' }} />
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Пока нет комментариев</p>
          <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Будьте первым, кто оставит мысли об этом предложении!</p>
        </div>
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
                pendingVotes={pendingVotes}
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

      {user && (
        <div className="comment-form-bottom" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '32px', marginTop: '32px', paddingBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ChatBubbleOvalLeftIcon style={{ width: '20px', height: '20px', color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Написать комментарий</h3>
          </div>
          <MarkdownEditor 
            value={commentText}
            onChange={setCommentText}
            minHeight="120px"
            resizable={false}
            placeholder="Что вы думаете об этом? Поддерживается Markdown."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => handleComment(e as any)}
              disabled={sending || !commentText.trim()}
              style={{ fontSize: '0.9rem', padding: '10px 32px' }}
            >
              {sending ? 'Отправка...' : 'Отправить комментарий'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
