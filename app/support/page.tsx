'use client';

import React from 'react';
import LandingPageWrapper from '@/components/landing/LandingPageWrapper';
import Reveal from '@/components/ui/Reveal';
import Link from 'next/link';

export default function SupportPage() {
  const contactOptions = [
    {
      title: 'Email',
      value: 'support@feedback-board.com',
      desc: 'Отвечаем в течение 24 часов в рабочие дни.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Telegram',
      value: '@feedback_support',
      desc: 'Живое общение с нашей командой и сообществом.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
  ];

  return (
    <LandingPageWrapper glowColor="bg-purple-500/5" glowPosition="middle">
      <Reveal>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            Центр <span className="text-indigo-400">поддержки</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Мы здесь, чтобы помочь вам извлечь максимум пользы из нашей платформы. Выберите удобный способ связи или обратитесь к FAQ.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-24">
        {contactOptions.map((option, i) => (
          <Reveal key={option.title} delay={i * 0.1}>
            <div className="relative p-8 md:p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-indigo-500/20 hover:-translate-y-2 transition-all duration-700 flex flex-col items-start gap-4 group shadow-lg overflow-hidden h-full">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                {option.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{option.title}</h3>
                <div className="text-indigo-400 font-medium mb-3">{option.value}</div>
                <p className="text-zinc-500 text-sm">{option.desc}</p>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3}>
        <div className="space-y-12">
          <h2 className="text-3xl font-bold text-white tracking-tight text-center">Часто задаваемые вопросы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white opacity-80">Как сменить тарифный план?</h4>
              <p className="text-zinc-500 leading-relaxed">Вы можете сделать это в настройках вашего пространства в разделе &laquo;Подписка&raquo;. Все изменения вступят в силу немедленно.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white opacity-80">Как экспортировать данные?</h4>
              <p className="text-zinc-500 leading-relaxed">Экспорт в CSV доступен для всех владельцев пространств. Зайдите в раздел &laquo;Аналитика&raquo; и нажмите &laquo;Экспорт&raquo;.</p>
            </div>
          </div>
          <div className="text-center pt-8">
            <Link 
              href="/docs"
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-all inline-flex items-center gap-2 group"
            >
              Все вопросы в документации 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </LandingPageWrapper>
  );
}
