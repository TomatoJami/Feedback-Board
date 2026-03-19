import React, { useState, useEffect, useRef } from 'react';

export interface Option {
  id: string;
  name: string;
  color?: string;
}

export function CustomSelect({ options, value, onChange, placeholder, disabled, maxWidth }: {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  maxWidth?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const selected = options.find(o => o.id === value);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: maxWidth || '450px', marginLeft: maxWidth ? 'auto' : '0' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: selected ? 'white' : 'var(--text-secondary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1,
          whiteSpace: 'nowrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
          {selected?.color && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selected.color, flexShrink: 0 }} />}
          <span style={{ fontSize: '0.9rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selected ? selected.name : placeholder}
          </span>
        </div>
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: '#71717a' }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          zIndex: 100,
          maxHeight: '240px',
          overflowY: 'auto',
          padding: '6px'
        }}>
          {options.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); setIsOpen(false); }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: value === opt.id ? 'var(--bg-tertiary)' : 'transparent',
                border: 'none',
                color: value === opt.id ? 'var(--accent-primary)' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = value === opt.id ? 'var(--bg-tertiary)' : 'transparent')}
            >
              {opt.color && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: opt.color }} />}
              <span style={{ fontSize: '0.9rem', fontWeight: 500, flex: 1 }}>{opt.name}</span>
              {value === opt.id && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CustomMultiSelect({ options, selectedIds, onChange, placeholder, disabled }: {
  options: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const safeSelectedIds = Array.isArray(selectedIds) 
    ? selectedIds 
    : (typeof selectedIds === 'string' && selectedIds ? [selectedIds] : []);
  
  const toggleOption = (id: string) => {
    const next = safeSelectedIds.includes(id)
      ? safeSelectedIds.filter(i => i !== id)
      : [...safeSelectedIds, id];
    onChange(next);
  };
  
  const selectedCount = safeSelectedIds.length;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: selectedCount > 0 ? 'white' : 'var(--text-secondary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1,
          minHeight: '46px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          {selectedCount === 0 ? (
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{placeholder}</span>
          ) : (
            safeSelectedIds.map(id => {
              const opt = options.find(o => o.id === id);
              if (!opt) return null;
              return (
                <span key={id} style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {opt.name}
                  <span 
                    onClick={(e) => { e.stopPropagation(); toggleOption(id); }}
                    style={{ cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 2px' }}
                  >
                    ×
                  </span>
                </span>
              );
            })
          )}
        </div>
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: '#71717a', flexShrink: 0, marginLeft: '8px' }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          zIndex: 100,
          maxHeight: '240px',
          overflowY: 'auto',
          padding: '6px'
        }}>
          {options.map(opt => {
            const isSelected = safeSelectedIds.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleOption(opt.id)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                  border: 'none',
                  color: isSelected ? 'var(--accent-primary)' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? 'rgba(99, 102, 241, 0.05)' : 'transparent')}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid',
                  borderColor: isSelected ? 'var(--accent-primary)' : '#52525b',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSelected ? 'var(--accent-primary)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                {opt.color && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: opt.color }} />}
                <span style={{ fontSize: '0.9rem', fontWeight: 500, flex: 1 }}>{opt.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
