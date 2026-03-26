'use client';

import type { RecordSubscription } from 'pocketbase';
import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib/logger';
import pb from '@/lib/pocketbase';
import * as commentsService from '@/lib/services/comments.service';
import type { SuggestionComment } from '@/types';

import { useCommentVotes } from './useCommentVotes';
import { useMemberPrefixes } from './useMemberPrefixes';

// Re-export for consumers
export type { CommentPendingVote } from './useCommentVotes';

/**
 * Composed hook for comments: data loading, realtime, CRUD.
 * Voting and prefixes are delegated to dedicated hooks.
 */
export function useComments(suggestionId: string, workspaceId?: string) {
  const [comments, setComments] = useState<SuggestionComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { userVotes, pendingVotes, loadUserVotes, voteComment: rawVoteComment } = useCommentVotes(suggestionId);
  const { memberPrefixes, loadPrefixes } = useMemberPrefixes();

  const fetchComments = useCallback(async () => {
    try {
      const records = await commentsService.fetchComments(suggestionId);
      setComments(records);
      await loadUserVotes();
      if (workspaceId) await loadPrefixes(workspaceId);
    } catch (err) {
      logger.error('Failed to fetch comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [suggestionId, workspaceId, loadUserVotes, loadPrefixes]);

  // Realtime subscription
  useEffect(() => {
    fetchComments();

    pb.collection('comments').subscribe('*', (e: RecordSubscription<SuggestionComment>) => {
      if (e.record.suggestion !== suggestionId) return;
      setComments((prev) => {
        switch (e.action) {
          case 'create':
            if (prev.find(c => c.id === e.record.id)) return prev;
            return [...prev, e.record];
          case 'update':
            return prev.map((c) => (c.id === e.record.id ? { ...c, ...e.record, expand: c.expand } : c));
          case 'delete':
            return prev.filter((c) => c.id !== e.record.id);
          default:
            return prev;
        }
      });
      
      if (e.action === 'create') {
        commentsService.fetchComment(e.record.id).then(full => {
          setComments(prev => prev.map(c => c.id === full.id ? full : c));
        }).catch(() => {});
      }
    });

    return () => {
      pb.collection('comments').unsubscribe('*');
    };
  }, [fetchComments, suggestionId]);

  // Wrapped voteComment that updates local comments state
  const voteComment = useCallback(async (commentId: string, type: 'upvote' | 'downvote') => {
    const updated = await rawVoteComment(commentId, type);
    if (updated) {
      setComments(prev => prev.map(c => c.id === commentId ? updated : c));
    }
  }, [rawVoteComment]);

  const addComment = useCallback(async (userId: string, text: string, parentId?: string) => {
    const full = await commentsService.createComment({
      userId,
      suggestionId,
      text,
      parentId,
      workspaceId,
    });
    setComments((prev) => [...prev.filter((c) => c.id !== full.id), full]);
    return full;
  }, [suggestionId, workspaceId]);

  const updateComment = useCallback(async (id: string, text: string) => {
    try {
      const record = await commentsService.updateComment(id, text);
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
      return record;
    } catch (err: unknown) {
      logger.error('Failed to update comment:', err);
      throw err;
    }
  }, []);

  const deleteComment = useCallback(async (id: string) => {
    try {
      await commentsService.deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      logger.error('Failed to delete comment:', err);
      throw err;
    }
  }, []);

  return { 
    comments, 
    isLoading, 
    userVotes, 
    memberPrefixes,
    pendingVotes,
    addComment, 
    voteComment,
    updateComment,
    deleteComment,
    refresh: fetchComments 
  };
}
