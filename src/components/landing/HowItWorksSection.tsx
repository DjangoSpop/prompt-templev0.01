'use client';

import { useEffect, useRef } from 'react';
import { COPY_V1 as COPY } from '@/lib/landing/copy';
import { GSAP_SCROLL_TRIGGER_DEFAULTS } from '@/lib/landing/motion';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';

// SVG Icons
function MagnifyingGlassIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12" role="img" aria-label="Find prompts">
      <circle cx="20" cy="20" r="12" stroke="url(#grad1)" strokeWidth="2.5" fill="none" />
      <line x1="29" y1="29" x2="40" y2="40" stroke="url(#grad1)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15 16l3 3m3-5l1 4" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function WandIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12" role="img" aria-label="Enhance prompts">
      <line x1="8" y1="40" x2="32" y2="16" stroke="url(#grad2)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 16l6-6-4-4-6 6z" fill="url(#grad2)" />
      <circle cx="14" cy="10" r="1.5" fill="#d4a853" />
      <circle cx="38" cy="8" r="1" fill="#d4a853" />
      <circle cx="40" cy="28" r="1.5" fill="#d4a853" />
      <path d="M10 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="#d4a853" opacity="0.7" />
      <path d="M38 24l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#d4a853" opacity="0.7" />
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LightningBoltIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12" role="img" aria-label="Use prompts everywhere">
      <rect x="10" y="8" width="28" height="22" rx="3" stroke="url(#grad3)" strokeWidth="2" fill="none" />
      <line x1="10" y1="14" x2="38" y2="14" stroke="url(#grad3)" strokeWidth="1.5" />
      <circle cx="14" cy="11" r="1" fill="#d4a853" />
      <circle cx="18" cy="11" r="1" fill="#d4a853" opacity="0.6" />
      <circle cx="22" cy="11" r="1" fill="#d4a853" opacity="0.3" />
      <path d="M26 20l-4 8h6l-4 8" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M20 34v4m8-4v4m-4-4v6" stroke="url(#grad3)" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const STEP_ICONS = [MagnifyingGlassIcon, WandIcon, LightningBoltIcon];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !sectionRef.current) return;

    let gsapCtx: { revert: () => void } | undefined;

    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsapCtx = gsap.context(() => {
        // Animate steps
        gsap.from('.hiw-step', {
          y: 50,
          opacity: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            ...GSAP_SCROLL_TRIGGER_DEFAULTS,
          },
        });

        // Animate connecting line (desktop only)
        if (lineRef.current && window.innerWidth >= 768) {
          const length = lineRef.current.getTotalLength();
          gsap.set(lineRef.current, { strokeDasharray: length, strokeDashoffset: length });
          gsap.to(lineRef.current, {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              end: 'bottom 50%',
              scrub: 1,
            },
          });
        }
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
          trackLanding(LANDING_EVENTS.HOW_IT_WORKS_VIEWED);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-4 bg-sand-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-2xl md:text-4xl font-bold text-sand-900 text-center mb-16">
          {COPY.howItWorks.title}
        </h2>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <svg
            className="absolute top-16 left-0 w-full h-4 hidden md:block pointer-events-none"
            viewBox="0 0 1000 20"
            preserveAspectRatio="none"
          >
            <path
              ref={lineRef}
              d="M167 10 L500 10 L833 10"
              stroke="url(#lineGrad)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Mobile connecting line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-royal to-temple-purple md:hidden" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {COPY.howItWorks.steps.map((step, i) => {
              const IconComponent = STEP_ICONS[i];
              return (
                <div key={i} className="hiw-step relative pl-14 md:pl-0 md:text-center">
                  {/* Step number badge (mobile: left aligned, desktop: centered) */}
                  <div className="absolute left-0 top-0 md:relative md:mx-auto w-12 h-12 rounded-full bg-pharaonic text-white flex items-center justify-center font-bold text-lg shadow-pyramid mb-4">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-start md:justify-center mb-4">
                    <IconComponent />
                  </div>

                  {/* Verb label */}
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-royal bg-indigo-royal/10 mb-3">
                    {step.verb}
                  </div>

                  {/* Name */}
                  <h3 className="font-display text-lg md:text-xl font-bold text-sand-900 mb-2">
                    {step.name}
                  </h3>

                  {/* Description */}
                  <p className="font-body text-sand-600 text-sm md:text-base leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
