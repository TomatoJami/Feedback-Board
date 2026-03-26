'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@/lib/logger';
import pb from '@/lib/pocketbase';
import { fetchComment } from '@/lib/services/comments.service';
import { getUserCommentVotes, voteOnComment } from '@/lib/services/votes.service';
import type { SuggestionComment } from '@/types';

const CHANGE_WINDOW_MS = 15_000;

export interface CommentPendingVote {
  commentId: string;
  type: 'upvote' | 'downvote';
  remainingSeconds: number;
}

/**
 * Hook for managing comment votes: tracking user votes, pending timers, and vote locking.
 * Separated from useComments for single responsibility.
 */
export function useCommentVotes(suggestionId: string) {
  const [userVotes, setUserVotes] = useState<Record<string, 'upvote' | 'downvote' | null>>({});
  const [pendingVotes, setPendingVotes] = useState<Record<string, CommentPendingVote>>({});

  const lockedVotesRef = useRef<Set<string>>(new Set());
  const pendingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Load existing votes from DB (marks them as locked). */
  const loadUserVotes = useCallback(async () => {
    if (!pb.authStore.record) return;
    const voteMap = await getUserCommentVotes(pb.authStore.record.id, suggestionId);
    Object.keys(voteMap).forEach(commentId => lockedVotesRef.current.add(commentId));
    setUserVotes(voteMap);
  }, [suggestionId]);

  // Countdown interval for pending vote timers
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
      Object.values(currentTimers).forEach(clearTimeout);
    };
  }, []);

  const startPendingTimer = useCallback((commentId: string, type: 'upvote' | 'downvote') => {
    if (pendingTimersRef.current[commentId]) {
      clearTimeout(pendingTimersRef.current[commentId]);
    }

    setPendingVotes(prev => ({
      ...prev,
      [commentId]: { commentId, type, remainingSeconds: 15 },
    }));

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

  /** Cast or change a vote on a comment, returns the refreshed comment or null. */
  const voteComment = useCallback(async (
    commentId: string,
    type: 'upvote' | 'downvote',
  ): Promise<SuggestionComment | null> => {
    if (!pb.authStore.record) return null;
    const userId = pb.authStore.record.id;
    const existingType = userVotes[commentId];

    if (existingType === type) return null;
    if (lockedVotesRef.current.has(commentId) && existingType) return null;

    try {
      await voteOnComment(userId, commentId, existingType || null, type);
      setUserVotes(prev => ({ ...prev, [commentId]: type }));
      startPendingTimer(commentId, type);

      try {
        return await fetchComment(commentId);
      } catch { return null; }
    } catch (err: unknown) {
      logger.error('Comment vote failed:', err);
      return null;
    }
  }, [userVotes, startPendingTimer]);

  return { userVotes, pendingVotes, loadUserVotes, voteComment };
}
