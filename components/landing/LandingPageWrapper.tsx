'use client';

import React from 'react';

import LandingFooter from '@/components/landing/Footer';

interface LandingPageWrapperProps {
  children: React.ReactNode;
  glowColor?: string;
  glowPosition?: 'top' | 'middle' | 'bottom';
}

export default function LandingPageWrapper({ 
  children, 
  glowColor = 'bg-indigo-500/5',
  glowPosition = 'top'
}: LandingPageWrapperProps) {
  const glowStyles = {
    top: 'top-[-10%] right-[-10%] w-[70vw] h-[70vw]',
    middle: 'top-[20%] left-[-10%] w-[80vw] h-[80vw]',
    bottom: 'bottom-[-10%] right-[20%] w-[60vw] h-[60vw]'
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start antialiased pt-24">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute ${glowStyles[glowPosition]} ${glowColor} blur-[120px] rounded-full animate-pulse transition-opacity duration-1000`} />
      </div>

      <div className="w-full max-w-5xl px-6 pb-24">
        {children}
      </div>

      <div className="w-full flex flex-col items-center mt-auto">
        <div className="w-full max-w-7xl mx-auto px-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
        <LandingFooter />
      </div>
    </div>
  );
}
