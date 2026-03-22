import Image from 'next/image';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import { CustomSelect } from '@/components/admin/AdminUI';
import pb from '@/lib/pocketbase';
import type { User } from '@/types';

interface UsersTableProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    currentUser: User | null;
}

export default function UsersTable({ users, setUsers, currentUser }: UsersTableProps) {
    const [userSearch, setUserSearch] = useState('');
    const [userPage, setUserPage] = useState(1);
    const USERS_PER_PAGE = 10;
    const [isUpdatingUser, setIsUpdatingUser] = useState<string | null>(null);

    const handleUpdateUserPlan = async (uId: string, newPlan: string) => {
        setIsUpdatingUser(uId);
        try {
            await pb.collection('users').update(uId, { plan: newPlan });
            setUsers(prev => prev.map(u => u.id === uId ? { ...u, plan: newPlan as 'free' | 'pro' } : u));
            toast.success('Тариф пользователя обновлен');
        } catch (__err) {
            toast.error('Ошибка при обновлении тарифа');
        } finally {
            setIsUpdatingUser(null);
        }
    };

    const handleUpdateUserRole = async (uId: string, newRole: string) => {
        if (uId === currentUser?.id) {
            toast.error('Вы не можете изменить свою собственную роль');
            return;
        }
        setIsUpdatingUser(uId);
        try {
            await pb.collection('users').update(uId, { role: newRole });
            setUsers(prev => prev.map(u => u.id === uId ? { ...u, role: newRole as 'user' | 'admin' } : u));
            toast.success('Роль пользователя обновлена');
        } catch (__err) {
            toast.error('Ошибка при обновлении роли');
        } finally {
            setIsUpdatingUser(null);
        }
    };

    const handleUpdateUserStatus = async (uId: string, newStatus: string) => {
        setIsUpdatingUser(uId);
        try {
            await pb.collection('users').update(uId, { status: newStatus });
            setUsers(prev => prev.map(u => u.id === uId ? { ...u, status: newStatus as 'active' | 'blocked' } : u));
            toast.success('Статус пользователя обновлен');
        } catch (__err) {
            toast.error('Ошибка при обновлении статуса');
        } finally {
            setIsUpdatingUser(null);
        }
    };

    return (
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
                                                                <Image 
                                                                    src={`${pb.baseUrl}/api/files/users/${u.id}/${u.avatar}`} 
                                                                    alt={u.name || 'User Avatar'} 
                                                                    width={40}
                                                                    height={40}
                                                                    unoptimized
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                                />
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
                                                        disabled={isUpdatingUser === u.id || u.id === currentUser?.id}
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
                                                        disabled={isUpdatingUser === u.id || u.id === currentUser?.id}
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
    );
}
