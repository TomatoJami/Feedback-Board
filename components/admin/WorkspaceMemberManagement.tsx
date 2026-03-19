import React, { useState } from 'react';
import pb from '@/lib/pocketbase';
import toast from 'react-hot-toast';
import { CustomSelect } from './AdminUI';

interface WorkspaceMemberManagementProps {
  workspaceId: string;
  members: any[];
  currentUser: any;
  onMembersUpdated: () => void;
}

export default function WorkspaceMemberManagement({
  workspaceId,
  members,
  currentUser,
  onMembersUpdated
}: WorkspaceMemberManagementProps) {
  const [inviteInput, setInviteInput] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'moderator'>('moderator');
  const [isInviting, setIsInviting] = useState(false);

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
    } catch (err: any) {
      if (err.status === 404) {
        toast.error('Пользователь не найден по email или никнейму.');
      } else {
        toast.error('Ошибка при приглашении пользователя.');
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === currentUser.id) {
      toast.error('Вы не можете удалить сами себя. Попросите другого админа или владельца.');
      return;
    }
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя из пространства?')) return;

    try {
      await pb.collection('workspace_members').delete(memberId);
      toast.success('Участник удален');
      onMembersUpdated();
    } catch (err) {
      toast.error('Ошибка при удалении участника');
    }
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
                { id: 'moderator', name: 'Модератор' },
                { id: 'admin', name: 'Админ' }
              ]}
              value={inviteRole}
              onChange={(val) => setInviteRole(val as any)}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {members.map((member) => (
            <div key={member.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  fontWeight: 600
                }}>
                  {member.expand?.user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pb.files.getURL(member.expand.user, member.expand.user.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    member.expand?.user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {member.expand?.user?.name || member.expand?.user?.email}
                    {member.user === currentUser?.id && ' (Вы)'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                    {member.role === 'admin' ? 'Админ' : 'Модератор'}
                  </div>
                </div>
              </div>
              {member.user !== currentUser.id && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member.id, member.user)}
                  className="btn btn-ghost"
                  style={{ color: '#f43f5e', fontSize: '0.85rem' }}
                >
                  Удалить
                </button>
              )}
            </div>
          ))}
          {members.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
              Другие участники не найдены.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
