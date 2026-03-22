'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import pb from '@/lib/pocketbase';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';
import type { Vote, VoteType } from '@/types';

const REVOKE_WINDOW_MS = 15_000;
const VOTE_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const COOLDOWN_KEY = 'fb_last_vote_time';

function getLastVoteTime(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(COOLDOWN_KEY) || '0', 10);
}

function setLastVoteTime() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
  }
}

interface UseVoteReturn {
  voteType: VoteType | null;
  isRevocable: boolean;
  remainingSeconds: number;
  isLoading: boolean;
  cooldownActive: boolean;
  optimisticScore: number;
  vote: (type: VoteType, authorId?: string) => Promise<void>;
  revokeVote: () => Promise<void>;
}

export function useVote(suggestionId: string, initialScore?: number): UseVoteReturn {
  const { user } = useAuth();
  const [voteType, setVoteType] = useState<VoteType | null>(null);
  const [voteId, setVoteId] = useState<string | null>(null);
  const [isRevocable, setIsRevocable] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [optimisticScore, setOptimisticScore] = useState(initialScore ?? 0);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync initialScore if it changes from external sources (like realtime subscriptions)
  useEffect(() => {
    if (initialScore !== undefined) {
      setOptimisticScore(initialScore);
    }
  }, [initialScore]);

  // Check existing vote
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
        }
      } catch {
        // No vote found
      }
    })();
  }, [user, suggestionId]);

  // Check cooldown
  useEffect(() => {
    const diff = Date.now() - getLastVoteTime();
    if (diff < VOTE_COOLDOWN_MS) {
      setCooldownActive(true);
      const timeout = setTimeout(() => setCooldownActive(false), VOTE_COOLDOWN_MS - diff);
      return () => clearTimeout(timeout);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startRevocationTimer = useCallback(() => {
    setIsRevocable(true);
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
      setIsRevocable(false);
      setRemainingSeconds(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }, REVOKE_WINDOW_MS);
  }, []);

  const clearTimers = useCallback(() => {
    setIsRevocable(false);
    setRemainingSeconds(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const vote = useCallback(async (type: VoteType, authorId?: string) => {
    if (!user || isLoading || cooldownActive) return;

    if (authorId && user.id === authorId) {
      const toast = (await import('react-hot-toast')).default;
      toast.error('Вы не можете голосовать за свое предложение');
      return;
    }

    // If already voted same type → do nothing
    if (voteType === type && voteId) {
      return;
    }

    // Capture previous state for fallback
    const previousVoteType = voteType;
    const previousScore = optimisticScore;

    // Optimistically update UI
    let newScore = optimisticScore;
    if (previousVoteType) {
      // Remove old vote effect
      newScore += previousVoteType === 'upvote' ? -1 : 1;
    }
    // Add new vote effect
    newScore += type === 'upvote' ? 1 : -1;

    setVoteType(type);
    setOptimisticScore(newScore);
    // Give immediate feedback by setting loading to true
    // Wait, setting `isLoading(true)` disables the button visually immediately, which is fine,
    // but we want the UI to feel instant, not disabled. Actually we shouldn't disable it during optimistic.
    // Let's keep `isLoading = false` for optimistic feel, or only disable the opposite button.
    setIsLoading(true);

    try {
      // If voted opposite type, remove old vote first
      if (voteId) {
        await pb.collection('votes').delete(voteId);
        // Atomically adjust score for removed vote
        const oldAdjust = previousVoteType === 'upvote' ? { 'votes_count-': 1 } : { 'votes_count+': 1 };
        await pb.collection('suggestions').update(suggestionId, oldAdjust);
      }

      // Create new vote
      const newVote = await pb.collection('votes').create<Vote>({
        user: user.id,
        suggestion: suggestionId,
        type,
      });

      // Atomically update score
      const newAdjust = type === 'upvote' ? { 'votes_count+': 1 } : { 'votes_count-': 1 };
      await pb.collection('suggestions').update(suggestionId, newAdjust);

      setVoteId(newVote.id);
      setLastVoteTime();
      setCooldownActive(true);
      setTimeout(() => setCooldownActive(false), VOTE_COOLDOWN_MS);
      startRevocationTimer();
    } catch (err: any) {
      // Revert on failure
      setVoteType(previousVoteType);
      setOptimisticScore(previousScore);
      logger.error('Vote failed:', err);
      toast.error('Ошибка при голосовании');
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, cooldownActive, voteType, voteId, suggestionId, optimisticScore, startRevocationTimer]);

  const revokeVote = useCallback(async () => {
    if (!isRevocable || !voteId || isLoading) return;

    const previousVoteType = voteType;
    const previousScore = optimisticScore;

    let newScore = optimisticScore;
    if (voteType) {
      newScore += voteType === 'upvote' ? -1 : 1;
    }

    // Optimistic UI update
    setVoteType(null);
    setOptimisticScore(newScore);
    clearTimers();
    setIsLoading(true);

    try {
      await pb.collection('votes').delete(voteId);
      // Atomically adjust score for revoked vote
      const revokeAdjust = previousVoteType === 'upvote' ? { 'votes_count-': 1 } : { 'votes_count+': 1 };
      await pb.collection('suggestions').update(suggestionId, revokeAdjust);
      setVoteId(null);
    } catch (err: any) {
      // Revert on failure
      setVoteType(previousVoteType);
      setOptimisticScore(previousScore);
      logger.error('Revoke failed:', err);
      toast.error('Ошибка при отмене голоса');
    } finally {
      setIsLoading(false);
    }
  }, [isRevocable, voteId, isLoading, suggestionId, voteType, optimisticScore, clearTimers]);

  return {
    voteType,
    isRevocable,
    remainingSeconds,
    isLoading,
    cooldownActive,
    optimisticScore,
    vote,
    revokeVote,
  };
}
