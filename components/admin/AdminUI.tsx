import React from 'react';

// Re-export unified components for backward compatibility
export { default as CustomMultiSelect } from '@/components/ui/MultiSelect';
export type { SelectOption as Option } from '@/components/ui/Select';
export { default as CustomSelect } from '@/components/ui/Select';

export function StatCard({ title, value, subtext, icon, color }: {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  color?: string;
}) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      flex: 1,
      minWidth: '240px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: color ? `${color}10` : 'rgba(255,255,255,0.03)',
        borderRadius: '0 0 0 100%',
        zIndex: 0
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          {icon && (
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              background: 'rgba(255,255,255,0.05)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: color || 'white'
            }}>
              {icon}
            </div>
          )}
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            {value}
          </span>
          {subtext && (
            <span style={{ fontSize: '0.875rem', color: '#71717a', fontWeight: 500 }}>
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
