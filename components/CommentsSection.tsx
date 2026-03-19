import React, { useState } from 'react';
import CommentItem from '@/components/CommentItem';

import type { SuggestionComment } from '@/types';
interface CommentsSectionProps {
  comments: SuggestionComment[];
  isLoading: boolean;
  user: any;
  userVotes: Record<string, 'upvote' | 'downvote' | null>;
  commentText: string;
  setCommentText: (val: string) => void;
  sending: boolean;
  onComment: (e: React.FormEvent<HTMLFormElement>) => Promise<void> | void;
  onVote: (id: string, type: 'upvote' | 'downvote') => Promise<void>;
  onReply: (userId: string, text: string, parentId: string) => Promise<any>;
  authorId: string;
}

export default function CommentsSection({
  comments,
  isLoading,
  user,
  userVotes,
  commentText,
  setCommentText,
  sending,
  onComment,
  onVote,
  onReply,
  authorId,
}: CommentsSectionProps) {
  return (
    <div className="comments-section">
      <h2 className="comments-title">
        Комментарии {comments.length > 0 && `(${comments.length})`}
      </h2>

      {user && (
        <form className="comment-form" onSubmit={onComment} style={{ marginBottom: '24px' }}>
          <input
            className="comment-input"
            placeholder="Написать комментарий..."
            value={commentText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentText(e.target.value)}
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
