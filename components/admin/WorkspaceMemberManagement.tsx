import React, { useState } from 'react';
import toast from 'react-hot-toast';

import ConfirmModal from '@/components/ui/ConfirmModal';
import UserAvatar from '@/components/ui/UserAvatar';
import pb from '@/lib/pocketbase';
import type { User, UserPrefix, WorkspaceMember, WorkspaceRole } from '@/types';

import { CustomMultiSelect,CustomSelect } from './AdminUI';

interface WorkspaceMemberManagementProps {
  workspaceId: string;
  members: WorkspaceMember[];
  prefixes: UserPrefix[];
  currentUser: User | null;
  onMembersUpdated: () => void;
  onUpdateMemberPrefix: (memberId: string, prefixIds: string[]) => Promise<void>;
  onUpdateMemberRole: (memberId: string, role: WorkspaceRole) => Promise<void>;
  isPublic?: boolean;
  isPro?: boolean;
}

export default function WorkspaceMemberManagement({
  workspaceId,
  members,
  prefixes,
  currentUser,
  onMembersUpdated,
  onUpdateMemberPrefix,
  onUpdateMemberRole,
  isPublic = false,
  isPro: _isPro = false
}: WorkspaceMemberManagementProps) {
  const [inviteInput, setInviteInput] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('user');
  const [isInviting, setIsInviting] = useState(false);
  
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [pendingMember, setPendingMember] = useState<{ id: string, userId: string, name: string } | null>(null);

  // Search and Pagination
  const [memberSearch, setMemberSearch] = useState('');
  const [memberPage, setMemberPage] = useState(1);
  const MEMBERS_PER_PAGE = 5; // Smaller for members list

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;

    setIsInviting(true);
    try {
      // Find user by email or name
      const targetUser = await pb.collection('users').getFirstListItem(
        `email = "${inviteInput.trim()}" || name = "${inviteInput.trim()}"`
      );

      // Check if already a member
      if (members.some(m => m.user === targetUser.id)) {
        toast.error('Пользователь уже является участником этого пространства.');
        setIsInviting(false);
        return;
      }

      // Add as member
      await pb.collection('workspace_members').create({
        workspace: workspaceId,
        user: targetUser.id,
        role: inviteRole
      });

      toast.success('Пользователь успешно приглашен!');
      setInviteInput('');
      onMembersUpdated();
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string };
      if (error.status === 404) {
        toast.error('Пользователь не найден.');
      } else {
        toast.error('Ошибка при приглашении пользователя. ' + (error.message || ''));
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!pendingMember) return;
    
    try {
      await pb.collection('workspace_members').delete(pendingMember.id);
      toast.success('Участник удален');
      onMembersUpdated();
    } catch (__err) {
      toast.error('Ошибка при удалении участника');
    } finally {
      setShowRemoveConfirm(false);
      setPendingMember(null);
    }
  };

  const initiateRemoveMember = (memberId: string, memberUserId: string, name: string) => {
    if (memberUserId === currentUser?.id) {
      toast.error('Вы не можете удалить сами себя. Попросите другого админа или владельца.');
      return;
    }
    setPendingMember({ id: memberId, userId: memberUserId, name });
    setShowRemoveConfirm(true);
  };

  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Участники</h2>
      
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '20px'
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Приглашайте пользователей и управляйте их доступом к этому пространству.
        </p>

        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value)}
            placeholder="Email или никнейм пользователя..."
            style={{
              flex: 2,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              color: 'var(--text-primary)',
              outline: 'none',
              minWidth: '200px'
            }}
          />
          <div style={{ width: '180px' }}>
            <CustomSelect
              options={[
                { id: 'user', name: isPublic ? 'Резидент' : 'Пользователь' },
                { id: 'moderator', name: 'Модератор' },
                { id: 'admin', name: 'Админ' }
              ]}
              value={inviteRole}
              onChange={(val) => setInviteRole(val as WorkspaceRole)}
              placeholder="Роль"
              disabled={isInviting}
            />
          </div>
          <button
            type="submit"
            disabled={isInviting || !inviteInput.trim()}
            className="btn btn-primary"
            style={{ padding: '0 24px' }}
          >
            {isInviting ? '...' : 'Пригласить'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Список участников ({members.length})</h3>
            <div style={{ position: 'relative', width: '250px' }}>
                <input
                    type="text"
                    placeholder="Поиск участников..."
                    value={memberSearch}
                    onChange={(e) => {
                        setMemberSearch(e.target.value);
                        setMemberPage(1);
                    }}
                    style={{
                        width: '100%',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 12px 8px 36px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none'
                    }}
                />
                <svg 
                    className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(() => {
            const filtered = members.filter(m => 
                (m.expand?.user?.name || '').toLowerCase().includes(memberSearch.toLowerCase()) ||
                (m.expand?.user?.email || '').toLowerCase().includes(memberSearch.toLowerCase())
            );
            const totalPages = Math.ceil(filtered.length / MEMBERS_PER_PAGE);
            const currentMembers = filtered.slice((memberPage - 1) * MEMBERS_PER_PAGE, memberPage * MEMBERS_PER_PAGE);

            return (
              <>
                {currentMembers.map((member) => (
                  <div key={member.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <UserAvatar 
                        userId={member.user} 
                        userName={member.expand?.user?.name} 
                        userEmail={member.expand?.user?.email} 
                        userAvatar={member.expand?.user?.avatar} 
                        size={40} 
                      />
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {member.expand?.user?.name || member.expand?.user?.email}
                          {member.user === currentUser?.id && ' (Вы)'}
                        </div>
                        {member.user === currentUser?.id ? (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                            {member.role === 'admin' ? 'Админ' : member.role === 'moderator' ? 'Модератор' : isPublic ? 'Участник' : 'Пользователь'}
                          </div>
                        ) : (
                          <div style={{ width: '140px', marginTop: '4px' }}>
                            <CustomSelect
                              options={[
                                { id: 'user', name: isPublic ? 'Участник' : 'Пользователь' },
                                { id: 'moderator', name: 'Модератор' },
                                { id: 'admin', name: 'Админ' }
                              ]}
                              value={member.role}
                              onChange={(val) => onUpdateMemberRole(member.id, val as WorkspaceRole)}
                              placeholder="Роль"
                              variant="small"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ minWidth: '150px', maxWidth: '250px' }}>
                        <CustomMultiSelect
                          options={prefixes?.map(p => ({ id: p.id, name: p.name, color: p.color })) || []}
                          selectedIds={member.prefixes || []}
                          onChange={(vals) => onUpdateMemberPrefix(member.id, vals)}
                          placeholder="Префиксы..."
                        />
                      </div>

                      {member.user !== currentUser?.id && (
                        <button
                          type="button"
                          onClick={() => initiateRemoveMember(member.id, member.user, member.expand?.user?.name || member.expand?.user?.email || 'Пользователь')}
                          className="btn btn-ghost"
                          style={{ color: '#f43f5e', fontSize: '0.85rem' }}
                        >
                          Выгнать
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
                    {memberSearch ? 'Участники не найдены.' : 'Другие участники не найдены.'}
                  </div>
                )}

                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                    <button 
                      onClick={() => setMemberPage(p => Math.max(1, p - 1))}
                      disabled={memberPage === 1}
                      className="btn btn-ghost"
                      style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                    >
                      Назад
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0 12px' }}>
                      {memberPage} / {totalPages}
                    </div>
                    <button 
                      onClick={() => setMemberPage(p => Math.min(totalPages, p + 1))}
                      disabled={memberPage === totalPages}
                      className="btn btn-ghost"
                      style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                    >
                      Вперед
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      <ConfirmModal
        isOpen={showRemoveConfirm}
        title="Удалить участника"
        message={`Вы уверены, что хотите удалить пользователя ${pendingMember?.name} из этого пространства?`}
        confirmText="Выгнать"
        cancelText="Отмена"
        variant="danger"
        onConfirm={handleRemoveMember}
        onCancel={() => {
          setShowRemoveConfirm(false);
          setPendingMember(null);
        }}
      />
    </section>
  );
}
