'use client';

import React, { useMemo } from 'react';

import { formatAbsoluteDate } from '@/lib/timeago';
import type { Status, Suggestion } from '@/types';

interface ChangelogViewProps {
  suggestions: Suggestion[];
  statuses: Status[];
  workspaceSlug: string;
}

export default function ChangelogView({ suggestions, statuses, workspaceSlug }: ChangelogViewProps) {
  // Group by month/year based on updated date
  const grouped = useMemo(() => {
    // Only show suggestions with a status
    // To identify "completed", we can look for keywords in status name, or just show all for now
    const completedKeywords = ['done', 'complete', 'closed', 'выполн', 'заверш', 'решен'];
    
    let items = suggestions.filter(s => {
      if (!s.status_id || !s.expand?.status_id) return false;
      const t = s.expand.status_id.name.toLowerCase();
      return completedKeywords.some(k => t.includes(k)) || true; // Currently showing all with a status for visibility, adjust if strict filtering needed
    });

    items = items.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());

    const groups: Record<string, Suggestion[]> = {};
    
    items.forEach(s => {
      const date = new Date(s.updated);
      const monthYear = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      // Capitalize first letter of month
      const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });

    return groups;
  }, [suggestions]);

  const groupKeys = Object.keys(grouped);

  if (groupKeys.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '0.95rem' }}>Нет данных для отображения в Changelog.</p>
        <p style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.8 }}>Предложения со статусами появятся здесь после обновления.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 0' }}>
      {groupKeys.map(month => (
        <div key={month} style={{ marginBottom: '48px' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            marginBottom: '24px',
            color: 'var(--text-primary)',
            position: 'relative',
            paddingLeft: '16px'
          }}>
            <span style={{ 
              position: 'absolute', 
              left: 0, 
              top: '50%', 
              transform: 'translateY(-50%)',
              width: '4px',
              height: '100%',
              background: 'var(--accent-primary)',
              borderRadius: '4px'
            }} />
            {month}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingLeft: '16px', borderLeft: '1px solid var(--border-color)', marginLeft: '2px' }}>
            {grouped[month].map(s => {
              const st = s.expand?.status_id;
              const cat = s.expand?.category_id;
              
              return (
                <div key={s.id} style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-21px',
                    top: '24px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: st?.color || 'var(--accent-primary)',
                    boxShadow: `0 0 0 4px var(--bg-primary)`,
                  }} />
                  
                  <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {st && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '100px',
                            background: `${st.color}15`,
                            color: st.color,
                            border: `1px solid ${st.color}30`
                          }}>
                            {st.name}
                          </span>
                        )}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {formatAbsoluteDate(s.updated)}
                        </span>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: s.votes_count > 0 ? '#10b981' : 'var(--text-secondary)',
                        background: s.votes_count > 0 ? 'rgba(16,185,129,0.1)' : 'var(--bg-tertiary)',
                        padding: '4px 10px',
                        borderRadius: '100px'
                      }}>
                        👍 {s.votes_count > 0 ? `+${s.votes_count}` : s.votes_count}
                      </div>
                    </div>
                    
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                      <a href={`/w/${workspaceSlug}/suggestions/${s.id}`} style={{ textDecoration: 'none', color: 'inherit' }} className="hover:text-indigo-400 transition-colors">
                        {s.title}
                      </a>
                    </h3>
                    
                    {s.description && (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {s.description.replace(/[#*_~`>\[\]()!]/g, '')}
                      </p>
                    )}
                    
                    {cat && (
                      <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{cat.icon}</span> <span>{cat.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
