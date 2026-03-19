'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import pb from '@/lib/pocketbase';
import { logger } from '@/lib/logger';
import type { Category } from '@/types';
import type { RecordSubscription } from 'pocketbase';

export function useCategories(workspaceId?: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const realWorkspaceIdRef = useRef<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const workspaceRecord = await pb.collection('workspaces').getFirstListItem(`slug = "${workspaceId}"`, { requestKey: null });
      realWorkspaceIdRef.current = workspaceRecord.id;

      // Check both ID (if Relation) and slug (if Text field legacy)
      const records = await pb.collection('categories').getFullList<Category>({
        filter: `workspace_id = "${workspaceRecord.id}" || workspace_id = "${workspaceId}"`,
        sort: 'name',
        requestKey: null,
      });
      setCategories(records);
    } catch (err) {
      logger.error('Failed to fetch categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchCategories();

    pb.collection('categories').subscribe('*', (e: RecordSubscription<Category>) => {
      setCategories((prev) => {
        if (realWorkspaceIdRef.current && e.record.workspace_id !== realWorkspaceIdRef.current) return prev;
        switch (e.action) {
          case 'create':
            return [...prev, e.record].sort((a, b) => a.name.localeCompare(b.name));
          case 'update':
            return prev.map((c) => (c.id === e.record.id ? e.record : c)).sort((a, b) => a.name.localeCompare(b.name));
          case 'delete':
            return prev.filter((c) => c.id !== e.record.id);
          default:
            return prev;
        }
      });
    });

    return () => {
      pb.collection('categories').unsubscribe('*');
    };
  }, [fetchCategories]);

  return { categories, isLoading, refetch: fetchCategories };
}
