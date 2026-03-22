'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import ProfileSettingsForm from '@/components/settings/ProfileSettingsForm';
import SubscriptionCard from '@/components/settings/SubscriptionCard';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="settings-container">
      <h1 className="settings-title">Настройки профиля</h1>
      
      <ProfileSettingsForm user={user} />
      <SubscriptionCard user={user} />
    </div>
  );
}

