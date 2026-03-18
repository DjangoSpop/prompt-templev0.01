'use client';

import { useEffect, useRef } from 'react';
import { COPY } from '@/lib/landing/copy';
import { GSAP_SCROLL_TRIGGER_DEFAULTS } from '@/lib/landing/motion';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';

// SVG icons for each pain card
function ClockTrashIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" role="img" aria-label="Time wasted">
      <circle cx="20" cy="20" r="14" stroke="#d4a853" strokeWidth="2" fill="none" />
      <path d="M20 10v10l7 4" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M34 30l4 12h-8l4-12z" stroke="#8a7d6b" strokeWidth="1.5" fill="none" />
      <line x1="32" y1="42" x2="40" y2="42" stroke="#8a7d6b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SearchQuestionIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" role="img" aria-label="Lost prompt">
      <circle cx="20" cy="20" r="12" stroke="#d4a853" strokeWidth="2" fill="none" />
      <line x1="29" y1="29" x2="40" y2="40" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" />
      <text x="16" y="25" fontSize="14" fill="#8a7d6b" fontFamily="serif" fontWeight="bold">?</text>
    </svg>
  );
}

function ClipboardXIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" role="img" aria-label="Copied prompts fail">
      <rect x="8" y="6" width="28" height="36" rx="3" stroke="#d4a853" strokeWidth="2" fill="none" />
      <rect x="14" y="2" width="16" height="6" rx="2" stroke="#d4a853" strokeWidth="2" fill="none" />
      <line x1="16" y1="22" x2="28" y2="34" stroke="#8a7d6b" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="22" x2="16" y2="34" stroke="#8a7d6b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WindowsReloadIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10" role="img" aria-label="Rewriting prompts">
      <rect x="2" y="6" width="18" height="14" rx="2" stroke="#d4a853" strokeWidth="1.5" fill="none" />
      <rect x="15" y="16" width="18" height="14" rx="2" stroke="#d4a853" strokeWidth="1.5" fill="none" />
      <rect x="28" y="6" width="18" height="14" rx="2" stroke="#d4a853" strokeWidth="1.5" fill="none" />
      <path d="M24 34v6m-4 0h8" stroke="#8a7d6b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 40a5 5 0 1 1-3.5-4.5" stroke="#8a7d6b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M33 33l0 3h3" stroke="#8a7d6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
        gsap.from('.problem-card', {
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

  // Track section view with IntersectionObserver
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackLanding(LANDING_EVENTS.PROBLEM_SECTION_VIEWED);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="problem-section"
      className="py-16 md:py-24 px-4 bg-sand-50"
    >
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
                className="problem-card bg-sand-100 rounded-xl p-6 border border-sand-200 hover:border-accent-gold/40 hover:shadow-gold-glow transition-all duration-200"
              >
                <div className="mb-3">
                  <IconComponent />
                </div>
                <p className="font-body text-sand-800 text-base leading-relaxed">
                  {card.text}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-center font-body text-lg md:text-xl text-sand-600 italic">
          {COPY.problem.transition}
        </p>
      </div>
    </section>
  );
}
