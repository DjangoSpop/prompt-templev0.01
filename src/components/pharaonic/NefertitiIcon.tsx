'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface NefertitiIconProps {
  className?: string;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export function NefertitiIcon({ 
  className = '', 
  animate = false, 
  size = 'md' 
}: NefertitiIconProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (animate) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !shouldAnimate) {
            setShouldAnimate(true);
          }
        },
        { threshold: 0.5 }
      );

      const element = document.getElementById('nefertiti-svg');
      if (element) {
        observer.observe(element);
      }

      return () => observer.disconnect();
    }
  }, [animate, shouldAnimate]);

  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <div 
      id="nefertiti-svg"
      className={`${sizeClasses[size]} ${className}`}
      aria-label="Nefertiti silhouette - Egyptian heritage symbol"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Nefertiti profile - elegant line art */}
        <motion.path
          d="M30 20 C35 15, 40 15, 45 18 C50 20, 55 22, 58 25 C60 28, 62 32, 62 36 C62 40, 60 44, 58 47 C56 50, 54 52, 52 54 C50 56, 48 58, 46 60 C44 62, 42 64, 40 66 C38 68, 36 70, 35 72 C34 74, 34 76, 35 78 C36 80, 38 82, 40 83 C42 84, 44 84, 46 83 C48 82, 49 80, 50 78"
          stroke="hsl(var(--pharaoh-gold))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={shouldAnimate ? pathVariants : {}}
          initial={shouldAnimate ? "hidden" : "visible"}
          animate={shouldAnimate ? "visible" : "visible"}
          style={{
            filter: 'drop-shadow(0 2px 4px hsl(var(--temple-shadow)))'
          }}
        />
        
        {/* Crown/headdress detail */}
        <motion.path
          d="M45 18 C48 16, 52 16, 55 18 C57 20, 58 23, 57 26"
          stroke="hsl(var(--pharaoh-gold))"
          strokeWidth="1"
          strokeLinecap="round"
          variants={shouldAnimate ? pathVariants : {}}
          initial={shouldAnimate ? "hidden" : "visible"}
          animate={shouldAnimate ? "visible" : "visible"}
          style={{
            animationDelay: '0.3s'
          }}
        />

        {/* Eye detail */}
        <motion.circle
          cx="48"
          cy="35"
          r="1.5"
          fill="hsl(var(--pharaoh-gold))"
          variants={shouldAnimate ? {
            hidden: { scale: 0, opacity: 0 },
            visible: { 
              scale: 1, 
              opacity: 1,
              transition: { delay: 0.8, duration: 0.3 }
            }
          } : {}}
          initial={shouldAnimate ? "hidden" : "visible"}
          animate={shouldAnimate ? "visible" : "visible"}
        />

        {/* Neck jewelry accent */}
        <motion.path
          d="M38 78 Q42 80, 46 78"
          stroke="hsl(var(--pharaoh-gold))"
          strokeWidth="0.8"
          strokeLinecap="round"
          variants={shouldAnimate ? pathVariants : {}}
          initial={shouldAnimate ? "hidden" : "visible"}
          animate={shouldAnimate ? "visible" : "visible"}
          style={{
            animationDelay: '1s'
          }}
        />
      </svg>
    </div>
  );
}

// Utility component for hero backgrounds
export function NefertitiBackground({ 
  className = '',
  opacity = 0.03 
}: { 
  className?: string;
  opacity?: number;
}) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity }}
    >
      <div className="absolute right-8 top-1/2 -translate-y-1/2">
        <NefertitiIcon 
          size="xl" 
          animate={true}
          className="text-pharaoh-gold opacity-20"
        />
      </div>
    </div>
  );
}