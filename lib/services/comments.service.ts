import pb from '@/lib/pocketbase';
import type { SuggestionComment, UserPrefix } from '@/types';

/**
 * Fetch all comments for a suggestion with expanded user data.
 */
export async function fetchComments(suggestionId: string): Promise<SuggestionComment[]> {
  return pb.collection('comments').getFullList<SuggestionComment>({
    filter: `suggestion = "${suggestionId}"`,
    sort: 'created',
    expand: 'user',
    requestKey: null,
  });
}

/**
 * Fetch a single comment with expanded user data.
 */
export async function fetchComment(commentId: string): Promise<SuggestionComment> {
  return pb.collection('comments').getOne<SuggestionComment>(commentId, {
    expand: 'user',
  });
}

/**
 * Create a new comment.
 */
export async function createComment(data: {
  userId: string;
  suggestionId: string;
  text: string;
  parentId?: string;
  workspaceId?: string;
}): Promise<SuggestionComment> {
  const record = await pb.collection('comments').create({
    user: data.userId,
    suggestion: data.suggestionId,
    text: data.text,
    parent_id: data.parentId || null,
    workspace_id: data.workspaceId || null,
  });

  // Try to fetch expanded version
  try {
    return await pb.collection('comments').getOne<SuggestionComment>(record.id, {
      expand: 'user',
    });
  } catch {
    return record as unknown as SuggestionComment;
  }
}

/**
 * Update a comment's text.
 */
export async function updateComment(id: string, text: string) {
  return pb.collection('comments').update(id, { text });
}

/**
 * Delete a comment.
 */
export async function deleteComment(id: string) {
  return pb.collection('comments').delete(id);
}

/**
 * Fetch workspace member prefixes mapped by user ID.
 */
export async function fetchMemberPrefixes(
  workspaceId: string,
): Promise<Record<string, UserPrefix[]>> {
  const members = await pb.collection('workspace_members').getFullList({
    filter: `workspace = "${workspaceId}"`,
    expand: 'prefixes',
    requestKey: null,
  });

  const prefixMap: Record<string, UserPrefix[]> = {};
  members.forEach(m => {
    if (m.expand?.prefixes) {
      prefixMap[m.user] = m.expand.prefixes;
    }
  });
  return prefixMap;
}
