import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['Open', 'Planned', 'In_Progress', 'Completed']),
  message: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const jsonBody = await request.json();
    const parsed = statusSchema.safeParse(jsonBody);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.issues }, { status: 400 });
    }
    
    const { id, status, message } = parsed.data;
    const authToken = request.headers.get('Authorization');

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pb = new PocketBase(POCKETBASE_URL);
    pb.authStore.save(authToken, null);

    // Verify the token by fetching the current user
    try {
      const authData = await pb.collection('users').authRefresh();
      if ((authData.record as any).role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 1. Update suggestion status
    const suggestion = await pb.collection('suggestions').update(id, { status });

    // 2. Create notification for the author
    if (suggestion.author) {
      const statusText = status.replace('_', ' ');
      const notifMessage = message
        ? `Статус вашего предложения "${suggestion.title}" изменен на: ${statusText}. ${message}`
        : `Статус вашего предложения "${suggestion.title}" изменен на: ${statusText}`;
      await pb.collection('notifications').create({
        user: suggestion.author,
        message: notifMessage,
        read: false,
      });
    }

    return NextResponse.json(suggestion);
  } catch (err: unknown) {
    logger.error('Status update failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
