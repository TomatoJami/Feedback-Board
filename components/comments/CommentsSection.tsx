'use client';

import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import CommentItem from '@/components/comments/CommentItem';
import MarkdownEditor from '@/components/ui/MarkdownEditor';
import { useComments } from '@/hooks/useComments';
import type { User } from '@/types';

interface CommentsSectionProps {
  suggestionId: string;
  user: User | null;
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

  const handleComment = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (!user || !commentText.trim()) return;

    setSending(true);
    try {
      await addComment(user.id, commentText);
      setCommentText('');
      toast.success('Комментарий добавлен');
    } catch (__err) {
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
        <div className="empty-state">
          <div className="empty-state-icon">
            <ChatBubbleOvalLeftIcon />
          </div>
          <p className="empty-state-title">Пока нет комментариев</p>
          <p className="empty-state-subtitle">Будьте первым, кто оставит мысли об этом предложении!</p>
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
                suggestionAuthorId={suggestionAuthorId}
              />
            ))}
        </div>
      )}

      {user && (
        <div className="comment-form-section">
          <div className="comment-form-header">
            <ChatBubbleOvalLeftIcon style={{ width: '20px', height: '20px' }} />
            <h3>Написать комментарий</h3>
          </div>
          <MarkdownEditor 
            value={commentText}
            onChange={setCommentText}
            minHeight="120px"
            resizable={false}
            placeholder="Что вы думаете об этом? Поддерживается Markdown."
          />
          <div className="comment-form-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleComment()}
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
