'use client';

import React from 'react';
import LandingPageWrapper from '@/components/landing/LandingPageWrapper';
import Reveal from '@/components/ui/Reveal';
import Link from 'next/link';

export default function DocsPage() {
  const sections = [
    {
      title: 'Начало работы',
      items: [
        { name: 'Быстрый старт', href: '#' },
        { name: 'Установка и настройка', href: '#' },
        { name: 'Создание первого пространства', href: '#' },
      ]
    },
    {
      title: 'Управление фидбеком',
      items: [
        { name: 'Работа с предложениями', href: '#' },
        { name: 'Система тегов и категорий', href: '#' },
        { name: 'Модерация и статусы', href: '#' },
      ]
    },
    {
      title: 'Интеграции',
      items: [
        { name: 'Webhooks', href: '#' },
        { name: 'Slack & Discord', href: '#' },
        { name: 'API Reference', href: '#' },
      ]
    }
  ];

  return (
    <LandingPageWrapper glowPosition="top">
      <Reveal>
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            Документация
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Все, что вам нужно знать для эффективного управления обратной связью с помощью нашей платформы.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((section, idx) => (
          <Reveal key={section.title} delay={0.1 * idx}>
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="text-zinc-500 hover:text-indigo-400 transition-colors text-sm font-medium flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-indigo-500 mr-0 group-hover:mr-2 transition-all duration-300" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

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
    </LandingPageWrapper>
  );
}
