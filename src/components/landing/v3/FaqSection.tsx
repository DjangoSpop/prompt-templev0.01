'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COPY_V3 } from '@/lib/landing/copy-v3';

const { faq } = COPY_V3;

export function FaqSection() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="bg-white px-4 py-16 dark:bg-stone-950 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h2
          className="mb-10 text-center text-2xl font-bold text-stone-900 dark:text-white md:text-4xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {faq.title}
        </h2>

        <div className="space-y-3">
          {faq.items.map((item, index) => {
            const expanded = open === index;
            return (
              <div
                key={item.q}
                className={cn(
                  'overflow-hidden rounded-xl border bg-white transition-colors dark:bg-stone-900',
                  expanded
                    ? 'border-amber-300/50 shadow-sm dark:border-amber-500/30'
                    : 'border-stone-200 dark:border-stone-800'
                )}
              >
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`faq-v3-panel-${index}`}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                  onClick={() => setOpen(expanded ? -1 : index)}
                >
                  <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 md:text-base">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200',
                      expanded && 'rotate-180'
                    )}
                  />
                </button>
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      id={`faq-v3-panel-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-stone-100 px-5 py-4 text-sm leading-relaxed text-stone-600 dark:border-stone-800 dark:text-stone-400">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
