'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  id: string;
  label?: string;
  name?: string;
  color?: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  maxWidth?: string;
  variant?: 'default' | 'small' | 'filter';
  renderOption?: (option: SelectOption, isActive: boolean) => React.ReactNode;
}

function getLabel(opt: SelectOption): string {
  return opt.label || opt.name || opt.id;
}

export default function Select({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  maxWidth,
  variant = 'default',
  renderOption,
}: SelectProps) {
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
  const isFiltered = variant === 'filter' && value !== options[0]?.id;
  const isFilter = variant === 'filter';

  const buttonStyle: React.CSSProperties = isFilter ? {
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
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    opacity: disabled ? 0.6 : 1,
  } : {
    width: '100%',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: variant === 'small' ? '6px 10px' : '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: selected ? 'white' : 'var(--text-secondary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    whiteSpace: 'nowrap',
    gap: '8px',
    minHeight: variant === 'small' ? '32px' : '46px',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: isFilter ? undefined : 0,
    minWidth: isFilter ? '180px' : undefined,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    zIndex: 100,
    maxHeight: '240px',
    overflowY: 'auto',
    padding: isFilter ? '4px' : '6px',
    animation: isFilter ? 'fadeIn 0.15s ease-out' : undefined,
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: isFilter ? undefined : '100%', 
        maxWidth: isFilter ? undefined : (maxWidth || '450px'),
        marginLeft: maxWidth && !isFilter ? 'auto' : '0',
      }}
    >
      <button type="button" disabled={disabled} onClick={() => setIsOpen(!isOpen)} style={buttonStyle}>
        {isFilter ? (
          <>
            {selected?.icon && <span style={{ flexShrink: 0 }}>{selected.icon}</span>}
            <span>{selected ? getLabel(selected) : placeholder}</span>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
            {selected?.color && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selected.color, flexShrink: 0 }} />}
            <span style={{ fontSize: variant === 'small' ? '0.8rem' : '0.9rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selected ? getLabel(selected) : placeholder}
            </span>
          </div>
        )}
        <svg 
          width={isFilter ? 12 : 16} height={isFilter ? 12 : 16}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" 
          strokeWidth={isFilter ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.2s ease', 
            color: isFilter ? undefined : '#71717a',
            opacity: isFilter ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          {options.map(opt => {
            const isActive = value === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => { onChange(opt.id); setIsOpen(false); }}
                className="select-option"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isFilter ? '8px' : '10px',
                  width: '100%',
                  padding: isFilter ? '8px 10px' : '10px 12px',
                  borderRadius: isFilter ? 'var(--radius-sm)' : '6px',
                  background: isActive ? (isFilter ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)') : 'transparent',
                  border: 'none',
                  color: isActive ? (isFilter ? '#818cf8' : 'var(--accent-primary)') : (isFilter ? 'var(--text-primary)' : 'white'),
                  fontSize: isFilter ? '0.82rem' : '0.9rem',
                  fontWeight: isActive ? 600 : (isFilter ? 400 : 500),
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { 
                  if (!isActive) e.currentTarget.style.background = isFilter ? 'rgba(255,255,255,0.04)' : 'var(--bg-tertiary)'; 
                }}
                onMouseLeave={(e) => { 
                  if (!isActive) e.currentTarget.style.background = 'transparent'; 
                }}
              >
                {renderOption ? renderOption(opt, isActive) : (
                  <>
                    {opt.icon && <span style={{ flexShrink: 0 }}>{opt.icon}</span>}
                    {opt.color && <span style={{ width: isFilter ? '6px' : '8px', height: isFilter ? '6px' : '8px', borderRadius: '50%', background: opt.color, flexShrink: 0 }} />}
                    <span style={{ flex: 1 }}>{getLabel(opt)}</span>
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
