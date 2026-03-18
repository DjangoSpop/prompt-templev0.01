'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { COPY } from '@/lib/landing/copy';
import { slideUp, staggerContainer, cardHover } from '@/lib/landing/motion';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { useCountUp } from './hooks/useCountUp';

const { social } = COPY;

function StatItem({ stat }: { stat: (typeof social.stats)[number] }) {
  const numericValue = stat.value;
  const isDecimal = 'isDecimal' in stat && stat.isDecimal;
  const duration = 1.5;

  const [ref, displayValue] = useCountUp(numericValue, duration, stat.suffix);

  return (
    <div className="text-center">
      <span
        ref={ref}
        className="block text-3xl md:text-4xl font-bold text-[#0E3A8C] dark:text-blue-400"
      >
        {isDecimal ? stat.value + stat.suffix : displayValue}
      </span>
      <span className="text-sm text-stone-500 dark:text-stone-400 mt-1 block">
        {stat.label}
      </span>
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
      whileHover={cardHover}
      className="bg-white dark:bg-[#161A22] rounded-xl p-6 border border-sand-200 shadow-sm cursor-default"
    >
      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className="fill-[#CBA135] text-[#CBA135] dark:fill-[#E9C25A] dark:text-[#E9C25A]"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed mb-4 italic">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0E3A8C] to-[#1a4fa0] dark:from-blue-500 dark:to-blue-700 flex items-center justify-center text-white text-sm font-bold">
          {testimonial.initials}
        </div>
        <div>
          <p className="text-stone-800 dark:text-stone-200 font-semibold text-sm">
            {testimonial.name}
          </p>
          <p className="text-stone-500 dark:text-stone-400 text-xs">
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
      className="py-16 md:py-24 px-4 bg-sand-100"
      onViewportEnter={() => {
        if (!sectionTracked.current) {
          trackLanding(LANDING_EVENTS.SOCIAL_PROOF_VIEWED);
          sectionTracked.current = true;
        }
      }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16 py-8 px-6 bg-white dark:bg-[#161A22] rounded-2xl border border-sand-200 shadow-sm">
          {social.stats.map((stat, i) => (
            <StatItem key={i} stat={stat} />
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {social.testimonials.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} />
          ))}
        </motion.div>

        {/* Trust strip */}
        <p className="text-center text-stone-400 dark:text-stone-500 text-sm mt-10">
          {social.trustStrip}
        </p>

        {/* Logo strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          <span className="text-stone-400 dark:text-stone-500 text-xs uppercase tracking-wider">
            {social.logosLabel}
          </span>
          {social.logos.map((name) => (
            <span
              key={name}
              className="text-stone-400 dark:text-stone-500 font-medium text-sm"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default SocialProofSection;
