import { useEffect,useState } from 'react';

import pb from '@/lib/pocketbase';
import { fetchWorkspaceRole } from '@/lib/services/workspaces.service';
import { WorkspaceRole } from '@/types';

export function useWorkspaceRole(workspaceId: string | undefined) {
  const [role, setRole] = useState<WorkspaceRole | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!workspaceId || !pb.authStore.isValid || !pb.authStore.record) {
      setRole(null);
      setIsOwner(false);
      return;
    }

    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        const result = await fetchWorkspaceRole(pb.authStore.record!.id, workspaceId!);
        
        if (isMounted) {
          setRole(result.role);
          setIsOwner(result.isOwner);
          setIsFrozen(result.isFrozen || false);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Error fetching workspace role:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [workspaceId]);

  return { role, isOwner, isFrozen, isLoading, error };
}
