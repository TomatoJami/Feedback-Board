'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface SubscriptionCardProps {
    user: any;
}

export default function SubscriptionCard({ user }: SubscriptionCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success('Подписка успешно оформлена! Добро пожаловать в PRO.');
      // Remove query params from URL
      router.replace('/auth/settings');
    }

    if (canceled === 'true') {
      toast.error('Оплата отменена.');
      router.replace('/auth/settings');
    }
  }, [searchParams, router]);

  const handleManage = async () => {
    if (user.plan !== 'pro') {
      router.push('/#pricing');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/stripe/billing-portal', { method: 'POST' });
      if (!res.ok) {
        toast.error('Профиль Stripe не найден или ошибка сервера');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Неверный ответ сервера');
        setLoading(false);
      }
    } catch (err) {
      toast.error('Ошибка подключения к серверу');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="settings-card mt-[32px] mb-[100px] overflow-hidden relative">
        {/* Decorative background glow for PRO */}
        {user.plan === 'pro' && (
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 w-full">
            <h2 className="text-2xl font-bold text-white mb-1">
              Подписка и оплата
            </h2>
            <p className="text-zinc-500 text-sm">
              Управляйте вашим тарифным планом и счетами.
            </p>
          </div>

          <div className={`w-full rounded-2xl border p-6 transition-all duration-300 flex flex-col items-center ${
            user.plan === 'pro' 
              ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 shadow-xl shadow-indigo-500/10' 
              : 'bg-white/[0.02] border-white/10'
          }`}>
            <div className="flex flex-col items-center gap-6 w-full max-w-sm">
              <div className="flex flex-col items-center">
                <div className="text-zinc-600 text-xs font-bold uppercase tracking-[0.2em] mb-2">Текущий тариф</div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-white tracking-tight leading-none">
                    {user.plan === 'pro' ? 'PROFESSIONAL' : 'FREE'}
                  </h3>
                </div>
                <div className="mt-2 text-zinc-500 font-medium text-sm">
                  {user.plan === 'pro' ? 'Полный доступ ко всем функциям' : 'Базовый план навсегда'}
                </div>
                
                <div className="mt-6 flex flex-col gap-3 w-full">
                  {user.plan === 'pro' ? (
                    <>
                      <div className="flex items-center justify-center gap-2.5 text-sm text-zinc-400">
                        <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Неограниченно пространств
                      </div>
                      <div className="flex items-center justify-center gap-2.5 text-sm text-zinc-400">
                        <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Все PRO-функции включены
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2.5 text-sm text-zinc-500">
                        <svg className="w-4 h-4 text-zinc-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        До 3 активных пространств
                      </div>
                      <div className="flex items-center justify-center gap-2.5 text-sm text-zinc-500">
                        <svg className="w-4 h-4 text-zinc-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Базовая функциональность
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 w-full">
                <button
                  onClick={handleManage}
                  disabled={loading}
                  className={`relative group overflow-hidden px-8 py-3.5 rounded-xl font-bold text-base transition-all w-full shadow-lg ${
                    user.plan === 'pro'
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-[0.98]'
                  }`}
                >
                  <span className="relative z-10 text-center block">
                    {loading ? 'Загрузка...' : user.plan === 'pro' ? 'Управление подпиской' : 'Перейти на PRO'}
                  </span>
                </button>
                
                {user.plan !== 'pro' && (
                  <p className="text-[10px] text-zinc-600 leading-tight">
                    Безопасная оплата Stripe.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-zinc-500 text-xs">
            <div className="flex items-center gap-4">
              <span className="hover:text-zinc-300 cursor-help transition-colors">Условия использования</span>
              <span className="w-1 h-1 rounded-full bg-zinc-800" />
              <span className="hover:text-zinc-300 cursor-help transition-colors">Поддержка</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
