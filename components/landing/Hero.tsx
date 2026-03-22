'use client';

import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="w-full max-w-5xl flex flex-col items-center text-center">
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 leading-[1.1] select-none">
        Создавайте продукты,<br />
        которые <span className="text-indigo-400 pulse-text">любят</span>
      </h1>

      <div className="flex flex-col items-center w-full max-w-3xl mb-16 mx-auto">
        <p style={{ marginTop: '10px' }} className="text-xl md:text-2xl text-zinc-400 leading-relaxed font-medium text-center">
          Современная платформа для сбора обратной связи, отслеживания идей и управления развитием ваших проектов в реальном времени.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 hero-buttons-wrapper">
        <Link
          href="/auth/login"
          className="btn btn-primary !px-12 !py-5 !text-xl h-auto !rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all outline-none border-none font-bold"
        >
          Начать бесплатно
        </Link>
        <Link
          href="#demo-preview"
          className="btn btn-ghost !px-12 !py-5 !text-xl h-auto !rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all outline-none font-bold"
        >
          Посмотреть демо
        </Link>
      </div>
    </div>
  );
}
