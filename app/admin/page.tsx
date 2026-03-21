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

export default function GlobalAdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isUpdatingUser, setIsUpdatingUser] = useState<string | null>(null);

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

  const handleDeleteWorkspace = async (id: string, name: string) => {
    if (!window.confirm(`Вы уверены, что хотите навсегда удалить воркспейс "${name}"?`)) return;
    try {
      await pb.collection('workspaces').delete(id);
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      toast.success('Воркспейс удален');
    } catch (err) {
      toast.error('Ошибка при удалении');
    }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Пользователи</h2>
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
                            {users.map(u => (
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
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        {/* Workspaces Management Section */}
        <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Воркспейсы</h2>
                <span style={{ fontSize: '0.8rem', color: '#71717a', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '100px' }}>
                    {workspaces.length} всего
                </span>
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
                            {workspaces.map(w => (
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
                                            onClick={() => handleDeleteWorkspace(w.id, w.name)}
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
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                                            }}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </div>
  );
}
