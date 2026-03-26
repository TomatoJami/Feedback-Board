import { ArrowsPointingInIcon, MapPinIcon } from '@heroicons/react/24/outline';
import React from 'react';

import UserAvatar from '@/components/ui/UserAvatar';
import type { Status,Suggestion, WorkspaceMember } from '@/types';

import { CustomSelect } from './AdminUI';

interface SuggestionManagementProps {
  suggestions: Suggestion[];
  statuses: Status[];
  updatingId: string | null;
  onStatusChange: (id: string, newStatusId: string) => Promise<void>;
  onAssigneeChange: (id: string, userId: string | null) => Promise<void>;
  onTogglePin: (id: string, pinned: boolean) => Promise<void>;
  onMerge: (sourceId: string) => void;
  members: WorkspaceMember[];
}

export default function SuggestionManagement({
  suggestions,
  statuses,
  updatingId,
  onStatusChange,
  onAssigneeChange,
  onTogglePin,
  onMerge,
  members,
}: SuggestionManagementProps) {
  return (
    <section>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Предложения</h2>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '35%' }}>Заголовок</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '20%' }}>Автор</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '10%' }}>Голоса</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '8%' }}>Пин</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '15%' }}>Исполнитель</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '15%' }}>Статус</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '7%' }}></th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s) => (
              <tr
                key={s.id}
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', opacity: s.merged_into ? 0.5 : 1 }}>
                    {s.title}
                    {s.merged_into && (
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 500, marginLeft: '8px', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Объединено</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '2px' }}>
                    {s.expand?.category_id?.icon} {s.expand?.category_id?.name || 'Без категории'}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#d4d4d8' }}>
                    <UserAvatar 
                      userId={s.author || ''} 
                      userName={s.expand?.author?.name} 
                      userEmail={s.expand?.author?.email} 
                      userAvatar={s.expand?.author?.avatar} 
                      size={24} 
                    />
                    {s.expand?.author?.name || 'Аноним'}
                  </div>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                  <span style={{
                    display: 'inline-block',
                    background: 'rgba(99,102,241,0.1)',
                    color: '#818cf8',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: '1px solid rgba(99,102,241,0.2)',
                    minWidth: '40px'
                  }}>
                    {s.votes_count || 0}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                  <button
                    onClick={() => onTogglePin(s.id, !s.pinned)}
                    title={s.pinned ? 'Открепить' : 'Закрепить'}
                    style={{
                      background: s.pinned ? 'rgba(99,102,241,0.1)' : 'transparent',
                      border: `1px solid ${s.pinned ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      padding: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: s.pinned ? '#6366f1' : '#71717a',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <MapPinIcon style={{ width: '16px', height: '16px' }} />
                  </button>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                  <CustomSelect
                    options={[
                      { id: '', name: 'Не назначен', color: '#71717a' },
                      ...members.map(m => ({ id: m.user, name: m.expand?.user?.name || 'Пользователь' }))
                    ]}
                    value={s.assigned_user || ''}
                    onChange={(val) => onAssigneeChange(s.id, val || null)}
                    placeholder="Назначить..."
                    disabled={updatingId === s.id}
                    maxWidth="140px"
                  />
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                  <CustomSelect
                    options={[
                      { id: '', name: 'Без статуса', color: '#71717a' },
                      ...statuses.map(st => ({ id: st.id, name: st.name, color: st.color }))
                    ]}
                    value={s.status_id || ''}
                    onChange={(val) => onStatusChange(s.id, val)}
                    placeholder="Выберите статус..."
                    disabled={updatingId === s.id}
                    maxWidth="180px"
                  />
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                  {!s.merged_into && (
                    <button
                      onClick={() => onMerge(s.id)}
                      title="Объединить"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#71717a',
                        transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                      }}
                    >
                      <ArrowsPointingInIcon style={{ width: '16px', height: '16px' }} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
