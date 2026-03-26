'use client';

import React, { useState } from 'react';

import Reveal from '@/components/ui/Reveal';

function SupportFAQItem({ 
  question, 
  answer, 
  delay, 
  isOpen, 
  onToggle 
}: { 
  question: string, 
  answer: string, 
  delay: number, 
  isOpen: boolean, 
  onToggle: () => void 
}) {
  return (
    <Reveal delay={0.1 + delay}>
      <div 
        className={`group rounded-[32px] border transition-all duration-500 overflow-hidden ${
          isOpen 
            ? 'bg-white/[0.04] border-indigo-500/30 shadow-2xl shadow-indigo-500/5' 
            : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
        }`}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between text-left p-6 md:p-8 transition-all"
        >
          <span className={`text-lg font-bold transition-all duration-300 truncate pr-4 ${isOpen ? 'text-indigo-400' : 'text-white/90'}`}>
            {question}
          </span>
          <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${
            isOpen 
              ? 'bg-indigo-500 text-white rotate-180 shadow-lg shadow-indigo-500/40' 
              : 'bg-white/5 text-zinc-500 group-hover:bg-white/10 group-hover:text-zinc-300'
          }`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </button>
        <div 
          className={`transition-all duration-500 ease-in-out ${
            isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 md:px-8 pb-8 pt-0 border-t border-white/5 mt-0">
            <p className="text-zinc-400 leading-relaxed pt-6">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function SupportFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Как сменить тарифный план?",
      answer: "Вы можете сделать это в настройках вашего пространства в разделе «Подписка». Все изменения вступят в силу немедленно."
    },
    {
      question: "Как экспортировать данные?",
      answer: "Export в CSV доступен для всех владельцев пространств. Зайдите в раздел «Аналитика» и нажмите «Экспорт»."
    },
    {
      question: "Это бесплатно?",
      answer: "Да, базовый функционал платформы абсолютно бесплатен. Вы можете создать свой борд, собирать бесконечное количество идей и приглашать пользователей прямо сейчас."
    },
    {
      question: "Кому это полезно?",
      answer: "Платформа идеально подходит для продакт-менеджеров, разработчиков, дизайнеров и всех, кто хочет слышать своих пользователей и строить roadmap на основе реальных данных, а не догадок."
    },
    {
      question: "Можно ли кастомизировать борд?",
      answer: "Да, вы можете полностью настроить борд под свои нужды: создавать собственные категории с иконками, управлять статусами и их цветами, добавлять уникальные префиксы для участников и выбирать между публичным или приватным доступом к вашему пространству."
    },
    {
      question: "Как управлять доступом и ролями?",
      answer: "Вы можете создавать как публичные борды для свободного сбора идей, так и полностью закрытые приватные пространства с модераторами и администраторами."
    }
  ];

  return (
    <div className="space-y-12 mb-24">
      <Reveal delay={0.1}>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight text-center mb-16">
          Часто задаваемые вопросы
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-start">
        {faqs.map((faq, index) => (
          <SupportFAQItem 
            key={index}
            question={faq.question}
            answer={faq.answer}
            delay={index * 0.05}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
}
