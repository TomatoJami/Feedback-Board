'use client';

import { useParams } from 'next/navigation';
import React, { useState } from 'react';

import ChangelogView from '@/components/workspace/ChangelogView';
import RoadmapView from '@/components/workspace/RoadmapView';
import { useRealtimeSuggestions } from '@/hooks/useRealtimeSuggestions';
import { useStatuses } from '@/hooks/useStatuses';
import { useWorkspaceRole } from '@/hooks/useWorkspaceRole';
import Link from 'next/link';

export default function RoadmapPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  const { suggestions, isLoading: suggestionsLoading } = useRealtimeSuggestions(workspaceId);
  const { statuses, isLoading: statusesLoading } = useStatuses(workspaceId);
  const { role: workspaceRole, isOwner, isLoading: roleLoading } = useWorkspaceRole(workspaceId);
  
  const [viewMode, setViewMode] = useState<'roadmap' | 'changelog'>('roadmap');

  const isLoading = suggestionsLoading || statusesLoading || roleLoading;
  const canManageWorkspace = isOwner || workspaceRole === 'admin' || workspaceRole === 'moderator';

  if (!isLoading && !canManageWorkspace) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Нет доступа</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Просматривать дорожную карту могут только администраторы и модераторы воркспейса.
        </p>
        <Link href={`/w/${workspaceId}`} className="btn btn-primary">
          Вернуться к предложениям
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <Link href={`/w/${workspaceId}`} className="hover:text-indigo-400 transition-colors">
          Предложения
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          Roadmap & Changelog
        </span>
      </nav>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Дорожная карта
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Отслеживайте статус предложений и последние изменения
          </p>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setViewMode('roadmap')}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: viewMode === 'roadmap' ? 'var(--bg-tertiary)' : 'transparent',
              color: viewMode === 'roadmap' ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            Roadmap
          </button>
          <button
            onClick={() => setViewMode('changelog')}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: viewMode === 'changelog' ? 'var(--bg-tertiary)' : 'transparent',
              color: viewMode === 'changelog' ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            Changelog
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', gap: '24px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ width: '320px', height: '500px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          ))}
        </div>
      ) : (
        viewMode === 'roadmap' ? (
          <RoadmapView suggestions={suggestions} statuses={statuses} workspaceSlug={workspaceId} />
        ) : (
          <ChangelogView suggestions={suggestions} statuses={statuses} workspaceSlug={workspaceId} />
        )
      )}
    </div>
  );
}
