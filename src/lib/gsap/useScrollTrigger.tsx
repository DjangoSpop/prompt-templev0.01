'use client';

import { useEffect } from 'react';

export function useScrollTrigger(rootRef?: React.RefObject<HTMLElement>) {
  useEffect(() => {
    let ctx: unknown;

    async function setup() {
      if (typeof window === 'undefined') return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return; // disable scroll-driven motion when reduced

      const gsapMod = await import('gsap');
      const st = await import('gsap/dist/ScrollTrigger');
      const gsap = (gsapMod as any).gsap || (gsapMod as any).default || gsapMod;
      const ScrollTrigger = (st as any).ScrollTrigger || (st as any).default || st;
      gsap.registerPlugin?.(ScrollTrigger);

      ctx = gsap.context(() => {
        // placeholder for page-specific triggers; consumers will create ScrollTrigger instances
      }, rootRef?.current ?? undefined);
    }

    setup();

    return () => {
      try {
        (ctx as any)?.revert?.();
      } catch {
        // noop
      }
    };
  }, [rootRef]);
}
