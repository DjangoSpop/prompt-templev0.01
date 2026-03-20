'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { useOnboardingSlider } from '@/hooks/useOnboardingSlider';
import { SliderCardRenderer, SliderSkeleton } from './SliderCardRenderer';
import { useReducedMotion } from '@/components/landing/v2/hooks/useReducedMotion';
import { triggerGoldConfetti } from '@/lib/utils/confetti';

// ── Timing (30-second experience: ~4s per card) ──
const AUTO_ADVANCE_MS = 4000;
const CARD_ENTER_DURATION = 0.6;
const STAGGER = 0.08;

export function OnboardingSlider({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const { cards, isLoading } = useOnboardingSlider(isAuthenticated);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  const goToCard = useCallback(
    (index: number, triggerParticles: boolean = false) => {
      if (!trackRef.current || !cards.length) return;
      const safeIndex = (index + cards.length) % cards.length;
      setActiveIndex(safeIndex);

      const firstChild = trackRef.current.children[0] as HTMLElement | undefined;
      const cardWidth = firstChild?.offsetWidth || 310;
      const gap = 24;
      const offset = safeIndex * (cardWidth + gap);

      gsap.to(trackRef.current, {
        x: -offset,
        duration: reducedMotion ? 0 : 0.6,
        ease: 'power2.inOut',
      });

      Array.from(trackRef.current.children).forEach((child, i) => {
        gsap.to(child, {
          scale: i === safeIndex ? 1 : 0.94,
          opacity: i === safeIndex ? 1 : 0.7,
          duration: reducedMotion ? 0 : 0.4,
        });
      });

      if (triggerParticles && !reducedMotion) {
        void triggerGoldConfetti({
          particleCount: 20,
          spread: 40,
          startVelocity: 20,
          origin: { y: 0.55 },
        });
      }
    },
    [cards.length, reducedMotion]
  );

  // ── GSAP entrance animation ──
  useEffect(() => {
    if (!containerRef.current || isLoading || reducedMotion) return;

    const cardEls = containerRef.current.querySelectorAll('.slider-card');
    if (!cardEls.length) return;

    gsap.fromTo(
      cardEls,
      { y: 60, opacity: 0, scale: 0.92 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: CARD_ENTER_DURATION,
        stagger: STAGGER,
        ease: 'power3.out',
        delay: 0.2,
      }
    );
  }, [isLoading, cards.length, reducedMotion]);

  // ── Auto-advance ──
  const advanceSlider = useCallback(() => {
    if (!trackRef.current || !cards.length) return;

    const nextIndex = (idx: number) => (idx + 1) % cards.length;

    setActiveIndex((prev) => {
      const next = nextIndex(prev);
      goToCard(next);
      return next;
    });
  }, [cards.length, goToCard]);

  useEffect(() => {
    if (isLoading || !cards.length) return;
    timerRef.current = setInterval(advanceSlider, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [advanceSlider, isLoading, cards.length]);

  const pauseAutoAdvance = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resumeAutoAdvance = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advanceSlider, AUTO_ADVANCE_MS);
  };

  const handlePrev = () => {
    const prev = activeIndex - 1;
    goToCard(prev, true);
  };

  const handleNext = () => {
    const next = activeIndex + 1;
    goToCard(next, true);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    pauseAutoAdvance();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current == null || touchCurrentX.current == null) {
      resumeAutoAdvance();
      return;
    }

    const delta = touchCurrentX.current - touchStartX.current;
    if (delta > 40) {
      handlePrev();
    } else if (delta < -40) {
      handleNext();
    }

    touchStartX.current = null;
    touchCurrentX.current = null;
    resumeAutoAdvance();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      }
      if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (isLoading) return <SliderSkeleton />;
  if (!cards.length) return null;

  return (
    <section
      id={!isAuthenticated ? 'discover-section' : undefined}
      className="relative w-full overflow-hidden scroll-mt-24 py-8 md:py-12"
    >
      {/* Section heading */}
      <div className="mb-6 px-4 text-center">
        <h2 className="text-2xl font-bold text-hieroglyph md:text-3xl">
          {isAuthenticated ? 'Your Sacred Scrolls' : 'Discover the Temple'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAuthenticated
            ? 'Pick up where you left off or explore new prompts'
            : 'Featured prompts, courses, and categories — curated for you'}
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative"
        onMouseEnter={pauseAutoAdvance}
        onMouseLeave={resumeAutoAdvance}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Gradient fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-sand-50 to-transparent md:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-sand-50 to-transparent md:w-16" />

        <div className="pointer-events-none absolute right-6 top-2 z-20 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-stone-700 backdrop-blur-sm">
          <span className="font-semibold text-stone-900">{activeIndex + 1}</span>
          <span className="mx-1 text-stone-400">/</span>
          <span>{cards.length}</span>
        </div>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={handlePrev}
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-stone-200 bg-white/90 p-2 text-stone-700 shadow-sm transition-colors hover:bg-[#CBA135] hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label="Next slide"
          onClick={handleNext}
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-stone-200 bg-white/90 p-2 text-stone-700 shadow-sm transition-colors hover:bg-[#CBA135] hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Card track */}
        <div
          ref={trackRef}
          className="flex gap-6 px-8 will-change-transform"
          style={{ cursor: 'grab' }}
        >
          {cards.map((card, i) => (
            <SliderCardRenderer
              key={`${card.type}-${i}`}
              card={card}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Progress dots */}
      <div className="mt-6 flex justify-center gap-2">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => goToCard(i, true)}
            aria-label={`Go to card ${i + 1}`}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-royal-gold-500 rounded-full"
          >
            <motion.div
              className="h-1.5 rounded-full"
              animate={{
                width: i === activeIndex ? 32 : 8,
                backgroundColor:
                  i === activeIndex
                    ? 'rgb(180, 140, 50)' // royal gold
                    : 'rgba(180, 140, 50, 0.2)',
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

export default OnboardingSlider;
