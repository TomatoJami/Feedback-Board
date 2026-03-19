'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import type { Suggestion, Category, Status, Settings } from '@/types';
import pb from '@/lib/pocketbase';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

import AdminHeader from '@/components/admin/AdminHeader';
import PlatformSettings from '@/components/admin/PlatformSettings';
import CategoryManagement from '@/components/admin/CategoryManagement';
import StatusManagement from '@/components/admin/StatusManagement';
import PrefixManagement from '@/components/admin/PrefixManagement';
import UserManagement from '@/components/admin/UserManagement';
import SuggestionManagement from '@/components/admin/SuggestionManagement';

const STATUS_COLORS = [
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
  const [showIconPicker, setShowIconPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Status management state
  const [newStatName, setNewStatName] = useState('');
  const [newStatColor, setNewStatColor] = useState('#6366f1');
  const [isAddingStat, setIsAddingStat] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowIconPicker(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
      if (prefixColorPickerRef.current && !prefixColorPickerRef.current.contains(e.target as Node)) {
        setShowPrefixColorPicker(false);
      }
    };
    if (showIconPicker || showColorPicker || showPrefixColorPicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showIconPicker, showColorPicker, showPrefixColorPicker]);

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

      let settingsRecord: Settings | null = null;
      try {
        const records = await pb.collection('settings').getFullList<Settings>({ limit: 1, requestKey: null });
        if (records.length > 0) {
          settingsRecord = records[0];
        } else {
          settingsRecord = await pb.collection('settings').create({ default_status: '', deletable_statuses: [] }) as unknown as Settings;
        }
      } catch (err) {
        logger.warn('Failed to fetch settings:', err);
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
      const updateData: any = { status_id: newStatusId || null };
      const statusObj = statuses.find(s => s.id === newStatusId);
      await pb.collection('suggestions').update(id, updateData, { requestKey: null });
      setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status_id: updateData.status_id, status: (statusObj?.name || '') as any, expand: { ...s.expand, status_id: statusObj } } : s)));
      toast.success('Статус обновлён');

      const suggestion = suggestions.find((s) => s.id === id);
      if (suggestion?.author) {
        const statusText = statusObj?.name || 'Без статуса';
        const notifMessage = message ? `Статус вашего предложения "${suggestion.title}" изменен на: ${statusText}. ${message}` : `Статус вашего предложения "${suggestion.title}" изменен на: ${statusText}`;
        await pb.collection('notifications').create({ user: suggestion.author, message: notifMessage, read: false }, { requestKey: null });
      }
    } catch (err) {
      toast.error('Ошибка при обновлении статуса');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsAddingCat(true);
    try {
      const record = await pb.collection('categories').create({ name: newCatName.trim(), icon: newCatIcon.trim() }) as unknown as Category;
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

  const handleAddStatus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newStatName.trim()) return;
    setIsAddingStat(true);
    try {
      const record = await pb.collection('statuses').create({ name: newStatName.trim(), color: newStatColor }) as unknown as Status;
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
    setIsSavingSettings(true);
    try {
      const updated = await pb.collection('settings').update(settings.id, updates) as unknown as Settings;
      setSettings(updated);
      toast.success('Настройки сохранены');
    } catch (err) {
      toast.error('Ошибка при сохранении настроек');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSeedStatuses = async () => {
    if (statuses.length > 0 && !window.confirm('Добавить стандартные статусы к существующим?')) return;
    try {
      const results = await Promise.allSettled(DEFAULT_STATUSES.map(s => pb.collection('statuses').create({ name: s.name, color: s.color }, { requestKey: null })));
      if (results.some(r => r.status === 'fulfilled')) {
        toast.success(`Добавлены статусы`);
        await fetchData();
      } else {
        toast.error('Ошибка при заполнении статусов');
      }
    } catch (err) {
      toast.error('Ошибка при инициализации');
    }
  };

  const handleAddPrefix = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPrefixName.trim()) return;
    setIsAddingPrefix(true);
    try {
      const record = await pb.collection('user_prefixes').create({ name: newPrefixName.trim(), color: newPrefixColor });
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
    if (!window.confirm('Вы уверены?')) return;
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
      toast.error('Ошибка при обновлении');
    } finally {
      setIsUpdatingUser(null);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (userId === user?.id) {
      toast.error('Вы не можете изменить свою роль');
      return;
    }
    setIsUpdatingUser(userId);
    try {
      await pb.collection('users').update(userId, { role: newRole });
      setAllUsers((prev) => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Роль обновлена');
    } catch (err) {
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
      <AdminHeader />

      <PlatformSettings
        settings={settings}
        statuses={statuses}
        isSavingSettings={isSavingSettings}
        onUpdateSettings={handleUpdateSettings}
      />

      <CategoryManagement
        categories={categories}
        newCatName={newCatName}
        setNewCatName={setNewCatName}
        newCatIcon={newCatIcon}
        setNewCatIcon={setNewCatIcon}
        showIconPicker={showIconPicker}
        setShowIconPicker={setShowIconPicker}
        isAddingCat={isAddingCat}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        pickerRef={pickerRef}
      />

      <StatusManagement
        statuses={statuses}
        newStatName={newStatName}
        setNewStatName={setNewStatName}
        newStatColor={newStatColor}
        setNewStatColor={setNewStatColor}
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
        isAddingStat={isAddingStat}
        onAddStatus={handleAddStatus}
        onDeleteStatus={handleDeleteStatus}
        onSeedStatuses={handleSeedStatuses}
        colorPickerRef={colorPickerRef}
        statusColors={STATUS_COLORS}
      />

      <PrefixManagement
        prefixes={prefixes}
        newPrefixName={newPrefixName}
        setNewPrefixName={setNewPrefixName}
        newPrefixColor={newPrefixColor}
        setNewPrefixColor={setNewPrefixColor}
        showPrefixColorPicker={showPrefixColorPicker}
        setShowPrefixColorPicker={setShowPrefixColorPicker}
        isAddingPrefix={isAddingPrefix}
        onAddPrefix={handleAddPrefix}
        onDeletePrefix={handleDeletePrefix}
        prefixColorPickerRef={prefixColorPickerRef}
        statusColors={STATUS_COLORS}
      />

      <UserManagement
        allUsers={allUsers}
        user={user}
        prefixes={prefixes}
        isUpdatingUser={isUpdatingUser}
        onUpdateUserRole={handleUpdateUserRole}
        onUpdateUserPrefix={handleUpdateUserPrefix}
      />

      <SuggestionManagement
        suggestions={suggestions}
        statuses={statuses}
        updatingId={updatingId}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
