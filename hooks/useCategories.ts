'use client';

import { useEffect, useState, useCallback } from 'react';
import pb from '@/lib/pocketbase';
import type { Category } from '@/types';
import type { RecordSubscription } from 'pocketbase';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const records = await pb.collection('categories').getFullList<Category>({
        sort: 'name',
        requestKey: null,
      });
      setCategories(records);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();

    pb.collection('categories').subscribe('*', (e: RecordSubscription<Category>) => {
      setCategories((prev) => {
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
