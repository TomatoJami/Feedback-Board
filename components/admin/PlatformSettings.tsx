import React from 'react';

import type { Settings, Status, Workspace } from '@/types';

import { CustomMultiSelect, CustomSelect } from './AdminUI';

interface PlatformSettingsProps {
  settings: Settings | null;
  workspace: Workspace | null;
  statuses: Status[];
  isSavingSettings: boolean;
  onUpdateSettings: (updates: Partial<Settings>) => Promise<void>;
  onUpdateWorkspace: (updates: Partial<Workspace>) => Promise<void>;
}

export default function PlatformSettings({
  settings,
  workspace,
  statuses,
  isSavingSettings,
  onUpdateSettings,
  onUpdateWorkspace,
}: PlatformSettingsProps) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Настройки платформы</h2>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        {/* Default Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Статус по умолчанию для новых предложений
          </label>
          <CustomSelect
            options={[
              { id: '', name: 'Без статуса', color: '#71717a' },
              ...statuses.map(s => ({ id: s.id, name: s.name, color: s.color }))
            ]}
            value={settings?.default_status || ''}
            onChange={(val) => onUpdateSettings({ default_status: val })}
            placeholder="Выберите статус..."
            disabled={isSavingSettings}
          />
        </div>

        {/* Deletable Statuses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Статусы, при которых автор может удалить предложение
            </label>
            <p style={{ color: '#71717a', fontSize: '0.8rem' }}>
              Если ничего не выбрано, автор может удалять предложения всегда.
            </p>
          </div>
          <CustomMultiSelect
            options={statuses.map(s => ({ id: s.id, name: s.name, color: s.color }))}
            selectedIds={settings?.deletable_statuses || []}
            onChange={(vals: string[]) => onUpdateSettings({ deletable_statuses: vals })}
            placeholder="Выберите статусы..."
            disabled={isSavingSettings}
          />
        </div>

        {/* Workspace Freeze */}
        <div style={{ 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '32px',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Заморозить добавление предложений
            </label>
            <p style={{ color: '#71717a', fontSize: '0.8rem' }}>
              Если включено, пользователи не смогут создавать новые предложения в этом пространстве.
            </p>
          </div>
          <button
            onClick={() => onUpdateWorkspace({ is_frozen: !workspace?.is_frozen })}
            disabled={isSavingSettings}
            style={{
              width: '48px',
              height: '24px',
              borderRadius: '12px',
              background: workspace?.is_frozen ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
              position: 'relative',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              opacity: isSavingSettings ? 0.5 : 1
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: '3px',
              left: workspace?.is_frozen ? '27px' : '3px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>
      </div>
    </section>
  );
}
