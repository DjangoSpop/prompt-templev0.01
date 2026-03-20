'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { COPY_V3 } from '@/lib/landing/copy-v3';
import { slideUp, staggerContainer } from '@/lib/landing/motion';
import { useCountUp } from '../v2/hooks/useCountUp';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';

const { social } = COPY_V3;

function StatItem({ stat }: { stat: (typeof social.stats)[number] }) {
  const isDecimal = 'isDecimal' in stat && stat.isDecimal;
  const [ref, displayValue] = useCountUp(stat.value, 1.5, stat.suffix);

  return (
    <div className="text-center">
      <span
        ref={ref}
        className="block text-3xl font-bold text-white md:text-4xl"
      >
        {isDecimal ? stat.value + stat.suffix : displayValue}
      </span>
      <span className="mt-1 block text-sm text-white/70">{stat.label}</span>
    </div>
  );
}

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof social.testimonials)[number];
}) {
  return (
    <motion.div
      variants={slideUp}
      className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-800/50"
    >
      {/* Stars */}
      <div className="mb-4 flex gap-0.5">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className="fill-[#CBA135] text-[#CBA135] dark:fill-[#E9C25A] dark:text-[#E9C25A]"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="mb-4 text-sm italic leading-relaxed text-stone-700 dark:text-stone-300">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0E3A8C] to-[#1a4fa0] text-sm font-bold text-white shadow-sm">
          {testimonial.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
            {testimonial.name}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {testimonial.role}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function SocialProofSection() {
  const sectionTracked = useRef(false);

  return (
    <motion.section
      className="relative overflow-hidden bg-stone-50 px-4 py-16 dark:bg-stone-900/50 md:py-24"
      onViewportEnter={() => {
        if (!sectionTracked.current) {
          trackLanding(LANDING_EVENTS.SOCIAL_PROOF_VIEWED);
          sectionTracked.current = true;
        }
      }}
      viewport={{ once: true, margin: '-100px' }}
    >
      {/* Stats bar */}
      <div className="mx-auto mb-16 max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E3A8C] to-[#1a4fa0] px-6 py-10 shadow-xl dark:from-[#0E3A8C]/90 dark:to-[#1a4fa0]/90">
        <h2
          className="mb-8 text-center text-xl font-bold text-white md:text-2xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {social.title}
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {social.stats.map((stat, i) => (
            <StatItem key={i} stat={stat} />
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="mx-auto max-w-5xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {social.testimonials.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} />
          ))}
        </motion.div>

        {/* Trust strip */}
        <p className="mt-10 text-center text-sm text-stone-500 dark:text-stone-500">
          {social.trustStrip}
        </p>
      </div>
    </motion.section>
  );
}

export default SocialProofSection;
