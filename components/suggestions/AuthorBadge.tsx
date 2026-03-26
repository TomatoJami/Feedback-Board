'use client';

import React from 'react';

import UserAvatar from '@/components/ui/UserAvatar';

interface AuthorBadgeProps {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
}

export default function AuthorBadge({ authorId, authorName, authorAvatar }: AuthorBadgeProps) {
  return (
    <div className="card-author">
      <UserAvatar 
        userId={authorId} 
        userName={authorName} 
        userAvatar={authorAvatar} 
        size={24} 
        className="author-avatar-placeholder"
        style={{ padding: 0 }}
      />
      <span className="author-name">{authorName}</span>
    </div>
  );
}
