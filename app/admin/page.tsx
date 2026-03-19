'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import type { Suggestion, SuggestionStatus, Category, Status, Settings } from '@/types';
import pb from '@/lib/pocketbase';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

const PREDEFINED_ICONS = [
  '✨', '🐛', '🎨', '🚀', '💡', '🔧', '📱', '💻', '🔒', 
  '⚙️', '📈', '💬', '⚡', '🌈', '🔥', '🛠️', '🔋', '📡', '🧪'
];

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Prefix management state
  const [prefixes, setPrefixes] = useState<any[]>([]);
  const [newPrefixName, setNewPrefixName] = useState('');
  const [newPrefixColor, setNewPrefixColor] = useState('#6366f1');
  const [isAddingPrefix, setIsAddingPrefix] = useState(false);
  const [showPrefixColorPicker, setShowPrefixColorPicker] = useState(false);
  const prefixColorPickerRef = useRef<HTMLDivElement>(null);

  // User management state
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isUpdatingUser, setIsUpdatingUser] = useState<string | null>(null);

  // Category management state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Status management state
  const [newStatName, setNewStatName] = useState('');
  const [newStatColor, setNewStatColor] = useState('#6366f1');
  const [isAddingStat, setIsAddingStat] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [showIconPicker, setShowIconPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const statusColors = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#0ea5e9', '#ffffff', 
    '#a1a1aa', '#3f3f46'
  ];

  const DEFAULT_STATUSES = [
    { name: 'Open', color: '#a1a1aa' },
    { name: 'Planned', color: '#8b5cf6' },
    { name: 'In Progress', color: '#6366f1' },
    { name: 'Completed', color: '#10b981' }
  ];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowIconPicker(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    if (showIconPicker || showColorPicker || showPrefixColorPicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showIconPicker, showColorPicker, showPrefixColorPicker]);

  useEffect(() => {
    const handleClickPrefix = (e: MouseEvent) => {
      if (prefixColorPickerRef.current && !prefixColorPickerRef.current.contains(e.target as Node)) {
        setShowPrefixColorPicker(false);
      }
    };
    if (showPrefixColorPicker) document.addEventListener('mousedown', handleClickPrefix);
    return () => document.removeEventListener('mousedown', handleClickPrefix);
  }, [showPrefixColorPicker]);

  const fetchData = useCallback(async () => {
    try {
      const [sgRecords, catRecords, statRecords, prefixRecords, userRecords] = await Promise.all([
        pb.collection('suggestions').getFullList<Suggestion>({
          sort: '-created',
          expand: 'author.prefixes,category_id,status_id',
          requestKey: null,
        }),
        pb.collection('categories').getFullList<Category>({
          sort: 'name',
          requestKey: null,
        }),
        pb.collection('statuses').getFullList<Status>({
          sort: 'name',
          requestKey: null,
        }),
        pb.collection('user_prefixes').getFullList({
          requestKey: null,
        }),
        pb.collection('users').getFullList({
          expand: 'prefixes',
          requestKey: null,
        }),
      ]);

      // Fetch or initialize settings
      let settingsRecord: Settings | null = null;
      try {
        const records = await pb.collection('settings').getFullList<Settings>({ 
          limit: 1, 
          requestKey: null 
        });
        if (records.length > 0) {
          settingsRecord = records[0];
        } else {
          settingsRecord = await pb.collection('settings').create({
            default_status: '',
            deletable_statuses: []
          }) as unknown as Settings;
        }
      } catch (err) {
        logger.warn('Failed to fetch settings, they might not be imported yet:', err);
      }

      setSuggestions(sgRecords);
      setCategories(catRecords);
      setStatuses(statRecords);
      setPrefixes(prefixRecords);
      setAllUsers(userRecords);
      setSettings(settingsRecord);
    } catch (err) {
      logger.error('Failed to fetch data:', err);
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

  const handleStatusChange = async (id: string, newStatusId: string) => {
    const message = window.prompt('Введите комментарий для пользователя (необязательно):', '');
    setUpdatingId(id);

    try {
      const updateData: any = {
        status_id: newStatusId || null
      };
      
      const statusObj = statuses.find(s => s.id === newStatusId);

      // Only update status_id in DB to avoid validation errors with the old select field
      await pb.collection('suggestions').update(id, updateData, { requestKey: null });

      // Update local state (including status name for UI)
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { 
          ...s, 
          status_id: updateData.status_id,
          status: (statusObj?.name || '') as any, 
          expand: { ...s.expand, status_id: statusObj } 
        } : s))
      );
      toast.success('Статус обновлён');

      // Send notification
      const suggestion = suggestions.find((s) => s.id === id);
      if (suggestion?.author) {
        try {
          const statusText = statusObj?.name || 'Без статуса';
          const notifMessage = message
            ? `Статус вашего предложения "${suggestion.title}" изменен на: ${statusText}. ${message}`
            : `Статус вашего предложения "${suggestion.title}" изменен на: ${statusText}`;
          
          await pb.collection('notifications').create({
            user: suggestion.author,
            message: notifMessage,
            read: false,
          }, { requestKey: null });
        } catch (notifErr) {
          logger.warn('Failed to create notification:', notifErr);
        }
      }
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

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatName.trim()) return;
    setIsAddingStat(true);
    try {
      const record = await pb.collection('statuses').create({
        name: newStatName.trim(),
        color: newStatColor,
      }) as unknown as Status;
      setStatuses((prev) => [...prev, record].sort((a, b) => a.name.localeCompare(b.name)));
      setNewStatName('');
      setNewStatColor('#6366f1');
      toast.success('Статус добавлен');
    } catch (err) {
      toast.error('Ошибка при добавлении статуса');
    } finally {
      setIsAddingStat(false);
    }
  };

  const handleDeleteStatus = async (id: string) => {
    if (!window.confirm('Вы уверены? Это может затронуть привязанные предложения.')) return;
    try {
      await pb.collection('statuses').delete(id);
      setStatuses((prev) => prev.filter((s) => s.id !== id));
      toast.success('Статус удален');
    } catch (err) {
      toast.error('Ошибка при удалении статуса');
    }
  };

  const handleUpdateSettings = async (updates: Partial<Settings>) => {
    if (!settings) return;
    logger.info('Updating settings with:', updates);
    setIsSavingSettings(true);
    try {
      const updated = await pb.collection('settings').update(settings.id, updates) as unknown as Settings;
      logger.info('Settings updated successfully:', updated);
      setSettings(updated);
      toast.success('Настройки сохранены');
    } catch (err) {
      toast.error('Ошибка при сохранении настроек');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const toggleDeletableStatus = (statusId: string) => {
    if (!settings) return;
    const current = settings.deletable_statuses || [];
    const next = current.includes(statusId)
      ? current.filter(id => id !== statusId)
      : [...current, statusId];
    handleUpdateSettings({ deletable_statuses: next });
  };

  const handleSeedStatuses = async () => {
    if (statuses.length > 0 && !window.confirm('Добавить стандартные статусы к существующим?')) return;
    try {
      const results = await Promise.allSettled(
        DEFAULT_STATUSES.map(s => 
          pb.collection('statuses').create({ name: s.name, color: s.color }, { requestKey: null })
        )
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      if (successful > 0) {
        toast.success(`Добавлено статусов: ${successful}`);
      } else {
        toast.error('Статусы уже существуют или ошибка');
      }
      
      await fetchData();
    } catch (err) {
      toast.error('Ошибка при инициализации');
    }
  };

  const handleAddPrefix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrefixName.trim()) return;
    setIsAddingPrefix(true);
    try {
      const record = await pb.collection('user_prefixes').create({
        name: newPrefixName.trim(),
        color: newPrefixColor,
      });
      setPrefixes((prev) => [...prev, record].sort((a, b) => a.name.localeCompare(b.name)));
      setNewPrefixName('');
      setNewPrefixColor('#6366f1');
      toast.success('Префикс добавлен');
    } catch (err) {
      toast.error('Ошибка при добавлении префикса');
    } finally {
      setIsAddingPrefix(false);
    }
  };

  const handleDeletePrefix = async (id: string) => {
    if (!window.confirm('Вы уверены? Это уберет префикс у всех пользователей, использующих его.')) return;
    try {
      await pb.collection('user_prefixes').delete(id);
      setPrefixes((prev) => prev.filter((p) => p.id !== id));
      toast.success('Префикс удален');
    } catch (err) {
      toast.error('Ошибка при удалении префикса');
    }
  };

  const handleUpdateUserPrefix = async (userId: string, prefixIds: string[]) => {
    setIsUpdatingUser(userId);
    try {
      await pb.collection('users').update(userId, { prefixes: prefixIds });
      const updatedUser = await pb.collection('users').getOne(userId, { expand: 'prefixes' });
      setAllUsers((prev) => prev.map(u => u.id === userId ? updatedUser : u));
      toast.success('Префиксы пользователя обновлены');
    } catch (err) {
      logger.error('Ошибка при обновлении префиксов:', err);
      toast.error('Ошибка при обновлении префиксов');
    } finally {
      setIsUpdatingUser(null);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    // Safety checks
    if (userId === user?.id) {
      toast.error('Вы не можете изменить свою собственную роль');
      return;
    }

    const adminCount = allUsers.filter(u => u.role === 'admin').length;
    const targetUser = allUsers.find(u => u.id === userId);

    if (targetUser?.role === 'admin' && newRole !== 'admin' && adminCount <= 1) {
      toast.error('Должен остаться хотя бы один администратор');
      return;
    }

    setIsUpdatingUser(userId);
    logger.info(`Attempting to update user ${userId} role to ${newRole}`);
    try {
      await pb.collection('users').update(userId, { role: newRole });
      setAllUsers((prev) => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Роль пользователя обновлена');
    } catch (err) {
      logger.error('Ошибка при обновлении роли:', err);
      toast.error('Ошибка при обновлении роли');
    } finally {
      setIsUpdatingUser(null);
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

      {/* Platform Settings */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Настройки платформы</h2>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>
          {/* Default Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Статус по умолчанию для новых предложений
            </label>
            <CustomSelect
              options={[
                { id: '', name: 'Без статуса', color: '#71717a' },
                ...statuses.map(s => ({ id: s.id, name: s.name, color: s.color }))
              ]}
              value={settings?.default_status || ''}
              onChange={(val) => handleUpdateSettings({ default_status: val })}
              placeholder="Выберите статус..."
              disabled={isSavingSettings}
            />
          </div>

          {/* Deletable Statuses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Статусы, при которых автор может удалить предложение
              </label>
              <p style={{ color: '#71717a', fontSize: '0.8rem' }}>
                Если ничего не выбрано, автор может удалять предложения всегда.
              </p>
            </div>
            <CustomMultiSelect
              options={statuses.map(s => ({ id: s.id, name: s.name, color: s.color }))}
              selectedIds={settings?.deletable_statuses || []}
              onChange={(val) => handleUpdateSettings({ deletable_statuses: val })}
              placeholder="Выберите статусы..."
              disabled={isSavingSettings}
            />
          </div>
        </div>
      </section>

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
            <div style={{ position: 'relative', display: 'flex' }} ref={pickerRef}>
              <button
                type="button"
                data-tooltip="Добавить иконку"
                onClick={() => setShowIconPicker(!showIconPicker)}
                style={{
                  width: '48px',
                  height: '48px',
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

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Статусы</h2>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <form onSubmit={handleAddStatus} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Название (напр. В работе)"
              value={newStatName}
              onChange={(e) => setNewStatName(e.target.value)}
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
            <div style={{ position: 'relative', display: 'flex' }} ref={colorPickerRef}>
              <button
                type="button"
                data-tooltip="Выбрать цвет"
                onClick={() => setShowColorPicker(!showColorPicker)}
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--bg-tertiary)',
                  border: `2px solid ${newStatColor}`,
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'transform 0.2s ease'
                }}
              >
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: newStatColor }} />
              </button>

              {showColorPicker && (
                <div style={{ 
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  zIndex: 50,
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)', 
                  gap: '8px',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                  width: '180px',
                }}>
                  {statusColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => { setNewStatColor(color); setShowColorPicker(false); }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: color,
                        border: newStatColor === color ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'transform 0.1s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isAddingStat || !newStatName.trim()}
              className="btn btn-primary"
              style={{ padding: '0 24px' }}
            >
              {isAddingStat ? '...' : 'Добавить'}
            </button>
          </form>
          {statuses.length === 0 && (
            <button
              type="button"
              onClick={handleSeedStatuses}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: '#a1a1aa',
                fontSize: '0.85rem',
                padding: '8px 16px',
                cursor: 'pointer',
                marginBottom: '24px',
                display: 'block',
                width: '100%'
              }}
            >
              🚀 Загрузить стандартные статусы для начала работы
            </button>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {statuses.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: `1px solid ${s.color}44`,
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                <span style={{ fontWeight: 500 }}>{s.name}</span>
                <button
                  onClick={() => handleDeleteStatus(s.id)}
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

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Префиксы пользователей</h2>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <form onSubmit={handleAddPrefix} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Название (напр. VIP, Куратор)"
              value={newPrefixName}
              onChange={(e) => setNewPrefixName(e.target.value)}
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
            <div style={{ position: 'relative', display: 'flex' }} ref={prefixColorPickerRef}>
              <button
                type="button"
                data-tooltip="Выбрать цвет префикса"
                onClick={() => setShowPrefixColorPicker(!showPrefixColorPicker)}
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--bg-tertiary)',
                  border: `2px solid ${newPrefixColor}`,
                  borderRadius: 'var(--radius-md)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'transform 0.2s ease'
                }}
              >
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: newPrefixColor }} />
              </button>

              {showPrefixColorPicker && (
                <div style={{ 
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  zIndex: 50,
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)', 
                  gap: '8px',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                  width: '180px',
                }}>
                  {statusColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => { setNewPrefixColor(color); setShowPrefixColorPicker(false); }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: color,
                        border: newPrefixColor === color ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'transform 0.1s ease'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isAddingPrefix || !newPrefixName.trim()}
              className="btn btn-primary"
              style={{ padding: '0 24px' }}
            >
              {isAddingPrefix ? '...' : 'Добавить'}
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
            {prefixes.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: `1px solid ${p.color}44`,
                }}
              >
                <span style={{ 
                  color: p.color, 
                  fontSize: '0.7rem', 
                  fontWeight: 800, 
                  textTransform: 'uppercase',
                  background: `${p.color}15`,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: `1px solid ${p.color}33`
                }}>
                  {p.name}
                </span>
                <button
                  onClick={() => handleDeletePrefix(p.id)}
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

      {/* User Management */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Пользователи</h2>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '50%' }}>Пользователь</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '25%' }}>Роль</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '25%' }}>Префикс</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr
                  key={u.id}
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', overflow: 'hidden' }}>
                        {u.avatar ? (
                          <img src={`${pb.baseUrl}/api/files/users/${u.id}/${u.avatar}`} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (u.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <CustomSelect
                      options={[
                        { id: 'user', name: 'Пользователь', color: '#a1a1aa' },
                        { id: 'admin', name: 'Админ', color: '#fbbf24' }
                      ]}
                      value={u.role || 'user'}
                      onChange={(val) => handleUpdateUserRole(u.id, val)}
                      placeholder="Роль..."
                      disabled={isUpdatingUser === u.id || u.id === user?.id}
                      maxWidth="100%"
                    />
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <CustomMultiSelect
                      options={prefixes.map(p => ({ id: p.id, name: p.name, color: p.color }))}
                      selectedIds={u.prefixes || []}
                      onChange={(vals) => handleUpdateUserPrefix(u.id, vals)}
                      placeholder="Префиксы..."
                      disabled={isUpdatingUser === u.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Suggestion Management */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Предложения</h2>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          // overflow: 'hidden', // Removed to prevent dropdown clipping
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '40%' }}>Заголовок</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '25%' }}>Автор</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '15%' }}>Голоса</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '20%' }}>Статус</th>
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
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(99,102,241,0.1)',
                      color: '#818cf8',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border: '1px solid rgba(99,102,241,0.2)',
                      minWidth: '40px'
                    }}>
                      {s.votes_count || 0}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <CustomSelect
                      options={[
                        { id: '', name: 'Без статуса', color: '#71717a' },
                        ...statuses.map(st => ({ id: st.id, name: st.name, color: st.color }))
                      ]}
                      value={s.status_id || ''}
                      onChange={(val) => handleStatusChange(s.id, val)}
                      placeholder="Выберите статус..."
                      disabled={updatingId === s.id}
                      maxWidth="180px"
                    />
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

// ── Components ──────────────────────────────────────────────

interface Option {
  id: string;
  name: string;
  color?: string;
}

function CustomSelect({ options, value, onChange, placeholder, disabled, maxWidth }: {
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

function CustomMultiSelect({ options, selectedIds, onChange, placeholder, disabled }: {
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
