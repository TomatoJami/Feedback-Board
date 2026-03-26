'use client';

import { 
  ExclamationCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import React, { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'warning' | 'danger' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Продолжить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const icons: Record<string, React.ReactNode> = {
    warning: <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto" />,
    danger: <ExclamationCircleIcon className="w-12 h-12 text-rose-500 mx-auto" />,
    info: <InformationCircleIcon className="w-12 h-12 text-blue-500 mx-auto" />,
  };

  return (
    <dialog
      ref={dialogRef}
      className="confirm-modal"
      onClose={onCancel}
      onClick={(e) => {
        if (e.target === dialogRef.current) onCancel();
      }}
    >
      <div className="modal-content">
        <div className="modal-icon">{icons[variant]}</div>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`modal-btn modal-btn-confirm modal-btn-${variant}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
}
