'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import pb from '@/lib/pocketbase';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { useAuth } from '@/hooks/useAuth';
import { useVote } from '@/hooks/useVote';
import { useComments } from '@/hooks/useComments';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import type { Suggestion, Settings } from '@/types';
import SuggestionDetailCard from '@/components/SuggestionDetailCard';
import CommentsSection from '@/components/CommentsSection';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

const STATUS_COLORS: Record<string, string> = {
  Open: '#3b82f6',
  Planned: '#a855f7',
  In_Progress: '#f59e0b',
  Completed: '#10b981',
};

// Deterministic color from string
function getColor(id: string): string {
  const colors = [
    '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function SuggestionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const workspaceId = params.workspaceId as string;

  const { user } = useAuth();
  const { voteType, isRevocable, remainingSeconds, isLoading: voteLoading, vote, revokeVote } = useVote(id);

  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [workspaceRole, setWorkspaceRole] = useState<'admin' | 'moderator' | 'user' | null>(null);
  const [authorPrefixes, setAuthorPrefixes] = useState<any[]>([]);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Check workspace access first to redirect unauthorized users
  useEffect(() => {
    async function checkAccess() {
      try {
        await pb.collection('workspaces').getFirstListItem(`slug = "${workspaceId}"`, { requestKey: null });
        setCheckingAccess(false);
      } catch (err: any) {
        if (!user) {
          router.push('/auth/login');
        } else {
          router.push('/');
        }
      }
    }
    const timer = setTimeout(() => {
       if (!user) checkAccess();
    }, 100);
    // Let useAuth initialize before checking
    if (user !== undefined) {
      clearTimeout(timer);
      checkAccess();
    }
    return () => clearTimeout(timer);
  }, [workspaceId, user, router]);
  
  // Deletion logic
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (checkingAccess) return;
    (async () => {
      try {
        const [suggestionRecord, settingsRecords, memberRecord] = await Promise.all([
          pb.collection('suggestions').getOne<Suggestion>(id, {
            expand: 'author,category_id,status_id,assigned_user,workspace_id',
            requestKey: null,
          }),
          pb.collection('settings').getFullList<Settings>({ 
            filter: `workspace_id = "${workspaceId}" || workspace_id.slug = "${workspaceId}"`,
            limit: 1,
            requestKey: null
          }),
          user ? pb.collection('workspace_members').getFirstListItem(
            `workspace = "${workspaceId}" && user = "${user.id}"`
          ).catch(() => null) : Promise.resolve(null)
        ]);
        if (suggestionRecord.workspace_id !== workspaceId && suggestionRecord.expand?.workspace_id?.slug !== workspaceId) {
          throw new Error('Suggestion does not belong to this workspace');
        }
        setSuggestion(suggestionRecord);
        if (settingsRecords.length > 0) setSettings(settingsRecords[0]);
        if (memberRecord) {
          setWorkspaceRole(memberRecord.role as any);
        }
        try {
          const authMember = await pb.collection('workspace_members').getFirstListItem(
            `workspace = "${suggestionRecord.workspace_id}" && user = "${suggestionRecord.author}"`,
            { expand: 'prefixes', requestKey: null }
          );
          if (authMember?.expand?.prefixes) {
            setAuthorPrefixes(authMember.expand.prefixes);
          }
        } catch(e) {}
      } catch (err) {
        logger.error('Fetch error:', err);
        router.push(`/w/${workspaceId}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router, user, workspaceId, checkingAccess]);

  const handleDelete = async () => {
    if (!suggestion || deleteInput !== suggestion.title || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await pb.collection('suggestions').delete(id);
      toast.success('Предложение удалено');
      router.push(`/w/${workspaceId}`);
    } catch (err: any) {
      logger.error('Delete failed:', err);
      toast.error('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

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
  const authorColor = getColor(authorId);
  const score = suggestion.votes_count ?? 0;
  const scoreClass = score > 0 ? 'positive' : score < 0 ? 'negative' : 'zero';

  const imageUrl = suggestion.image
    ? `${POCKETBASE_URL}/api/files/suggestions/${suggestion.id}/${suggestion.image}`
    : null;

  const isAuthor = user?.id === suggestion.author;
  const isAdmin = user?.role === 'admin' || workspaceRole === 'admin';
  const isModerator = workspaceRole === 'moderator';

  const canDeleteSuggestion = 
    isAdmin || 
    isModerator ||
    (isAuthor && (suggestion?.expand?.status_id?.name === 'Open' || !suggestion.status_id));

  const showDeleteBtn = canDeleteSuggestion;

  return (
    <div className="detail-container w-full !max-w-full">
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
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
        isRevocable={isRevocable}
        remainingSeconds={remainingSeconds}
        voteLoading={voteLoading}
        user={user}
        onVote={vote}
        onRevoke={revokeVote}
        onShowDelete={() => setShowDeleteModal(true)}
        showDeleteBtn={showDeleteBtn}
        authorPrefixes={authorPrefixes}
      />

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
