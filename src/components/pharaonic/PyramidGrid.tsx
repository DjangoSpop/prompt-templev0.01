'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface PyramidGridProps {
  className?: string;
  animate?: boolean;
  interactive?: boolean;
}

export function PyramidGrid({ 
  className = '', 
  animate = true,
  interactive = false 
}: PyramidGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Subtle parallax effect on pyramids
      const pyramids = container.querySelectorAll('.pyramid-shape');
      pyramids.forEach((pyramid, index) => {
        const element = pyramid as HTMLElement;
        const intensity = (index + 1) * 0.5;
        const moveX = (x - 0.5) * intensity;
        const moveY = (y - 0.5) * intensity;
        
        element.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  const pyramidVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.8
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    })
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      aria-hidden="true"
    >
      {/* Background pyramid grid */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large central pyramid */}
        <motion.div
          className="pyramid-shape absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          custom={0}
          variants={animate ? pyramidVariants : {}}
          initial={animate ? "hidden" : "visible"}
          animate="visible"
        >
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 120 120"
            className="text-pharaoh-gold opacity-10"
          >
            <polygon 
              points="60,20 100,100 20,100" 
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
          </svg>
        </motion.div>

        {/* Smaller accent pyramids */}
        <motion.div
          className="pyramid-shape absolute left-1/4 top-1/3"
          custom={1}
          variants={animate ? pyramidVariants : {}}
          initial={animate ? "hidden" : "visible"}
          animate="visible"
        >
          <svg 
            width="60" 
            height="60" 
            viewBox="0 0 60 60"
            className="text-nile-teal opacity-8"
          >
            <polygon 
              points="30,10 50,50 10,50" 
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeOpacity="0.2"
            />
          </svg>
        </motion.div>

        <motion.div
          className="pyramid-shape absolute right-1/4 bottom-1/3"
          custom={2}
          variants={animate ? pyramidVariants : {}}
          initial={animate ? "hidden" : "visible"}
          animate="visible"
        >
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 80 80"
            className="text-desert-sand opacity-15"
          >
            <polygon 
              points="40,15 65,65 15,65" 
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity="0.2"
            />
          </svg>
        </motion.div>

        {/* Micro pyramids for texture */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="pyramid-shape absolute"
            custom={i + 3}
            variants={animate ? pyramidVariants : {}}
            initial={animate ? "hidden" : "visible"}
            animate="visible"
            style={{
              left: `${15 + (i * 12)}%`,
              top: `${20 + ((i % 3) * 25)}%`,
            }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24"
              className="text-pharaoh-gold opacity-5"
            >
              <polygon 
                points="12,4 20,20 4,20" 
                fill="currentColor"
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Subtle geometric pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 40%, hsl(var(--pharaoh-gold)) 41%, hsl(var(--pharaoh-gold)) 42%, transparent 43%),
            linear-gradient(-45deg, transparent 40%, hsl(var(--nile-teal)) 41%, hsl(var(--nile-teal)) 42%, transparent 43%)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        }}
      />
    </div>
  );
}

// Sun disk component for hero animations
export function SunDisk({ 
  className = '',
  animate = true,
  size = 60 
}: {
  className?: string;
  animate?: boolean;
  size?: number;
}) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={animate ? {
        rotate: [0, 360],
        scale: [1, 1.05, 1],
      } : {}}
      transition={animate ? {
        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      } : {}}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100"
        className="text-royal-gold opacity-20"
      >
        {/* Sun disk */}
        <circle 
          cx="50" 
          cy="50" 
          r="25" 
          fill="currentColor"
          opacity="0.8"
        />
        
        {/* Sun rays */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const x1 = 50 + Math.cos(angle) * 30;
          const y1 = 50 + Math.sin(angle) * 30;
          const x2 = 50 + Math.cos(angle) * 45;
          const y2 = 50 + Math.sin(angle) * 45;
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
          );
        })}
      </svg>
    </motion.div>
  );
}