'use client';

import { motion } from 'framer-motion';
import { Search, Sparkles, Send, ArrowRight } from 'lucide-react';
import { COPY_V3 } from '@/lib/landing/copy-v3';
import { slideUp, staggerContainer } from '@/lib/landing/motion';
import Link from 'next/link';

const { howItWorks } = COPY_V3;

const STEP_ICONS = [Search, Sparkles, Send];

const STEP_COLORS = [
  {
    icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    number: 'bg-blue-600 dark:bg-blue-500 text-white',
    connector: 'from-blue-400 to-amber-400 dark:from-blue-500 dark:to-amber-500',
  },
  {
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    number: 'bg-amber-500 dark:bg-amber-500 text-white',
    connector: 'from-amber-400 to-emerald-400 dark:from-amber-500 dark:to-emerald-500',
  },
  {
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    number: 'bg-emerald-600 dark:bg-emerald-500 text-white',
    connector: '',
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-white px-4 py-20 dark:bg-stone-950 md:py-28"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2
            className="mb-3 text-2xl font-bold text-stone-900 dark:text-white md:text-4xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {howItWorks.title}
          </h2>
          <p className="text-base text-stone-500 dark:text-stone-400 md:text-lg">
            {howItWorks.subtitle}
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-8 md:grid-cols-3 md:gap-6"
        >
          {howItWorks.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <motion.div
                key={step.number}
                variants={slideUp}
                className="step-card relative rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700 md:p-8"
              >
                {/* Number badge */}
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-sm ${STEP_COLORS[i].number}`}
                  >
                    {step.number}
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-stone-200 to-transparent dark:from-stone-700" />
                </div>

                {/* Icon */}
                <div
                  className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${STEP_COLORS[i].icon}`}
                >
                  <Icon size={26} strokeWidth={1.8} />
                </div>

                {/* Text */}
                <h3 className="mb-2 text-lg font-semibold text-stone-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                  {step.description}
                </p>

                {/* Connector arrow (desktop only) */}
                {i < 2 && STEP_COLORS[i].connector && (
                  <div className="pointer-events-none absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${STEP_COLORS[i].connector} shadow-sm`}>
                      <ArrowRight size={14} className="text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0E3A8C] transition-colors hover:text-[#0E3A8C]/80 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {howItWorks.cta}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
