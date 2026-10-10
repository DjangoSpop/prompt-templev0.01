'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { COPY_V3 } from '@/lib/landing/copy-v3';
import { LANDING_EVENTS, trackLanding } from '@/lib/landing/analytics';
import { slideUp, staggerContainer } from '@/lib/landing/motion';

const { useCases } = COPY_V3;

export function UseCasesSection() {
  return (
    <section className="bg-white px-4 py-20 dark:bg-stone-950 md:py-28">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <h2
            className="mb-3 text-2xl font-bold text-stone-900 dark:text-white md:text-4xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {useCases.title}
          </h2>
          <p className="text-base text-stone-500 dark:text-stone-400 md:text-lg">
            {useCases.subtitle}
          </p>
        </div>

        {/* Role cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-5"
        >
          {useCases.roles.map((item) => {
            const href = `/discover?category=${encodeURIComponent(item.category)}&curated=true`;
            return (
              <motion.div key={item.role} variants={slideUp}>
                <Link
                  href={href}
                  onClick={() =>
                    trackLanding(LANDING_EVENTS.LIBRARY_CARD_CLICK, {
                      section: 'use_cases',
                      label: item.role,
                      href,
                    })
                  }
                  className="group block h-full rounded-xl border border-stone-200 bg-stone-50 p-4 text-center transition-all duration-200 hover:border-amber-400/40 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-stone-800 dark:bg-stone-900 dark:hover:border-amber-500/30 dark:hover:bg-stone-800 dark:focus-visible:ring-offset-stone-950 md:p-5"
                >
                  <span className="mb-2 block text-2xl">{item.emoji}</span>
                  <p className="mb-1 text-sm font-semibold text-stone-900 dark:text-white">
                    {item.role}
                  </p>
                  <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                    {item.benefit}
                  </p>
                  <span className="mt-2 block text-[11px] font-semibold text-amber-600 transition-opacity duration-200 dark:text-amber-400 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                    {useCases.cta}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default UseCasesSection;
