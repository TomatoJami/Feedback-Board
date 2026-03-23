'use client';

import type { RecordSubscription } from 'pocketbase';
import { useCallback, useEffect, useRef,useState } from 'react';

import { logger } from '@/lib/logger';
import pb from '@/lib/pocketbase';
import { fetchSuggestion, fetchSuggestions, resolveWorkspaceId } from '@/lib/services/suggestions.service';
import type { Suggestion } from '@/types';

export function useRealtimeSuggestions(workspaceId?: string, initialSuggestions: Suggestion[] = []) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [isLoading, setIsLoading] = useState(true);
  const realWorkspaceIdRef = useRef<string | null>(null);

  // Fetch all suggestions
  const fetchAll = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const resolvedId = await resolveWorkspaceId(workspaceId);
      realWorkspaceIdRef.current = resolvedId;

      const records = await fetchSuggestions(resolvedId, workspaceId);
      setSuggestions(records);
    } catch (err) {
      logger.error('Failed to fetch suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchAll();

    // Subscribe to real-time updates
    pb.collection('suggestions').subscribe('*', async (e: RecordSubscription<Suggestion>) => {
      let record = e.record;
      if (e.action === 'create' || e.action === 'update') {
        try {
          record = await fetchSuggestion(e.record.id);
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
  }, [fetchAll]);

  return { suggestions, isLoading, refetch: fetchAll };
}
