'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import pb from '@/lib/pocketbase';
import { logger } from '@/lib/logger';
import type { Suggestion } from '@/types';
import type { RecordSubscription } from 'pocketbase';

export function useRealtimeSuggestions(workspaceId?: string, initialSuggestions: Suggestion[] = []) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [isLoading, setIsLoading] = useState(true);
  const realWorkspaceIdRef = useRef<string | null>(null);

  // Fetch all suggestions
  const fetchSuggestions = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const workspaceRecord = await pb.collection('workspaces').getFirstListItem(`slug = "${workspaceId}"`, { requestKey: null });
      realWorkspaceIdRef.current = workspaceRecord.id;

      // Check both ID (if Relation) and slug (if Text field legacy)
      const records = await pb.collection('suggestions').getFullList<Suggestion>({
        filter: `workspace_id = "${workspaceRecord.id}" || workspace_id = "${workspaceId}"`,
        sort: '-created',
        expand: 'author,category_id,status_id',
        requestKey: null, // Disable auto-cancellation
      });
      setSuggestions(records);
    } catch (err) {
      logger.error('Failed to fetch suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchSuggestions();

    // Subscribe to real-time updates
    pb.collection('suggestions').subscribe('*', async (e: RecordSubscription<Suggestion>) => {
      let record = e.record;
      if (e.action === 'create' || e.action === 'update') {
        try {
          // Fetch expanded record because real-time payload doesn't include it
          record = await pb.collection('suggestions').getOne<Suggestion>(e.record.id, {
            expand: 'author,category_id,status_id',
            requestKey: null,
          });
        } catch (err) {
          logger.error('Failed to fetch expanded record for real-time update:', err);
        }
      }

      setSuggestions((prev) => {
        // Skip updates for other workspaces
        if (realWorkspaceIdRef.current && record.workspace_id !== realWorkspaceIdRef.current) return prev;
        
        switch (e.action) {
          case 'create':
            return [record, ...prev];
          case 'update':
            return prev.map((s) => (s.id === record.id ? record : s));
          case 'delete':
            return prev.filter((s) => s.id !== record.id);
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
