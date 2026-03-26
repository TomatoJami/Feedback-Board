import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useVote } from '@/hooks/useVote';
import { useWorkspaceRole } from '@/hooks/useWorkspaceRole';
import { logger } from '@/lib/logger';
import pb from '@/lib/pocketbase';
import type { Suggestion } from '@/types';
import type { UserPrefix } from '@/types/user-prefix';

export function useSuggestion() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const workspaceId = params.workspaceId as string;

  const { user } = useAuth();
  
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  
  const { voteType, isPending, remainingSeconds, isLoading: voteLoading, vote, optimisticScore } = useVote(id, suggestion?.votes_count ?? 0);
  const [loading, setLoading] = useState(true);
  const { role: workspaceRole, isOwner: isWorkspaceOwner } = useWorkspaceRole(workspaceId);
  const [authorPrefixes, setAuthorPrefixes] = useState<UserPrefix[]>([]);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { categories } = useCategories(workspaceId);

  // Check workspace access first to redirect unauthorized users
  useEffect(() => {
    async function checkAccess() {
      try {
        await pb.collection('workspaces').getFirstListItem(`slug = "${workspaceId}"`, { requestKey: null });
        setCheckingAccess(false);
      } catch (_err: unknown) {
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
        const suggestionRecord = await pb.collection('suggestions').getOne<Suggestion>(id, {
          expand: 'author,category_id,status_id,assigned_user,workspace_id',
          requestKey: null,
        });

        if (suggestionRecord.workspace_id !== workspaceId && suggestionRecord.expand?.workspace_id?.slug !== workspaceId) {
          throw new Error('Suggestion does not belong to this workspace');
        }
        setSuggestion(suggestionRecord);
        
        try {
          const authMember = await pb.collection('workspace_members').getFirstListItem(
            `workspace = "${suggestionRecord.workspace_id}" && user = "${suggestionRecord.author}"`,
            { expand: 'prefixes', requestKey: null }
          );
          if (authMember?.expand?.prefixes) {
            setAuthorPrefixes(authMember.expand.prefixes);
          }
        } catch(__e) {}
      } catch (err) {
        logger.error('Fetch error:', err);
        router.push(`/w/${workspaceId}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router, workspaceId, checkingAccess]);

  const handleDelete = async () => {
    if (!suggestion || deleteInput !== suggestion.title || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await pb.collection('suggestions').delete(id);
      toast.success('Предложение удалено');
      router.push(`/w/${workspaceId}`);
    } catch (err: unknown) {
      logger.error('Delete failed:', err);
      toast.error('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const startEditing = () => {
    if (!suggestion) return;
    setEditTitle(suggestion.title);
    setEditDescription(suggestion.description || '');
    setEditCategoryId(suggestion.category_id);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!suggestion || !editTitle.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const updated = await pb.collection('suggestions').update<Suggestion>(id, {
        title: editTitle.trim(),
        description: editDescription,
        category_id: editCategoryId,
      }, {
        expand: 'author,category_id,status_id,workspace_id',
        requestKey: null,
      });
      setSuggestion(updated);
      setIsEditing(false);
      toast.success('Предложение обновлено');
    } catch (err) {
      logger.error('Edit failed:', err);
      toast.error('Ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePin = async () => {
    if (!suggestion) return;
    try {
      const updated = await pb.collection('suggestions').update<Suggestion>(id, {
        pinned: !suggestion.pinned,
      }, {
        expand: 'author,category_id,status_id,workspace_id',
        requestKey: null,
      });
      setSuggestion(updated);
      toast.success(updated.pinned ? 'Предложение закреплено' : 'Предложение откреплено');
    } catch (err) {
      logger.error('Toggle pin failed:', err);
      toast.error('Ошибка при закреплении');
    }
  };

  return {
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
  };
}
