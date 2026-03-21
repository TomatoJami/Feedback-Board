import React from 'react';
import type { Category, Status } from '@/types';

interface FilterSectionProps {
  categoryId: string;
  setCategoryId: (id: string) => void;
  status: string;
  setStatus: (status: string) => void;
  categories: Category[];
  statuses: Status[];
  user: any;
}

export default function FilterSection({
  categoryId,
  setCategoryId,
  status,
  setStatus,
  categories,
  statuses,
  user
}: FilterSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Category Filters */}
      <div className="filters-bar">
        <button
          className={`filter-chip ${categoryId === 'All' ? 'active' : ''}`}
          onClick={() => setCategoryId('All')}
        >
          Все
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`filter-chip ${categoryId === c.id ? 'active' : ''}`}
            onClick={() => setCategoryId(c.id)}
          >
            {c.icon && <span style={{ marginRight: '6px' }}>{c.icon}</span>}
            {c.name}
          </button>
        ))}
        {user && (
          <button
            className={`filter-chip ${categoryId === 'Mine' ? 'active' : ''}`}
            onClick={() => setCategoryId('Mine')}
          >
            📝 Мои
          </button>
        )}
      </div>

      {/* Status Filters */}
      <div className="filters-bar">
        <button
          className={`filter-chip ${status === 'All' ? 'active' : ''}`}
          onClick={() => setStatus('All')}
        >
          Любой статус
        </button>

        <button
          className={`filter-chip ${status === 'None' ? 'active' : ''}`}
          onClick={() => setStatus('None')}
        >
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#6b7280', marginRight: '6px', flexShrink: 0 }} />
          Без статуса
        </button>
        
        {/* Dynamic Statuses */}
        {statuses.map((s) => (
          <button
            key={s.id}
            className={`filter-chip ${status === s.id ? 'active' : ''}`}
            onClick={() => setStatus(s.id)}
          >
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: s.color, marginRight: '6px', flexShrink: 0 }} />
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
