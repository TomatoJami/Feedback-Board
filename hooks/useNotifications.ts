'use client';

import { useEffect, useState, useCallback } from 'react';
import pb from '@/lib/pocketbase';
import type { Notification } from '@/types';
import { useAuth } from './useAuth';
import type { RecordSubscription } from 'pocketbase';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const records = await pb.collection('notifications').getFullList<Notification>({
        filter: `user = "${user.id}"`,
        sort: '-created',
        requestKey: null,
      });
      setNotifications(records);
      setUnreadCount(records.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await pb.collection('notifications').update(notificationId, { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    try {
      await Promise.all(
        unread.map((n) => pb.collection('notifications').update(n.id, { read: true }))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, [notifications]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Subscribe to real-time notifications for this user
    pb.collection('notifications').subscribe('*', (e: RecordSubscription<Notification>) => {
      if (e.record.user !== user.id) return;

      switch (e.action) {
        case 'create':
          setNotifications((prev) => [e.record, ...prev]);
          setUnreadCount((prev) => prev + 1);
          break;
        case 'update':
          setNotifications((prev) =>
            prev.map((n) => (n.id === e.record.id ? e.record : n))
          );
          break;
        case 'delete':
          setNotifications((prev) => prev.filter((n) => n.id !== e.record.id));
          break;
      }
    });

    return () => {
      pb.collection('notifications').unsubscribe('*');
    };
  }, [user, fetchNotifications]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
