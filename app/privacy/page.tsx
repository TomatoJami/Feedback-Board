'use client';

import React from 'react';
import LandingPageWrapper from '@/components/landing/LandingPageWrapper';
import DemoNotice from '@/components/landing/DemoNotice';
import Reveal from '@/components/ui/Reveal';

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Сбор информации',
      content: 'Мы собираем только те данные, которые необходимы для предоставления качественного сервиса: email для регистрации, имя пользователя и информацию о созданных вами пространствах. Мы не передаем ваши личные данные третьим лицам.'
    },
    {
      title: '2. Использование данных',
      content: 'Ваш email используется для авторизации, отправки важных уведомлений о статусе ваших предложений и обновлений платформы. Вы можете настроить частоту уведомлений в профиле.'
    },
    {
      title: '3. Безопасность',
      content: 'Мы предпринимаем все необходимые технические меры для защиты вашей информации. Данные хранятся в зашифрованном виде на защищенных серверах.'
    },
    {
      title: '4. Cookies',
      content: 'Мы используем файлы cookie исключительно для поддержания вашей сессии и корректной работы личного кабинета. Мы не используем сторонние трекеры для отслеживания вашего поведения на других сайтах.'
    }
  ];

  return (
    <LandingPageWrapper glowColor="bg-indigo-500/5">
      <Reveal>
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">
            Политика <span className="text-indigo-400">конфиденциальности</span>
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
