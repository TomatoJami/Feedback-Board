'use client';

import { useEffect, useState, useCallback } from 'react';
import pb from '@/lib/pocketbase';
import { logger } from '@/lib/logger';
import type { Status } from '@/types';
import type { RecordSubscription } from 'pocketbase';

export function useStatuses() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatuses = useCallback(async () => {
    try {
      const records = await pb.collection('statuses').getFullList<Status>({
        sort: 'name',
        requestKey: null,
      });
      setStatuses(records);
    } catch (err) {
      logger.error('Failed to fetch statuses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();

    pb.collection('statuses').subscribe('*', (e: RecordSubscription<Status>) => {
      setStatuses((prev) => {
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
