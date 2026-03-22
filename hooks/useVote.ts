'use client';

import { useCallback, useEffect,useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { logger } from '@/lib/logger';
import pb from '@/lib/pocketbase';
import type { Vote, VoteType } from '@/types';

import { useAuth } from './useAuth';

const CHANGE_WINDOW_MS = 15_000;
const VOTE_SPAM_PROTECTION_MS = 500;

interface UseVoteReturn {
  voteType: VoteType | null;
  isPending: boolean;
  remainingSeconds: number;
  isLoading: boolean;
  optimisticScore: number;
  vote: (type: VoteType, authorId?: string) => Promise<void>;
}

export function useVote(suggestionId: string, initialScore?: number): UseVoteReturn {
  const { user } = useAuth();
  const [voteType, setVoteType] = useState<VoteType | null>(null);
  const [voteId, setVoteId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticScore, setOptimisticScore] = useState(initialScore ?? 0);
  const [isLocked, setIsLocked] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastClickRef = useRef<number>(0);
  const isRequestInFlightRef = useRef(false);

  // Sync initialScore from external
  useEffect(() => {
    if (initialScore !== undefined) {
      setOptimisticScore(initialScore);
    }
  }, [initialScore]);

  // On mount: check existing vote → it's already committed (page was refreshed)
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const result = await pb.collection('votes').getList<Vote>(1, 1, {
          filter: `user = "${user.id}" && suggestion = "${suggestionId}"`,
          requestKey: null,
        });
        if (result.totalItems > 0) {
          setVoteType(result.items[0].type || 'upvote');
          setVoteId(result.items[0].id);
          // Vote exists in DB and page was loaded/refreshed → locked
          setIsLocked(true);
          setIsPending(false);
        }
      } catch (_err: unknown) {
        // No vote found
      }
    })();
  }, [user, suggestionId]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startChangeTimer = useCallback(() => {
    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    setIsPending(true);
    setRemainingSeconds(15);

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = setTimeout(() => {
      // Timer expired → lock vote
      setIsPending(false);
      setIsLocked(true);
      setRemainingSeconds(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }, CHANGE_WINDOW_MS);
  }, []);

  const vote = useCallback(async (type: VoteType, authorId?: string) => {
    if (!user || isRequestInFlightRef.current) return;

    // Spam protection
    const now = Date.now();
    if (now - lastClickRef.current < VOTE_SPAM_PROTECTION_MS) return;

    if (authorId && user.id === authorId) {
      toast.error('Вы не можете голосовать за свое предложение');
      return;
    }

    // Already voted same type → do nothing
    if (voteType === type) {
      return;
    }

    // Vote is locked (15s passed or page was refreshed) → do nothing
    if (isLocked && voteId) {
      toast('Голос уже зафиксирован', { icon: '🔒' });
      return;
    }

    isRequestInFlightRef.current = true;
    lastClickRef.current = now;

    // Capture previous state for rollback
    const previousVoteType = voteType;
    const previousScore = optimisticScore;
    const previousVoteId = voteId;

    // Optimistic UI update
    let newScore = optimisticScore;
    if (previousVoteType) {
      // Remove old vote effect
      newScore += previousVoteType === 'upvote' ? -1 : 1;
    }
    // Add new vote effect
    newScore += type === 'upvote' ? 1 : -1;

    setVoteType(type);
    setOptimisticScore(newScore);
    setIsLoading(true);

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({
          suggestionId,
          type,
          action: 'vote',
        }),
      });

      if (!response.ok) {
        throw new Error('Vote failed on server');
      }

      const result = await response.json();
      setVoteId(result.id);
      // Start/restart the 15s change window
      startChangeTimer();
    } catch (err: unknown) {
      // Rollback
      setVoteType(previousVoteType);
      setOptimisticScore(previousScore);
      setVoteId(previousVoteId);
      logger.error('Vote failed:', err);
      toast.error('Ошибка при голосовании');
    } finally {
      setIsLoading(false);
      isRequestInFlightRef.current = false;
    }
  }, [user, voteType, voteId, suggestionId, optimisticScore, isLocked, startChangeTimer]);

  return {
    voteType,
    isPending,
    remainingSeconds,
    isLoading,
    optimisticScore,
    vote,
  };
}
