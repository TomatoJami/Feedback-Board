'use client';

import React from 'react';

import Reveal from '@/components/ui/Reveal';

export default function ContactCards() {
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
  );
}
