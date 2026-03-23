import React from 'react';

import HomeRouter from '@/components/HomeRouter';
import CTA from '@/components/landing/CTA';
import FAQ from '@/components/landing/FAQ';
import Features from '@/components/landing/Features';
import LandingFooter from '@/components/landing/Footer';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import LivePreview from '@/components/landing/LivePreview';
import Pricing from '@/components/landing/Pricing';
import Reveal from '@/components/ui/Reveal';

/**
 * Root page — Server Component.
 * Landing content is rendered here and passed to HomeRouter as children.
 * HomeRouter (client) decides whether to show Landing or Dashboard based on auth state.
 */
export default function GlobalHome() {
  return (
    <HomeRouter>
      <div className="relative min-h-screen flex flex-col items-center justify-start antialiased">
        <div className="relative z-10 w-full flex flex-col items-center pt-24 pb-16 px-6 gap-16 text-zinc-400">
          <Reveal delay={0.1}><Hero /></Reveal>
          <Reveal delay={0.2}><Features /></Reveal>
          <Reveal delay={0.3}><LivePreview /></Reveal>
          <Reveal delay={0.4}><HowItWorks /></Reveal>
          <Reveal delay={0.5}><Pricing /></Reveal>
          <Reveal delay={0.6}><FAQ /></Reveal>
          <Reveal delay={0.7}><CTA /></Reveal>
        </div>
        <div className="w-full flex flex-col items-center gap-0 relative z-10">
          <div className="w-full max-w-7xl mx-auto px-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
          <LandingFooter />
        </div>
      </div>
    </HomeRouter>
  );
}
