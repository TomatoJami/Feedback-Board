import { TrashIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

import ConfirmModal from '@/components/ConfirmModal';
import pb from '@/lib/pocketbase';
import type { Workspace } from '@/types';

interface WorkspacesTableProps {
    workspaces: Workspace[];
    setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
}

export default function WorkspacesTable({ workspaces, setWorkspaces }: WorkspacesTableProps) {
    const [workspaceSearch, setWorkspaceSearch] = useState('');
    const [workspacePage, setWorkspacePage] = useState(1);
    const WORKSPACES_PER_PAGE = 10;
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<{ id: string, name: string } | null>(null);

    const handleDeleteWorkspace = async () => {
        if (!pendingDelete) return;
        try {
            await pb.collection('workspaces').delete(pendingDelete.id);
            setWorkspaces(prev => prev.filter(w => w.id !== pendingDelete.id));
            toast.success('Воркспейс удален');
        } catch (__err) {
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

    return (
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
        </section>
    );
}
