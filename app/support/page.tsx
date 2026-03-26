'use client';

import React from 'react';

import ContactCards from '@/components/landing/ContactCards';
import LandingPageWrapper from '@/components/landing/LandingPageWrapper';
import PageHeader from '@/components/landing/PageHeader';
import SupportFAQ from '@/components/landing/SupportFAQ';

export default function SupportPage() {
  return (
    <LandingPageWrapper glowColor="bg-purple-500/5" glowPosition="middle">
      <PageHeader 
        centered
        title={
          <>Центр <span className="text-indigo-400">поддержки</span></>
        }
        description="Мы здесь, чтобы помочь вам извлечь максимум пользы из нашей платформы. Выберите удобный способ связи или обратитесь к FAQ."
      />
      <ContactCards />
      <SupportFAQ />
    </LandingPageWrapper>
  );
}
