'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProgressIndicatorProps {
  className?: string;
  color?: string;
  height?: number;
}

export function ProgressIndicator({
  className = '',
  color = '#3B82F6',
  height = 4,
}: ProgressIndicatorProps) {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!progressRef.current) return;

    const progressBar = progressRef.current;

    // Create scroll progress animation
    gsap.fromTo(
      progressBar,
      {
        scaleX: 0,
        transformOrigin: 'left center',
      },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
          invalidateOnRefresh: true,
        },
      }
    );

    // Add glow effect
    gsap.to(progressBar, {
      boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}40`,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === document.body) {
          trigger.kill();
        }
      });
    };
  }, [color]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${className}`}
      style={{
        height: `${height}px`,
        background: 'transparent',
      }}
    >
      <div
        ref={progressRef}
        className="scroll-progress h-full"
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}80, ${color})`,
          transformOrigin: 'left center',
          scaleX: 0,
        }}
      />
    </div>
  );
}