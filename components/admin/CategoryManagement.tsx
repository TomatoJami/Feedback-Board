import React from 'react';
import type { Category } from '@/types';

const PREDEFINED_ICONS = [
  '✨', '🐛', '🎨', '🚀', '💡', '🔧', '📱', '💻', '🔒', 
  '⚙️', '📈', '💬', '⚡', '🌈', '🔥', '🛠️', '🔋', '📡', '🧪'
];

interface CategoryManagementProps {
  categories: Category[];
  newCatName: string;
  setNewCatName: (val: string) => void;
  newCatIcon: string;
  setNewCatIcon: (val: string) => void;
  showIconPicker: boolean;
  setShowIconPicker: (val: boolean) => void;
  isAddingCat: boolean;
  onAddCategory: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  pickerRef: React.RefObject<HTMLDivElement | null>;
}

export default function CategoryManagement({
  categories,
  newCatName,
  setNewCatName,
  newCatIcon,
  setNewCatIcon,
  showIconPicker,
  setShowIconPicker,
  isAddingCat,
  onAddCategory,
  onDeleteCategory,
  pickerRef,
}: CategoryManagementProps) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Категории</h2>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '20px'
      }}>
        <form onSubmit={onAddCategory} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Название (напр. UI)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
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
          <div style={{ position: 'relative', display: 'flex' }} ref={pickerRef}>
            <button
              type="button"
              data-tooltip="Добавить иконку"
              onClick={() => setShowIconPicker(!showIconPicker)}
              style={{
                width: '48px',
                height: '48px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: 'white',
                transition: 'border-color 0.2s ease',
                padding: 0,
              }}
            >
              {newCatIcon || '+'}
            </button>

            {showIconPicker && (
              <div style={{ 
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                zIndex: 50,
                display: 'grid', 
                gridTemplateColumns: 'repeat(5, 1fr)', 
                gap: '6px',
                padding: '8px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                width: '220px',
              }}>
                <button
                  type="button"
                  onClick={() => { setNewCatIcon(''); setShowIconPicker(false); }}
                  style={{
                    gridColumn: 'span 5',
                    fontSize: '0.75rem',
                    padding: '4px',
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    color: '#a1a1aa',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Без иконки
                </button>
                {PREDEFINED_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => { setNewCatIcon(icon); setShowIconPicker(false); }}
                    style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      background: newCatIcon === icon ? 'var(--accent-primary)' : 'transparent',
                      border: 'none',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isAddingCat || !newCatName.trim()}
            className="btn btn-primary"
            style={{ padding: '0 24px' }}
          >
            {isAddingCat ? '...' : 'Добавить'}
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {categories.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255,255,255,0.05)',
                padding: '8px 14px',
                borderRadius: '999px',
                border: '1px solid var(--border-color)',
              }}
            >
              <span>{c.icon}</span>
              <span style={{ fontWeight: 500 }}>{c.name}</span>
              <button
                onClick={() => onDeleteCategory(c.id)}
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
