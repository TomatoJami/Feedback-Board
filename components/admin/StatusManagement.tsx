import React from 'react';
import type { Status } from '@/types';

interface StatusManagementProps {
  statuses: Status[];
  newStatName: string;
  setNewStatName: (val: string) => void;
  newStatColor: string;
  setNewStatColor: (val: string) => void;
  showColorPicker: boolean;
  setShowColorPicker: (val: boolean) => void;
  isAddingStat: boolean;
  onAddStatus: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDeleteStatus: (id: string) => Promise<void>;
  onSeedStatuses: () => Promise<void>;
  colorPickerRef: React.RefObject<HTMLDivElement | null>;
  statusColors: string[];
}

export default function StatusManagement({
  statuses,
  newStatName,
  setNewStatName,
  newStatColor,
  setNewStatColor,
  showColorPicker,
  setShowColorPicker,
  isAddingStat,
  onAddStatus,
  onDeleteStatus,
  onSeedStatuses,
  colorPickerRef,
  statusColors,
}: StatusManagementProps) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Статусы</h2>
        {statuses.length === 0 && (
          <button 
            onClick={onSeedStatuses}
            style={{ fontSize: '0.75rem', color: '#a1a1aa', border: '1px solid #3f3f46', padding: '4px 10px', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}
          >
            Инициализировать стандартные
          </button>
        )}
      </div>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '20px'
      }}>
        <form onSubmit={onAddStatus} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Название (напр. Planned)"
            value={newStatName}
            onChange={(e) => setNewStatName(e.target.value)}
            required
            style={{
              flex: 2,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              color: 'white',
              outline: 'none'
            }}
          />
          <div style={{ position: 'relative', display: 'flex' }} ref={colorPickerRef}>
            <button
              type="button"
              data-tooltip="Выбрать цвет статуса"
              onClick={() => setShowColorPicker(!showColorPicker)}
              style={{
                width: '48px',
                height: '48px',
                background: 'var(--bg-tertiary)',
                border: `2px solid ${newStatColor}`,
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: newStatColor }} />
            </button>

            {showColorPicker && (
              <div style={{ 
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                zIndex: 50,
                display: 'grid', 
                gridTemplateColumns: 'repeat(5, 1fr)', 
                gap: '8px',
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                width: '180px',
              }}>
                {statusColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => { setNewStatColor(color); setShowColorPicker(false); }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: color,
                      border: newStatColor === color ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'transform 0.1s ease'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isAddingStat || !newStatName.trim()}
            className="btn btn-primary"
            style={{ padding: '0 24px' }}
          >
            {isAddingStat ? '...' : 'Добавить'}
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {statuses.map((s) => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255,255,255,0.05)',
                padding: '8px 14px',
                borderRadius: '999px',
                border: `1px solid ${s.color}44`,
              }}
            >
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
              <span style={{ fontWeight: 500 }}>{s.name}</span>
              <button
                onClick={() => onDeleteStatus(s.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f43f5e',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  lineHeight: 1,
                  marginLeft: '4px',
                  padding: '0 4px'
                }}
                title="Удалить"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
