'use client';

import { useEffect, useState, useCallback } from 'react';
import pb from '@/lib/pocketbase';
import { logger } from '@/lib/logger';
import type { SuggestionComment } from '@/types';
import type { RecordSubscription } from 'pocketbase';

export function useComments(suggestionId: string) {
  const [comments, setComments] = useState<SuggestionComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, 'upvote' | 'downvote' | null>>({});

  const fetchComments = useCallback(async () => {
    try {
      // 1. Fetch comments
      const records = await pb.collection('comments').getFullList<SuggestionComment>({
        filter: `suggestion = "${suggestionId}"`,
        sort: 'created',
        expand: 'user.prefixes',
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
        });
        setUserVotes(voteMap);
      }
    } catch (err) {
      logger.error('Failed to fetch comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [suggestionId]);

  useEffect(() => {
    fetchComments();

    const unsubscribeComments = pb.collection('comments').subscribe('*', (e: RecordSubscription<SuggestionComment>) => {
      if (e.record.suggestion !== suggestionId) return;
      setComments((prev) => {
        switch (e.action) {
          case 'create':
            // If we already have it (from manual add), skip
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
        pb.collection('comments').getOne<SuggestionComment>(e.record.id, { expand: 'user.prefixes' }).then(full => {
          setComments(prev => prev.map(c => c.id === full.id ? full : c));
        }).catch(() => {});
      }
    });

    return () => {
      pb.collection('comments').unsubscribe('*');
    };
  }, [fetchComments, suggestionId]);

  const addComment = useCallback(async (userId: string, text: string, parentId?: string) => {
    const record = await pb.collection('comments').create({
      user: userId,
      suggestion: suggestionId,
      text,
      parent_id: parentId || null,
    });
    
    try {
      const full = await pb.collection('comments').getOne<SuggestionComment>(record.id, { expand: 'user.prefixes' });
      setComments((prev) => [...prev.filter((c) => c.id !== full.id), full]);
      return full;
    } catch {
      return record;
    }
  }, [suggestionId]);

  const voteComment = useCallback(async (commentId: string, type: 'upvote' | 'downvote') => {
    if (!pb.authStore.record) return;
    const userId = pb.authStore.record.id;
    const existingType = userVotes[commentId];

    try {
      if (existingType === type) {
        // 1. Revoke vote
        const existing = await pb.collection('comment_votes').getFirstListItem(`user="${userId}" && comment="${commentId}"`);
        await pb.collection('comment_votes').delete(existing.id);
        
        // Update counter on comment
        const field = type === 'upvote' ? 'upvotes' : 'downvotes';
        await pb.collection('comments').update(commentId, { [`${field}-`]: 1 });
        
        setUserVotes(prev => ({ ...prev, [commentId]: null }));
      } else {
        if (existingType) {
          // 2. Change vote (e.g. up -> down)
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
          // 3. New vote
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
      }
    } catch (err) {
      // Failed to vote
    }
  }, [userVotes]);

  return { comments, isLoading, userVotes, addComment, voteComment, refresh: fetchComments };
}
