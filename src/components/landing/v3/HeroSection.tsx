'use client';

import { motion } from 'framer-motion';
import { COPY_V3 } from '@/lib/landing/copy-v3';
import { slideUp, fadeIn } from '@/lib/landing/motion';
import { GradientButton } from '../shared/GradientButton';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { BeforeAfterDemo } from './BeforeAfterDemo';
import { EnhancedFloatingParticles } from '@/components/animations/EnhancedFloatingParticles';
import DownloadHero from '@/components/DownloadHero';
import { TryMeButton } from '@/components/try-me/TryMeButton';

const { hero } = COPY_V3;

export function HeroSection() {
  return (
    <section
      id="hero-section"
      className="relative min-h-[92vh] overflow-hidden px-4 pb-20 pt-32 md:pb-28 md:pt-40"
      style={{
        background: 'linear-gradient(180deg, #fdf8f0 0%, #f5efe3 60%, #ede4d3 100%)',
      }}
    >
      {/* Dark mode background override */}
      <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{ background: 'linear-gradient(180deg, #0E0F12 0%, #131620 60%, #0E0F12 100%)' }} />

      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #d4a853 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Floating particles — subtle brand accents */}
      <EnhancedFloatingParticles
        count={8}
        interactive={false}
        colors={['#CBA135', '#d4af37', '#0E3A8C', '#E9C25A']}
        size={{ min: 2, max: 4 }}
        speed={{ min: 6, max: 12 }}
        className="opacity-25 dark:opacity-15"
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
        {/* Left: Message */}
        <div>
          {/* Trust pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2 dark:border-amber-500/15 dark:bg-amber-500/10"
          >
            <span className="text-sm text-[#CBA135]">⚡</span>
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400 md:text-sm">
              {hero.pill}
            </span>
          
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="mb-6 text-3xl font-bold leading-[1.15] tracking-tight text-stone-900 dark:text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {hero.headline}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={slideUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="mb-8 max-w-lg text-base leading-relaxed text-stone-600 dark:text-stone-400 md:text-lg"
          >
            {hero.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="mb-8 flex flex-col gap-3 sm:flex-row"
          >
            <GradientButton
              href="/auth/register"
              size="lg"
              onClick={() =>
                trackLanding(LANDING_EVENTS.HERO_CTA_CLICK, { cta: 'primary' })
              }
            >
              {hero.ctaPrimary}
            </GradientButton>
            <GradientButton
              href="#how-it-works"
              size="lg"
              variant="outlined"
            >
              {hero.ctaSecondary}
            </GradientButton>
          </motion.div>

          {/* Platform strip */}
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="text-sm text-stone-500 dark:text-stone-500"
          >
            {hero.platformsLabel}
          </motion.p>
        </div>

        {/* Right: Before/After Demo */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.35 }}
          className="relative"
        >
          <BeforeAfterDemo />
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
