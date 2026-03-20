'use client';

import { motion } from 'framer-motion';
import { COPY_V3 } from '@/lib/landing/copy-v3';
import { slideUp, staggerContainer } from '@/lib/landing/motion';

const { features } = COPY_V3;

export function FeatureCardsSection() {
  return (
    <section className="bg-stone-50 px-4 py-20 dark:bg-stone-900/50 md:py-28">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <h2
            className="mb-3 text-2xl font-bold text-stone-900 dark:text-white md:text-4xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {features.title}
          </h2>
          <p className="text-base text-stone-500 dark:text-stone-400 md:text-lg">
            {features.subtitle}
          </p>
        </div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-6 sm:grid-cols-2"
        >
          {features.cards.map((card) => (
            <motion.div
              key={card.title}
              variants={slideUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-stone-900/5 dark:border-stone-700 dark:bg-stone-800/50 dark:hover:border-stone-600 dark:hover:shadow-black/20 md:p-8"
            >
              {/* Icon + Tag */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-3xl">{card.icon}</span>
                <span className="rounded-full bg-[#0E3A8C]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0E3A8C] dark:bg-blue-500/10 dark:text-blue-400">
                  {card.tag}
                </span>
              </div>

              {/* Title */}
              <h3 className="mb-2 text-lg font-semibold text-stone-900 dark:text-white">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                {card.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default FeatureCardsSection;
