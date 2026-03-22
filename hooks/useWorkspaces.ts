import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';
import type { Workspace } from '@/types/workspace';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [invitedWorkspaceIds, setInvitedWorkspaceIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchWorkspaces() {
      try {
        setIsLoading(true);
        // Fetch public workspaces and user's workspaces
        const records = await pb.collection('workspaces').getFullList<Workspace>({
          sort: '-created',
          expand: 'owner',
        });

        let invitedIds: string[] = [];
        if (pb.authStore.record) {
          try {
            const memberRecords = await pb.collection('workspace_members').getFullList({
              filter: `user = "${pb.authStore.record.id}"`,
              requestKey: null
            });
            invitedIds = memberRecords.map(m => m.workspace);
          } catch (e) {
            console.error('Failed to fetch invited workspaces', e);
          }
        }
        
        if (isMounted) {
          setWorkspaces(records);
          setInvitedWorkspaceIds(invitedIds);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          console.error('Error fetching workspaces:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchWorkspaces();

    // Subscribe to realtime updates
    const subscribe = async () => {
      try {
        await pb.collection('workspaces').subscribe<Workspace>('*', (e) => {
          if (e.action === 'create') {
            setWorkspaces((prev) => [e.record, ...prev]);
          } else if (e.action === 'update') {
            setWorkspaces((prev) =>
              prev.map((w) => (w.id === e.record.id ? e.record : w))
            );
          } else if (e.action === 'delete') {
            setWorkspaces((prev) => prev.filter((w) => w.id !== e.record.id));
          }
        });
      } catch (err) {
        console.error('Realtime subscription error (workspaces):', err);
      }
    };

    subscribe();

    return () => {
      isMounted = false;
      pb.collection('workspaces').unsubscribe('*');
    };
  }, []);

  return { workspaces, invitedWorkspaceIds, isLoading, error };
}
