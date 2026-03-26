'use client';

import React from 'react';

import DemoNotice from '@/components/landing/DemoNotice';
import LandingPageWrapper from '@/components/landing/LandingPageWrapper';
import LegalSectionList from '@/components/landing/LegalSectionList';
import PageHeader from '@/components/landing/PageHeader';

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
      <PageHeader 
        title={
          <>Условия <span className="text-indigo-400">использования</span></>
        }
        description="Последнее обновление: 26 марта 2026"
      />
      <LegalSectionList sections={sections} />
      <DemoNotice />
    </LandingPageWrapper>
  );
}
