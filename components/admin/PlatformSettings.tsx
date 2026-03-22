import React from 'react';

import type { Settings,Status } from '@/types';

import { CustomMultiSelect,CustomSelect } from './AdminUI';

interface PlatformSettingsProps {
  settings: Settings | null;
  statuses: Status[];
  isSavingSettings: boolean;
  onUpdateSettings: (updates: Partial<Settings>) => Promise<void>;
}

export default function PlatformSettings({
  settings,
  statuses,
  isSavingSettings,
  onUpdateSettings,
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
            onChange={(val) => onUpdateSettings({ deletable_statuses: val })}
            placeholder="Выберите статусы..."
            disabled={isSavingSettings}
          />
        </div>
      </div>
    </section>
  );
}
