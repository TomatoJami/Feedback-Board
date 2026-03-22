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

export default function Pricing({ showFree = true }: { showFree?: boolean }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { user } = useAuth();
  const router = useRouter();
  const [loadingPrice, setLoadingPrice] = useState<string | null>(null);

  const plansToShow = showFree ? PRICING_PLANS : PRICING_PLANS.filter(p => p.name !== 'Free');

  const handleCheckout = async (planName: string) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (planName === 'Free') {
      router.push('/');
      return;
    }

    console.log('--- Checkout Debug ---');
    console.log('User:', user?.id);
    console.log('Plan Name:', planName);
    console.log('Billing Cycle:', billingCycle);

    setLoadingPrice(planName);
    try {
      const priceId = billingCycle === 'monthly' 
        ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID;

      console.log('Resolved Price ID:', priceId);

      if (!priceId) {
        console.error('CRITICAL: Price ID is missing!');
        toast.error('Stripe Price ID не настроен');
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

      <div className={`grid grid-cols-1 ${plansToShow.length > 1 ? 'md:grid-cols-2 max-w-5xl' : 'max-w-lg'} gap-x-8 gap-y-6 mx-auto mb-16 items-stretch`}>
        {plansToShow.length > 1 && <div className="hidden md:block h-px"></div>}
        <div className={`flex justify-center relative z-30 mb-8`}>
          <div
            style={{ width: '230px', padding: '3px' }}
            className="relative rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl flex items-center shadow-2xl overflow-hidden"
          >
            <div
              className="absolute inset-y-[3px] transition-all duration-300 ease-out bg-indigo-500/20 border border-indigo-500/30 rounded-xl"
              style={{
                width: 'calc(50% - 3px)',
                left: billingCycle === 'monthly' ? '3px' : 'calc(50%)',
              }}
            />
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative z-10 flex-1 py-1.5 text-[13px] font-black uppercase tracking-widest transition-colors duration-200 ${billingCycle === 'monthly' ? 'text-white' : 'text-white/40 hover:text-white/60'
                }`}
            >
              Месяц
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative z-10 flex-1 py-1.5 text-[13px] font-black uppercase tracking-widest transition-colors duration-200 ${billingCycle === 'yearly' ? 'text-white' : 'text-white/40 hover:text-white/60'
                }`}
            >
              Год
              <span className="ml-1 text-[10px] text-indigo-400 font-bold">-20%</span>
            </button>
          </div>
        </div>

        {plansToShow.map((plan) => (
          <div
            key={plan.name}
            className={`group relative flex flex-col p-8 rounded-3xl transition-all duration-500 hover:scale-[1.02] ${plan.popular
              ? 'bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(79,70,229,0.2)]'
              : 'bg-white/[0.02] border border-white/5 hover:border-white/10'
              }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 rounded-full text-[10px] font-bold tracking-widest uppercase text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                Популярный
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{plan.name}</h3>
              <p className="text-sm text-white/50 leading-relaxed font-light">{plan.description}</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tight group-hover:scale-110 transition-transform duration-500 block text-white">
                ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
              </span>
              <span className="text-white/30 text-sm font-medium">/мес</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-sm text-white/70 group/item">
                  <div className="mr-3 p-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 group-hover/item:bg-indigo-500/20 transition-colors">
                    <CheckIcon className="w-3 h-3 text-indigo-400" />
                  </div>
                  <span className="font-light">{feature}</span>
                </li>
              ))}
            </ul>

            {user?.plan === plan.name.toLowerCase() ? (
              <div className="w-full py-4 rounded-2xl bg-white/[0.05] border border-white/10 text-center text-sm font-medium text-white/40">
                Текущий план
              </div>
            ) : (
              <button
                onClick={() => handleCheckout(plan.name)}
                disabled={loadingPrice === plan.name}
                className={`relative w-full py-4 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden active:scale-95 disabled:opacity-50 ${plan.popular
                  ? 'bg-indigo-500 text-white shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(79,70,229,0.6)]'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                  }`}
              >
                <span className="relative z-10 block text-center">
                  {loadingPrice === plan.name ? 'Загрузка...' : plan.cta}
                </span>
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                )}
              </button>
            )}

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
