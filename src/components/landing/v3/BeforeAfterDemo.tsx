'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import { COPY_V3 } from '@/lib/landing/copy-v3';

const { demo } = COPY_V3;

export function BeforeAfterDemo() {
  const [showAfter, setShowAfter] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAfter(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-white p-1 shadow-[0_0_40px_rgba(212,175,55,0.06)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(212,175,55,0.12)] dark:border-amber-400/15 dark:bg-stone-900">
      {/* Header bar — browser chrome */}
      <div className="flex items-center gap-2 rounded-t-xl bg-stone-50 px-4 py-3 dark:bg-stone-800/80">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500">
            Prompt Temple — AI Enhancement
          </span>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Live Demo</span>
        </span>
      </div>

      <div className="space-y-3 p-4 md:p-5">
        {/* Before */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400">
            {demo.before.label}
          </p>
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800/40 dark:bg-red-900/15">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              &ldquo;{demo.before.text}&rdquo;
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center gap-2 py-1">
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-2 text-[#CBA135] dark:text-[#E9C25A]"
          >
            <ArrowDown size={14} />
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={10} />
              Enhanced by AI
            </span>
            <ArrowDown size={14} />
          </motion.div>
        </div>

        {/* After */}
        <AnimatePresence>
          {showAfter && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {demo.after.label}
              </p>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800/40 dark:bg-emerald-900/15">
                <pre className="max-h-[180px] overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed text-stone-700 dark:text-stone-300">
                  {demo.after.text}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default BeforeAfterDemo;
