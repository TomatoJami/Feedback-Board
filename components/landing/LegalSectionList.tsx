'use client';

import React from 'react';

import Reveal from '@/components/ui/Reveal';

interface LegalSection {
  title: string;
  content: string;
}

interface LegalSectionListProps {
  sections: LegalSection[];
}

export default function LegalSectionList({ sections }: LegalSectionListProps) {
  return (
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
  );
}
