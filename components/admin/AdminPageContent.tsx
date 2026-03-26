'use client';

import React from 'react';

import AdminHeader from '@/components/admin/AdminHeader';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import CategoryManagement from '@/components/admin/CategoryManagement';
import MergeModal from '@/components/admin/MergeModal';
import PlatformSettings from '@/components/admin/PlatformSettings';
import PrefixManagement from '@/components/admin/PrefixManagement';
import StatusChangeModal from '@/components/admin/StatusChangeModal';
import StatusManagement from '@/components/admin/StatusManagement';
import SuggestionManagement from '@/components/admin/SuggestionManagement';
import WorkspaceDangerZone from '@/components/admin/WorkspaceDangerZone';
import WorkspaceMemberManagement from '@/components/admin/WorkspaceMemberManagement';
import AccessDenied from '@/components/ui/AccessDenied';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAdmin } from '@/hooks/useAdmin';

const STATUS_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#0ea5e9', '#ffffff', 
  '#a1a1aa', '#3f3f46'
];

export default function AdminPageContent() {
  const {
    user,
    authLoading,
    router,
    workspaceId,
    isWorkspaceAdmin,
    suggestions,
    categories, setNewCatName, setNewCatIcon, showIconPicker, setShowIconPicker, isAddingCat, pickerRef, newCatName, newCatIcon, handleAddCategory, handleDeleteCategory,
    statuses, setNewStatName, setNewStatColor, showColorPicker, setShowColorPicker, isAddingStat, colorPickerRef, newStatName, newStatColor, handleAddStatus, handleDeleteStatus,

    settings, isSavingSettings, handleUpdateSettings, handleUpdateWorkspace,
    members,
    loading,
    updatingId,
    activeWorkspace,
    userRole,
    activeTab, setActiveTab,
    prefixes, setNewPrefixName, setNewPrefixColor, showPrefixColorPicker, setShowPrefixColorPicker, isAddingPrefix, prefixColorPickerRef, newPrefixName, newPrefixColor, handleAddPrefix, handleDeletePrefix,
    confirmConfig, setConfirmConfig,
    statusChangeModal, setStatusChangeModal,
    fetchData,
    handleStatusChange,
    commitStatusChange,
    handleAssigneeChange,
    handleUpdateMemberPrefix,
    handleUpdateMemberRole,
    handleTogglePin,
    handleMerge,
    mergeSourceId,
    setMergeSourceId
  } = useAdmin();

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
          { id: 'analytics', name: 'Аналитика', icon: '📊' },
          { id: 'danger', name: 'Опасная зона', icon: '⚠️' }
        ].filter(t => userRole === 'admin' || (t.id !== 'danger')).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'general' | 'board' | 'members' | 'suggestions' | 'analytics' | 'danger')}
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
            workspace={activeWorkspace}
            statuses={statuses}
            isSavingSettings={isSavingSettings}
            onUpdateSettings={handleUpdateSettings}
            onUpdateWorkspace={handleUpdateWorkspace}
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
            onTogglePin={handleTogglePin}
            onMerge={(id) => setMergeSourceId(id)}
            members={members}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            suggestions={suggestions}
            categories={categories}
            statuses={statuses}
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

      {mergeSourceId && (
        <MergeModal
          sourceId={mergeSourceId}
          sourceTitle={suggestions.find(s => s.id === mergeSourceId)?.title || ''}
          suggestions={suggestions}
          onMerge={handleMerge}
          onClose={() => setMergeSourceId(null)}
        />
      )}
    </div>
  );
}
