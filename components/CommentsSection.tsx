'use client';

import React, { useState } from 'react';
import CommentItem from '@/components/CommentItem';
import MarkdownEditor from '@/components/MarkdownEditor'; // Assuming MarkdownEditor is in '@/components' based on other imports
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
        <div className="comment-form" style={{ marginBottom: '24px' }}>
          <MarkdownEditor 
            value={commentText}
            onChange={setCommentText}
            minHeight="100px"
            resizable={false}
            placeholder="Написать комментарий... Поддерживается Markdown."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => handleComment(e as any)}
              disabled={sending || !commentText.trim()}
              style={{ fontSize: '0.85rem', padding: '8px 24px' }}
            >
              {sending ? '...' : 'Отправить'}
            </button>
          </div>
        </div>
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
