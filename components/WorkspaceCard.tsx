import React from 'react';
import Link from 'next/link';
import { Workspace } from '@/types/workspace';
import { BuildingStorefrontIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import Badge from '@/components/ui/Badge';
import { getAvatarColor } from '@/lib/utils';

interface WorkspaceCardProps {
  workspace: Workspace;
}

export default function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const authorName = workspace.expand?.owner?.name || 'Владелец';

  return (
    <Link 
      href={`/w/${workspace.slug || workspace.id}`}
      className="suggestion-card"
      style={{ textDecoration: 'none', display: 'flex', marginBottom: 0 }}
    >
      <div className="card-content" style={{ width: '100%' }}>
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <div className="card-badges">
            {workspace.isPrivate ? (
              <Badge variant="rose" size="md">
                <LockClosedIcon className="w-3 h-3 mr-1" />
                Приватное
              </Badge>
            ) : (
              <Badge variant="sky" size="md">
                <GlobeAltIcon className="w-3 h-3 mr-1" />
                Публичное
              </Badge>
            )}
          </div>
        </div>
        
        <h3 className="card-title flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <BuildingStorefrontIcon className="w-5 h-5" />
          </div>
          {workspace.name}
        </h3>
        
        <div className="card-footer">
          <div className="card-author">
            <div className="author-avatar-placeholder" style={{ 
              background: workspace.expand?.owner?.avatar ? 'transparent' : getAvatarColor(workspace.expand?.owner?.id || ''),
              overflow: 'hidden',
              padding: 0
            }}>
              {workspace.expand?.owner?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={`${POCKETBASE_URL}/api/files/users/${workspace.expand.owner.id}/${workspace.expand.owner.avatar}`} 
                  alt={authorName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : authorName.charAt(0).toUpperCase()}
            </div>
            <span className="author-name">{authorName}</span>
          </div>
          <div className="card-date flex items-center justify-end gap-2 text-xs whitespace-nowrap shrink-0 pl-6 ml-auto">
            <span>Активная доска</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0"></span>
          </div>
        </div>
      </div>
    </Link>
  );
}
