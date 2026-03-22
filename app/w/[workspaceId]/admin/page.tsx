'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
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
import WorkspaceMemberManagement from '@/components/admin/WorkspaceMemberManagement';
import WorkspaceDangerZone from '@/components/admin/WorkspaceDangerZone';
import ConfirmModal from '@/components/ConfirmModal';

const STATUS_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#0ea5e9', '#ffffff', 
  '#a1a1aa', '#3f3f46'
];

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [isWorkspaceAdmin, setIsWorkspaceAdmin] = useState(false);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'moderator' | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'board' | 'members' | 'suggestions' | 'danger'>('general');

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

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger',
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
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
      // First, get the actual workspace record
      const workspaceRecord = await pb.collection('workspaces').getFirstListItem(`slug = "${workspaceId}" || id = "${workspaceId}"`, { requestKey: null });
      const realWorkspaceId = workspaceRecord.id;
      setActiveWorkspace(workspaceRecord);

      // Check admin status first
      const memberCheck = await pb.collection('workspace_members').getFirstListItem(
        `(workspace = "${realWorkspaceId}" || workspace = "${workspaceId}") && user = "${pb.authStore.record?.id}"`,
        { requestKey: null }
      ).catch(() => null);

      let currentRole: 'admin' | 'moderator' | null = null;
      if (memberCheck) {
        currentRole = memberCheck.role as 'admin' | 'moderator';
      }
      
      // Allow global owner
      if (pb.authStore.record?.role === 'admin') {
        currentRole = 'admin';
      }

      if (!currentRole) {
        router.push(`/w/${workspaceId}`);
        return;
      }
      
      setUserRole(currentRole);
      setIsWorkspaceAdmin(currentRole === 'admin' || currentRole === 'moderator');

      const [sgRecords, catRecords, statRecords, prefixRecords, memberRecords] = await Promise.all([
        pb.collection('suggestions').getFullList<Suggestion>({
          filter: `workspace_id = "${realWorkspaceId}" || workspace_id = "${workspaceId}"`,
          sort: '-created',
          expand: 'author,category_id,status_id',
          requestKey: null,
        }),
        pb.collection('categories').getFullList<Category>({
          filter: `workspace_id = "${realWorkspaceId}" || workspace_id = "${workspaceId}"`,
          sort: 'name',
          requestKey: null,
        }),
        pb.collection('statuses').getFullList<Status>({
          filter: `workspace_id = "${realWorkspaceId}" || workspace_id = "${workspaceId}"`,
          sort: 'name',
          requestKey: null,
        }),
        pb.collection('user_prefixes').getFullList({
          filter: `workspace_id = "${realWorkspaceId}" || workspace_id = ""`,
          requestKey: null,
        }),
        pb.collection('workspace_members').getFullList({
          filter: `workspace = "${realWorkspaceId}" || workspace = "${workspaceId}"`,
          expand: 'user,prefixes',
          requestKey: null,
        }),
      ]);

      let settingsRecord: Settings | null = null;
      try {
        const records = await pb.collection('settings').getFullList<Settings>({ 
          filter: `workspace_id = "${realWorkspaceId}" || workspace_id = "${workspaceId}"`,
          limit: 1, 
          requestKey: null 
        });
        if (records.length > 0) {
          settingsRecord = records[0];
        } else {
          settingsRecord = await pb.collection('settings').create({ default_status: '', deletable_statuses: [], workspace_id: realWorkspaceId }) as unknown as Settings;
        }
      } catch (err) {
        logger.warn('Failed to fetch settings:', err);
      }

      setSuggestions(sgRecords);
      setCategories(catRecords);
      setStatuses(statRecords);
      setPrefixes(prefixRecords);
      setMembers(memberRecords);
      setAllUsers(memberRecords.map(m => m.expand?.user).filter(Boolean));
      setSettings(settingsRecord);
    } catch (err) {
      logger.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading, router, fetchData]);

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

  const handleAssigneeChange = async (id: string, userId: string | null) => {
    setUpdatingId(id);
    try {
      await pb.collection('suggestions').update(id, { assigned_user: userId }, { requestKey: null });
      setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, assigned_user: userId } : s)));
      toast.success('Исполнитель изменен');

      if (userId) {
        const suggestion = suggestions.find((s) => s.id === id);
        await pb.collection('notifications').create({
          user: userId,
          message: `Вы назначены исполнителем для предложения: "${suggestion?.title}"`,
          read: false
        }, { requestKey: null });
      }
    } catch (err) {
      toast.error('Ошибка при назначении исполнителя');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsAddingCat(true);
    try {
      const record = await pb.collection('categories').create({ name: newCatName.trim(), icon: newCatIcon.trim(), workspace_id: activeWorkspace.id }) as unknown as Category;
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
    setConfirmConfig({
      isOpen: true,
      title: 'Удалить категорию',
      message: 'Вы уверены? Предложения в этой категории останутся без категории.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await pb.collection('categories').delete(id);
          setCategories((prev) => prev.filter((c) => c.id !== id));
          toast.success('Категория удалена');
        } catch (err) {
          toast.error('Ошибка при удалении категории');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleAddStatus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newStatName.trim()) return;
    setIsAddingStat(true);
    try {
      const record = await pb.collection('statuses').create({ name: newStatName.trim(), color: newStatColor, workspace_id: activeWorkspace.id }) as unknown as Status;
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
    setConfirmConfig({
      isOpen: true,
      title: 'Удалить статус',
      message: 'Вы уверены? Это может затронуть привязанные предложения.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await pb.collection('statuses').delete(id);
          setStatuses((prev) => prev.filter((s) => s.id !== id));
          toast.success('Статус удален');
        } catch (err) {
          toast.error('Ошибка при удалении статуса');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
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

  const handleAddPrefix = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPrefixName.trim()) return;
    setIsAddingPrefix(true);
    try {
      const record = await pb.collection('user_prefixes').create({ 
        name: newPrefixName.trim(), 
        color: newPrefixColor,
        workspace_id: activeWorkspace.id 
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
    setConfirmConfig({
      isOpen: true,
      title: 'Удалить префикс',
      message: 'Вы уверены, что хотите удалить этот префикс?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await pb.collection('user_prefixes').delete(id);
          setPrefixes((prev) => prev.filter((p) => p.id !== id));
          toast.success('Префикс удален');
        } catch (err) {
          toast.error('Ошибка при удалении префикса');
        } finally {
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleUpdateMemberPrefix = async (memberId: string, prefixIds: string[]) => {
    try {
      await pb.collection('workspace_members').update(memberId, { prefixes: prefixIds });
      const updatedMember = await pb.collection('workspace_members').getOne(memberId, { expand: 'user,prefixes', requestKey: null });
      setMembers((prev) => prev.map(m => m.id === memberId ? updatedMember : m));
      toast.success('Префиксы участника обновлены');
    } catch (err) {
      toast.error('Ошибка при обновлении префиксов');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: string) => {
    try {
      await pb.collection('workspace_members').update(memberId, { role });
      const updatedMember = await pb.collection('workspace_members').getOne(memberId, { expand: 'user,prefixes', requestKey: null });
      setMembers((prev) => prev.map(m => m.id === memberId ? updatedMember : m));
      toast.success('Роль участника обновлена');
    } catch (err) {
      toast.error('Ошибка при обновлении роли');
    }
  };



  useEffect(() => {
    if (!authLoading && !loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (!isWorkspaceAdmin) {
        router.push(`/w/${workspaceId}`);
      }
    }
  }, [user, authLoading, isWorkspaceAdmin, loading, router, workspaceId]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col gap-6" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="h-10 w-64 bg-white/5 animate-pulse rounded-lg" />
        <div className="h-96 bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!user || !isWorkspaceAdmin) return null;

  return (
    <div style={{ paddingBottom: '60px', position: 'relative' }}>
      <button
        onClick={() => router.back()}
        className="fixed left-4 md:left-8 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center cursor-pointer transition-all"
        style={{ 
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
          zIndex: 40,
          boxShadow: 'var(--shadow-md)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'var(--bg-tertiary)';
          e.currentTarget.style.transform = 'translate(-2px, -50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.background = 'var(--bg-secondary)';
          e.currentTarget.style.transform = 'translateY(-50%)';
        }}
        title="Вернуться назад"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <AdminHeader />

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', padding: '0 8px' }}>
        {[
          { id: 'general', name: 'Общие', icon: '⚙️' },
          { id: 'board', name: 'Доска', icon: '📋' },
          { id: 'members', name: 'Участники', icon: '👥' },
          { id: 'suggestions', name: 'Предложения', icon: '💡' },
          { id: 'danger', name: 'Опасная зона', icon: '⚠️' }
        ].filter(t => userRole === 'admin' || t.id !== 'danger').map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.95rem',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        {activeTab === 'general' && userRole === 'admin' && (
          <PlatformSettings
            settings={settings}
            statuses={statuses}
            isSavingSettings={isSavingSettings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === 'board' && (
          <>
            {userRole === 'admin' && (
              <>
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
                  colorPickerRef={colorPickerRef}
                  statusColors={STATUS_COLORS}
                />
              </>
            )}
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
              isReadOnly={userRole === 'moderator'}
              isPro={user?.plan === 'pro'}
            />
          </>
        )}

        {activeTab === 'members' && (
          <WorkspaceMemberManagement
            workspaceId={activeWorkspace?.id || workspaceId}
            members={members}
            prefixes={prefixes}
            currentUser={user}
            onMembersUpdated={fetchData}
            onUpdateMemberPrefix={handleUpdateMemberPrefix}
            onUpdateMemberRole={handleUpdateMemberRole}
            isPublic={!activeWorkspace?.isPrivate}
            isPro={user?.plan === 'pro'}
          />
        )}

        {activeTab === 'suggestions' && (
          <SuggestionManagement
            suggestions={suggestions}
            statuses={statuses}
            updatingId={updatingId}
            onStatusChange={handleStatusChange}
            onAssigneeChange={handleAssigneeChange}
            members={members}
          />
        )}
        
        {activeTab === 'danger' && activeWorkspace && userRole === 'admin' && (
          <WorkspaceDangerZone workspace={activeWorkspace} />
        )}
      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
