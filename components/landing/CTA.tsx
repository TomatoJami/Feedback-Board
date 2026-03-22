import Link from 'next/link';
import React from 'react';

export default function CTA() {
  return (
    <div className="w-full max-w-5xl mx-auto p-10 md:p-12 rounded-[48px] bg-white/[0.03] border border-indigo-500/20 backdrop-blur-3xl text-center relative overflow-hidden shadow-2xl shadow-indigo-500/5 group hover:bg-white/[0.05] hover:border-indigo-500/40 transition-all duration-500 hover:-translate-y-2">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/10 transition-all duration-700" />

      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter leading-tight" style={{ marginTop: '0', textAlign: 'center' }}>
          Готовы услышать ваших<br />
          <span className="text-indigo-400">пользователей?</span>
        </h2>
        <p className="text-lg md:text-xl text-zinc-400 mb-16 max-w-xl mx-auto leading-relaxed" style={{ textAlign: 'center' }}>
          Начните развивать свой продукт системно, основываясь на реальной обратной связи от вашей целевой аудитории.
        </p>
        <Link
          href="/auth/register"
          className="btn btn-primary !px-12 !py-4 !text-xl h-auto !rounded-3xl shadow-2xl shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all outline-none border-none font-black"
          style={{ marginTop: '16px', marginBottom: '8px' }}
        >
          Начать сейчас
        </Link>
      </div>
    </div>
  );
}
