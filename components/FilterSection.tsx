import React, { useState, useRef, useEffect } from 'react';
import type { Category, Status } from '@/types';

interface FilterSectionProps {
  categoryId: string;
  setCategoryId: (id: string) => void;
  status: string;
  setStatus: (status: string) => void;
  categories: Category[];
  statuses: Status[];
  user: any;
  sortBy: 'votes' | 'newest' | 'oldest';
  setSortBy: (sort: 'votes' | 'newest' | 'oldest') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

function FilterDropdown({ 
  label, 
  icon,
  options, 
  value, 
  onChange,
  renderOption,
}: { 
  label: string;
  icon: React.ReactNode;
  options: { id: string; label: string; color?: string; icon?: string }[];
  value: string;
  onChange: (id: string) => void;
  renderOption?: (opt: { id: string; label: string; color?: string; icon?: string }, isActive: boolean) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const activeOption = options.find(o => o.id === value);
  const displayLabel = activeOption?.label || label;
  const isFiltered = value !== options[0]?.id;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 12px',
          borderRadius: 'var(--radius-md)',
          background: isFiltered ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
          border: `1px solid ${isFiltered ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-color)'}`,
          color: isFiltered ? '#818cf8' : 'var(--text-secondary)',
          fontSize: '0.82rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        {icon}
        <span>{displayLabel}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          minWidth: '180px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 50,
          padding: '4px',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          {options.map(opt => {
            const isActive = value === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.id); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 10px',
                  background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#818cf8' : 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {renderOption ? renderOption(opt, isActive) : (
                  <>
                    {opt.icon && <span>{opt.icon}</span>}
                    {opt.color && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: opt.color, flexShrink: 0 }} />}
                    {opt.label}
                  </>
                )}
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FilterSection({
  categoryId,
  setCategoryId,
  status,
  setStatus,
  categories,
  statuses,
  user,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
}: FilterSectionProps) {
  const categoryOptions = [
    { id: 'All', label: 'Все', icon: '' },
    ...categories.map(c => ({ id: c.id, label: c.name, icon: c.icon || '' })),
    ...(user ? [{ id: 'Mine', label: 'Мои', icon: '📝' }] : []),
  ];

  const statusOptions = [
    { id: 'All', label: 'Любой', color: undefined },
    { id: 'None', label: 'Без статуса', color: '#6b7280' },
    ...statuses.map(s => ({ id: s.id, label: s.name, color: s.color })),
  ];

  const sortOptions = [
    { id: 'votes', label: '🔥 Популярные' },
    { id: 'newest', label: '✨ Новые' },
    { id: 'oldest', label: '⏳ Старые' },
  ];

  // Active filter chips to show below
  const activeFilters: { key: string; label: string; onClear: () => void }[] = [];
  if (categoryId !== 'All') {
    const cat = categoryOptions.find(c => c.id === categoryId);
    activeFilters.push({ key: 'cat', label: `${cat?.icon || ''} ${cat?.label || ''}`.trim(), onClear: () => setCategoryId('All') });
  }
  if (status !== 'All') {
    const st = statusOptions.find(s => s.id === status);
    activeFilters.push({ key: 'status', label: st?.label || '', onClear: () => setStatus('All') });
  }
  if (searchQuery) {
    activeFilters.push({ key: 'search', label: `«${searchQuery}»`, onClear: () => setSearchQuery('') });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Single compact row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <FilterDropdown
          label="Категория"
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>}
          options={categoryOptions}
          value={categoryId}
          onChange={setCategoryId}
        />
        <FilterDropdown
          label="Статус"
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
          options={statusOptions}
          value={status}
          onChange={setStatus}
        />
        <FilterDropdown
          label={sortOptions.find(s => s.id === sortBy)?.label || 'Сортировка'}
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5h10" /><path d="M11 9h7" /><path d="M11 13h4" /><path d="M3 17l3 3 3-3" /><path d="M6 18V4" /></svg>}
          options={sortOptions}
          value={sortBy}
          onChange={(v) => setSortBy(v as any)}
        />

        {/* Search */}
        <div style={{ marginLeft: 'auto', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '10px', pointerEvents: 'none', opacity: 0.5 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '7px 10px 7px 30px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              width: '180px',
              outline: 'none',
              transition: 'border-color 0.2s, width 0.3s',
              fontFamily: 'inherit',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.width = '240px'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; if (!e.currentTarget.value) e.currentTarget.style.width = '180px'; }}
          />
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {activeFilters.map(f => (
            <span
              key={f.key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '999px',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#818cf8',
                fontSize: '0.72rem',
                fontWeight: 500,
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              {f.label}
              <button
                onClick={f.onClear}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.7 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
          {activeFilters.length > 1 && (
            <button
              onClick={() => { setCategoryId('All'); setStatus('All'); setSearchQuery(''); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '999px',
                background: 'rgba(244, 63, 94, 0.1)',
                color: '#fb7185',
                fontSize: '0.72rem',
                fontWeight: 500,
                border: '1px solid rgba(244, 63, 94, 0.2)',
                cursor: 'pointer',
              }}
            >
              Сбросить все
            </button>
          )}
        </div>
      )}
    </div>
  );
}
