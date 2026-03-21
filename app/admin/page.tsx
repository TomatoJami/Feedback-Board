'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import toast from 'react-hot-toast';
import { CustomSelect, StatCard } from '@/components/admin/AdminUI';
import {
    UsersIcon,
    StarIcon,
    TrashIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import ConfirmModal from '@/components/ConfirmModal';

export default function GlobalAdminPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isUpdatingUser, setIsUpdatingUser] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<{ id: string, name: string } | null>(null);

    // Search and Pagination
    const [userSearch, setUserSearch] = useState('');
    const [userPage, setUserPage] = useState(1);
    const USERS_PER_PAGE = 10;

    const [workspaceSearch, setWorkspaceSearch] = useState('');
    const [workspacePage, setWorkspacePage] = useState(1);
    const WORKSPACES_PER_PAGE = 10;

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

    const handleUpdateUserPlan = async (uId: string, newPlan: string) => {
        setIsUpdatingUser(uId);
        try {
            await pb.collection('users').update(uId, { plan: newPlan });
            setUsers(prev => prev.map(u => u.id === uId ? { ...u, plan: newPlan } : u));
            toast.success('Тариф пользователя обновлен');
        } catch (err) {
            toast.error('Ошибка при обновлении тарифа');
        } finally {
            setIsUpdatingUser(null);
        }
    };

    const handleUpdateUserRole = async (uId: string, newRole: string) => {
        if (uId === user?.id) {
            toast.error('Вы не можете изменить свою собственную роль');
            return;
        }
        setIsUpdatingUser(uId);
        try {
            await pb.collection('users').update(uId, { role: newRole });
            setUsers(prev => prev.map(u => u.id === uId ? { ...u, role: newRole } : u));
            toast.success('Роль пользователя обновлена');
        } catch (err) {
            toast.error('Ошибка при обновлении роли');
        } finally {
            setIsUpdatingUser(null);
        }
    };

    const handleUpdateUserStatus = async (uId: string, newStatus: string) => {
        setIsUpdatingUser(uId);
        try {
            await pb.collection('users').update(uId, { status: newStatus });
            setUsers(prev => prev.map(u => u.id === uId ? { ...u, status: newStatus } : u));
            toast.success('Статус пользователя обновлен');
        } catch (err) {
            toast.error('Ошибка при обновлении статуса');
        } finally {
            setIsUpdatingUser(null);
        }
    };

    const handleDeleteWorkspace = async () => {
        if (!pendingDelete) return;
        try {
            await pb.collection('workspaces').delete(pendingDelete.id);
            setWorkspaces(prev => prev.filter(w => w.id !== pendingDelete.id));
            toast.success('Воркспейс удален');
        } catch (err) {
            toast.error('Ошибка при удалении');
        } finally {
            setShowDeleteConfirm(false);
            setPendingDelete(null);
        }
    };

    const initiateDeleteWorkspace = (id: string, name: string) => {
        setPendingDelete({ id, name });
        setShowDeleteConfirm(true);
    };

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
            <section style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Пользователи</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Поиск по имени или email..."
                            value={userSearch}
                            onChange={(e) => {
                                setUserSearch(e.target.value);
                                setUserPage(1);
                            }}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                padding: '10px 16px 10px 40px',
                                color: 'white',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <svg
                            className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase' }}>Пользователь</th>
                                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', width: '200px' }}>Тариф</th>
                                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', width: '200px' }}>Роль</th>
                                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', width: '200px' }}>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const filtered = users.filter(u =>
                                        (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                                        u.email.toLowerCase().includes(userSearch.toLowerCase())
                                    );
                                    const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
                                    const currentUsers = filtered.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);

                                    return (
                                        <>
                                            {currentUsers.map(u => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, overflow: 'hidden' }}>
                                                                {u.avatar ? (
                                                                    <img src={`${pb.baseUrl}/api/files/users/${u.id}/${u.avatar}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (u.name || u.email || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name || 'Без имени'}</div>
                                                                <div style={{ fontSize: '0.8rem', color: '#71717a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <CustomSelect
                                                            options={[
                                                                { id: 'free', name: 'Free', color: '#a1a1aa' },
                                                                { id: 'pro', name: 'Pro', color: '#fbbf24' }
                                                            ]}
                                                            value={u.plan || 'free'}
                                                            onChange={(val) => handleUpdateUserPlan(u.id, val)}
                                                            placeholder="Тариф..."
                                                            disabled={isUpdatingUser === u.id}
                                                            maxWidth="160px"
                                                        />
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <CustomSelect
                                                            options={[
                                                                { id: 'user', name: 'User', color: '#a1a1aa' },
                                                                { id: 'admin', name: 'Admin', color: '#fbbf24' }
                                                            ]}
                                                            value={u.role || 'user'}
                                                            onChange={(val) => handleUpdateUserRole(u.id, val)}
                                                            placeholder="Роль..."
                                                            disabled={isUpdatingUser === u.id || u.id === user?.id}
                                                            maxWidth="160px"
                                                        />
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                                        <CustomSelect
                                                            options={[
                                                                { id: 'active', name: 'Активен', color: '#10b981' },
                                                                { id: 'blocked', name: 'Заблокирован', color: '#ef4444' }
                                                            ]}
                                                            value={u.status || 'active'}
                                                            onChange={(val) => handleUpdateUserStatus(u.id, val)}
                                                            placeholder="Статус..."
                                                            disabled={isUpdatingUser === u.id || u.id === user?.id}
                                                            maxWidth="160px"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            {filtered.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#71717a' }}>Пользователи не найдены</td>
                                                </tr>
                                            )}
                                            {totalPages > 1 && (
                                                <tr>
                                                    <td colSpan={4} style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                            <button
                                                                onClick={() => setUserPage(p => Math.max(1, p - 1))}
                                                                disabled={userPage === 1}
                                                                className="btn btn-ghost"
                                                                style={{ padding: '4px 12px' }}
                                                            >
                                                                Назад
                                                            </button>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#a1a1aa', padding: '0 12px' }}>
                                                                Страница {userPage} из {totalPages}
                                                            </div>
                                                            <button
                                                                onClick={() => setUserPage(p => Math.min(totalPages, p + 1))}
                                                                disabled={userPage === totalPages}
                                                                className="btn btn-ghost"
                                                                style={{ padding: '4px 12px' }}
                                                            >
                                                                Вперед
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Workspaces Management Section */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Воркспейсы</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input
                            type="text"
                            placeholder="Поиск по названию или slug..."
                            value={workspaceSearch}
                            onChange={(e) => {
                                setWorkspaceSearch(e.target.value);
                                setWorkspacePage(1);
                            }}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                padding: '10px 16px 10px 40px',
                                color: 'white',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <svg
                            className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase' }}>Название</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase' }}>Владелец</th>
                                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase' }}>Доступ</th>
                                    <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase' }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const filtered = workspaces.filter(w =>
                                        w.name.toLowerCase().includes(workspaceSearch.toLowerCase()) ||
                                        w.slug.toLowerCase().includes(workspaceSearch.toLowerCase())
                                    );
                                    const totalPages = Math.ceil(filtered.length / WORKSPACES_PER_PAGE);
                                    const currentWorkspaces = filtered.slice((workspacePage - 1) * WORKSPACES_PER_PAGE, workspacePage * WORKSPACES_PER_PAGE);

                                    return (
                                        <>
                                            {currentWorkspaces.map(w => (
                                                <tr key={w.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ fontWeight: 600, color: 'white' }}>{w.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#71717a', fontFamily: 'monospace' }}>/w/{w.slug}</div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                                                {(w.expand?.owner?.name || w.expand?.owner?.email || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', color: '#e4e4e7' }}>{w.expand?.owner?.name || w.expand?.owner?.email || 'N/A'}</div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700,
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            background: w.isPrivate ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                            color: w.isPrivate ? '#f59e0b' : '#10b981',
                                                            border: `1px solid ${w.isPrivate ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.025em'
                                                        }}>
                                                            {w.isPrivate ? 'Private' : 'Public'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                                        <button
                                                            onClick={() => initiateDeleteWorkspace(w.id, w.name)}
                                                            style={{
                                                                background: 'rgba(239, 68, 68, 0.05)',
                                                                color: '#ef4444',
                                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                                padding: '8px 16px',
                                                                borderRadius: 'var(--radius-md)',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filtered.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#71717a' }}>Воркспейсы не найдены</td>
                                                </tr>
                                            )}
                                            {totalPages > 1 && (
                                                <tr>
                                                    <td colSpan={4} style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                            <button
                                                                onClick={() => setWorkspacePage(p => Math.max(1, p - 1))}
                                                                disabled={workspacePage === 1}
                                                                className="btn btn-ghost"
                                                                style={{ padding: '4px 12px' }}
                                                            >
                                                                Назад
                                                            </button>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#a1a1aa', padding: '0 12px' }}>
                                                                Страница {workspacePage} из {totalPages}
                                                            </div>
                                                            <button
                                                                onClick={() => setWorkspacePage(p => Math.min(totalPages, p + 1))}
                                                                disabled={workspacePage === totalPages}
                                                                className="btn btn-ghost"
                                                                style={{ padding: '4px 12px' }}
                                                            >
                                                                Вперед
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    );
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Удалить воркспейс"
                message={`Вы уверены, что хотите навсегда удалить воркспейс "${pendingDelete?.name}"? Все данные внутри него будут безвозвратно удалены.`}
                confirmText="Да, удалить навсегда"
                cancelText="Отмена"
                variant="danger"
                onConfirm={handleDeleteWorkspace}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setPendingDelete(null);
                }}
            />
        </div>
    );
}
