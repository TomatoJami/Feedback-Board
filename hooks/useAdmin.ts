import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import pb from '@/lib/pocketbase';
import type { Category, Settings, Status, Suggestion, User, UserPrefix, Workspace, WorkspaceMember } from '@/types';

export function useAdmin() {
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
  const [activeTab, setActiveTab] = useState<'general' | 'board' | 'members' | 'suggestions' | 'analytics' | 'danger'>('general');

  // Merge state
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);

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
      const workspaceRecord = await pb.collection('workspaces').getFirstListItem<Workspace>(`slug = "${workspaceId}" || id = "${workspaceId}"`, { requestKey: null });
      const realWorkspaceId = workspaceRecord.id;
      setActiveWorkspace(workspaceRecord);

      const memberCheck = await pb.collection('workspace_members').getFirstListItem<WorkspaceMember>(
        `(workspace = "${realWorkspaceId}" || workspace = "${workspaceId}") && user = "${pb.authStore.record?.id}"`,
        { requestKey: null }
      ).catch(() => null);

      let currentRole: 'admin' | 'moderator' | null = null;
      
      if (workspaceRecord.owner === pb.authStore.record?.id) {
        currentRole = 'admin';
      }
      
      if (!currentRole && memberCheck) {
        currentRole = memberCheck.role as 'admin' | 'moderator';
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

  const handleTogglePin = async (id: string, pinned: boolean) => {
    setUpdatingId(id);
    try {
      await pb.collection('suggestions').update(id, { pinned }, { requestKey: null });
      setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, pinned } : s)));
      toast.success(pinned ? 'Предложение закреплено' : 'Предложение откреплено');
    } catch (_err) {
      toast.error('Ошибка при закреплении');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMerge = async (sourceId: string, targetId: string) => {
    try {
      const response = await fetch('/api/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({ sourceId, targetId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Merge failed');
      }

      const result = await response.json();
      // Update local state: mark source as merged
      setSuggestions((prev) => prev.map(s => 
        s.id === sourceId ? { ...s, merged_into: targetId, votes_count: 0 } : s
      ));
      toast.success(`Объединено: ${result.votesTransferred} голосов, ${result.commentsTransferred} комментариев перенесено`);
      setMergeSourceId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при объединении';
      toast.error(message);
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

  const handleUpdateWorkspace = async (updates: Partial<Workspace>) => {
    if (!activeWorkspace) return;
    setIsSavingSettings(true);
    try {
      const updated = await pb.collection('workspaces').update<Workspace>(activeWorkspace.id, updates);
      setActiveWorkspace(updated);
      toast.success('Параметры пространства обновлены');
    } catch (_err) {
      toast.error('Ошибка при обновлении параметров');
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

  return {
    user,
    authLoading,
    router,
    workspaceId,
    isWorkspaceAdmin,
    suggestions, setSuggestions,
    categories, setCategories,
    statuses, setStatuses,
    settings, setSettings,
    members, setMembers,
    loading, setLoading,
    updatingId, setUpdatingId,
    isSavingSettings, setIsSavingSettings,
    activeWorkspace, setActiveWorkspace,
    userRole, setUserRole,
    activeTab, setActiveTab,
    prefixes, setPrefixes,
    newPrefixName, setNewPrefixName,
    newPrefixColor, setNewPrefixColor,
    isAddingPrefix, setIsAddingPrefix,
    showPrefixColorPicker, setShowPrefixColorPicker,
    prefixColorPickerRef,
    _allUsers, setAllUsers,
    newCatName, setNewCatName,
    newCatIcon, setNewCatIcon,
    isAddingCat, setIsAddingCat,
    showIconPicker, setShowIconPicker,
    pickerRef,
    newStatName, setNewStatName,
    newStatColor, setNewStatColor,
    isAddingStat, setIsAddingStat,
    showColorPicker, setShowColorPicker,
    colorPickerRef,
    confirmConfig, setConfirmConfig,
    statusChangeModal, setStatusChangeModal,
    fetchData,
    handleStatusChange,
    commitStatusChange,
    handleAssigneeChange,
    handleAddCategory,
    handleDeleteCategory,
    handleAddStatus,
    handleDeleteStatus,
    handleUpdateSettings,
    handleUpdateWorkspace,
    handleAddPrefix,
    handleDeletePrefix,
    handleUpdateMemberPrefix,
    handleUpdateMemberRole,
    handleTogglePin,
    handleMerge,
    mergeSourceId,
    setMergeSourceId
  };
}
