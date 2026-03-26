'use client';

import Link from 'next/link';
import React from 'react';

import Reveal from '@/components/ui/Reveal';

export default function SupportCTA() {
  return (
    <Reveal delay={0.4}>
      <div className="mt-24 p-8 md:p-12 rounded-[40px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-white mb-4">Нужна помощь?</h3>
          <p className="text-zinc-400 mb-8 max-w-xl">
            Если вы не нашли ответ в документации, наша команда поддержки всегда готова помочь вам с любым вопросом.
          </p>
          <Link 
            href="/support"
            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all active:scale-95"
          >
            Связаться с нами
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
