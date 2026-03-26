import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface DeleteConfirmModalProps {
  title: string;
  deleteInput: string;
  setDeleteInput: (val: string) => void;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteConfirmModal({
  title,
  deleteInput,
  setDeleteInput,
  isDeleting,
  onClose,
  onDelete,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-content animate-in zoom-in duration-200" style={{ maxWidth: '440px', width: '100%', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <ExclamationTriangleIcon className="w-12 h-12 text-amber-500" />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', textAlign: 'center' }}>Удалить предложение?</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6', textAlign: 'center' }}>
          Это действие необратимо. Пожалуйста, введите название предложения для подтверждения: <br/>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginTop: '8px', padding: '10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', userSelect: 'all', fontSize: '0.9rem', fontWeight: 600 }}>{title}</strong>
        </p>
        
        <input
          type="text"
          className="auth-input"
          style={{ marginBottom: '24px' }}
          placeholder="Введите название..."
          value={deleteInput}
          onChange={(e) => setDeleteInput(e.target.value)}
          autoFocus
        />

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-ghost"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className="detail-delete-btn"
            style={{ 
              flex: 1, 
              justifyContent: 'center',
              background: deleteInput === title ? '#f43f5e' : 'var(--bg-tertiary)',
              color: 'white',
              opacity: deleteInput === title ? 1 : 0.5,
              cursor: deleteInput === title ? 'pointer' : 'not-allowed',
              border: 'none',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            disabled={deleteInput !== title || isDeleting}
            onClick={onDelete}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </div>
  );
}
