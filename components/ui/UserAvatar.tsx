'use client';

import Image from 'next/image';
import React from 'react';

import pb from '@/lib/pocketbase';
import { getAvatarColor } from '@/lib/utils';

interface UserAvatarProps {
  userId: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function UserAvatar({
  userId,
  userName,
  userEmail,
  userAvatar,
  size = 40,
  className = '',
  style = {},
  children,
}: UserAvatarProps) {
  const avatarColor = getAvatarColor(userId || '');
  const initial = (userName || userEmail || 'U').charAt(0).toUpperCase();
  const avatarUrl = userAvatar
    ? `${pb.baseUrl}/api/files/users/${userId}/${userAvatar}`
    : null;

  const sizePx = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`user-avatar-root ${className}`}
      style={{
        width: sizePx,
        height: sizePx,
        borderRadius: '50%',
        background: userAvatar ? 'rgba(255,255,255,0.05)' : avatarColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 600,
        fontSize: typeof size === 'number' ? `${Math.max(10, size * 0.4)}px` : 'inherit',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
        position: 'relative',
        ...style,
      }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={userName || 'User Avatar'}
          width={typeof size === 'number' ? size : 100}
          height={typeof size === 'number' ? size : 100}
          unoptimized
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initial
      )}
      {children}
    </div>
  );
}
