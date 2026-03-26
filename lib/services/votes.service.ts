import pb from '@/lib/pocketbase';
import type { Vote, VoteType } from '@/types';

/**
 * Fetch a user's existing vote on a suggestion.
 * Returns the vote record or null if none exists.
 */
export async function getUserVote(userId: string, suggestionId: string): Promise<Vote | null> {
  const result = await pb.collection('votes').getList<Vote>(1, 1, {
    filter: `user = "${userId}" && suggestion = "${suggestionId}"`,
    requestKey: null,
  });
  return result.totalItems > 0 ? result.items[0] : null;
}

/**
 * Cast or change a vote via the server API route.
 * Returns the created/updated vote record.
 */
export async function castVote(
  suggestionId: string,
  type: VoteType,
): Promise<{ id: string }> {
  const response = await fetch('/api/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${pb.authStore.token}`,
    },
    body: JSON.stringify({ suggestionId, type, action: 'vote' }),
  });

  if (!response.ok) {
    throw new Error('Vote failed on server');
  }

  return response.json();
}

/**
 * Fetch all comment votes by a user for a given suggestion's comments.
 */
export async function getUserCommentVotes(
  userId: string,
  suggestionId: string,
): Promise<Record<string, 'upvote' | 'downvote'>> {
  const votes = await pb.collection('comment_votes').getFullList({
    filter: `user = "${userId}" && comment.suggestion = "${suggestionId}"`,
    requestKey: null,
  });

  const voteMap: Record<string, 'upvote' | 'downvote'> = {};
  votes.forEach(v => {
    voteMap[v.comment] = v.type as 'upvote' | 'downvote';
  });
  return voteMap;
}

/**
 * Vote on a comment (create new or change existing).
 * Updates both the vote record and comment counters.
 */
export async function voteOnComment(
  userId: string,
  commentId: string,
  existingType: 'upvote' | 'downvote' | null,
  newType: 'upvote' | 'downvote',
): Promise<void> {
  if (existingType) {
    // Change vote: find existing record and update
    const existing = await pb.collection('comment_votes').getFirstListItem(
      `user="${userId}" && comment="${commentId}"`,
    );
    await pb.collection('comment_votes').update(existing.id, { type: newType });

    // Adjust counters
    const oldField = existingType === 'upvote' ? 'upvotes' : 'downvotes';
    const newField = newType === 'upvote' ? 'upvotes' : 'downvotes';
    await pb.collection('comments').update(commentId, {
      [`${oldField}-`]: 1,
      [`${newField}+`]: 1,
    });
  } else {
    // New vote
    await pb.collection('comment_votes').create({
      user: userId,
      comment: commentId,
      type: newType,
    });

    const field = newType === 'upvote' ? 'upvotes' : 'downvotes';
    await pb.collection('comments').update(commentId, { [`${field}+`]: 1 });

    try {
      const comment = await pb.collection('comments').getOne(commentId, { expand: 'suggestion,suggestion.workspace_id' });
      const { createNotification } = await import('./notifications.helper');
      const suggestion = comment.expand?.suggestion;
      const workspaceSlug = suggestion?.expand?.workspace_id?.slug || suggestion?.workspace_id;
      
      await createNotification(
        comment.user,
        `Кто-то оценил ваш комментарий: "${comment.text.substring(0, 30)}${comment.text.length > 30 ? '...' : ''}"`,
        `/w/${workspaceSlug}/suggestions/${suggestion?.id}`,
        'vote'
      );
    } catch (e) {
      console.error('Failed to notify comment author', e);
    }
  }
}
