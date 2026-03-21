import React from 'react';

export default function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-7xl mx-auto text-center px-6">
      <div className="group flex flex-col items-center py-10 px-10 rounded-[40px] bg-white/[0.02] border border-white/5 border-t-white/10 border-l-white/5 backdrop-blur-lg hover:bg-white/[0.04] hover:border-indigo-500/40 hover:border-t-indigo-400/50 transition-all duration-700 hover:-translate-y-2 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        {/* Specular highlight gradient - very faint by default, pops on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        {/* Animated shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
        
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
        </div>
        <h3 className="relative z-10 text-2xl font-bold text-white mb-4 tracking-tight">Сбор идей</h3>
        <p className="relative z-10 text-zinc-400 leading-relaxed text-base font-medium">Все предложения в одном организованном пространстве.</p>
      </div>

      <div className="group flex flex-col items-center py-10 px-10 rounded-[40px] bg-white/[0.02] border border-white/5 border-t-white/10 border-l-white/5 backdrop-blur-lg hover:bg-white/[0.04] hover:border-purple-500/40 hover:border-t-purple-400/50 transition-all duration-700 hover:-translate-y-2 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
        
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-500">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
        </div>
        <h3 className="relative z-10 text-2xl font-bold text-white mb-4 tracking-tight">Roadmap</h3>
        <p className="relative z-10 text-zinc-400 leading-relaxed text-base font-medium">Визуализируйте прогресс и показывайте планы вашим пользователям.</p>
      </div>

      <div className="group flex flex-col items-center py-10 px-10 rounded-[40px] bg-white/[0.02] border border-white/5 border-t-white/10 border-l-white/5 backdrop-blur-lg hover:bg-white/[0.04] hover:border-emerald-500/40 hover:border-t-emerald-400/50 transition-all duration-700 hover:-translate-y-2 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
        
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><path d="M20 8v6M23 11h-6" /></svg>
        </div>
        <h3 className="relative z-10 text-2xl font-bold text-white mb-4 tracking-tight">Префиксы</h3>
        <p className="relative z-10 text-zinc-400 leading-relaxed text-base font-medium">Используйте кастомные роли и брендирование для вашей команды.</p>
      </div>
    </div>
  );
}
