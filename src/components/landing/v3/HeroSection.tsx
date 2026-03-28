'use client';

import { motion } from 'framer-motion';
import { COPY_V3 } from '@/lib/landing/copy-v3';
import { slideUp, fadeIn } from '@/lib/landing/motion';
import { GradientButton } from '../shared/GradientButton';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { BeforeAfterDemo } from './BeforeAfterDemo';
import { EnhancedFloatingParticles } from '@/components/animations/EnhancedFloatingParticles';
import { TryMeButton } from '@/components/try-me/TryMeButton';
import Eyehorus from '@/components/pharaonic/Eyehorus';
import { Sparkles, Search, Globe } from 'lucide-react';

const { hero } = COPY_V3;

const featureIcons: Record<string, React.ReactNode> = {
  optimize: <Sparkles className="h-5 w-5" />,
  seo: <Search className="h-5 w-5" />,
  extension: <Globe className="h-5 w-5" />,
};

export function HeroSection() {
  return (
    <section
      id="hero-section"
      className="relative min-h-[92vh] overflow-hidden px-4 pb-20 pt-32 md:pb-28 md:pt-40"
    >
      {/* Pharaonic dark gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0E0F12 0%, #131620 40%, #1B2B6B 80%, #0E0F12 100%)',
        }}
      />

      {/* Light mode override */}
      <div
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          background:
            'linear-gradient(180deg, #fdf8f0 0%, #f5efe3 40%, #ede4d3 80%, #fdf8f0 100%)',
        }}
      />

      {/* Golden hieroglyphic dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #d4af37 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top golden line — temple threshold */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-[2px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 5%, #d4af37 30%, #ffe066 50%, #d4af37 70%, transparent 95%)',
        }}
      />

      {/* Floating particles — gold & lapis accents */}
      <EnhancedFloatingParticles
        count={12}
        interactive={false}
        colors={['#CBA135', '#d4af37', '#ffe066', '#0E3A8C', '#6CA0FF']}
        size={{ min: 1, max: 4 }}
        speed={{ min: 4, max: 10 }}
        className="opacity-30 dark:opacity-20"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* ── Eye of Horus Centerpiece ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8 flex justify-center"
        >
          <div
            className="relative"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.4))',
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
              style={{
                width: 140,
                height: 140,
                background:
                  'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)',
                animation: 'eoh-outer-glow 4s ease-in-out infinite',
              }}
            />
            <Eyehorus
              size={96}
              variant="hero"
              glow={true}
              glowIntensity="high"
              animated={true}
              speedMultiplier={1.5}
              showLabel={false}
            />
          </div>
        </motion.div>

        {/* ── Main Grid: Copy + Demo ── */}
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Left: Message */}
          <div>
            {/* Trust pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 px-4 py-2 dark:border-amber-400/20"
              style={{
                background:
                  'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(203,161,53,0.04) 100%)',
              }}
            >
              <span className="text-sm text-[#d4af37]">&#x2625;</span>
              <span className="text-xs font-semibold tracking-wide text-stone-600 dark:text-amber-200/80 md:text-sm">
                {hero.pill}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={slideUp}
              initial="hidden"
              animate="visible"
              className="mb-6 text-3xl font-bold leading-[1.12] tracking-tight text-stone-900 dark:text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="block">Your Prompts, Forged in</span>
              <span
                className="block"
                style={{
                  background:
                    'linear-gradient(135deg, #ffe066 0%, #d4af37 40%, #CBA135 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                the Temple of AI.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="mb-8 max-w-lg text-base leading-relaxed text-stone-600 dark:text-stone-300 md:text-lg"
            >
              {hero.subtitle}
            </motion.p>

            {/* CTAs — Primary + Try Me */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <GradientButton
                href="/auth/register"
                size="lg"
                onClick={() =>
                  trackLanding(LANDING_EVENTS.HERO_CTA_CLICK, {
                    cta: 'primary',
                  })
                }
              >
                {hero.ctaPrimary}
              </GradientButton>

              <TryMeButton
                className="!bg-gradient-to-r !from-[#d4af37] !to-[#8B6914] hover:!from-[#ffe066] hover:!to-[#CBA135] !text-[#0E0F12] !font-bold !px-6 !py-3 !rounded-xl !shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                onHeroComplete={true}
              />
            </motion.div>

            {/* Secondary CTA */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.25 }}
              className="mb-8"
            >
              <GradientButton
                href="#how-it-works"
                size="sm"
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
              className="text-sm text-stone-500 dark:text-stone-400"
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

        {/* ── Feature Pillars — Optimizer / SEO / Extension ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 grid gap-4 sm:grid-cols-3"
        >
          {hero.features.map((feat) => (
            <div
              key={feat.icon}
              className="group relative overflow-hidden rounded-2xl border border-amber-500/15 p-6 text-center transition-all duration-300 hover:border-amber-400/40 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] dark:border-amber-400/10"
              style={{
                background:
                  'linear-gradient(135deg, rgba(212,175,55,0.03) 0%, rgba(14,15,18,0.02) 100%)',
              }}
            >
              {/* Icon */}
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors group-hover:border-amber-400/40 group-hover:text-amber-500"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)',
                }}
              >
                {featureIcons[feat.icon]}
              </div>
              <h3
                className="mb-1 text-sm font-bold tracking-wide text-stone-800 dark:text-amber-100"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {feat.label}
              </h3>
              <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                {feat.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
