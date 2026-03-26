'use client';

import React from 'react';
import LandingPageWrapper from '@/components/landing/LandingPageWrapper';
import DemoNotice from '@/components/landing/DemoNotice';
import Reveal from '@/components/ui/Reveal';

export default function TermsPage() {
  const sections = [
    {
      title: '1. Согласие с условиями',
      content: 'Используя платформу Feedback Board, вы соглашаетесь соблюдать настоящие Условия использования. Если вы не согласны с каким-либо из условий, пожалуйста, прекратите использование сервиса.'
    },
    {
      title: '2. Аккаунты пользователей',
      content: 'Вы несете ответственность за безопасность своего пароля и за любые действия, совершаемые под вашим аккаунтом. Мы оставляем за собой право удалять аккаунты, которые нарушают правила платформы.'
    },
    {
      title: '3. Интеллектуальная собственность',
      content: 'Платформа и весь её контент являются собственностью разработчиков. Вы сохраняете права на контент, который создаете (предложения, комментарии), но предоставляете нам право на его отображение в рамках сервиса.'
    },
    {
      title: '4. Ограничение ответственности',
      content: 'Сервис предоставляется &laquo;как есть&raquo;. Мы не гарантируем бесперебойную работу и не несем ответственности за косвенные убытки, возникшие в результате использования платформы.'
    }
  ];

  return (
    <LandingPageWrapper glowColor="bg-indigo-500/5">
      <Reveal>
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">
            Условия <span className="text-indigo-400">использования</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest mb-8">Последнее обновление: 26 марта 2026</p>
        </div>
      </Reveal>

      <div className="space-y-12">
        {sections.map((section, idx) => (
          <Reveal key={section.title} delay={0.05 * idx}>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight">{section.title}</h2>
              <p className="text-zinc-400 leading-relaxed text-base md:text-lg opacity-80">
                {section.content}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <DemoNotice />
    </LandingPageWrapper>
  );
}
