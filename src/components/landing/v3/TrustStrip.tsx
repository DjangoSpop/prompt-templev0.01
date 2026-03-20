'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { staggerContainer, fadeIn } from '@/lib/landing/motion';

const PLATFORMS = [
  { name: 'ChatGPT', logo: '/logos/chatgpt.svg' },
  { name: 'Claude', logo: '/logos/claude.svg' },
  { name: 'Gemini', logo: '/logos/gemini.svg' },
  { name: 'Perplexity', logo: '/logos/perplexity.svg' },
  { name: 'Copilot', logo: '/logos/copilot.svg' },
];

export function TrustStrip() {
  return (
    <section className="border-b border-t border-stone-200/80 bg-stone-50/80 px-4 py-7 dark:border-stone-800 dark:bg-stone-900/50">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-30px' }}
        className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4"
      >
        <motion.span
          variants={fadeIn}
          className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500"
        >
          Works with
        </motion.span>

        {PLATFORMS.map((platform) => (
          <motion.div
            key={platform.name}
            variants={fadeIn}
            className="group flex items-center gap-2 opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
          >
            <Image
              src={platform.logo}
              alt={platform.name}
              width={20}
              height={20}
              className="dark:invert dark:brightness-200"
            />
            <span className="text-sm font-medium text-stone-500 transition-colors group-hover:text-stone-800 dark:text-stone-500 dark:group-hover:text-stone-200">
              {platform.name}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default TrustStrip;
