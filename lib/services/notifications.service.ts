import pb from '@/lib/pocketbase';
import type { Notification } from '@/types';

/**
 * Fetch all notifications for a user.
 */
export async function fetchNotifications(userId: string): Promise<Notification[]> {
  return pb.collection('notifications').getFullList<Notification>({
    filter: `user = "${userId}"`,
    sort: '-created',
    requestKey: null,
  });
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId: string) {
  return pb.collection('notifications').update(notificationId, { read: true });
}

/**
 * Mark multiple notifications as read.
 */
export async function markAllAsRead(notificationIds: string[]) {
  return Promise.all(
    notificationIds.map(id => pb.collection('notifications').update(id, { read: true })),
  );
}
