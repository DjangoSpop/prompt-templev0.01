'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { COPY_V3 } from '@/lib/landing/copy-v3';
import { slideUp, fadeIn } from '@/lib/landing/motion';
import { GradientButton } from '../shared/GradientButton';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { EnhancedFloatingParticles } from '@/components/animations/EnhancedFloatingParticles';

const { finalCta } = COPY_V3;

export function FinalCTASection() {
  return (
    <section
      className="relative overflow-hidden px-4 py-20 md:py-28"
      style={{
        background:
          'linear-gradient(135deg, #0E3A8C 0%, #1a4fa0 40%, #0E3A8C 100%)',
      }}
    >
      {/* Dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Subtle particles */}
      <EnhancedFloatingParticles
        count={5}
        interactive={false}
        colors={['#E9C25A', '#FCD34D', '#ffffff']}
        size={{ min: 1, max: 3 }}
        speed={{ min: 8, max: 16 }}
        className="opacity-15"
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.h2
          variants={slideUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-4 text-2xl font-bold text-white md:text-4xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {finalCta.headline}
        </motion.h2>

        <motion.p
          variants={slideUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-8 text-base text-blue-100/80 md:text-lg"
        >
          {finalCta.subtitle}
        </motion.p>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-4"
        >
          <GradientButton
            href="/auth/register"
            size="lg"
            onClick={() =>
              trackLanding(LANDING_EVENTS.HERO_CTA_CLICK, {
                cta: 'final_cta',
              })
            }
          >
            {finalCta.primaryText}
          </GradientButton>

          <Link
            href={finalCta.secondaryHref}
            className="text-sm font-medium text-blue-200/70 transition-colors hover:text-white"
          >
            {finalCta.secondaryText}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCTASection;
