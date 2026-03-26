import pb from '@/lib/pocketbase';

/**
 * Create a notification for a user.
 * Uses the current authenticated user's PB instance.
 * If the target user is the current user, skip (don't notify yourself).
 */
export async function createNotification(
  targetUserId: string,
  message: string,
  link?: string,
  type?: 'comment' | 'vote' | 'status' | 'merge' | 'system',
) {
  const currentUserId = pb.authStore.record?.id;
  if (currentUserId === targetUserId) return; // Don't notify yourself

  try {
    await pb.collection('notifications').create({
      user: targetUserId,
      message,
      read: false,
      link: link || '',
      type: type || 'system',
    }, { requestKey: null });
  } catch (_err) {
    // Non-critical — don't throw
    console.error('Failed to create notification:', _err);
  }
}

/**
 * Create a notification using an admin PB client (for server-side usage).
 */
export async function createNotificationAdmin(
  adminPb: typeof pb,
  targetUserId: string,
  currentUserId: string,
  message: string,
  link?: string,
  type?: 'comment' | 'vote' | 'status' | 'merge' | 'system',
) {
  if (currentUserId === targetUserId) return;

  try {
    await adminPb.collection('notifications').create({
      user: targetUserId,
      message,
      read: false,
      link: link || '',
      type: type || 'system',
    }, { requestKey: null });
  } catch (_err) {
    console.error('Failed to create notification (admin):', _err);
  }
}
