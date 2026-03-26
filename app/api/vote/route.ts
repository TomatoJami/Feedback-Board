import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

import { logger } from '@/lib/logger';
import { POCKETBASE_URL } from '@/lib/pocketbase';

export async function POST(request: Request) {
  try {
    const { suggestionId, type, action } = await request.json();
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // 3. Handle Vote Logic
    if (action === 'vote') {
      // Check for existing vote
      const existingVotes = await adminPb.collection('votes').getList(1, 1, {
        filter: `user = "${user.id}" && suggestion = "${suggestionId}"`,
      });

      if (existingVotes.totalItems > 0) {
        const oldVote = existingVotes.items[0];
        if (oldVote.type === type) {
          return NextResponse.json(oldVote); // Already voted same type
        }

        // Change vote type: delete old, create new, adjust score by ±2
        await adminPb.collection('votes').delete(oldVote.id);
        
        const totalAdjust = type === 'upvote' ? 2 : -2;
        const adjustObj = totalAdjust > 0 
          ? { 'votes_count+': totalAdjust } 
          : { 'votes_count-': Math.abs(totalAdjust) };
          
        await adminPb.collection('suggestions').update(suggestionId, adjustObj);
      } else {
        // No existing vote — new vote, adjust by ±1
        const adjust = type === 'upvote' ? { 'votes_count+': 1 } : { 'votes_count-': 1 };
        await adminPb.collection('suggestions').update(suggestionId, adjust);
      }

      // Create new vote record
      const newVote = await adminPb.collection('votes').create({
        user: user.id,
        suggestion: suggestionId,
        type,
      });

      // Send notification to author
      try {
        const suggestion = await adminPb.collection('suggestions').getOne(suggestionId, { expand: 'workspace_id' });
        const workspaceSlug = suggestion.expand?.workspace_id?.slug || suggestion.workspace_id;
        
        const { createNotificationAdmin } = await import('@/lib/services/notifications.helper');
        await createNotificationAdmin(
          adminPb,
          suggestion.author,
          user.id,
          `Кто-то проголосовал за ваше предложение: ${suggestion.title}`,
          `/w/${workspaceSlug}/suggestions/${suggestionId}`,
          'vote'
        );
      } catch (e) {
        logger.error('Failed to notify author of vote', e);
      }

      return NextResponse.json(newVote);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    logger.error('Vote API failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
