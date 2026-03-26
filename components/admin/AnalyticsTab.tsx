import React, { useMemo } from 'react';

import type { Category, Status, Suggestion } from '@/types';

interface AnalyticsTabProps {
  suggestions: Suggestion[];
  categories: Category[];
  statuses: Status[];
}

export default function AnalyticsTab({ suggestions, categories, statuses }: AnalyticsTabProps) {
  // Suggestions by category
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of suggestions) {
      const catId = s.category_id || '_none';
      counts[catId] = (counts[catId] || 0) + 1;
    }
    
    const items = categories.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon || '📋',
      count: counts[c.id] || 0,
    }));
    
    if (counts['_none']) {
      items.push({ id: '_none', name: 'Без категории', icon: '❓', count: counts['_none'] });
    }
    
    return items.sort((a, b) => b.count - a.count);
  }, [suggestions, categories]);

  // Done vs not done
  const completionData = useMemo(() => {
    // Find statuses that look "done" (common names)
    const doneNames = ['done', 'completed', 'closed', 'выполнено', 'завершено', 'закрыто', 'готово'];
    const doneStatusIds = new Set(
      statuses
        .filter(s => doneNames.some(n => s.name.toLowerCase().includes(n)))
        .map(s => s.id)
    );

    let done = 0;
    let notDone = 0;
    for (const s of suggestions) {
      if (s.status_id && doneStatusIds.has(s.status_id)) {
        done++;
      } else {
        notDone++;
      }
    }

    return { done, notDone, total: suggestions.length };
  }, [suggestions, statuses]);

  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of suggestions) {
      const statusId = s.status_id || '_none';
      counts[statusId] = (counts[statusId] || 0) + 1;
    }

    const items = statuses.map(st => ({
      id: st.id,
      name: st.name,
      color: st.color,
      count: counts[st.id] || 0,
    }));

    if (counts['_none']) {
      items.push({ id: '_none', name: 'Без статуса', color: '#71717a', count: counts['_none'] });
    }

    return items.sort((a, b) => b.count - a.count);
  }, [suggestions, statuses]);

  const maxCatCount = Math.max(...categoryData.map(c => c.count), 1);
  const maxStatCount = Math.max(...statusData.map(s => s.count), 1);
  const donePercent = completionData.total > 0 ? Math.round((completionData.done / completionData.total) * 100) : 0;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Аналитика</h2>

      {suggestions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          color: 'var(--text-secondary)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}>
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>Пока нет данных</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.7 }}>Аналитика появится, когда будут созданы предложения.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Completed vs Not Completed */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>
              Выполнение
            </h3>
            
            {/* Donut-like visual */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${donePercent * 0.88} 88`}
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)',
                }}>
                  {donePercent}%
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Выполнено: <strong style={{ color: 'var(--text-primary)' }}>{completionData.done}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    В работе: <strong style={{ color: 'var(--text-primary)' }}>{completionData.notDone}</strong>
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Всего: {completionData.total}
                </div>
              </div>
            </div>
          </div>

          {/* By Category */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>
              По категориям
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categoryData.map(cat => (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.icon} {cat.name}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{cat.count}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(cat.count / maxCatCount) * 100}%`,
                      background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Status */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            gridColumn: '1 / -1',
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>
              По статусам
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {statusData.map(st => (
                <div key={st.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.color, display: 'inline-block' }} />
                      {st.name}
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{st.count}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(st.count / maxStatCount) * 100}%`,
                      background: st.color,
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                      opacity: 0.8,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
