'use client';

import React from 'react';

import DemoNotice from '@/components/landing/DemoNotice';
import LandingPageWrapper from '@/components/landing/LandingPageWrapper';
import LegalSectionList from '@/components/landing/LegalSectionList';
import PageHeader from '@/components/landing/PageHeader';

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
      <PageHeader 
        title={
          <>Политика <span className="text-indigo-400">конфиденциальности</span></>
        }
        description="Последнее обновление: 26 марта 2026"
      />
      <LegalSectionList sections={sections} />
      <DemoNotice />
    </LandingPageWrapper>
  );
}
