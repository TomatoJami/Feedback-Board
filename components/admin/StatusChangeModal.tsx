'use client';

import React, { useState, useEffect, useRef } from 'react';

interface StatusChangeModalProps {
  isOpen: boolean;
  statusName: string;
  statusColor: string;
  suggestionTitle: string;
  onConfirm: (comment: string) => void;
  onCancel: () => void;
}

export default function StatusChangeModal({
  isOpen,
  statusName,
  statusColor,
  suggestionTitle,
  onConfirm,
  onCancel,
}: StatusChangeModalProps) {
  const [comment, setComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setComment('');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(comment.trim());
    setComment('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
      onClick={onCancel}
    >
      <div 
        className="modal-content animate-in zoom-in duration-200" 
        style={{ maxWidth: '480px', width: '100%', textAlign: 'left' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: `${statusColor}15`,
            border: `1px solid ${statusColor}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" />
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Изменение статуса
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {suggestionTitle}
            </p>
          </div>
        </div>

        {/* New status pill */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '16px',
          padding: '10px 14px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Новый статус:</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '999px',
            background: `${statusColor}15`,
            color: statusColor,
            border: `1px solid ${statusColor}30`,
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
            {statusName}
          </span>
        </div>

        {/* Comment textarea */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: 'var(--text-secondary)', 
            marginBottom: '6px' 
          }}>
            Комментарий для автора <span style={{ fontWeight: 400, opacity: 0.6 }}>(необязательно)</span>
          </label>
          <textarea
            ref={textareaRef}
            className="auth-input"
            style={{ 
              width: '100%',
              minHeight: '80px',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: '1.5',
            }}
            placeholder="Напишите комментарий, который увидит автор предложения..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSubmit();
              }
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-ghost"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={handleSubmit}
          >
            Сохранить
          </button>
        </div>

        {/* Hint */}
        <p style={{ 
          textAlign: 'center', 
          fontSize: '0.7rem', 
          color: 'var(--text-secondary)', 
          opacity: 0.5, 
          marginTop: '12px' 
        }}>
          Ctrl + Enter для быстрого подтверждения
        </p>
      </div>
    </div>
  );
}
