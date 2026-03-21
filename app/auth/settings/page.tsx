'use client';

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import PasswordField from '@/components/PasswordField';
import Badge from '@/components/ui/Badge';
import ManageSubscriptionModal from '@/components/ManageSubscriptionModal';

function getAvatarColor(id: string): string {
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

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with current user data
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Максимальный размер файла: 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== newPasswordConfirm) {
      setError('Новые пароли не совпадают');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      let hasChanges = false;

      if (name !== user?.name) { formData.append('name', name); hasChanges = true; }
      if (email !== user?.email) { formData.append('email', email); hasChanges = true; }
      if (newPassword) {
        formData.append('oldPassword', oldPassword);
        formData.append('password', newPassword);
        formData.append('passwordConfirm', newPasswordConfirm);
        hasChanges = true;
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
        hasChanges = true;
      }

      if (hasChanges && user) {
        await pb.collection('users').update(user.id, formData);
        // Refresh auth state to sync with AuthProvider and other components
        await pb.collection('users').authRefresh();

        setSuccess('Настройки обновлены!');
        toast.success('Профиль успешно обновлен!');
        setOldPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
        setAvatarFile(null);
        setAvatarPreview(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при обновлении';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user) return null;

  const avatarColor = getAvatarColor(user.id);
  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
  const currentAvatarUrl = user.avatar
    ? `${POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`
    : null;

  return (
    <div className="settings-container">
      <h1 className="settings-title">Настройки профиля</h1>

      {/* Profile Settings Card */}
      <div className="settings-card mb-8">
        {success && <div className="settings-success">{success}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* ... existing avatar and fields ... */}
          {/* Avatar upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="settings-avatar-wrapper"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '4px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                position: 'relative',
              }}
              title="Нажмите, чтобы изменить аватар"
            >
              {avatarPreview || currentAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview || currentAvatarUrl!}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : initial}

              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                fontSize: '0.65rem',
                padding: '4px 0',
                textAlign: 'center',
                opacity: 0,
                transition: 'opacity 0.2s ease',
              }} className="avatar-hover-tip">
                ИЗМЕНИТЬ
              </div>
            </div>

            <style jsx>{`
              .settings-avatar-wrapper:hover {
                border-color: var(--accent-primary);
                transform: scale(1.05);
              }
              .settings-avatar-wrapper:hover .avatar-hover-tip {
                opacity: 1;
              }
            `}</style>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="settings-name">Имя</label>
            <input
              id="settings-name"
              className="auth-input"
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Ваше имя"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="settings-email">Email</label>
            <input
              id="settings-email"
              className="auth-input"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Оставьте пустым, если не хотите менять пароль
            </p>
          </div>

          <PasswordField
            id="settings-old-password"
            label="Текущий пароль"
            value={oldPassword}
            onChange={setOldPassword}
            autoComplete="current-password"
            placeholder="Обязательно для смены пароля"
          />

          <PasswordField
            id="settings-new-password"
            label="Новый пароль"
            value={newPassword}
            onChange={setNewPassword}
            minLength={8}
            autoComplete="new-password"
            placeholder="Минимум 8 символов"
          />

          <PasswordField
            id="settings-new-password-confirm"
            label="Подтвердите новый пароль"
            value={newPasswordConfirm}
            onChange={setNewPasswordConfirm}
            autoComplete="new-password"
            placeholder="Повторите новый пароль"
          />

          <button
            type="submit"
            className="auth-submit"
            disabled={submitting}
          >
            {submitting ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </div>

      {/* Subscription Card */}
      <div className="settings-card mt-[32px] mb-[100px] overflow-hidden relative">
        {/* Decorative background glow for PRO */}
        {user.plan === 'pro' && (
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 w-full">
            <h2 className="text-2xl font-bold text-white mb-1">
              Подписка и оплата
            </h2>
            <p className="text-zinc-500 text-sm">
              Управляйте вашим тарифным планом и счетами.
            </p>
          </div>

          <div className={`w-full rounded-2xl border p-6 transition-all duration-300 flex flex-col items-center ${
            user.plan === 'pro' 
              ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 shadow-xl shadow-indigo-500/10' 
              : 'bg-white/[0.02] border-white/10'
          }`}>
            <div className="flex flex-col items-center gap-6 w-full max-w-sm">
              <div className="flex flex-col items-center">
                <div className="text-zinc-600 text-xs font-bold uppercase tracking-[0.2em] mb-2">Текущий тариф</div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-white tracking-tight leading-none">
                    {user.plan === 'pro' ? 'PROFESSIONAL' : 'FREE'}
                  </h3>
                </div>
                <div className="mt-2 text-zinc-500 font-medium text-sm">
                  {user.plan === 'pro' ? 'Полный доступ ко всем функциям' : 'Базовый план навсегда'}
                </div>
                
                <div className="mt-6 flex flex-col gap-3 w-full">
                  {user.plan === 'pro' ? (
                    <>
                      <div className="flex items-center justify-center gap-2.5 text-sm text-zinc-400">
                        <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Неограниченно пространств
                      </div>
                      <div className="flex items-center justify-center gap-2.5 text-sm text-zinc-400">
                        <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Все PRO-функции включены
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2.5 text-sm text-zinc-500">
                        <svg className="w-4 h-4 text-zinc-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        До 3 активных пространств
                      </div>
                      <div className="flex items-center justify-center gap-2.5 text-sm text-zinc-500">
                        <svg className="w-4 h-4 text-zinc-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Базовая функциональность
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 w-full">
                <button
                  onClick={() => setShowManageModal(true)}
                  className={`relative group overflow-hidden px-8 py-3.5 rounded-xl font-bold text-base transition-all w-full shadow-lg ${
                    user.plan === 'pro'
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-[0.98]'
                  }`}
                >
                  <span className="relative z-10 text-center block">
                    {user.plan === 'pro' ? 'Управление подпиской' : 'Перейти на PRO'}
                  </span>
                </button>
                
                {user.plan !== 'pro' && (
                  <p className="text-[10px] text-zinc-600 leading-tight">
                    Безопасная оплата Stripe.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-zinc-500 text-xs">
            <div className="flex items-center gap-4">
              <span className="hover:text-zinc-300 cursor-help transition-colors">Условия использования</span>
              <span className="w-1 h-1 rounded-full bg-zinc-800" />
              <span className="hover:text-zinc-300 cursor-help transition-colors">Поддержка</span>
            </div>
          </div>
        </div>
      </div>

      <ManageSubscriptionModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        plan={user.plan || 'free'}
      />
    </div>
  );
}

