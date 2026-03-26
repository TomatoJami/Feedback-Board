'use client';

import React, { useEffect, useState } from 'react';

import UserAvatar from '@/components/ui/UserAvatar';
import type { LogEntry } from '@/lib/logger';
import pb from '@/lib/pocketbase';

export default function LogsTable() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LOGS_PER_PAGE = 20;

    const fetchLogs = async (p: number) => {
        setLoading(true);
        try {
            const result = await pb.collection('logs').getList<LogEntry>(p, LOGS_PER_PAGE, {
                sort: '-created',
                expand: 'user_id',
                requestKey: null,
            });
            setLogs(result.items);
            setTotalPages(result.totalPages);
        } catch (err) {
            console.error('Failed to fetch logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    if (loading && page === 1) {
        return <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl" />
            ))}
        </div>;
    }

    return (
        <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Логи ошибок</h2>
                <button 
                  onClick={() => fetchLogs(1)} 
                  className="btn btn-ghost"
                  style={{ fontSize: '0.8rem' }}
                >
                  Обновить
                </button>
            </div>

            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', width: '20%' }}>Время</th>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', width: '25%' }}>Пользователь</th>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', width: '40%' }}>Сообщение</th>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', width: '15%' }}>Путь</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#71717a' }}>Логов не найдено</td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)', verticalAlign: 'top' }}>
                                        <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#a1a1aa' }}>
                                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <UserAvatar 
                                                   userId={log.user_id || ''} 
                                                   userName={log.expand?.user_id?.name} 
                                                   userEmail={log.expand?.user_id?.email} 
                                                   userAvatar={log.expand?.user_id?.avatar} 
                                                   size={24} 
                                                />
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontSize: '0.85rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.expand?.user_id?.name || 'Гость'}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.expand?.user_id?.email || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ 
                                                fontSize: '0.85rem', 
                                                color: '#ef4444', 
                                                fontWeight: 500,
                                                wordBreak: 'break-word',
                                                fontFamily: 'monospace'
                                            }}>
                                                {log.error_message}
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{log.path}</div>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                        <button 
                            disabled={page === 1} 
                            onClick={() => setPage(p => p - 1)}
                            className="btn btn-ghost"
                        >
                            Назад
                        </button>
                        <span style={{ fontSize: '0.9rem', color: '#71717a', alignSelf: 'center' }}>
                            Страница {page} из {totalPages}
                        </span>
                        <button 
                            disabled={page === totalPages} 
                            onClick={() => setPage(p => p + 1)}
                            className="btn btn-ghost"
                        >
                            Вперед
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
