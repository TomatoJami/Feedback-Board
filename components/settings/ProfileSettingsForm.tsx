'use client';

import Image from 'next/image';
import React, { useEffect,useRef, useState } from 'react';
import toast from 'react-hot-toast';

import PasswordField from '@/components/PasswordField';
import pb from '@/lib/pocketbase';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import type { User } from '@/types';

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

interface ProfileSettingsFormProps {
    user: User;
}

export default function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

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

  const avatarColor = getAvatarColor(user.id);
  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
  const currentAvatarUrl = user.avatar
    ? `${POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`
    : null;

  return (
    <div className="settings-card mb-8">
      {success && <div className="settings-success">{success}</div>}
      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
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
                <Image
                  src={avatarPreview || currentAvatarUrl!}
                  alt={user.name || 'User Avatar'}
                  width={100}
                  height={100}
                  unoptimized
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
  );
}
