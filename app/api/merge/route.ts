import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

import { logger } from '@/lib/logger';
import { POCKETBASE_URL } from '@/lib/pocketbase';

export async function POST(request: Request) {
  try {
    const { sourceId, targetId } = await request.json();
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!sourceId || !targetId || sourceId === targetId) {
      return NextResponse.json({ error: 'Invalid merge params' }, { status: 400 });
    }

    // 1. Verify user identity
    const userPb = new PocketBase(POCKETBASE_URL);
    const token = authHeader.replace('Bearer ', '');
    userPb.authStore.save(token, null);

    let user;
    try {
      const authData = await userPb.collection('users').authRefresh();
      user = authData.record;
    } catch (__e) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Get admin client
    const { getAdminClient } = await import('@/lib/pocketbase');
    const adminPb = await getAdminClient();

    // 3. Load source and target suggestions
    const source = await adminPb.collection('suggestions').getOne(sourceId, {
      expand: 'workspace_id',
    });
    const target = await adminPb.collection('suggestions').getOne(targetId);

    // 4. Verify same workspace
    if (source.workspace_id !== target.workspace_id) {
      return NextResponse.json({ error: 'Suggestions must be in the same workspace' }, { status: 400 });
    }

    // 5. Verify user is admin/owner of this workspace
    const workspace = await adminPb.collection('workspaces').getOne(source.workspace_id);
    let isAuthorized = workspace.owner === user.id || user.role === 'admin';

    if (!isAuthorized) {
      try {
        const member = await adminPb.collection('workspace_members').getFirstListItem(
          `workspace = "${source.workspace_id}" && user = "${user.id}" && (role = "admin" || role = "moderator")`,
        );
        isAuthorized = !!member;
      } catch {
        // Not a member
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 6. Transfer votes: fetch all votes from source, re-create for target
    const sourceVotes = await adminPb.collection('votes').getFullList({
      filter: `suggestion = "${sourceId}"`,
    });

    let votesTransferred = 0;
    for (const vote of sourceVotes) {
      // Check if user already voted on target
      try {
        const existing = await adminPb.collection('votes').getFirstListItem(
          `user = "${vote.user}" && suggestion = "${targetId}"`,
        );
        // Already voted → just delete the source vote
        await adminPb.collection('votes').delete(vote.id);
        // Don't adjust votes since user already has a vote on target
        void existing;
      } catch {
        // No existing vote → transfer
        await adminPb.collection('votes').create({
          user: vote.user,
          suggestion: targetId,
          type: vote.type,
        });
        await adminPb.collection('votes').delete(vote.id);
        votesTransferred++;
      }
    }

    // Adjust target votes_count
    if (votesTransferred > 0) {
      // Recalculate total for accuracy
      const allTargetVotes = await adminPb.collection('votes').getFullList({
        filter: `suggestion = "${targetId}"`,
      });
      let score = 0;
      for (const v of allTargetVotes) {
        score += v.type === 'upvote' ? 1 : -1;
      }
      await adminPb.collection('suggestions').update(targetId, {
        votes_count: score,
      });
    }

    // Zero out source votes_count
    await adminPb.collection('suggestions').update(sourceId, { votes_count: 0 });

    // 7. Transfer comments
    const sourceComments = await adminPb.collection('comments').getFullList({
      filter: `suggestion = "${sourceId}"`,
    });

    const mergedLabel = `${source.title}`;
    for (const comment of sourceComments) {
      await adminPb.collection('comments').update(comment.id, {
        suggestion: targetId,
        merged_from_suggestion: mergedLabel,
        parent_id: '', // Flatten — don't try to maintain reply chains across merge
      });
    }

    // 8. Mark source as merged
    await adminPb.collection('suggestions').update(sourceId, {
      merged_into: targetId,
    });

    // 9. Notify source author
    const workspaceSlug = (source.expand as Record<string, Record<string, string>>)?.workspace_id?.slug || source.workspace_id;
    if (source.author && source.author !== user.id) {
      try {
        await adminPb.collection('notifications').create({
          user: source.author,
          message: `Ваше предложение "${source.title}" было объединено с "${target.title}"`,
          read: false,
          link: `/w/${workspaceSlug}/suggestions/${targetId}`,
          type: 'merge',
        });
      } catch (_err) {
        logger.error('Failed to send merge notification:', _err);
      }
    }

    return NextResponse.json({
      success: true,
      votesTransferred,
      commentsTransferred: sourceComments.length,
    });
  } catch (err: unknown) {
    logger.error('Merge API failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
