'use client';

import React, { useState } from 'react';

function FAQItem({ question, answer, isOpen, onToggle }: { question: string, answer: string, isOpen: boolean, onToggle: () => void }) {
  return (
    <div
      className={`group mb-4 rounded-3xl border transition-all duration-500 overflow-hidden ${isOpen
          ? 'bg-white/5 border-indigo-500/20 shadow-2xl shadow-indigo-500/5'
          : 'bg-transparent border-white/5 hover:border-white/10 hover:bg-white/5'
        }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left transition-all"
        style={{ padding: '40px' }}
      >
        <span className={`text-xl md:text-2xl font-bold transition-all duration-300 truncate pr-4 ${isOpen ? 'text-indigo-400' : 'text-white'
          }`}>
          {question}
        </span>
        <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${isOpen
            ? 'bg-indigo-500 text-white rotate-180 shadow-lg shadow-indigo-500/40'
            : 'bg-white/5 text-zinc-500 group-hover:bg-white/10 group-hover:text-zinc-300'
          }`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </button>
      <div
        className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="border-t border-white/5" style={{ padding: '40px' }}>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-3xl">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

const FAQ_DATA = [
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

export default function FAQ() {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  return (
    <div id="faq" className="w-full max-w-4xl mx-auto relative z-10 px-6">
      <h2 className="text-4xl md:text-6xl font-black text-white mb-16 text-center tracking-tighter leading-tight">
        Остались <span className="text-indigo-400">вопросы?</span>
      </h2>
      <div className="flex flex-col gap-2" style={{ marginTop: '16px' }}>
        {FAQ_DATA.map((item, index) => (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openFAQIndex === index}
            onToggle={() => setOpenFAQIndex(openFAQIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
}
