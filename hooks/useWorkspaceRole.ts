import { useEffect,useState } from 'react';

import pb from '@/lib/pocketbase';
import { WorkspaceRole } from '@/types';

export function useWorkspaceRole(workspaceId: string | undefined) {
  const [role, setRole] = useState<WorkspaceRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!workspaceId || !pb.authStore.isValid || !pb.authStore.record) {
      setRole(null);
      return;
    }

    let isMounted = true;

    async function fetchRole() {
      try {
        setIsLoading(true);
        // We try to find the member record for this user in this workspace.
        // workspaceId could be either the ID or the slug.
        const record = await pb.collection('workspace_members').getFirstListItem(
          `user = "${pb.authStore.record?.id}" && (workspace = "${workspaceId}" || workspace.slug = "${workspaceId}")`, 
          { requestKey: null }
        );
        
        if (isMounted) {
          setRole(record.role as WorkspaceRole);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          // 404 means no membership found, which is fine
          const pbError = err as { status?: number };
          if (pbError.status === 404) {
            setRole(null);
          } else {
            console.error('Error fetching workspace role:', err);
            setError(err instanceof Error ? err : new Error(String(err)));
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchRole();

    return () => {
      isMounted = false;
    };
  }, [workspaceId]);

  return { role, isLoading, error };
}
