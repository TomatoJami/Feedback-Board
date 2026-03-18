'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import type { Suggestion, SuggestionStatus, Category } from '@/types';
import pb from '@/lib/pocketbase';
import toast from 'react-hot-toast';

const PREDEFINED_ICONS = [
  '✨', '🐛', '🎨', '🚀', '💡', '🔧', '📱', '💻', '🔒', 
  '⚙️', '📈', '💬', '⚡', '🌈', '🔥', '🛠️', '🔋', '📡', '🧪'
];

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Category management state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [sgRecords, catRecords] = await Promise.all([
        pb.collection('suggestions').getFullList<Suggestion>({
          sort: '-created',
          expand: 'author,category_id',
          requestKey: null,
        }),
        pb.collection('categories').getFullList<Category>({
          sort: 'name',
          requestKey: null,
        }),
      ]);
      setSuggestions(sgRecords);
      setCategories(catRecords);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
      return;
    }
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, authLoading, router, fetchData]);

  const handleStatusChange = async (id: string, status: SuggestionStatus) => {
    const message = window.prompt('Введите комментарий для пользователя (необязательно):', '');
    setUpdatingId(id);

    try {
      await pb.collection('suggestions').update(id, { status });

      const suggestion = suggestions.find((s) => s.id === id);
      if (suggestion?.author) {
        const statusText = status.replace('_', ' ');
        const notifMessage = message
          ? `Статус вашего предложения "${suggestion.title}" изменен на: ${statusText}. ${message}`
          : `Статус вашего предложения "${suggestion.title}" изменен на: ${statusText}`;
        await pb.collection('notifications').create({
          user: suggestion.author,
          message: notifMessage,
          read: false,
        });
      }

      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
      toast.success('Статус обновлён');
    } catch (err) {
      toast.error('Ошибка при обновлении статуса');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsAddingCat(true);
    try {
      const record = await pb.collection('categories').create({
        name: newCatName.trim(),
        icon: newCatIcon.trim(),
      }) as unknown as Category;
      setCategories((prev) => [...prev, record].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCatName('');
      setNewCatIcon('');
      setShowIconPicker(false);
      toast.success('Категория добавлена');
    } catch (err) {
      toast.error('Ошибка при добавлении категории');
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Вы уверены? Предложения в этой категории останутся без категории.')) return;
    try {
      await pb.collection('categories').delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success('Категория удалена');
    } catch (err) {
      toast.error('Ошибка при удалении категории');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col gap-6" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="h-10 w-64 bg-white/5 animate-pulse rounded-lg" />
        <div className="h-96 bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>Панель администратора</h1>
        <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
          Управление системой и контентом
        </p>
      </div>

      {/* Category Management */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Категории</h2>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
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
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Иконка</p>
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                style={{
                  width: '42px',
                  height: '42px',
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
                  onClick={() => handleDeleteCategory(c.id)}
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

      {/* Suggestion Management */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Предложения</h2>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Заголовок</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Автор</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Голоса</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s) => (
                <tr
                  key={s.id}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '2px' }}>
                      {s.expand?.category_id?.icon} {s.expand?.category_id?.name || 'Без категории'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#d4d4d8' }}>
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {s.expand?.author?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={`${pb.baseUrl}/api/files/users/${s.expand.author.id}/${s.expand.author.avatar}`} 
                            alt={s.expand.author.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (s.expand?.author?.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      {s.expand?.author?.name || 'Аноним'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: 'rgba(99,102,241,0.1)',
                      color: '#818cf8',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border: '1px solid rgba(99,102,241,0.2)',
                    }}>
                      {s.votes_count || 0}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <select
                      value={s.status}
                      disabled={updatingId === s.id}
                      onChange={(e) => handleStatusChange(s.id, e.target.value as SuggestionStatus)}
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '6px 10px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      <option value="Open">Open</option>
                      <option value="Planned">Planned</option>
                      <option value="In_Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
