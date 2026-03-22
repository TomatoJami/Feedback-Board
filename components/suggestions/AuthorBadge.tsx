'use client';

import React from 'react';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { getAvatarColor } from '@/lib/utils';

interface AuthorBadgeProps {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
}

export default function AuthorBadge({ authorId, authorName, authorAvatar }: AuthorBadgeProps) {
  const avatarBg = authorAvatar ? 'transparent' : getAvatarColor(authorId || '');
  
  return (
    <div className="card-author">
      <div className="author-avatar-placeholder" style={{
        background: avatarBg,
        overflow: 'hidden',
        padding: 0
      }}>
        {authorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${POCKETBASE_URL}/api/files/users/${authorId}/${authorAvatar}`}
            alt={authorName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : authorName.charAt(0).toUpperCase()}
      </div>
      <span className="author-name">{authorName}</span>
    </div>
  );
}
