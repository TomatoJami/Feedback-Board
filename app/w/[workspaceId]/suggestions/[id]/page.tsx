'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import pb from '@/lib/pocketbase';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { useAuth } from '@/hooks/useAuth';
import { useVote } from '@/hooks/useVote';
import { useComments } from '@/hooks/useComments';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import type { Suggestion, SuggestionComment, Settings } from '@/types';
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
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user } = useAuth();
  const { voteType, isRevocable, remainingSeconds, isLoading: voteLoading, vote, revokeVote } = useVote(id);
  const { comments, isLoading: commentsLoading, userVotes, addComment, voteComment } = useComments(id);

  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  
  // Deletion logic
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [record, settingsRecords] = await Promise.all([
          pb.collection('suggestions').getOne<Suggestion>(id, {
            expand: 'author.prefixes,category_id,status_id',
            requestKey: null,
          }),
          pb.collection('settings').getFullList<Settings>({ 
            limit: 1,
            requestKey: null
          })
        ]);
        if (record.workspace_id !== params.workspaceId) {
          throw new Error('Suggestion does not belong to this workspace');
        }
        setSuggestion(record);
        if (settingsRecords.length > 0) setSettings(settingsRecords[0]);
      } catch (err) {
        logger.error('Fetch error:', err);
        router.push(`/w/${params.workspaceId}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    setSending(true);
    try {
      await addComment(user.id, commentText.trim());
      
      // Notify author if the commenter is not the author
      if (suggestion && suggestion.author !== user.id) {
        await pb.collection('notifications').create({
          user: suggestion.author,
          message: `Новый комментарий к вашему предложению "${suggestion.title}": ${commentText.trim().substring(0, 50)}${commentText.length > 50 ? '...' : ''}`,
          read: false,
        });
      }

      setCommentText('');
      toast.success('Комментарий добавлен!');
    } catch (err: any) {
      logger.error('Comment failed:', err);
      toast.error('Ошибка при добавлении комментария');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!suggestion || deleteInput !== suggestion.title || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await pb.collection('suggestions').delete(id);
      toast.success('Предложение удалено');
      router.push(`/w/${params.workspaceId}`);
    } catch (err: any) {
      logger.error('Delete failed:', err);
      toast.error('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-container w-full !max-w-full">
        <div className="h-10 w-32 bg-white/5 animate-pulse rounded-lg mb-6" />
        <div className="h-64 bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!suggestion) return null;

  const dynamicStatus = suggestion.expand?.status_id;
  const isLegacyOpen = !suggestion.status || suggestion.status.toLowerCase() === 'open';
  const statusColor = dynamicStatus?.color || (!isLegacyOpen ? STATUS_COLORS[suggestion.status] : null) || '#6b7280';
  const statusLabel = dynamicStatus?.name || (!isLegacyOpen ? suggestion.status.replace('_', ' ') : 'Без статуса');
  
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
  const isAdmin = user?.role === 'admin';
  const deletableArray = Array.isArray(settings?.deletable_statuses) ? settings.deletable_statuses : [];
  const isDeletable = deletableArray.length === 0 || 
                     (suggestion.status_id && deletableArray.includes(suggestion.status_id));
  const showDeleteBtn = !!(isAdmin || (isAuthor && isDeletable));

  return (
    <div className="detail-container w-full !max-w-full">
      <Link href={`/w/${params.workspaceId}`} className="detail-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Назад к предложениям
      </Link>

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
      />

      <CommentsSection
        comments={comments}
        isLoading={commentsLoading}
        user={user}
        userVotes={userVotes}
        commentText={commentText}
        setCommentText={setCommentText}
        sending={sending}
        onComment={handleComment}
        onVote={voteComment}
        onReply={addComment}
        authorId={authorId}
        workspaceId={params.workspaceId as string}
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
