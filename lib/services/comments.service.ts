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

  // Try to fetch expanded version and notify
  let expandedComment;
  try {
    expandedComment = await pb.collection('comments').getOne<SuggestionComment>(record.id, {
      expand: 'user,suggestion,suggestion.workspace_id,parent_id',
    });

    const { createNotification } = await import('./notifications.helper');
    const suggestion = expandedComment.expand?.suggestion;
    const workspaceSlug = suggestion?.expand?.workspace_id?.slug || suggestion?.workspace_id;
    const link = `/w/${workspaceSlug}/suggestions/${suggestion?.id}`;
    
    if (suggestion && suggestion.author !== data.userId) {
      await createNotification(
        suggestion.author,
        `Новый комментарий к вашему предложению: ${suggestion.title}`,
        link,
        'comment'
      );
    }

    const parentComment = expandedComment.expand?.parent_id;
    if (parentComment && parentComment.user !== data.userId && parentComment.user !== suggestion?.author) {
      await createNotification(
        parentComment.user,
        `Новый ответ на ваш комментарий`,
        link,
        'comment'
      );
    }
    
    return expandedComment;
  } catch (err) {
    console.error('Failed to notify about comment', err);
    return expandedComment || record as unknown as SuggestionComment;
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
