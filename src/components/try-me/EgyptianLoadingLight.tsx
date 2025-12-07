'use client';

import { motion } from 'framer-motion';

interface EgyptianLoadingLightProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EgyptianLoadingLight({ className = '', size = 'md' }: EgyptianLoadingLightProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pyramidVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: prefersReducedMotion ? 0 : 2,
        repeat: prefersReducedMotion ? 0 : Infinity,
        ease: 'linear',
      },
    },
  };

  const sunRayVariants = {
    animate: {
      opacity: [0.4, 1, 0.4],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: prefersReducedMotion ? 0 : 1.5,
        repeat: prefersReducedMotion ? 0 : Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Sun rays */}
      <motion.div
        className="absolute inset-0"
        variants={sunRayVariants}
        animate={prefersReducedMotion ? {} : 'animate'}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-full h-full text-amber-400"
        >
          {/* Sun rays */}
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="M4.93 4.93l1.41 1.41" />
            <path d="M17.66 17.66l1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="M6.34 17.66l-1.41 1.41" />
            <path d="M19.07 4.93l-1.41 1.41" />
          </g>
        </svg>
      </motion.div>

      {/* Pyramid */}
      <motion.div
        className="absolute inset-2"
        variants={pyramidVariants}
        animate={prefersReducedMotion ? {} : 'animate'}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-full h-full text-amber-600"
        >
          <path
            d="M12 3L21 20H3L12 3Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Pyramid details */}
          <path
            d="M12 3L16.5 20"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="0.5"
          />
          <path
            d="M12 3L7.5 20"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="0.5"
          />
        </svg>
      </motion.div>

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-1 h-1 bg-amber-300 rounded-full"
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1,
            repeat: prefersReducedMotion ? 0 : Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
}