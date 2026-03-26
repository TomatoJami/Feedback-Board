'use client';

import { CreditCardIcon, RocketLaunchIcon, ShieldCheckIcon,SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef } from 'react';

import Badge from '@/components/ui/Badge';

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
}

export default function ManageSubscriptionModal({ isOpen, onClose, plan }: ManageSubscriptionModalProps) {
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

  const isPro = plan === 'pro';

  const benefits = isPro ? [
    { icon: <RocketLaunchIcon className="w-5 h-5" />, text: 'Неограниченное число пространств' },
    { icon: <SparklesIcon className="w-5 h-5" />, text: 'Персональный брендинг и домены' },
    { icon: <ShieldCheckIcon className="w-5 h-5" />, text: 'Приоритетная поддержка 24/7' },
  ] : [
    { icon: <RocketLaunchIcon className="w-5 h-5" />, text: '1 пространство бесплатно' },
    { icon: <SparklesIcon className="w-5 h-5" />, text: 'Базовая кастомизация' },
    { icon: <ShieldCheckIcon className="w-5 h-5" />, text: 'Сообщество поддержки' },
  ];

  return (
    <dialog
      ref={dialogRef}
      className="confirm-modal !max-w-lg"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="modal-content !text-left !p-0 overflow-hidden relative border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.15)] bg-[#0a0a0c]">
        {/* Animated Mesh Gradient Background Source */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-500/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="p-6 px-8 bg-white/[0.02] border-b border-white/5 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse" />
                <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-inner">
                  <CreditCardIcon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Подписка</h2>
                <p className="text-zinc-400 text-sm font-medium">Управление тарифом и счетами</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-2xl hover:bg-white/10 text-zinc-500 hover:text-white transition-all duration-300 border border-transparent hover:border-white/10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 px-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Current Plan Card with Glassmorphism */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-[22px] blur opacity-30 group-hover:opacity-50 transition duration-500" />
              <div className="relative p-6 px-7 rounded-[20px] bg-zinc-900/40 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400/80">Текущий тариф</div>
                    <Badge variant={isPro ? "indigo" : "zinc"} size="md" showDot={isPro}>
                      {isPro ? "Pro" : "Free"}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white tracking-tighter">
                      {isPro ? '$5' : '$0'}<span className="text-base text-zinc-500 font-bold tracking-normal">/мес</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                    {benefits.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-5 text-zinc-300 text-sm font-medium">
                        <div className="text-indigo-400 bg-indigo-400/10 p-2 rounded-lg">
                          {item.icon}
                        </div>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-8 border-t border-white/5">
              <button className="w-full btn btn-primary !py-4 !rounded-2xl shadow-[0_20px_40px_rgba(99,102,241,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 group">
                {isPro ? (
                  <>
                    <CreditCardIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Изменить способ оплаты
                  </>
                ) : 'Обновиться до Pro'}
              </button>

              {isPro && (
                <button className="w-full p-4 rounded-2xl bg-white/[0.02] hover:bg-rose-500/10 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 text-zinc-500 font-bold transition-all duration-300 text-[11px] uppercase tracking-widest">
                  Отменить подписку
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 px-8 bg-black/40 border-t border-white/5 backdrop-blur-md">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 bg-white/5 px-5 py-2.5 rounded-full border border-white/5">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-indigo-400" />
                Безопасные платежи через Stripe
              </div>
              <p className="text-zinc-600 text-[11px] font-medium leading-relaxed">
                Есть вопросы? Мы всегда на связи: <br />
                <a href="mailto:support@feedbackboard.info" className="text-indigo-400/80 hover:text-indigo-400 underline decoration-indigo-400/30 transition-colors">support@feedbackboard.info</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

