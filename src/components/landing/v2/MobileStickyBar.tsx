'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { GradientButton } from '../shared/GradientButton';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import Link from 'next/link';

export function MobileStickyBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('hero-section');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const show = visible && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="landing-sticky fixed bottom-0 left-0 right-0 z-50 md:hidden bg-sand-50/95 dark:bg-[#0E0F12]/95 border-t border-stone-200 dark:border-[#2A2E38] px-4 py-3 rounded-t-xl"
        >
          <div className="flex items-center justify-between gap-3">
            <GradientButton href="/auth/register" size="sm" className="flex-1" onClick={() => trackLanding(LANDING_EVENTS.STICKY_BAR_CTA_CLICK, { cta: 'register' })}>
              Start Free
            </GradientButton>

            <Link
              href="/download"
              onClick={() => trackLanding(LANDING_EVENTS.EXTENSION_CTA_CLICK, { source: 'sticky_bar' })}
              className="text-sm text-[#0E3A8C] dark:text-blue-400 font-medium whitespace-nowrap"
            >
              Get Extension
            </Link>

            <button
              onClick={() => {
                setDismissed(true);
                trackLanding(LANDING_EVENTS.STICKY_BAR_DISMISSED);
              }}
              className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileStickyBar;
