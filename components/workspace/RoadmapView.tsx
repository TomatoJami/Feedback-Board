'use client';

import Image from 'next/image';
import React from 'react';

import type { Status, Suggestion } from '@/types';

interface RoadmapViewProps {
  suggestions: Suggestion[];
  statuses: Status[];
  workspaceSlug: string;
}

export default function RoadmapView({ suggestions, statuses, workspaceSlug }: RoadmapViewProps) {
  // Group suggestions by status
  const grouped: Record<string, Suggestion[]> = {};
  
  statuses.forEach(st => {
    grouped[st.id] = [];
  });
  
  // Optionally include an "Open / Unassigned" column
  grouped['unassigned'] = [];

  suggestions.forEach(s => {
    if (s.status_id && grouped[s.status_id]) {
      grouped[s.status_id].push(s);
    } else {
      grouped['unassigned'].push(s);
    }
  });

  // Filter out columns that are completely empty to keep it clean, except statuses?
  // Actually, usually roadmap shows all statuses.
  const columns = [
    { id: 'unassigned', name: 'Открыто', color: '#71717a', items: grouped['unassigned'].sort((a,b) => b.votes_count - a.votes_count) },
    ...statuses.map(st => ({
      id: st.id,
      name: st.name,
      color: st.color,
      items: grouped[st.id].sort((a,b) => b.votes_count - a.votes_count)
    }))
  ].filter(col => col.items.length > 0 || col.id !== 'unassigned');

  return (
    <div style={{ 
      display: 'flex', 
      gap: '24px', 
      overflowX: 'auto', 
      paddingBottom: '24px',
      alignItems: 'flex-start',
      minHeight: 'calc(100vh - 200px)'
    }}>
      {columns.map(col => (
        <div key={col.id} style={{
          minWidth: '320px',
          width: '320px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100%',
          flexShrink: 0
        }}>
          {/* Column Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: 'var(--bg-secondary)',
            borderTopLeftRadius: 'var(--radius-lg)',
            borderTopRightRadius: 'var(--radius-lg)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: col.color
              }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {col.name}
              </h3>
            </div>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              padding: '2px 8px',
              borderRadius: '100px'
            }}>
              {col.items.length}
            </span>
          </div>
          
          {/* Column Items */}
          <div style={{
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto'
          }}>
            {col.items.map(s => (
              <a 
                key={s.id}
                href={`/w/${workspaceSlug}/suggestions/${s.id}`}
                style={{
                  display: 'block',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  textDecoration: 'none',
                  transition: 'transform 0.15s, border-color 0.15s',
                }}
                className="hover:-translate-y-1 hover:border-indigo-500/50"
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {s.expand?.category_id?.icon} {s.expand?.category_id?.name || 'Без категории'}
                </div>
                
                <h4 style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {s.title}
                </h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: s.votes_count > 0 ? '#10b981' : 'var(--text-secondary)',
                  }}>
                    👍 {s.votes_count > 0 ? `+${s.votes_count}` : s.votes_count}
                  </div>
                  
                  {s.expand?.author && (
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6rem',
                      color: 'var(--text-secondary)',
                      overflow: 'hidden'
                    }} title={s.expand.author.name}>
                      {s.expand.author.avatar ? (
                         <Image 
                         src={`/api/files/users/${s.author}/${s.expand.author.avatar}`} 
                         alt=""
                         width={24}
                         height={24}
                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                       />
                      ) : s.expand.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </a>
            ))}
            
            {col.items.length === 0 && (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Нет предложений
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
