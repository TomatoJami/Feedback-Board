'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import ConfirmModal from '@/components/ui/ConfirmModal';
import MarkdownEditor from '@/components/ui/MarkdownEditor';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { logger } from '@/lib/logger';
import pb from '@/lib/pocketbase';
import { Settings, Workspace } from '@/types';

export default function NewSuggestionPage() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { categories, isLoading: categoriesLoading } = useCategories(workspaceId);
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [settings, setSettings] = useState<Settings & { is_frozen?: boolean } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(`fb_draft_suggestion_${workspaceId}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.description) setDescription(parsed.description);
      } catch (__e) {}
    }
  }, [workspaceId]);

  // Save draft on change
  useEffect(() => {
    if (title || description) {
      localStorage.setItem(`fb_draft_suggestion_${workspaceId}`, JSON.stringify({ title, description }));
    } else {
      localStorage.removeItem(`fb_draft_suggestion_${workspaceId}`);
    }
  }, [title, description, workspaceId]);

  // Fetch categories, settings, and workspace frozen status
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
    
    const fetchData = async () => {
      try {
        const [settingsRecords, workspaceRecord] = await Promise.all([
          pb.collection('settings').getFullList<Settings>({ 
            filter: `workspace_id = "${workspaceId}" || workspace_id.slug = "${workspaceId}"`,
            limit: 1,
            requestKey: null
          }),
          pb.collection('workspaces').getFirstListItem<Workspace>(
            `id = "${workspaceId}" || slug = "${workspaceId}"`,
            { requestKey: null }
          ).catch(() => null)
        ]);

        const currentSettings: any = settingsRecords.length > 0 ? { ...settingsRecords[0] } : {};
        if (workspaceRecord) {
          currentSettings.is_frozen = !!workspaceRecord.is_frozen;
        }
        
        if (settingsRecords.length > 0) {
          setSettings(currentSettings);
        } else {
          // Fallback settings if not found
          const openStatus = await pb.collection('statuses').getFirstListItem(
            `(workspace_id = "${workspaceId}" || workspace_id.slug = "${workspaceId}") && name = "Open"`,
            { requestKey: null }
          ).catch(() => null);
          
          setSettings({ 
            ...currentSettings,
            default_status: openStatus?.id || '' 
          } as any);
        }
      } catch (err) {
        logger.error('Failed to fetch initial data:', err);
      }
    };
    fetchData();
  }, [categories, categoryId, workspaceId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitForm = async () => {
    if (!user) return;
    if (settings?.is_frozen && user.role !== 'admin') {
      toast.error('Пространство заморожено. Нельзя создавать новые предложения.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Resolve slug to real workspace ID for relation fields
      const workspaceRecord = await pb.collection('workspaces').getFirstListItem(`slug = "${workspaceId}"`, { requestKey: null });
      const realWorkspaceId = workspaceRecord.id;

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category_id', categoryId);
      formData.append('author', user.id);
      formData.append('status_id', settings?.default_status || '');
      formData.append('votes_count', '0');
      formData.append('is_public', 'true');
      formData.append('workspace_id', realWorkspaceId);
      if (image) {
        formData.append('image', image);
      }

      await pb.collection('suggestions').create(formData);
      localStorage.removeItem(`fb_draft_suggestion_${workspaceId}`);
      toast.success('Предложение успешно опубликовано!');
      router.push(`/w/${workspaceId}`);
    } catch (err: unknown) {
      logger.error('Failed to create suggestion:', err);
      toast.error('Ошибка при создании предложения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (settings?.is_frozen && user?.role !== 'admin') return;
    
    if (!description.trim()) {
      setShowConfirm(true);
    } else {
      submitForm();
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || categoriesLoading || !user) return null;

  const isFrozen = !!settings?.is_frozen;
  const canSuggest = !isFrozen || user.role === 'admin';

  return (
    <div className="w-full flex justify-center py-6 sm:py-12">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <div className="mb-8 text-center w-full">
          <h1 className="text-3xl font-bold mb-2">Новое предложение</h1>
          <p className="text-zinc-400">Опишите вашу идею или сообщите об ошибке.</p>
        </div>

        {isFrozen && user.role !== 'admin' && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '32px',
            width: '100%',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fca5a5', marginBottom: '8px' }}>Пространство заморожено</h2>
            <p style={{ color: '#fecaca' }}>В этом пространстве временно ограничено создание новых предложений.</p>
            <button 
              onClick={() => router.push(`/w/${workspaceId}`)}
              className="btn btn-secondary"
              style={{ marginTop: '20px' }}
            >
              Вернуться на главную
            </button>
          </div>
        )}

        {canSuggest && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px'
          }}>
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Заголовок</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                className="w-full transition-all outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  color: 'var(--text-primary)'
                }}
                placeholder="Краткое название идеи..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Категория</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const isActive = categoryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="font-semibold transition-all min-w-[100px] flex items-center justify-center gap-2"
                      style={{
                        background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                        border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        borderRadius: '999px',
                        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        padding: '8px 16px',
                        fontSize: '0.9rem'
                      }}
                      onClick={() => setCategoryId(c.id)}
                    >
                      {c.icon && <span>{c.icon}</span>}
                      {c.name}
                    </button>
                  );
                })}
                {categories.length === 0 && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Нет доступных категорий. Обратитесь к админу.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Описание (опционально)</label>
              <MarkdownEditor 
                value={description}
                onChange={setDescription}
                placeholder="Опишите вашу идею подробнее. Поддерживается Markdown (списки, жирный текст, ссылки)..."
                minHeight="250px"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Скриншот</label>
              {!preview ? (
                <div 
                  className="flex flex-col items-center justify-center cursor-pointer transition-all group"
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '32px',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div 
                    className="rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                    style={{ width: '48px', height: '48px', background: 'var(--bg-tertiary)' }}
                  >
                    <svg className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Нажмите, чтобы загрузить скриншот</p>
                  <p style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '4px' }}>PNG, JPG, WEBP до 5MB</p>
                </div>
              ) : (
                <div className="relative overflow-hidden" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                  <Image src={preview} alt="Preview" width={800} height={500} unoptimized className="w-full max-h-64 object-contain" />
                  <button 
                    type="button"
                    className="absolute top-4 right-4 p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                    style={{ background: '#f43f5e', color: 'white' }}
                    onClick={removeImage}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !categoryId}
              className="btn btn-primary w-full py-4 text-lg justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ padding: '14px', fontSize: '1rem', fontWeight: 600, boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.3)' }}
            >
              {isSubmitting ? 'Отправляем...' : 'Опубликовать'}
            </button>
          </form>
        )}

        <ConfirmModal
          isOpen={showConfirm}
          title="Пустое описание"
          message="Вы уверены, что хотите отправить предложение без подробного описания?"
          confirmText="Да, отправить"
          cancelText="Вернуться"
          onConfirm={() => {
            setShowConfirm(false);
            submitForm();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      </div>
    </div>
  );
}
