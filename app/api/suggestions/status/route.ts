import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { POCKETBASE_URL } from '@/lib/pocketbase';

export async function POST(request: Request) {
  try {
    const { id, status, message } = await request.json();
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
