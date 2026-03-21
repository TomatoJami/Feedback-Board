'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-black/40 border-t border-white/5 pt-8 pb-0 relative z-10 backdrop-blur-2xl">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-10">
          <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed font-medium max-w-3xl opacity-40 select-none italic">
            "Современная платформа для сбора и управления обратной связью. Помогаем продуктам расти вместе с пользователями."
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <h4 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em] opacity-30">Продукт</h4>
            <ul className="space-y-2">
              <li><Link href="#demo-preview" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors relative group w-fit block">Функции<span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-500 group-hover:w-full transition-all duration-300"></span></Link></li>
              <li><Link href="#pricing" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors relative group w-fit block">Цены<span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-500 group-hover:w-full transition-all duration-300"></span></Link></li>
              <li><Link href="/auth/register" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors relative group w-fit block">Бета-тест<span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-500 group-hover:w-full transition-all duration-300"></span></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em] opacity-30">Ресурсы</h4>
            <ul className="space-y-2">
              <li><Link href="#faq" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors relative group w-fit block">FAQ<span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-500 group-hover:w-full transition-all duration-300"></span></Link></li>
              <li><Link href="/auth/login" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors relative group w-fit block">Документация<span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-500 group-hover:w-full transition-all duration-300"></span></Link></li>
              <li><Link href="/auth/login" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors relative group w-fit block">Поддержка<span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-500 group-hover:w-full transition-all duration-300"></span></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em] opacity-30">Технологии</h4>
            <ul className="space-y-2">
              <li><span className="text-zinc-600 text-sm font-medium block">Next.js 15</span></li>
              <li><span className="text-zinc-600 text-sm font-medium block">PocketBase</span></li>
              <li><span className="text-zinc-600 text-sm font-medium block">Tailwind CSS</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em] opacity-30">Право</h4>
            <ul className="space-y-2">
              <li><Link href="/auth/register" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors relative group w-fit block">Privacy<span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-500 group-hover:w-full transition-all duration-300"></span></Link></li>
              <li><Link href="/auth/register" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors relative group w-fit block">Terms<span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-500 group-hover:w-full transition-all duration-300"></span></Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.03] flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-[0.3em] opacity-40">
              © {new Date().getFullYear()} TomatoJami & Valgur. All rights reserved.
            </p>
            <a 
              href="https://github.com/TomatoJami/Feedback-Board" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm font-medium transition-colors group opacity-40 hover:opacity-100 mt-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.011-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.04 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              GitHub
            </a>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest opacity-20 select-none">
            Сделано с <span className="text-indigo-500/50">❤️</span> для будущего
          </div>
        </div>
      </div>
    </footer>
  );
}
