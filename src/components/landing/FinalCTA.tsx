'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COPY } from '@/lib/landing/copy';
import { fadeIn } from '@/lib/landing/motion';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { GradientButton } from './shared/GradientButton';

export function FinalCTA() {
  const [showStickyBar, setShowStickyBar] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Sticky bar visibility based on scroll
  useEffect(() => {
    const heroEl = document.querySelector('section');
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when hero is NOT visible
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Main CTA section */}
      <section ref={sectionRef} className="py-16 md:py-24 px-4 bg-sand-50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-2xl md:text-4xl font-bold text-sand-900 mb-6">
              {COPY.cta.closing}
            </h2>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GradientButton
                href="/auth/register"
                size="lg"
                onClick={() => trackLanding(LANDING_EVENTS.FINAL_CTA_CLICK)}
              >
                {COPY.cta.primary}
              </GradientButton>
              <GradientButton
                href="https://chrome.google.com/webstore"
                size="lg"
                variant="outlined"
                onClick={() => trackLanding(LANDING_EVENTS.EXTENSION_CTA_CLICK)}
              >
                {COPY.cta.secondary}
              </GradientButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sand-100 border-t border-sand-200 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="font-display text-xl font-bold text-sand-900 mb-2">
                &#127963;&#65039; {COPY.nav.logo}
              </h3>
              <p className="font-body text-sm text-sand-600">{COPY.footer.tagline}</p>
            </div>

            {/* Product links */}
            <div>
              <h4 className="font-semibold text-sand-900 text-sm mb-3">Product</h4>
              <ul className="space-y-2">
                {COPY.footer.links.product.map((link) => (
                  <li key={link}>
                    <a
                      href={`/${link.toLowerCase()}`}
                      className="text-sm text-sand-600 hover:text-indigo-royal transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h4 className="font-semibold text-sand-900 text-sm mb-3">Company</h4>
              <ul className="space-y-2">
                {COPY.footer.links.company.map((link) => (
                  <li key={link}>
                    <a
                      href={`/${link.toLowerCase()}`}
                      className="text-sm text-sand-600 hover:text-indigo-royal transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-sand-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-sand-600">{COPY.footer.copyright}</p>
            <p className="text-xs text-sand-600">{COPY.footer.madeWith}</p>
          </div>
        </div>
      </footer>

      {/* Mobile sticky bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            key="sticky"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed bottom-0 left-0 right-0 z-50 bg-sand-50/95 backdrop-blur-sm border-t border-sand-200 shadow-pyramid px-4 py-3 md:hidden"
          >
            <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
              <GradientButton
                href="/auth/register"
                size="sm"
                className="flex-1"
                onClick={() => trackLanding(LANDING_EVENTS.STICKY_BAR_CTA_CLICK)}
              >
                {COPY.cta.primary}
              </GradientButton>
              <a
                href="https://chrome.google.com/webstore"
                className="text-xs text-indigo-royal font-medium hover:underline shrink-0 min-h-[44px] flex items-center"
              >
                Get Extension
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
