import Link from 'next/link';
import React from 'react';

import type { UserPrefix } from '@/types';

interface PrefixManagementProps {
  prefixes: UserPrefix[];
  newPrefixName: string;
  setNewPrefixName: (val: string) => void;
  newPrefixColor: string;
  setNewPrefixColor: (val: string) => void;
  showPrefixColorPicker: boolean;
  setShowPrefixColorPicker: (val: boolean) => void;
  isAddingPrefix: boolean;
  onAddPrefix: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDeletePrefix: (id: string) => Promise<void>;
  prefixColorPickerRef: React.RefObject<HTMLDivElement | null>;
  statusColors: string[];
  isReadOnly?: boolean;
  isPro?: boolean;
}

export default function PrefixManagement({
  prefixes,
  newPrefixName,
  setNewPrefixName,
  newPrefixColor,
  setNewPrefixColor,
  showPrefixColorPicker,
  setShowPrefixColorPicker,
  isAddingPrefix,
  onAddPrefix,
  onDeletePrefix,
  prefixColorPickerRef,
  statusColors,
  isReadOnly = false,
  isPro = false,
}: PrefixManagementProps) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Префиксы пользователей</h2>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '20px'
      }}>
        {!isReadOnly && isPro && (
          <form onSubmit={onAddPrefix} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input
              type="text"
              placeholder="Название (напр. HELPER)"
              value={newPrefixName}
              onChange={(e) => setNewPrefixName(e.target.value)}
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
            <div style={{ position: 'relative', display: 'flex' }} ref={prefixColorPickerRef}>
              <button
                type="button"
                data-tooltip="Выбрать цвет префикса"
                onClick={() => setShowPrefixColorPicker(!showPrefixColorPicker)}
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--bg-tertiary)',
                  border: `2px solid ${newPrefixColor}`,
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'transform 0.2s ease'
                }}
              >
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: newPrefixColor }} />
              </button>

              {showPrefixColorPicker && (
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
                      onClick={() => { setNewPrefixColor(color); setShowPrefixColorPicker(false); }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: color,
                        border: newPrefixColor === color ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
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
              disabled={isAddingPrefix || !newPrefixName.trim()}
              className="btn btn-primary"
              style={{ padding: '0 24px' }}
            >
              {isAddingPrefix ? '...' : 'Добавить'}
            </button>
          </form>
        )}
        {!isReadOnly && !isPro && (
          <div className="flex flex-col items-center justify-center p-6 border border-dashed border-white/10 rounded-xl bg-white/[0.02] mb-6">
            <div className="text-zinc-500 text-sm mb-3">Кастомные префиксы доступны только в плане PRO</div>
            <Link href="/#pricing" className="btn btn-sm btn-primary">Улучшить тариф</Link>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
          {prefixes.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255,255,255,0.05)',
                padding: '8px 14px',
                borderRadius: '999px',
                border: `1px solid ${p.color}44`,
              }}
            >
              <span style={{ 
                color: p.color, 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                textTransform: 'uppercase',
                background: `${p.color}15`,
                padding: '2px 6px',
                borderRadius: '4px',
                border: `1px solid ${p.color}33`
              }}>
                {p.name}
              </span>
              {!isReadOnly && (
                <button
                  onClick={() => onDeletePrefix(p.id)}
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
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
