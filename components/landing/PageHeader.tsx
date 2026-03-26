'use client';

import React from 'react';

import Reveal from '@/components/ui/Reveal';

interface PageHeaderProps {
  title: string | React.ReactNode;
  description: string;
  centered?: boolean;
}

export default function PageHeader({ title, description, centered = false }: PageHeaderProps) {
  return (
    <Reveal>
      <div className={centered ? 'text-center mb-16' : 'mb-12'}>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
          {title}
        </h1>
        <p className={`text-zinc-400 text-lg md:text-xl leading-relaxed ${centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
          {description}
        </p>
      </div>
    </Reveal>
  );
}
