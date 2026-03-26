'use client';

import React from 'react';

import Reveal from '@/components/ui/Reveal';

export default function DemoNotice() {
  return (
    <Reveal delay={0.3}>
      <div className="mt-20 p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 transition-colors">
        <p className="text-zinc-400 italic text-sm text-center leading-relaxed">
          Это демонстрационная страница. В скором времени здесь может всё измениться. Не воспринимайте всё написанное всерьёз.
        </p>
      </div>
    </Reveal>
  );
}
