'use client';

import type { RecordSubscription } from 'pocketbase';
import { useCallback, useEffect, useRef,useState } from 'react';

import { logger } from '@/lib/logger';
import pb from '@/lib/pocketbase';
import * as commentsService from '@/lib/services/comments.service';
import { getUserCommentVotes, voteOnComment } from '@/lib/services/votes.service';
import type { SuggestionComment, UserPrefix } from '@/types';

const CHANGE_WINDOW_MS = 15_000;

export interface CommentPendingVote {
  commentId: string;
  type: 'upvote' | 'downvote';
  remainingSeconds: number;
}

export function useComments(suggestionId: string, workspaceId?: string) {
  const [comments, setComments] = useState<SuggestionComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, 'upvote' | 'downvote' | null>>({});
  const [memberPrefixes, setMemberPrefixes] = useState<Record<string, UserPrefix[]>>({});
  const [pendingVotes, setPendingVotes] = useState<Record<string, CommentPendingVote>>({});

  // Track locked votes (loaded from DB on mount, or timer expired)
  const lockedVotesRef = useRef<Set<string>>(new Set());
  const pendingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      // 1. Fetch comments
      const records = await commentsService.fetchComments(suggestionId);
      setComments(records);

      // 2. Fetch current user's votes on these comments if logged in
      if (pb.authStore.record) {
        const voteMap = await getUserCommentVotes(pb.authStore.record.id, suggestionId);
        // Mark all existing votes as locked
        Object.keys(voteMap).forEach(commentId => lockedVotesRef.current.add(commentId));
        setUserVotes(voteMap);
      }

      // 3. Fetch workspace members mapped to prefixes
      if (workspaceId) {
        const prefixMap = await commentsService.fetchMemberPrefixes(workspaceId);
        setMemberPrefixes(prefixMap);
      }

    } catch (err) {
      logger.error('Failed to fetch comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [suggestionId, workspaceId]);

  // Start countdown interval for pending votes
  useEffect(() => {
    const currentTimers = pendingTimersRef.current;
    
    countdownIntervalRef.current = setInterval(() => {
      setPendingVotes(prev => {
        const updated = { ...prev };
        let changed = false;
        for (const key of Object.keys(updated)) {
          if (updated[key].remainingSeconds > 0) {
            updated[key] = { ...updated[key], remainingSeconds: updated[key].remainingSeconds - 1 };
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      // Clear all pending timers on unmount
      Object.values(currentTimers).forEach(clearTimeout);
    };
  }, []);

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

  const startPendingTimer = useCallback((commentId: string, type: 'upvote' | 'downvote') => {
    // Clear existing timer for this comment
    if (pendingTimersRef.current[commentId]) {
      clearTimeout(pendingTimersRef.current[commentId]);
    }

    // Add to pending votes
    setPendingVotes(prev => ({
      ...prev,
      [commentId]: { commentId, type, remainingSeconds: 15 },
    }));

    // Set timer to lock vote after 15s
    pendingTimersRef.current[commentId] = setTimeout(() => {
      lockedVotesRef.current.add(commentId);
      setPendingVotes(prev => {
        const updated = { ...prev };
        delete updated[commentId];
        return updated;
      });
      delete pendingTimersRef.current[commentId];
    }, CHANGE_WINDOW_MS);
  }, []);

  const handleVoteComment = useCallback(async (commentId: string, type: 'upvote' | 'downvote') => {
    if (!pb.authStore.record) return;
    const userId = pb.authStore.record.id;
    const existingType = userVotes[commentId];

    // Already voted same type → do nothing
    if (existingType === type) return;

    // Vote is locked → do nothing
    if (lockedVotesRef.current.has(commentId) && existingType) {
      return;
    }

    try {
      await voteOnComment(userId, commentId, existingType || null, type);
      
      setUserVotes(prev => ({ ...prev, [commentId]: type }));
      startPendingTimer(commentId, type);

      // Refresh comment to get updated counts
      try {
        const updated = await commentsService.fetchComment(commentId);
        setComments(prev => prev.map(c => c.id === commentId ? updated : c));
      } catch (_err) { }
    } catch (err: unknown) {
      logger.error('Comment vote failed:', err);
    }
  }, [userVotes, startPendingTimer]);

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

  const handleUpdateComment = useCallback(async (id: string, text: string) => {
    try {
      const record = await commentsService.updateComment(id, text);
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
      return record;
    } catch (err: unknown) {
      logger.error('Failed to update comment:', err);
      throw err;
    }
  }, []);

  const handleDeleteComment = useCallback(async (id: string) => {
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
    voteComment: handleVoteComment, 
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,
    refresh: fetchComments 
  };
}
