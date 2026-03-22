'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { CheckIcon } from '@heroicons/react/20/solid';
import Badge from '@/components/ui/Badge';

const PRICING_PLANS = [
  {
    name: 'Free',
    monthlyPrice: '0',
    yearlyPrice: '0',
    description: 'Идеально для небольших проектов и пет-проектов.',
    features: [
      '1 активное пространство',
      'Публичные доски обратной связи',
      'Неограниченно предложений',
      'Базовая кастомизация',
      'Дружное сообщество'
    ],
    cta: 'Начать бесплатно',
    href: '/auth/register',
    popular: false,
  },
  {
    name: 'Pro',
    monthlyPrice: '5',
    yearlyPrice: '4',
    description: 'Для растущих продуктов и команд, которым важен контроль.',
    features: [
      'Неограниченно пространств',
      'Приватные доски (по ссылке)',
      'Кастомные префиксы и роли',
      'Продвинутая аналитика (скоро)',
      'Приоритетная поддержка',
    ],
    cta: 'Стать Pro',
    href: '/auth/register',
    popular: true,
  }
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { user } = useAuth();
  const router = useRouter();
  const [loadingPrice, setLoadingPrice] = useState<string | null>(null);

  const handleCheckout = async (planName: string) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (planName === 'Free') {
      router.push('/');
      return;
    }

    setLoadingPrice(planName);
    try {
      const priceId = billingCycle === 'monthly' 
        ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID;

      if (!priceId) {
        toast.error('Stripe Price ID не настроен в .env.local');
        setLoadingPrice(null);
        return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) {
        toast.error('Ошибка создания сессии оплаты');
        setLoadingPrice(null);
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Неверный ответ сервера');
      }
    } catch (err) {
      console.error(err);
      toast.error('Ошибка подключения к серверу оплаты');
    } finally {
      setLoadingPrice(null);
    }
  };

  return (
    <div id="pricing" className="w-full max-w-6xl mx-auto relative z-10 px-6 group/section">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="flex flex-col items-center text-center mb-16 relative z-20">
        <Badge 
          variant="indigo" 
          size="xl" 
          showDot 
          style={{ marginBottom: '24px' }}
        >
          Тарифные планы
        </Badge>
        
        <h2 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-tight">
          Инструменты для <span className="text-indigo-400">роста</span>
        </h2>
        
        <p 
          style={{ 
            textAlign: 'center', 
            marginBottom: '0px', 
            marginTop: '0px', 
            marginLeft: 'auto', 
            marginRight: 'auto',
            display: 'block',
            width: '100%',
            maxWidth: '42rem',
            color: '#a1a1aa'
          }}
          className="text-xl leading-relaxed px-6"
        >
          Начните бесплатно и расширяйтесь по мере роста вашего продукта.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 max-w-5xl mx-auto mb-16 items-stretch">
        {/* Row for Toggle (Desktop only alignment or specific mobile placement) */}
        <div className="hidden md:block h-px"></div>
        <div className="flex justify-center relative z-30">
          <div
            style={{ width: '230px', padding: '3px' }}
            className="relative rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl flex items-center shadow-2xl overflow-hidden"
          >
            {/* Sliding Background Indicator - Now with 100% Inline Styles for reliability */}
            <div
              style={{
                position: 'absolute',
                top: '3px',
                bottom: '3px',
                width: '112px',
                left: billingCycle === 'monthly' ? '3px' : '115px',
                transition: 'all 500ms cubic-bezier(0.19,1,0.22,1)',
                zIndex: 5
              }}
              className="rounded-xl bg-indigo-500 shadow-[0_4px_20px_rgba(99,102,241,0.4)]"
            />

            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 relative z-10 py-1.5 text-[13px] font-black uppercase tracking-widest !leading-none transition-colors duration-300 ${billingCycle === 'monthly' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              Месяц
            </button>

            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 relative z-10 py-1.5 text-[13px] font-black uppercase tracking-widest !leading-none transition-colors duration-300 flex items-center justify-center gap-2 ${billingCycle === 'yearly' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              Год
              <span className={`text-[10px] px-2 py-0.5 rounded-full border border-white/10 font-black transition-all ${billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                -20%
              </span>
            </button>
          </div>
        </div>

        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.name}
            style={{ padding: '40px 32px' }}
            className={`relative rounded-[48px] border transition-all duration-700 overflow-hidden group flex flex-col min-h-[500px] ${plan.popular
                ? 'bg-white/[0.03] border-indigo-500/40 shadow-[0_0_80px_-20px_rgba(99,102,241,0.2)] z-20 hover:scale-[1.01]'
                : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02] hover:border-white/10 z-10 hover:scale-[1.01]'
              }`}
          >
            {/* Glossy Overlay for Pro */}
            {plan.popular && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            )}

            {plan.popular && (
              <div className="absolute top-12 right-12 z-30">
                <Badge variant="indigo" size="md">Самый популярный</Badge>
              </div>
            )}

            <div className="mb-3 relative z-10 flex flex-col items-start">
              <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-zinc-500 text-2xl font-bold">$</span>
                <span className="text-7xl font-black text-white tracking-tighter">
                  {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                </span>
                <span className="text-zinc-500 font-bold">/мес</span>
              </div>
              <p className="mt-6 text-zinc-500 leading-relaxed font-medium text-lg lg:max-w-sm">
                {plan.description}
              </p>
            </div>

            <ul className="space-y-4 mb-10 flex-1 relative z-10 pl-[10px]">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 group/item">
                  <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${plan.popular ? 'bg-indigo-500/20 text-indigo-400 group-hover/item:bg-indigo-500 group-hover/item:text-white' : 'bg-white/5 text-zinc-600 group-hover/item:bg-white/10 group-hover/item:text-zinc-400'}`}>
                    <CheckIcon className="w-3 h-3" />
                  </div>
                  <span className="text-zinc-500 font-medium text-base group-hover/item:text-white transition-colors">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout(plan.name)}
              disabled={loadingPrice === plan.name}
              className={`btn w-full !py-5 !text-lg !rounded-3xl transition-all duration-500 font-black tracking-tight relative z-20 overflow-hidden group/btn flex items-center justify-center ${plan.popular
                  ? 'btn-primary shadow-2xl shadow-indigo-500/40 hover:scale-[1.05]'
                  : 'btn-ghost border border-white/10 bg-white/5 hover:bg-white/10 hover:scale-[1.02]'
                }`}
            >
              <span className="relative z-10">{loadingPrice === plan.name ? 'Загрузка...' : plan.cta}</span>
              {plan.popular && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              )}
            </button>

            {plan.popular && (
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      {/* Trust Quote / Badge */}
      <div className="text-center pb-7 relative z-30">
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-25 grayscale group-hover/section:grayscale-0 group-hover/section:opacity-50 transition-all duration-1000">
          <span className="text-[10px] sm:text-[11px] font-black text-zinc-500 tracking-[0.3em] uppercase border-b border-white/5 pb-1">SSL SECURE</span>
          <span className="text-[10px] sm:text-[11px] font-black text-zinc-500 tracking-[0.3em] uppercase border-b border-white/5 pb-1">STRIPE INTEGRATED</span>
          <span className="text-[10px] sm:text-[11px] font-black text-zinc-500 tracking-[0.3em] uppercase border-b border-white/5 pb-1">24/7 SUPPORT</span>
        </div>
      </div>
    </div>
  );
}
