import pb from '@/lib/pocketbase';
import type { Suggestion } from '@/types';

/**
 * Resolve a workspace slug or ID to the actual workspace record ID.
 * Shared utility used by multiple hooks that need to convert slug → id.
 */
export async function resolveWorkspaceId(slugOrId: string): Promise<string> {
  const record = await pb.collection('workspaces').getFirstListItem(
    `slug = "${slugOrId}" || id = "${slugOrId}"`,
    { requestKey: null },
  );
  return record.id;
}

/**
 * Fetch all suggestions for a workspace (by resolved ID and original slug/id).
 */
export async function fetchSuggestions(
  resolvedId: string,
  originalSlugOrId: string,
): Promise<Suggestion[]> {
  return pb.collection('suggestions').getFullList<Suggestion>({
    filter: `workspace_id = "${resolvedId}" || workspace_id = "${originalSlugOrId}"`,
    sort: '-created',
    expand: 'author,category_id,status_id',
    requestKey: null,
  });
}

/**
 * Fetch a single suggestion with full expand.
 */
export async function fetchSuggestion(id: string): Promise<Suggestion> {
  return pb.collection('suggestions').getOne<Suggestion>(id, {
    expand: 'author,category_id,status_id',
    requestKey: null,
  });
}
