'use client';

import type { RecordSubscription } from 'pocketbase';
import { useCallback, useEffect, useRef,useState } from 'react';

import { logger } from '@/lib/logger';
import pb from '@/lib/pocketbase';
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
      const records = await pb.collection('comments').getFullList<SuggestionComment>({
        filter: `suggestion = "${suggestionId}"`,
        sort: 'created',
        expand: 'user',
        requestKey: null,
      });
      setComments(records);

      // 2. Fetch current user's votes on these comments if logged in
      if (pb.authStore.record) {
        const votes = await pb.collection('comment_votes').getFullList({
          filter: `user = "${pb.authStore.record.id}" && comment.suggestion = "${suggestionId}"`,
          requestKey: null,
        });
        const voteMap: Record<string, 'upvote' | 'downvote'> = {};
        votes.forEach(v => {
          voteMap[v.comment] = v.type as 'upvote' | 'downvote';
          // Existing votes loaded from DB = locked (page was refreshed/loaded)
          lockedVotesRef.current.add(v.comment);
        });
        setUserVotes(voteMap);
      }

      // 3. Fetch workspace members mapped to prefixes
      if (workspaceId) {
        const members = await pb.collection('workspace_members').getFullList({
          filter: `workspace = "${workspaceId}"`,
          expand: 'prefixes',
          requestKey: null,
        });
        const prefixMap: Record<string, UserPrefix[]> = {};
        members.forEach(m => {
          if (m.expand?.prefixes) {
            prefixMap[m.user] = m.expand.prefixes;
          }
        });
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
        pb.collection('comments').getOne<SuggestionComment>(e.record.id, { expand: 'user' }).then(full => {
          setComments(prev => prev.map(c => c.id === full.id ? full : c));
        }).catch((_e) => {});
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

  const voteComment = useCallback(async (commentId: string, type: 'upvote' | 'downvote') => {
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
      if (existingType) {
        // Change vote (e.g. up -> down)
        const existing = await pb.collection('comment_votes').getFirstListItem(`user="${userId}" && comment="${commentId}"`);
        await pb.collection('comment_votes').update(existing.id, { type });
        
        // Update counters on comment
        const oldField = existingType === 'upvote' ? 'upvotes' : 'downvotes';
        const newField = type === 'upvote' ? 'upvotes' : 'downvotes';
        await pb.collection('comments').update(commentId, { 
          [`${oldField}-`]: 1,
          [`${newField}+`]: 1
        });
      } else {
        // New vote
        await pb.collection('comment_votes').create({
          user: userId,
          comment: commentId,
          type,
        });
        
        // Update counter on comment
        const field = type === 'upvote' ? 'upvotes' : 'downvotes';
        await pb.collection('comments').update(commentId, { [`${field}+`]: 1 });
      }
      
      setUserVotes(prev => ({ ...prev, [commentId]: type }));
      startPendingTimer(commentId, type);

      // Refresh comment to get updated counts
      try {
        const updated = await pb.collection('comments').getOne<SuggestionComment>(commentId, { expand: 'user' });
        setComments(prev => prev.map(c => c.id === commentId ? updated : c));
      } catch (_err) { }
    } catch (err: unknown) {
      logger.error('Comment vote failed:', err);
    }
  }, [userVotes, startPendingTimer]);

  const addComment = useCallback(async (userId: string, text: string, parentId?: string) => {
    const record = await pb.collection('comments').create({
      user: userId,
      suggestion: suggestionId,
      text,
      parent_id: parentId || null,
      workspace_id: workspaceId || null,
    });
    
    try {
      const full = await pb.collection('comments').getOne<SuggestionComment>(record.id, { expand: 'user' });
      setComments((prev) => [...prev.filter((c) => c.id !== full.id), full]);
      return full;
    } catch (_err) {
      return record;
    }
  }, [suggestionId, workspaceId]);

  const updateComment = useCallback(async (id: string, text: string) => {
    try {
      const record = await pb.collection('comments').update(id, { text });
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
      return record;
    } catch (err: unknown) {
      logger.error('Failed to update comment:', err);
      throw err;
    }
  }, []);

  const deleteComment = useCallback(async (id: string) => {
    try {
      await pb.collection('comments').delete(id);
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
