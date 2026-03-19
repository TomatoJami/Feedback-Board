import React from 'react';
import pb from '@/lib/pocketbase';
import { CustomSelect, CustomMultiSelect } from './AdminUI';

interface UserManagementProps {
  allUsers: any[];
  user: any;
  prefixes: any[];
  isUpdatingUser: string | null;
  onUpdateUserRole: (userId: string, newRole: string) => Promise<void>;
  onUpdateUserPrefix: (userId: string, prefixIds: string[]) => Promise<void>;
}

export default function UserManagement({
  allUsers,
  user,
  prefixes,
  isUpdatingUser,
  onUpdateUserRole,
  onUpdateUserPrefix,
}: UserManagementProps) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Пользователи</h2>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '50%' }}>Пользователь</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '25%' }}>Роль</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', width: '25%' }}>Префикс</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u) => (
              <tr
                key={u.id}
                style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', overflow: 'hidden' }}>
                      {u.avatar ? (
                        <img src={`${pb.baseUrl}/api/files/users/${u.id}/${u.avatar}`} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (u.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <CustomSelect
                    options={[
                      { id: 'user', name: 'Пользователь', color: '#a1a1aa' },
                      { id: 'admin', name: 'Админ', color: '#fbbf24' }
                    ]}
                    value={u.role || 'user'}
                    onChange={(val) => onUpdateUserRole(u.id, val)}
                    placeholder="Роль..."
                    disabled={isUpdatingUser === u.id || u.id === user?.id}
                    maxWidth="100%"
                  />
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <CustomMultiSelect
                    options={prefixes.map(p => ({ id: p.id, name: p.name, color: p.color }))}
                    selectedIds={u.prefixes || []}
                    onChange={(vals) => onUpdateUserPrefix(u.id, vals)}
                    placeholder="Префиксы..."
                    disabled={isUpdatingUser === u.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
