'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef,useState } from 'react';
import toast from 'react-hot-toast';

import AccessDenied from '@/components/AccessDenied';
import AdminHeader from '@/components/admin/AdminHeader';
import CategoryManagement from '@/components/admin/CategoryManagement';
import PlatformSettings from '@/components/admin/PlatformSettings';
import PrefixManagement from '@/components/admin/PrefixManagement';
import StatusChangeModal from '@/components/admin/StatusChangeModal';
import StatusManagement from '@/components/admin/StatusManagement';
import SuggestionManagement from '@/components/admin/SuggestionManagement';
// import UserManagement from '@/components/admin/UserManagement'; // Reported as unused, but verify usage first. I'll just prefix it if unsure, but if it's the component list, I'll check.
import WorkspaceDangerZone from '@/components/admin/WorkspaceDangerZone';
import WorkspaceMemberManagement from '@/components/admin/WorkspaceMemberManagement';
import ConfirmModal from '@/components/ConfirmModal';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import pb from '@/lib/pocketbase';
import type { Category, Settings, Status, Suggestion, User, UserPrefix, Workspace, WorkspaceMember } from '@/types';

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
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'moderator' | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'board' | 'members' | 'suggestions' | 'danger'>('general');

  // Prefix management state
  const [prefixes, setPrefixes] = useState<UserPrefix[]>([]);
  const [newPrefixName, setNewPrefixName] = useState('');
  const [newPrefixColor, setNewPrefixColor] = useState('#6366f1');
  const [isAddingPrefix, setIsAddingPrefix] = useState(false);
  const [showPrefixColorPicker, setShowPrefixColorPicker] = useState(false);
  const prefixColorPickerRef = useRef<HTMLDivElement>(null);

  // User management state
  const [_allUsers, setAllUsers] = useState<User[]>([]);

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

  // Status change modal state
  const [statusChangeModal, setStatusChangeModal] = useState<{
    isOpen: boolean;
    suggestionId: string;
    suggestionTitle: string;
    statusId: string;
    statusName: string;
    statusColor: string;
  }>({
    isOpen: false,
    suggestionId: '',
    suggestionTitle: '',
    statusId: '',
    statusName: '',
    statusColor: '#6366f1',
  });

  useEffect(() => {
    const handleClick = (_e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(_e.target as Node)) {
        setShowColorPicker(false);
      }
      if (prefixColorPickerRef.current && !prefixColorPickerRef.current.contains(_e.target as Node)) {
        setShowPrefixColorPicker(false);
      }
    };
    if (showIconPicker || showColorPicker || showPrefixColorPicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showIconPicker, showColorPicker, showPrefixColorPicker]);

  const fetchData = useCallback(async () => {
    try {
      // First, get the actual workspace record
      const workspaceRecord = await pb.collection('workspaces').getFirstListItem<Workspace>(`slug = "${workspaceId}" || id = "${workspaceId}"`, { requestKey: null });
      const realWorkspaceId = workspaceRecord.id;
      setActiveWorkspace(workspaceRecord);

      // Check admin status first
      const memberCheck = await pb.collection('workspace_members').getFirstListItem<WorkspaceMember>(
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
        pb.collection('user_prefixes').getFullList<UserPrefix>({
          filter: `workspace_id = "${realWorkspaceId}" || workspace_id = ""`,
          requestKey: null,
        }),
        pb.collection('workspace_members').getFullList<WorkspaceMember>({
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
          settingsRecord = await pb.collection('settings').create<Settings>({ default_status: '', deletable_statuses: [], workspace_id: realWorkspaceId });
        }
      } catch (err) {
        logger.warn('Failed to fetch settings:', err);
      }

      setSuggestions(sgRecords);
      setCategories(catRecords);
      setStatuses(statRecords);
      setPrefixes(prefixRecords);
      setMembers(memberRecords);
      setAllUsers(memberRecords.map(m => m.expand?.user).filter((u): u is User => !!u));
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
    const suggestion = suggestions.find((s) => s.id === id);
    const statusObj = statuses.find(s => s.id === newStatusId);
    setStatusChangeModal({
      isOpen: true,
      suggestionId: id,
      suggestionTitle: suggestion?.title || '',
      statusId: newStatusId,
      statusName: statusObj?.name || 'Без статуса',
      statusColor: statusObj?.color || '#71717a',
    });
  };

  const commitStatusChange = async (_comment: string) => {
    const { suggestionId, statusId } = statusChangeModal;
    setStatusChangeModal(prev => ({ ...prev, isOpen: false }));
    setUpdatingId(suggestionId);
    try {
      const updateData = { status_id: statusId || null };
      const statusObj = statuses.find(s => s.id === statusId);
      await pb.collection('suggestions').update(suggestionId, updateData, { requestKey: null });
      setSuggestions((prev) => prev.map((s) => (s.id === suggestionId ? { ...s, status_id: updateData.status_id as string, expand: { ...s.expand, status_id: statusObj } } : s)));
      toast.success('Статус обновлён');

      const suggestion = suggestions.find((s) => s.id === suggestionId);
      if (suggestion?.author) {
        const statusText = statusObj?.name || 'Без статуса';
        const notifMessage = _comment
          ? `Статус вашего предложения "${suggestion.title}" изменен на: ${statusText}. ${_comment}`
          : `Статус вашего предложения "${suggestion.title}" изменен на: ${statusText}`;
        await pb.collection('notifications').create({ user: suggestion.author, message: notifMessage, read: false }, { requestKey: null });
      }
    } catch (_err) {
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
    } catch (_err) {
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
      const record = await pb.collection('categories').create<Category>({ name: newCatName.trim(), icon: newCatIcon.trim(), workspace_id: activeWorkspace?.id });
      setCategories((prev) => [...prev, record].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCatName('');
      setNewCatIcon('');
      setShowIconPicker(false);
      toast.success('Категория добавлена');
    } catch (_err) {
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
        } catch (_err) {
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
      const record = await pb.collection('statuses').create<Status>({ name: newStatName.trim(), color: newStatColor, workspace_id: activeWorkspace?.id });
      setStatuses((prev) => [...prev, record].sort((a, b) => a.name.localeCompare(b.name)));
      setNewStatName('');
      setNewStatColor('#6366f1');
      toast.success('Статус добавлен');
    } catch (_err) {
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
        } catch (_err) {
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
      const updated = await pb.collection('settings').update<Settings>(settings.id, updates);
      setSettings(updated);
      toast.success('Настройки сохранены');
    } catch (_err) {
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
      const record = await pb.collection('user_prefixes').create<UserPrefix>({ 
        name: newPrefixName.trim(), 
        color: newPrefixColor,
        workspace_id: activeWorkspace?.id 
      });
      setPrefixes((prev) => [...prev, record].sort((a, b) => a.name.localeCompare(b.name)));
      setNewPrefixName('');
      setNewPrefixColor('#6366f1');
      toast.success('Префикс добавлен');
    } catch (_err) {
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
        } catch (_err) {
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
      const updatedMember = await pb.collection('workspace_members').getOne<WorkspaceMember>(memberId, { expand: 'user,prefixes', requestKey: null });
      setMembers((prev) => prev.map(m => m.id === memberId ? updatedMember : m));
      toast.success('Префиксы участника обновлены');
    } catch (_err) {
      toast.error('Ошибка при обновлении префиксов');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: string) => {
    try {
      await pb.collection('workspace_members').update(memberId, { role });
      const updatedMember = await pb.collection('workspace_members').getOne<WorkspaceMember>(memberId, { expand: 'user,prefixes', requestKey: null });
      setMembers((prev) => prev.map(m => m.id === memberId ? updatedMember : m));
      toast.success('Роль участника обновлена');
    } catch (_err) {
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

  if (!user || !isWorkspaceAdmin) return (
    <AccessDenied 
      title="Доступ запрещён"
      message="У вас нет прав администратора для управления этим пространством."
      showLogin={!user}
      showHome={true}
    />
  );

  return (
    <div style={{ paddingBottom: '60px', position: 'relative' }}>
      {/* Breadcrumb navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        fontSize: '0.85rem',
      }}>
        <button
          onClick={() => router.push(`/w/${workspaceId}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px 0',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          {activeWorkspace?.name || workspaceId}
        </button>
        <span style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Админ-панель</span>
      </nav>

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
            onClick={() => setActiveTab(tab.id as 'general' | 'board' | 'members' | 'suggestions' | 'danger')}
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

      <StatusChangeModal
        isOpen={statusChangeModal.isOpen}
        statusName={statusChangeModal.statusName}
        statusColor={statusChangeModal.statusColor}
        suggestionTitle={statusChangeModal.suggestionTitle}
        onConfirm={commitStatusChange}
        onCancel={() => setStatusChangeModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
