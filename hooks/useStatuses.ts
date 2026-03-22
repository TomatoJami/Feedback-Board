'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import pb from '@/lib/pocketbase';
import { logger } from '@/lib/logger';
import type { Status } from '@/types';
import type { RecordSubscription } from 'pocketbase';

export function useStatuses(workspaceId?: string) {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const realWorkspaceIdRef = useRef<string | null>(null);

  const fetchStatuses = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const workspaceRecord = await pb.collection('workspaces').getFirstListItem(`slug = "${workspaceId}" || id = "${workspaceId}"`, { requestKey: null });
      realWorkspaceIdRef.current = workspaceRecord.id;

      // Check both ID (if Relation) and slug (if Text field legacy)
      const records = await pb.collection('statuses').getFullList<Status>({
        filter: `workspace_id = "${workspaceRecord.id}" || workspace_id = "${workspaceId}"`,
        sort: 'name',
        requestKey: null,
      });
      setStatuses(records);
    } catch (err) {
      logger.error('Failed to fetch statuses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchStatuses();

    pb.collection('statuses').subscribe('*', (e: RecordSubscription<Status>) => {
      setStatuses((prev) => {
        if (realWorkspaceIdRef.current && e.record.workspace_id !== realWorkspaceIdRef.current) return prev;
        switch (e.action) {
          case 'create':
            return [...prev, e.record].sort((a, b) => a.name.localeCompare(b.name));
          case 'update':
            return prev.map((s) => (s.id === e.record.id ? e.record : s)).sort((a, b) => a.name.localeCompare(b.name));
          case 'delete':
            return prev.filter((s) => s.id !== e.record.id);
          default:
            return prev;
        }
      });
    });

    return () => {
      pb.collection('statuses').unsubscribe('*');
    };
  }, [fetchStatuses]);

  return { statuses, isLoading, refetch: fetchStatuses };
}
