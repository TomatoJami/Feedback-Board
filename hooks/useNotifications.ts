'use client';

import type { RecordSubscription } from 'pocketbase';
import { useCallback,useEffect, useState } from 'react';

import { logger } from '@/lib/logger';
import pb from '@/lib/pocketbase';
import * as notificationsService from '@/lib/services/notifications.service';
import type { Notification } from '@/types';

import { useAuth } from './useAuth';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchAll = useCallback(async () => {
    if (!user) return;
    try {
      const records = await notificationsService.fetchNotifications(user.id);
      setNotifications(records);
    } catch (err) {
      logger.error('Failed to fetch notifications:', err);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      logger.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    try {
      await notificationsService.markAllAsRead(unread.map(n => n.id));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      logger.error('Failed to mark all as read:', err);
    }
  }, [notifications]);

  useEffect(() => {
    if (!user) return;
    setTimeout(() => {
      fetchAll();
    }, 0);

    // Subscribe to real-time notifications for this user
    pb.collection('notifications').subscribe('*', (e: RecordSubscription<Notification>) => {
      if (e.record.user !== user.id) return;

      switch (e.action) {
        case 'create':
          setNotifications((prev) => [e.record, ...prev]);
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
  }, [user, fetchAll]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
