'use client';

import {
    ChatBubbleLeftRightIcon,
    CommandLineIcon,
    GlobeAltIcon,
    PencilSquareIcon,
    StarIcon,
    UsersIcon} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, { useCallback,useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { StatCard } from '@/components/admin/AdminUI';
import LogsTable from '@/components/admin/LogsTable';
import UsersTable from '@/components/admin/UsersTable';
import WorkspacesTable from '@/components/admin/WorkspacesTable';
import { useAuth } from '@/hooks/useAuth';
import pb from '@/lib/pocketbase';
import type { User, Workspace } from '@/types';

export default function GlobalAdminPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [totalSuggestions, setTotalSuggestions] = useState(0);
    const [totalComments, setTotalComments] = useState(0);
    const [recentErrors, setRecentErrors] = useState(0);
    const [loadingData, setLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'workspaces' | 'logs'>('overview');

    const stats = {
        totalUsers: users.length,
        proUsers: users.filter(u => u.plan === 'pro').length,
        totalWorkspaces: workspaces.length,
        totalSuggestions,
        totalComments
    };

    const fetchData = useCallback(async () => {
        try {
            const [wsRecords, userRecords, suggestionsList, commentsList, logsList] = await Promise.all([
                pb.collection('workspaces').getFullList<Workspace>({ sort: '-created', expand: 'owner', requestKey: null }),
                pb.collection('users').getFullList<User>({ sort: '-created', requestKey: null }),
                pb.collection('suggestions').getList(1, 1, { requestKey: null }),
                pb.collection('comments').getList(1, 1, { requestKey: null }),
                pb.collection('logs').getList(1, 1, { 
                    filter: `created >= "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().replace('T', ' ')}"`,
                    requestKey: null 
                }),
            ]);
            setWorkspaces(wsRecords);
            setUsers(userRecords);
            setTotalSuggestions(suggestionsList.totalItems);
            setTotalComments(commentsList.totalItems);
            setRecentErrors(logsList.totalItems);
        } catch (__err) {
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
                    title="Пользователи"
                    value={stats.totalUsers}
                    icon={<UsersIcon className="w-5 h-5" />}
                    subtext={stats.proUsers > 0 ? `${stats.proUsers} PRO` : ''}
                />
                <StatCard
                    title="Воркспейсов"
                    value={stats.totalWorkspaces}
                    icon={<GlobeAltIcon className="w-5 h-5" />}
                    color="#6366f1"
                />
                <StatCard
                    title="Предложений"
                    value={stats.totalSuggestions}
                    icon={<PencilSquareIcon className="w-5 h-5" />}
                    color="#ec4899"
                />
                <StatCard
                    title="Комментариев"
                    value={stats.totalComments}
                    icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
                    color="#10b981"
                />
            </div>

            {/* Tab Navigation */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '32px',
                padding: '4px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                width: 'fit-content',
                border: '1px solid var(--border-color)'
            }}>
                {[
                    { id: 'overview', name: 'Обзор', icon: <StarIcon className="w-4 h-4" /> },
                    { id: 'users', name: 'Пользователи', icon: <UsersIcon className="w-4 h-4" /> },
                    { id: 'workspaces', name: 'Воркспейсы', icon: <GlobeAltIcon className="w-4 h-4" /> },
                    { id: 'logs', name: 'Логи', icon: <CommandLineIcon className="w-4 h-4" /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'workspaces' | 'logs')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: 'none',
                            background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#a1a1aa'
                        }}
                    >
                        {tab.icon} {tab.name}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        <StatCard
                            title="Конверсия в PRO"
                            value={stats.totalUsers > 0 ? `${((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}%` : '0%'}
                            subtext="Процент платных пользователей"
                            color="#fbbf24"
                            icon={<StarIcon className="w-5 h-5" />}
                        />
                        <div style={{ 
                            background: 'var(--bg-secondary)', 
                            padding: '24px', 
                            borderRadius: 'var(--radius-lg)', 
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                           <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Статус системы</h3>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: recentErrors > 0 ? '#ef4444' : '#10b981', fontSize: '0.9rem' }}>
                               <div style={{ 
                                   width: '8px', 
                                   height: '8px', 
                                   borderRadius: '50%', 
                                   background: recentErrors > 0 ? '#ef4444' : '#10b981', 
                                   boxShadow: `0 0 10px ${recentErrors > 0 ? '#ef4444' : '#10b981'}` 
                               }} />
                               {recentErrors > 0 
                                 ? `Обнаружено ${recentErrors} ошибок за 24ч` 
                                 : 'Все системы работают в штатном режиме'}
                           </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <UsersTable users={users} setUsers={setUsers} currentUser={user} />
                )}

                {activeTab === 'workspaces' && (
                    <WorkspacesTable workspaces={workspaces} setWorkspaces={setWorkspaces} />
                )}

                {activeTab === 'logs' && (
                    <LogsTable />
                )}
            </div>
        </div>
    );
}
