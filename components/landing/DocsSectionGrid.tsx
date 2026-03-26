'use client';

import Link from 'next/link';
import React from 'react';

import Reveal from '@/components/ui/Reveal';

export default function DocsSectionGrid() {
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
  );
}
