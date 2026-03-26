'use client';

import { useCallback, useState } from 'react';

import { fetchMemberPrefixes as fetchPrefixes } from '@/lib/services/comments.service';
import type { UserPrefix } from '@/types';

/**
 * Hook for loading workspace member prefixes.
 * Separated from useComments for single responsibility.
 */
export function useMemberPrefixes() {
  const [memberPrefixes, setMemberPrefixes] = useState<Record<string, UserPrefix[]>>({});

  const loadPrefixes = useCallback(async (workspaceId: string) => {
    const prefixMap = await fetchPrefixes(workspaceId);
    setMemberPrefixes(prefixMap);
  }, []);

  return { memberPrefixes, loadPrefixes };
}
