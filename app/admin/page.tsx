'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import toast from 'react-hot-toast';
import { StatCard } from '@/components/admin/AdminUI';
import {
    UsersIcon,
    StarIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import UsersTable from '@/components/admin/UsersTable';
import WorkspacesTable from '@/components/admin/WorkspacesTable';

export default function GlobalAdminPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const stats = {
        totalUsers: users.length,
        proUsers: users.filter(u => u.plan === 'pro').length,
        totalWorkspaces: workspaces.length,
    };

    const fetchData = useCallback(async () => {
        try {
            const [wsRecords, userRecords] = await Promise.all([
                pb.collection('workspaces').getFullList({ sort: '-created', expand: 'owner', requestKey: null }),
                pb.collection('users').getFullList({ sort: '-created', requestKey: null }),
            ]);
            setWorkspaces(wsRecords);
            setUsers(userRecords);
        } catch (err) {
            toast.error('Failed to load admin data');
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/auth/login');
            } else if (user.role !== 'admin') {
                router.push('/');
            } else {
                console.log('Fetching admin data for:', user.email);
                fetchData();
            }
        }
    }, [user, isLoading, router, fetchData]);

    if (isLoading || loadingData) {
        return (
            <div className="flex flex-col gap-6" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                <div className="h-10 w-64 bg-white/5 animate-pulse rounded-lg" />
                <div className="flex gap-4">
                    <div className="h-32 flex-1 bg-white/5 animate-pulse rounded-2xl" />
                    <div className="h-32 flex-1 bg-white/5 animate-pulse rounded-2xl" />
                    <div className="h-32 flex-1 bg-white/5 animate-pulse rounded-2xl" />
                </div>
                <div className="h-96 bg-white/5 animate-pulse rounded-2xl" />
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    return (
        <div style={{ paddingBottom: '100px' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Панель управления платформой
                </h1>
                <p style={{ color: '#a1a1aa', fontSize: '1rem' }}>
                    Контроль подписок, пользователей и воркспейсов системы
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '48px' }}>
                <StatCard
                    title="Всего пользователей"
                    value={stats.totalUsers}
                    icon={<UsersIcon className="w-5 h-5" />}
                />
                <StatCard
                    title="PRO Пользователи"
                    value={stats.proUsers}
                    icon={<StarIcon className="w-5 h-5" />}
                    color="#fbbf24"
                    subtext={`${((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}% от всех`}
                />
                <StatCard
                    title="Воркспейсов"
                    value={stats.totalWorkspaces}
                    icon={<GlobeAltIcon className="w-5 h-5" />}
                    color="#6366f1"
                />
            </div>

            {/* Users Management Section */}
            <UsersTable users={users} setUsers={setUsers} currentUser={user} />

            {/* Workspaces Management Section */}
            <WorkspacesTable workspaces={workspaces} setWorkspaces={setWorkspaces} />
        </div>
    );
}
