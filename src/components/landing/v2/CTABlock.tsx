'use client';

import { motion } from 'framer-motion';
import { GradientButton } from '../shared/GradientButton';
import { fadeIn } from '@/lib/landing/motion';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';

interface CTABlockProps {
  headline: string;
  primaryText: string;
  primaryHref: string;
  secondaryText?: string;
  secondaryHref?: string;
  variant?: 'light' | 'dark';
  sub?: string;
}

export function CTABlock({
  headline,
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
  variant = 'light',
  sub,
}: CTABlockProps) {
  const isDark = variant === 'dark';

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={`py-16 md:py-20 px-4 ${
        isDark
          ? 'bg-gradient-to-r from-[#0E3A8C] to-[#1a4fa0] text-white'
          : 'bg-sand-100 dark:bg-[#14161B]'
      }`}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h3
          className={`text-2xl md:text-3xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-stone-800 dark:text-stone-100'
          }`}
        >
          {headline}
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <GradientButton href={primaryHref} size="lg" onClick={() => trackLanding(LANDING_EVENTS.FINAL_CTA_CLICK, { headline, cta: primaryText })}>
            {primaryText}
          </GradientButton>

          {secondaryText && secondaryHref && (
            <GradientButton href={secondaryHref} size="lg" variant="outlined" onClick={() => trackLanding(LANDING_EVENTS.EXTENSION_CTA_CLICK, { source: 'cta_block' })}>
              {secondaryText}
            </GradientButton>
          )}
        </div>

        {sub && (
          <p
            className={`mt-4 text-sm ${
              isDark ? 'text-white/70' : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {sub}
          </p>
        )}
      </div>
    </motion.section>
  );
}

export default CTABlock;
