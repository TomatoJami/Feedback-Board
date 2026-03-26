'use client';

import { ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

import CommentsSection from '@/components/comments/CommentsSection';
import SuggestionDetailCard from '@/components/suggestions/SuggestionDetailCard';
import MarkdownEditor from '@/components/ui/MarkdownEditor';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import { useSuggestion } from '@/hooks/useSuggestion';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { getAvatarColor } from '@/lib/utils';

export default function SuggestionPageContent() {
  const {
    id,
    workspaceId,
    user,
    suggestion,
    loading,
    checkingAccess,
    voteType,
    isPending,
    remainingSeconds,
    voteLoading,
    vote,
    optimisticScore,
    workspaceRole,
    isWorkspaceOwner,
    authorPrefixes,
    showDeleteModal,
    setShowDeleteModal,
    deleteInput,
    setDeleteInput,
    isDeleting,
    handleDelete,
    // Editing
    isEditing,
    setIsEditing,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editCategoryId,
    setEditCategoryId,
    isSaving,
    startEditing,
    handleSaveEdit,
    categories,
    // Pin
    handleTogglePin
  } = useSuggestion();

  if (loading || checkingAccess) {
    return (
      <div className="detail-container w-full !max-w-full">
        <div className="h-10 w-32 bg-white/5 animate-pulse rounded-lg mb-6" />
        <div className="h-64 bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!suggestion) return null;

  const dynamicStatus = suggestion.expand?.status_id;
  const statusColor = dynamicStatus?.color || '#3b82f6';
  const statusLabel = dynamicStatus?.name || 'Открыто';
  
  const categoryName = suggestion.expand?.category_id?.name || 'Без категории';
  const categoryIcon = suggestion.expand?.category_id?.icon || '📋';
  const authorName = suggestion.expand?.author?.name || 'Аноним';
  const authorId = suggestion.author;
  const authorRole = suggestion.expand?.author?.role;
  const authorColor = getAvatarColor(authorId || '');
  const score = optimisticScore;
  const scoreClass = score > 0 ? 'positive' : score < 0 ? 'negative' : 'zero';

  const imageUrl = suggestion.image
    ? `${POCKETBASE_URL}/api/files/suggestions/${suggestion.id}/${suggestion.image}`
    : null;

  const isAuthor = user?.id === suggestion.author;
  const isAdmin = isWorkspaceOwner || workspaceRole === 'admin';
  const isModerator = workspaceRole === 'moderator';

  const canDeleteSuggestion = 
    isAdmin || 
    isModerator ||
    (isAuthor && (suggestion?.expand?.status_id?.name === 'Open' || !suggestion.status_id));

  const showDeleteBtn = canDeleteSuggestion;
  const showEditBtn = isAuthor && !suggestion.merged_into;
  const showPinBtn = isAdmin || isModerator;

  return (
    <div className="detail-container w-full !max-w-full" style={{ paddingTop: '16px' }}>
      {suggestion.merged_into && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#f59e0b',
        }}>
          <ArrowsPointingInIcon style={{ width: '24px', height: '24px', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontWeight: 600, fontSize: '1rem', color: '#fcd34d' }}>Это предложение было объединено</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '2px', opacity: 0.9 }}>
              Голосование и обсуждение перенесены в основное предложение.{' '}
              <Link 
                href={`/w/${workspaceId}/suggestions/${suggestion.merged_into}`}
                style={{ textDecoration: 'underline', fontWeight: 500, color: '#fde68a' }}
              >
                Перейти к основному →
              </Link>
            </p>
          </div>
        </div>
      )}

      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <Link href={`/w/${workspaceId}`} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          {suggestion.expand?.workspace_id?.name || 'Воркспейс'}
        </Link>
        <span>/</span>
        <Link href={`/w/${workspaceId}`} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
          Предложения
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
          {suggestion.title}
        </span>
      </nav>

      {/* Editing mode */}
      {isEditing ? (
        <div className="detail-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Редактирование предложения</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Заголовок</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full transition-all outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Категория</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setEditCategoryId(c.id)}
                  style={{
                    background: editCategoryId === c.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                    border: `1px solid ${editCategoryId === c.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: '999px',
                    color: editCategoryId === c.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    padding: '6px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {c.icon && <span>{c.icon}</span>}
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Описание</label>
            <MarkdownEditor
              value={editDescription}
              onChange={setEditDescription}
              placeholder="Опишите вашу идею подробнее..."
              minHeight="200px"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              className="btn btn-ghost"
              onClick={() => setIsEditing(false)}
              style={{ fontSize: '0.9rem', padding: '10px 24px' }}
            >
              Отмена
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveEdit}
              disabled={isSaving || !editTitle.trim()}
              style={{ fontSize: '0.9rem', padding: '10px 24px' }}
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      ) : (
        <SuggestionDetailCard
          suggestion={suggestion}
          authorName={authorName}
          authorColor={authorColor}
          authorRole={authorRole}
          statusLabel={statusLabel}
          statusColor={statusColor}
          categoryName={categoryName}
          categoryIcon={categoryIcon}
          imageUrl={imageUrl}
          score={score}
          scoreClass={scoreClass}
          voteType={voteType}
          isPending={isPending}
          remainingSeconds={remainingSeconds}
          voteLoading={voteLoading}
          user={user}
          onVote={vote}
          onShowDelete={() => setShowDeleteModal(true)}
          showDeleteBtn={showDeleteBtn}
          authorPrefixes={authorPrefixes}
          onEdit={startEditing}
          showEditBtn={showEditBtn}
          onTogglePin={handleTogglePin}
          showPinBtn={showPinBtn}
        />
      )}

      <CommentsSection 
        suggestionId={id} 
        user={user} 
        isAdmin={isAdmin}
        workspaceRole={workspaceRole}
        workspaceId={suggestion.workspace_id}
        suggestionAuthorId={suggestion.author}
      />

      {showDeleteModal && (
        <DeleteConfirmModal
          title={suggestion.title}
          deleteInput={deleteInput}
          setDeleteInput={setDeleteInput}
          isDeleting={isDeleting}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
