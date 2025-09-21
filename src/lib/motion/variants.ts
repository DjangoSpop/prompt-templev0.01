import { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 0.1, 0.12, 1] } },
  exit: { opacity: 0, y: 4, transition: { duration: 0.16 } },
};

export const subtleScale: Variants = {
  hidden: { opacity: 0, scale: 0.995 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.18 } },
};
