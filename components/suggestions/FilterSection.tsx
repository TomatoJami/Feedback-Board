import { 
  AdjustmentsHorizontalIcon, 
  ClockIcon, 
  FireIcon, 
  GlobeAltIcon, 
  PencilSquareIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';
import React from 'react';

import Select from '@/components/ui/Select';
import type { Category, Status, User } from '@/types';

interface FilterSectionProps {
  categoryId: string;
  setCategoryId: (id: string) => void;
  status: string;
  setStatus: (status: string) => void;
  categories: Category[];
  statuses: Status[];
  user: User | null;
  sortBy: 'votes' | 'newest' | 'oldest';
  setSortBy: (sort: 'votes' | 'newest' | 'oldest') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
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
    { id: 'All', label: 'Все', icon: <GlobeAltIcon style={{ width: '14px', height: '14px' }} /> },
    ...categories.map(c => ({ id: c.id, label: c.name, icon: c.icon || '' })),
    ...(user ? [{ id: 'Mine', label: 'Мои', icon: <PencilSquareIcon style={{ width: '14px', height: '14px' }} /> }] : []),
  ];

  const statusOptions = [
    { id: 'All', label: 'Любой', icon: <AdjustmentsHorizontalIcon style={{ width: '14px', height: '14px' }} />, color: undefined },
    { id: 'None', label: 'Без статуса', color: '#6b7280' },
    ...statuses.map(s => ({ id: s.id, label: s.name, color: s.color })),
  ];

  const sortOptions = [
    { id: 'votes', label: 'Популярные', icon: <FireIcon style={{ width: '14px', height: '14px' }} /> },
    { id: 'newest', label: 'Новые', icon: <SparklesIcon style={{ width: '14px', height: '14px' }} /> },
    { id: 'oldest', label: 'Старые', icon: <ClockIcon style={{ width: '14px', height: '14px' }} /> },
  ];

  // Active filter chips to show below
  const activeFilters: { key: string; label: React.ReactNode; onClear: () => void }[] = [];
  if (categoryId !== 'All') {
    const cat = categoryOptions.find(c => c.id === categoryId);
    activeFilters.push({ 
      key: 'cat', 
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {cat?.icon} {cat?.label}
        </span>
      ), 
      onClear: () => setCategoryId('All') 
    });
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
        <Select
          variant="filter"
          options={categoryOptions}
          value={categoryId}
          onChange={setCategoryId}
          placeholder="Категория"
        />
        <Select
          variant="filter"
          options={statusOptions}
          value={status}
          onChange={setStatus}
          placeholder="Статус"
        />
        <Select
          variant="filter"
          options={sortOptions}
          value={sortBy}
          onChange={(v) => setSortBy(v as 'votes' | 'newest' | 'oldest')}
          placeholder="Сортировка"
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
            className="filter-search-input"
          />
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {activeFilters.map(f => (
            <span key={f.key} className="active-filter-badge">
              {f.label}
              <button onClick={f.onClear} className="filter-chip-close">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
          {activeFilters.length > 1 && (
            <button
              onClick={() => { setCategoryId('All'); setStatus('All'); setSearchQuery(''); }}
              className="filter-chip-reset"
            >
              Сбросить все
            </button>
          )}
        </div>
      )}
    </div>
  );
}
