import pb from '@/lib/pocketbase';
import type { Workspace, WorkspaceRole } from '@/types';

/**
 * Fetch all workspaces with expanded owner.
 */
export async function fetchWorkspaces(): Promise<Workspace[]> {
  return pb.collection('workspaces').getFullList<Workspace>({
    sort: '-created',
    expand: 'owner',
  });
}

/**
 * Fetch workspace IDs where the user is a member.
 */
export async function fetchUserMemberships(userId: string): Promise<string[]> {
  const memberRecords = await pb.collection('workspace_members').getFullList({
    filter: `user = "${userId}"`,
    requestKey: null,
  });
  return memberRecords.map(m => m.workspace);
}

/**
 * Fetch a user's role in a specific workspace.
 * Returns null if user is not a member.
 */
export async function fetchWorkspaceRole(
  userId: string,
  workspaceId: string,
): Promise<WorkspaceRole | null> {
  try {
    const record = await pb.collection('workspace_members').getFirstListItem(
      `user = "${userId}" && (workspace = "${workspaceId}" || workspace.slug = "${workspaceId}")`,
      { requestKey: null },
    );
    return record.role as WorkspaceRole;
  } catch (err: unknown) {
    const pbError = err as { status?: number };
    if (pbError.status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Fetch workspace by slug.
 */
export async function fetchWorkspaceBySlug(slug: string) {
  return pb.collection('workspaces').getFirstListItem(
    `slug = "${slug}"`,
    { requestKey: null },
  );
}

/**
 * Fetch workspace member record for a specific user.
 */
export async function fetchMemberRecord(workspaceId: string, userId: string) {
  return pb.collection('workspace_members').getFirstListItem(
    `workspace = "${workspaceId}" && user = "${userId}"`,
    { requestKey: null },
  ).catch(() => null);
}
