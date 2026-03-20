'use client';

import { useEffect, useRef } from 'react';
import { COPY } from '@/lib/landing/copy';
import { GSAP_SCROLL_TRIGGER_DEFAULTS } from '@/lib/landing/motion';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';

// SVG icons for each pain card
function ClockTrashIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" role="img" aria-label="Time wasted">
      <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent-gold" />
      <path d="M20 10v10l7 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-accent-gold" />
      <path d="M34 30l4 12h-8l4-12z" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-sand-600 dark:text-stone-500" />
      <line x1="32" y1="42" x2="40" y2="42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-sand-600 dark:text-stone-500" />
    </svg>
  );
}

function SearchQuestionIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" role="img" aria-label="Lost prompt">
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent-gold" />
      <line x1="29" y1="29" x2="40" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent-gold" />
      <text x="16" y="25" fontSize="14" fill="currentColor" fontFamily="serif" fontWeight="bold" className="text-sand-600 dark:text-stone-500">?</text>
    </svg>
  );
}

function ClipboardXIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" role="img" aria-label="Copied prompts fail">
      <rect x="8" y="6" width="28" height="36" rx="3" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent-gold" />
      <rect x="14" y="2" width="16" height="6" rx="2" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent-gold" />
      <line x1="16" y1="22" x2="28" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-sand-600 dark:text-stone-500" />
      <line x1="28" y1="22" x2="16" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-sand-600 dark:text-stone-500" />
    </svg>
  );
}

function WindowsReloadIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" role="img" aria-label="Rewriting prompts">
      <rect x="2" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-accent-gold" />
      <rect x="15" y="16" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-accent-gold" />
      <rect x="28" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-accent-gold" />
      <path d="M24 34v6m-4 0h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-sand-600 dark:text-stone-500" />
      <path d="M36 40a5 5 0 1 1-3.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" className="text-sand-600 dark:text-stone-500" />
      <path d="M33 33l0 3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sand-600 dark:text-stone-500" />
    </svg>
  );
}

const ICONS = {
  'clock-trash': ClockTrashIcon,
  'search-question': SearchQuestionIcon,
  'clipboard-x': ClipboardXIcon,
  'windows-reload': WindowsReloadIcon,
} as const;

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !sectionRef.current) return;

    let gsapCtx: { revert: () => void } | undefined;

    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsapCtx = gsap.context(() => {
        gsap.from('.problem-card-v2', {
          y: 60,
          opacity: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            ...GSAP_SCROLL_TRIGGER_DEFAULTS,
          },
        });
      }, sectionRef);
    };

    loadGSAP();
    return () => gsapCtx?.revert();
  }, []);

  // Track section view
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackLanding(LANDING_EVENTS.PROBLEM_SECTION_VIEWED);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="problem-section"
      className="relative overflow-hidden py-16 md:py-24 px-4 bg-sand-50"
    >
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-[10%] top-[16%] h-2 w-2 rounded-full bg-red-300/35 animate-pulse" />
        <span className="absolute left-[80%] top-[36%] h-2 w-2 rounded-full bg-red-300/35 animate-pulse [animation-delay:0.4s]" />
        <span className="absolute left-[10%] top-[56%] h-2 w-2 rounded-full bg-red-300/35 animate-pulse [animation-delay:0.8s]" />
        <span className="absolute left-[80%] top-[76%] h-2 w-2 rounded-full bg-red-300/35 animate-pulse [animation-delay:1.2s]" />
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-2xl md:text-4xl font-bold text-sand-900 text-center mb-12">
          {COPY.problem.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12">
          {COPY.problem.cards.map((card, i) => {
            const IconComponent = ICONS[card.icon];
            return (
              <div
                key={i}
                className="problem-card-v2 bg-red-50/80 dark:bg-red-900/15 rounded-xl p-6 border border-red-100 hover:border-red-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="mb-3 flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 text-sm font-bold">
                    ✕
                  </span>
                  <IconComponent />
                </div>
                <p className="font-body text-sand-800 text-base leading-relaxed">
                  {card.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-500 mb-2">Before</p>
            <p className="text-sm text-red-700">"20 minutes writing a prompt... still mediocre output."</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">After</p>
            <p className="text-sm text-emerald-700">"10 seconds. Search, click, optimize, and use it anywhere."</p>
          </div>
        </div>

        <p className="text-center font-body text-lg md:text-xl text-sand-700 italic">
          There&apos;s a smarter way. And 5,031 people already found it.
        </p>
      </div>
    </section>
  );
}

export default ProblemSection;
