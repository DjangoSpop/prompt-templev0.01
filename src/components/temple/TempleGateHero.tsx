'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp } from '@/lib/motion/variants';
import { useScrollTrigger } from '@/lib/gsap/useScrollTrigger';

export function TempleGateHero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  useScrollTrigger(rootRef as React.RefObject<HTMLElement> | undefined);

  useEffect(() => {
    // Lightweight parallax for hero glyphs - avoided if reduced
    if (reduce) return;
    let mounted = true;
    async function run() {
      const { default: gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/dist/ScrollTrigger');
      gsap.registerPlugin?.(ScrollTrigger);
      if (!mounted) return;

      gsap.to('.gate-panel', {
        y: (i: number) => i * 10,
        opacity: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.temple-gate-hero',
          start: 'top top',
          scrub: true,
        },
      });
    }
    run();
    return () => { mounted = false; };
  }, [reduce]);

  return (
    <section ref={rootRef} className="temple-gate-hero relative overflow-hidden py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative z-10 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-display tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
           
          </h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
            Discover, refine, and preserve the most sacred AI prompts. Try a prompt and feel the light of insight.
          </p>

          {/* <div className="mt-8 flex items-center justify-center space-x-4">
            <button className="egyptian-button focus-visible:outline-none" aria-label="Try a prompt">
              Try a Prompt
            </button>
            <button className="px-4 py-2 rounded-lg border border-border text-sm bg-card-bg/70" aria-label="Explore library">
              Browse Library
            </button> */}
          {/* </div> */}
        </motion.div>

        {/* Decorative layered gate panels */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="gate-panel absolute left-1/2 transform -translate-x-1/2 top-10 w-[80%] h-40 rounded-2xl bg-gradient-to-r from-pharaoh-gold/6 to-transparent opacity-60 blur-md"></div>
          <div className="gate-panel absolute left-1/2 transform -translate-x-1/2 top-24 w-[60%] h-56 rounded-2xl bg-gradient-to-r from-pharaoh-gold/8 to-transparent opacity-50 blur-2xl"></div>
          <div className="gate-panel absolute left-1/2 transform -translate-x-1/2 top-40 w-[40%] h-72 rounded-2xl bg-gradient-to-r from-pharaoh-gold/10 to-transparent opacity-40 blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}
