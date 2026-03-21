'use client';

import React from 'react';
import Reveal from '@/components/ui/Reveal';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Создайте доску',
      desc: 'Зарегистрируйтесь и настройте ваше первое пространство за пару минут. Никакого сложного онбординга.',
    },
    {
      num: '02',
      title: 'Поделитесь ссылкой',
      desc: 'Пригласите вашу аудиторию или команду, дав им прямую ссылку на публичную доску.',
    },
    {
      num: '03',
      title: 'Собирайте идеи',
      desc: 'Позвольте пользователям голосовать, общаться в комментариях и подсказывать, что развивать дальше.',
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-16 px-6 relative z-10">
      <Reveal>
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">
            Как это <span className="text-indigo-400">работает</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Три простых шага, чтобы начать управлять фидбеком системно, а не искать его в разрозненных чатах.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {steps.map((step, i) => (
          <Reveal key={step.num} delay={i * 0.1}>
            <div className="relative p-8 md:p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-indigo-500/20 hover:-translate-y-2 transition-all duration-700 h-full flex flex-col items-start text-left group shadow-lg">
              <div className="text-5xl font-black text-indigo-500/20 mb-8 group-hover:text-indigo-400/40 transition-colors uppercase tracking-widest">
                {step.num}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{step.title}</h3>
              <p className="text-zinc-400 leading-relaxed font-medium">
                {step.desc}
              </p>
              <div className="absolute top-8 right-8 w-16 h-16 bg-indigo-500/0 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-1000 pointer-events-none" />
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
