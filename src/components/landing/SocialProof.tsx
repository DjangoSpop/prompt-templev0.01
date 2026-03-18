'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { COPY } from '@/lib/landing/copy';
import { GSAP_SCROLL_TRIGGER_DEFAULTS } from '@/lib/landing/motion';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';

// Animate a number from 0 to target
function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(value);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !ref.current) return;

    // Extract numeric part for animation
    const numMatch = value.match(/^([\d,]+)/);
    if (!numMatch) return;

    const targetNum = parseInt(numMatch[1].replace(/,/g, ''), 10);
    const suffix = value.replace(numMatch[1], '');

    let gsapCtx: { revert: () => void } | undefined;

    const loadGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const obj = { val: 0 };
      gsapCtx = gsap.context(() => {
        gsap.to(obj, {
          val: targetNum,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            ...GSAP_SCROLL_TRIGGER_DEFAULTS,
          },
          onUpdate: () => {
            const formatted = Math.round(obj.val).toLocaleString();
            setDisplayed(formatted + suffix);
          },
        });
      });
    };

    loadGSAP();
    return () => gsapCtx?.revert();
  }, [value]);

  return (
    <div className="text-center px-4">
      <span
        ref={ref}
        className="block font-display text-3xl md:text-5xl font-bold text-sand-900 mb-1"
      >
        {displayed}
      </span>
      <span className="text-sm text-sand-600 font-body">{label}</span>
    </div>
  );
}

// Gradient initials avatar
function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-12 h-12 rounded-full bg-pharaonic flex items-center justify-center text-white font-bold text-sm shrink-0">
      {initials}
    </div>
  );
}

export function SocialProof() {
  const sectionRef = useRef<HTMLElement>(null);

  // Track section view
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackLanding(LANDING_EVENTS.SOCIAL_PROOF_VIEWED);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-4 bg-sand-100">
      <div className="max-w-5xl mx-auto">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-16">
          {COPY.social.stats.map((stat) => (
            <AnimatedStat key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {COPY.social.testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="bg-white rounded-xl p-6 border border-sand-200 shadow-temple"
            >
              <div className="flex items-center gap-3 mb-4">
                <Avatar initials={testimonial.initials} />
                <div>
                  <p className="font-semibold text-sand-900 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-sand-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="font-body text-sand-800 text-sm leading-relaxed mb-3">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <span key={j} className="text-accent-gold text-sm">&#9733;</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust strip */}
        <p className="text-center text-sm text-sand-600 font-body">
          {COPY.social.trustStrip}
        </p>
      </div>
    </section>
  );
}
