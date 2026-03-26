'use client';

import React from 'react';

import DocsSectionGrid from '@/components/landing/DocsSectionGrid';
import LandingPageWrapper from '@/components/landing/LandingPageWrapper';
import PageHeader from '@/components/landing/PageHeader';
import SupportCTA from '@/components/landing/SupportCTA';

export default function DocsPage() {
  return (
    <LandingPageWrapper glowPosition="top">
      <PageHeader 
        title="Документация"
        description="Все, что вам нужно знать для эффективного управления обратной связью с помощью нашей платформы."
      />
      <DocsSectionGrid />
      <SupportCTA />
    </LandingPageWrapper>
  );
}
