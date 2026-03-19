import React, { useState } from 'react';
import pb from '@/lib/pocketbase';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface WorkspaceDangerZoneProps {
  workspace: any;
}

export default function WorkspaceDangerZone({ workspace }: WorkspaceDangerZoneProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === workspace?.owner || user?.global_role === 'owner';

  if (!isOwner) return null; // Only workspace owners or global owners can delete the workspace

  const handleFirstStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput === workspace.name) {
      setStep(2);
    } else {
      toast.error('Название не совпадает');
    }
  };

  const handleFinalDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) {
      toast.error('Введите пароль');
      return;
    }

    setIsDeleting(true);
    try {
      // Re-authenticate to verify password
      await pb.collection('users').authWithPassword(user!.email, passwordInput);
      
      // Password verified, proceed with deletion
      await pb.collection('workspaces').delete(workspace.id);
      
      toast.success('Пространство успешно удалено');
      router.push('/');
    } catch (err: any) {
      if (err.status === 400 || err.status === 401) {
        toast.error('Неверный пароль');
      } else {
        toast.error('Ошибка при удалении пространства');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section style={{ marginTop: '64px', marginBottom: '48px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', color: '#ef4444' }}>Опасная зона</h2>
      
      <div style={{
        background: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '4px' }}>Удалить пространство</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px' }}>
              Это действие необратимо. Оно удалит пространство <strong>{workspace.name}</strong>, а также все предложения, категории, статусы и участников, связанные с ним.
            </p>
          </div>
          
          {step === 0 && (
            <button
              onClick={() => setStep(1)}
              className="btn"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '10px 20px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = '#ef4444';
              }}
            >
              Удалить пространство
            </button>
          )}
        </div>

        {step === 1 && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '16px' }}>
              Пожалуйста, введите название пространства <strong>{workspace.name}</strong> для подтверждения:
            </p>
            <form onSubmit={handleFirstStepSubmit} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={workspace.name}
                style={{
                  flex: 1,
                  maxWidth: '300px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  color: 'white',
                  outline: 'none',
                  borderColor: nameInput === workspace.name ? '#10b981' : 'var(--border-color)',
                  transition: 'border-color 0.2s'
                }}
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => { setStep(0); setNameInput(''); }}
                className="btn btn-ghost"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                disabled={nameInput !== workspace.name}
                className="btn"
                style={{
                  background: nameInput === workspace.name ? '#ef4444' : 'rgba(239, 68, 68, 0.5)',
                  color: 'white',
                  cursor: nameInput === workspace.name ? 'pointer' : 'not-allowed',
                }}
              >
                Далее
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p style={{ color: '#ef4444', fontSize: '0.95rem', marginBottom: '16px', fontWeight: 500 }}>
              Последний шаг. Введите ваш пароль от аккаунта ({user?.email}) для окончательного удаления:
            </p>
            <form onSubmit={handleFinalDelete} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Ваш пароль"
                style={{
                  flex: 1,
                  maxWidth: '300px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  color: 'white',
                  outline: 'none'
                }}
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => { setStep(0); setNameInput(''); setPasswordInput(''); }}
                className="btn btn-ghost"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                disabled={!passwordInput || isDeleting}
                className="btn"
                style={{
                  background: '#ef4444',
                  color: 'white',
                  opacity: (!passwordInput || isDeleting) ? 0.5 : 1
                }}
              >
                {isDeleting ? 'Удаление...' : 'Удалить навсегда'}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
