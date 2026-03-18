import { Variants } from 'framer-motion';

// ── Timing Constants ──────────────────────────────────────
export const TIMING = {
  ENTRANCE_DURATION: 0.4,
  STAGGER_DELAY: 0.12,
  SSE_WORD_DELAY: 60,
  AUTO_TYPE_SPEED: 40,
  AUTO_TYPE_SPEED_MOBILE: 50,
  PUNCTUATION_PAUSE_PERIOD: 200,
  PUNCTUATION_PAUSE_COMMA: 100,
  COSTAR_STAGGER: 0.15,
  CARD_EXIT_DURATION: 0.2,
  DEBOUNCE_MS: 300,
} as const;

// ── Framer Motion Variants ────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: TIMING.ENTRANCE_DURATION } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.ENTRANCE_DURATION, ease: 'easeOut' },
  },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: TIMING.ENTRANCE_DURATION, ease: 'easeOut' },
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: TIMING.ENTRANCE_DURATION, ease: 'easeOut' },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: TIMING.STAGGER_DELAY,
    },
  },
};

export const costarStaggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: TIMING.COSTAR_STAGGER,
    },
  },
};

export const cardHover: { scale: number; y: number; transition: { duration: number; ease: string } } = {
  scale: 1.02,
  y: -2,
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const cardTap: { scale: number; transition: { duration: number } } = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const cardExit: Variants = {
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: TIMING.CARD_EXIT_DURATION },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: TIMING.ENTRANCE_DURATION, ease: 'easeOut' },
  },
};

// ── GSAP Defaults ─────────────────────────────────────────
export const GSAP_SCROLL_TRIGGER_DEFAULTS = {
  start: 'top 80%',
  end: 'bottom 20%',
  toggleActions: 'play none none none',
} as const;

export const GSAP_STAGGER = {
  amount: 0.4,
  from: 'start' as const,
};
