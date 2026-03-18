'use client';

import { useEffect, useState, useCallback } from 'react';
import pb from '@/lib/pocketbase';
import type { Suggestion } from '@/types';
import type { RecordSubscription } from 'pocketbase';

export function useRealtimeSuggestions(initialSuggestions: Suggestion[] = []) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all suggestions
  const fetchSuggestions = useCallback(async () => {
    try {
      const records = await pb.collection('suggestions').getFullList<Suggestion>({
        sort: '-created',
        expand: 'author,category_id',
        requestKey: null, // Disable auto-cancellation
      });
      setSuggestions(records);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();

    // Subscribe to real-time updates
    pb.collection('suggestions').subscribe('*', (e: RecordSubscription<Suggestion>) => {
      setSuggestions((prev) => {
        switch (e.action) {
          case 'create':
            return [e.record, ...prev];
          case 'update':
            return prev.map((s) => (s.id === e.record.id ? e.record : s));
          case 'delete':
            return prev.filter((s) => s.id !== e.record.id);
          default:
            return prev;
        }
      });
    });

    return () => {
      pb.collection('suggestions').unsubscribe('*');
    };
  }, [fetchSuggestions]);

  return { suggestions, isLoading, refetch: fetchSuggestions };
}
