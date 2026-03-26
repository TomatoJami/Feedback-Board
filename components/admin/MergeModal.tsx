'use client';

import React, { useEffect, useMemo, useState } from 'react';

import type { Suggestion } from '@/types';

interface MergeModalProps {
  sourceId: string;
  sourceTitle: string;
  suggestions: Suggestion[];
  onMerge: (sourceId: string, targetId: string) => Promise<void>;
  onClose: () => void;
}

export default function MergeModal({
  sourceId,
  sourceTitle,
  suggestions,
  onMerge,
  onClose,
}: MergeModalProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  const filtered = useMemo(() => {
    return suggestions
      .filter(s => s.id !== sourceId && !s.merged_into)
      .filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()));
  }, [suggestions, sourceId, search]);

  const handleMerge = async () => {
    if (!selectedId || isMerging) return;
    setIsMerging(true);
    try {
      await onMerge(sourceId, selectedId);
      onClose();
    } finally {
      setIsMerging(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.15s ease-out',
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
          Объединить предложения
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Голоса и комментарии из <strong style={{ color: 'var(--text-primary)' }}>«{sourceTitle}»</strong> будут перенесены в выбранное предложение.
        </p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск предложения..."
          style={{
            width: '100%',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            outline: 'none',
            marginBottom: '12px',
          }}
        />

        <div style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          marginBottom: '20px',
        }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Нет подходящих предложений
            </p>
          ) : filtered.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                background: selectedId === s.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                border: `1px solid ${selectedId === s.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                color: 'var(--text-primary)',
                transition: 'all 0.15s ease',
                width: '100%',
              }}
            >
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: s.votes_count > 0 ? '#10b981' : 'var(--text-secondary)',
                minWidth: '32px',
              }}>
                {s.votes_count > 0 ? `+${s.votes_count}` : s.votes_count}
              </span>
              <span style={{ fontSize: '0.9rem', flex: 1 }}>{s.title}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {s.expand?.status_id?.name || 'Открыто'}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            style={{ fontSize: '0.9rem', padding: '10px 24px' }}
          >
            Отмена
          </button>
          <button
            className="btn btn-primary"
            onClick={handleMerge}
            disabled={!selectedId || isMerging}
            style={{ fontSize: '0.9rem', padding: '10px 24px' }}
          >
            {isMerging ? 'Объединение...' : 'Объединить'}
          </button>
        </div>
      </div>
    </div>
  );
}
