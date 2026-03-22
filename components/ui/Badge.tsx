import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'indigo' | 'emerald' | 'purple' | 'zinc' | 'rose' | 'amber' | 'sky';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDot?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function Badge({ 
  children, 
  variant = 'indigo', 
  size = 'md', 
  showDot = false,
  className = '',
  style = {}
}: BadgeProps) {
  const variants = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    zinc: 'bg-white/5 border-white/10 text-zinc-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    sky: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1.5',
    md: 'px-2.5 py-1 text-[0.75rem] gap-2',
    lg: 'px-4 py-1.5 text-[0.85rem] gap-2.5',
    xl: 'px-6 py-2.5 text-[1rem] gap-3',
  };

  // Dot sizes
  const dotSizes = {
    sm: 'h-1 w-1',
    md: 'h-1.5 w-1.5',
    lg: 'h-2 w-2',
    xl: 'h-2.5 w-2.5',
  };

  return (
    <div 
      style={style}
      className={`inline-flex !flex-row items-center justify-center whitespace-nowrap rounded-full border font-bold !leading-none shadow-lg backdrop-blur-xl transition-all duration-500 hover:scale-105 cursor-default ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {showDot && (
        <div className={`relative flex ${dotSizes[size]}`}>
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current`}></span>
          <span className={`relative inline-flex rounded-full ${dotSizes[size]} bg-current`}></span>
        </div>
      )}
      {children}
    </div>
  );
}
