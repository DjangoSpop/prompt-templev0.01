'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  distance?: number;
  duration?: number;
  delay?: number;
  trigger?: string;
  start?: string;
  end?: string;
  stagger?: number;
}

export function RevealOnScroll({
  children,
  className = '',
  direction = 'up',
  distance = 60,
  duration = 1,
  delay = 0,
  trigger,
  start = 'top 85%',
  end = 'bottom 20%',
  stagger = 0,
}: RevealOnScrollProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const targets = stagger > 0 ? element.children : element;

    // Initial state
    let fromVars: any = { opacity: 0 };
    let toVars: any = { opacity: 1, duration, delay, ease: 'power3.out' };

    switch (direction) {
      case 'up':
        fromVars.y = distance;
        toVars.y = 0;
        break;
      case 'down':
        fromVars.y = -distance;
        toVars.y = 0;
        break;
      case 'left':
        fromVars.x = distance;
        toVars.x = 0;
        break;
      case 'right':
        fromVars.x = -distance;
        toVars.x = 0;
        break;
      case 'scale':
        fromVars.scale = 0.8;
        toVars.scale = 1;
        toVars.ease = 'elastic.out(1, 0.8)';
        break;
      case 'fade':
        // Only opacity animation
        break;
    }

    // Set initial state
    gsap.set(targets, fromVars);

    // Add ScrollTrigger
    toVars.scrollTrigger = {
      trigger: trigger ? trigger : element,
      start,
      end,
      toggleActions: 'play none none reverse',
      markers: false,
    };

    // Add stagger if specified
    if (stagger > 0 && element.children.length > 0) {
      toVars.stagger = stagger;
    }

    // Animate
    const animation = gsap.to(targets, toVars);

    // Cleanup
    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [direction, distance, duration, delay, trigger, start, end, stagger]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}