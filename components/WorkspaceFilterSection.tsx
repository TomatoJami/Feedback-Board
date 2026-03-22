import React from 'react';

interface WorkspaceFilterSectionProps {
  filterType: 'all' | 'mine' | 'invited';
  setFilterType: (type: 'all' | 'mine' | 'invited') => void;
  user: any;
}

export default function WorkspaceFilterSection({
  filterType,
  setFilterType,
  user
}: WorkspaceFilterSectionProps) {
  return (
    <div className="filters-bar">
      <button
        className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
        onClick={() => setFilterType('all')}
      >
        Все
      </button>
      {user && (
        <React.Fragment>
          <button
            className={`filter-chip ${filterType === 'mine' ? 'active' : ''}`}
            onClick={() => setFilterType('mine')}
          >
            📝 Мои
          </button>
          <button
            className={`filter-chip ${filterType === 'invited' ? 'active' : ''}`}
            onClick={() => setFilterType('invited')}
          >
            🤝 Приглашен
          </button>
        </React.Fragment>
      )}
    </div>
  );
}
