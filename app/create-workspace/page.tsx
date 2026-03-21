'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import { useAuth } from '@/hooks/useAuth';
import { BuildingStorefrontIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logger';

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CreateWorkspace() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = user?.plan === 'pro';
  const [checkingLimit, setCheckingLimit] = useState(true);

  // Pre-emptive limit check
  React.useEffect(() => {
    async function checkLimit() {
      if (!user) return;
      if (user.plan === 'pro') {
        setCheckingLimit(false);
        return;
      }

      try {
        const existing = await pb.collection('workspaces').getList(1, 1, {
          filter: `owner = "${user.id}"`,
          requestKey: null
        });
        if (existing.totalItems >= 1) {
          router.push('/#pricing');
        } else {
          setCheckingLimit(false);
        }
      } catch (err) {
        console.error('Limit check failed:', err);
        setCheckingLimit(false);
      }
    }
    checkLimit();
  }, [user, router]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Handle name change and auto-generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const oldName = name;
    setName(newName);
    
    // Auto-generate slug if it's empty or perfectly matches the slug generated from the PREVIOUS name
    if (!slug || slug === generateSlug(oldName)) {
      setSlug(generateSlug(newName));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim() || !slug.trim()) {
      setError('Name and URL are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if user is free and already has a workspace
      if (!isPro) {
        const existing = await pb.collection('workspaces').getList(1, 1, {
          filter: `owner = "${user.id}"`,
        });
        if (existing.totalItems > 0) {
          setError('Free plan allows only 1 workspace. Upgrade to PRO to create more.');
          setLoading(false);
          return;
        }
      }

      const record = await pb.collection('workspaces').create({
        name,
        slug,
        isPrivate,
        owner: user.id,
      });

      // Create admin member role
      await pb.collection('workspace_members').create({
        workspace: record.id,
        user: user.id,
        role: 'admin',
      });

      // Create default categories
      const defaultCategories = [
        { name: 'Idea', icon: '💡' },
        { name: 'Bug', icon: '🐛' },
        { name: 'Question', icon: '❓' }
      ];
      
      await Promise.all(defaultCategories.map(cat => 
        pb.collection('categories').create({
          name: cat.name,
          icon: cat.icon,
          workspace_id: record.id
        }, { requestKey: null })
      ));

      // Create default statuses
      const defaultStatuses = [
        { name: 'Open', color: '#a1a1aa' },
        { name: 'In Work', color: '#6366f1' },
        { name: 'Completed', color: '#10b981' },
        { name: 'Rejected', color: '#ef4444' }
      ];
      
      const createdStatuses = await Promise.all(defaultStatuses.map(status => 
        pb.collection('statuses').create({
          name: status.name,
          color: status.color,
          workspace_id: record.id
        }, { requestKey: null })
      ));

      // Set default settings
      try {
        const openStatus = createdStatuses.find((s: any) => s.name === 'Open');
        await pb.collection('settings').create({
          default_status: openStatus?.id || '',
          deletable_statuses: [],
          workspace_id: record.id
        });
      } catch (err) {
        // Log error but don't fail the whole creation process
        // Note: 'settings' collection rules might be too restrictive (e.g. admin only)
        logger.warn('Failed to create default settings:', err);
      }

      router.push(`/w/${record.slug || record.id}`);
    } catch (err: any) {
      console.error('Error creating workspace:', err);
      if (err.response?.data?.slug?.code === 'validation_not_unique') {
        setError('This URL is already taken. Please choose another one.');
      } else {
        setError(err.message || 'Failed to create workspace.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || checkingLimit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <div className="text-zinc-400 animate-pulse">Проверка лимитов...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-6 sm:py-12">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <div className="text-center w-full my-4" style={{ marginBottom: '48px' }}>
          <h1 className="text-3xl font-bold mb-2">Создать пространство</h1>
          <p className="text-zinc-400">Настройте новую доску для сбора обратной связи.</p>
        </div>

        {error && (
          <div className="mb-6 w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px'
        }}>
          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Название
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="Например: Feedback-Board"
              className="w-full transition-all outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                color: 'var(--text-primary)'
              }}
              maxLength={50}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              URL адрес
            </label>
            <div className="flex">
              <span className="inline-flex items-center justify-center px-6" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRight: 'none',
                borderTopLeftRadius: 'var(--radius-md)',
                borderBottomLeftRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                minWidth: '64px',
                fontWeight: 500
              }}>
                /w/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="yoursaas-name"
                className="flex-1 w-full transition-all outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderTopRightRadius: 'var(--radius-md)',
                  borderBottomRightRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  color: 'var(--text-primary)'
                }}
                maxLength={50}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '4px' }}>
              Это будет ваша уникальная ссылка. Выбирайте с умом!
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Приватность
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className="flex flex-col items-center justify-center p-6 transition-all text-center"
                style={{
                  background: !isPrivate ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                  border: `1px solid ${!isPrivate ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-lg)',
                  color: !isPrivate ? 'white' : 'var(--text-secondary)'
                }}
              >
                <GlobeAltIcon className="w-8 h-8 mb-3" style={{ color: !isPrivate ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                <div>
                  <div className="font-semibold mb-1 text-base">Публичное</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.4 }}>Видно всем. Любой может оставить предложение.</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isPro) setIsPrivate(true);
                }}
                className={`flex flex-col items-center justify-center p-6 transition-all text-center relative overflow-hidden ${!isPrivate && !isPro ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{
                  background: isPrivate ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                  border: `1px solid ${isPrivate ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-lg)',
                  color: isPrivate ? 'white' : 'var(--text-secondary)'
                }}
              >
                <LockClosedIcon className="w-8 h-8 mb-3" style={{ color: isPrivate ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                <div style={{ width: '100%' }}>
                  <div className="font-semibold mb-1 text-base flex justify-center items-center">
                    Приватное
                    {!isPro && <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '2px 8px', borderRadius: '999px', marginLeft: '8px' }}>Pro</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.4 }}>Только по приглашению участникам.</div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)', marginTop: '24px', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-ghost"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !slug.trim()}
              className="btn btn-primary"
            >
              {loading ? 'Создание...' : 'Создать пространство'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
