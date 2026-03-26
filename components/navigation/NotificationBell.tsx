'use client';

import { 
  ArrowsRightLeftIcon,
  BellAlertIcon, 
  BellIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/outline';
import React, { useEffect,useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { useNotifications } from '@/hooks/useNotifications';
import { formatAbsoluteDate, timeAgo } from '@/lib/timeago';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(unreadCount);

  // Show toast on new notification
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current && notifications.length > 0) {
      const latest = notifications.find((n) => !n.read);
      if (latest) {
        toast(latest.message, {
          icon: <BellAlertIcon style={{ width: '20px', height: '20px', color: '#6366f1' }} />,
          style: {
            background: '#1c1c1f',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        });
      }
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, notifications]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Incremental loading
  const [visibleCount, setVisibleCount] = useState(5);
  const visibleNotifications = notifications.slice(0, visibleCount);
  const hasMore = visibleCount < notifications.length;

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Уведомления${unreadCount > 0 ? ` (${unreadCount} непрочитанных)` : ''}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div 
            className="notification-dropdown-header"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Уведомления</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read"
                onClick={markAllAsRead}
                style={{
                  background: 'none', border: 'none', color: '#6366f1',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Прочитать все
              </button>
            )}
          </div>
          <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {visibleNotifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#a1a1aa', fontSize: '0.85rem' }}>
                <BellIcon style={{ width: '32px', height: '32px', opacity: 0.2, margin: '0 auto 8px', display: 'block' }} />
                Нет уведомлений
              </div>
            ) : (
              visibleNotifications.map((n) => {
                const getIcon = () => {
                  switch(n.type) {
                    case 'comment': return ChatBubbleLeftRightIcon;
                    case 'vote': return HandThumbUpIcon;
                    case 'status': return ClipboardDocumentIcon;
                    case 'merge': return ArrowsRightLeftIcon;
                    default: return BellIcon;
                  }
                };

                const Icon = getIcon();

                const InnerContent = (
                  <>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <Icon className="w-5 h-5 text-indigo-400 mt-0.5" />
                      <div>
                        <p style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '4px' }}>{n.message}</p>
                        <time
                          style={{ fontSize: '0.75rem', color: '#a1a1aa' }}
                          title={formatAbsoluteDate(n.created)}
                        >
                          {timeAgo(n.created)}
                        </time>
                      </div>
                    </div>
                  </>
                );

                const containerStyle = {
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: n.read && !n.link ? 'default' : 'pointer',
                  background: n.read ? 'transparent' : 'rgba(99,102,241,0.05)',
                  transition: 'background 0.15s ease',
                  display: 'block',
                  textDecoration: 'none'
                };

                const handleClick = () => {
                  if (!n.read) markAsRead(n.id);
                };

                return n.link ? (
                  <a
                    key={n.id}
                    href={n.link}
                    style={containerStyle}
                    onClick={() => {
                      handleClick();
                      setIsOpen(false);
                    }}
                  >
                    {InnerContent}
                  </a>
                ) : (
                  <div
                    key={n.id}
                    style={containerStyle}
                    onClick={handleClick}
                  >
                    {InnerContent}
                  </div>
                );
              })
            )}
            {hasMore && (
              <button
                onClick={() => setVisibleCount(prev => prev + 10)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                Показать ещё
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
