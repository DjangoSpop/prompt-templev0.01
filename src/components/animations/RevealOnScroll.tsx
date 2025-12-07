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

    // Enhanced initial state with more sophisticated properties
    let fromVars: any = {
      opacity: 0,
      transformOrigin: 'center center',
      willChange: 'transform, opacity',
    };
    let toVars: any = {
      opacity: 1,
      duration,
      delay,
      ease: 'power4.out',
      clearProps: 'willChange',
    };

    switch (direction) {
      case 'up':
        fromVars.y = distance;
        fromVars.rotationX = 10;
        fromVars.scale = 0.95;
        toVars.y = 0;
        toVars.rotationX = 0;
        toVars.scale = 1;
        toVars.ease = 'back.out(1.7)';
        break;
      case 'down':
        fromVars.y = -distance;
        fromVars.rotationX = -10;
        fromVars.scale = 0.95;
        toVars.y = 0;
        toVars.rotationX = 0;
        toVars.scale = 1;
        toVars.ease = 'back.out(1.7)';
        break;
      case 'left':
        fromVars.x = distance;
        fromVars.rotationY = 15;
        fromVars.scale = 0.9;
        toVars.x = 0;
        toVars.rotationY = 0;
        toVars.scale = 1;
        toVars.ease = 'power3.out';
        break;
      case 'right':
        fromVars.x = -distance;
        fromVars.rotationY = -15;
        fromVars.scale = 0.9;
        toVars.x = 0;
        toVars.rotationY = 0;
        toVars.scale = 1;
        toVars.ease = 'power3.out';
        break;
      case 'scale':
        fromVars.scale = 0.6;
        fromVars.rotationZ = -10;
        fromVars.y = distance * 0.5;
        toVars.scale = 1;
        toVars.rotationZ = 0;
        toVars.y = 0;
        toVars.ease = 'elastic.out(1, 0.6)';
        toVars.duration = duration * 1.2;
        break;
      case 'fade':
        // Enhanced fade with subtle movement
        fromVars.y = distance * 0.3;
        fromVars.scale = 0.98;
        toVars.y = 0;
        toVars.scale = 1;
        toVars.ease = 'power2.out';
        break;
    }

    // Set initial state with improved performance
    gsap.set(targets, fromVars);

    // Enhanced ScrollTrigger configuration
    toVars.scrollTrigger = {
      trigger: trigger ? trigger : element,
      start,
      end,
      toggleActions: 'play none none reverse',
      markers: false,
      fastScrollEnd: true,
      preventOverlaps: true,
      invalidateOnRefresh: true,
      refreshPriority: -90,
    };

    // Enhanced stagger with more sophisticated options
    if (stagger > 0 && element.children.length > 0) {
      toVars.stagger = {
        amount: stagger,
        from: 'start',
        ease: 'power2.out',
        onComplete: function() {
          // Add a subtle bounce effect after all elements are revealed
          gsap.to(this.targets(), {
            scale: 1.02,
            duration: 0.2,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
          });
        }
      };
    }

    // Create the main animation
    const animation = gsap.to(targets, toVars);

    // Add intersection observer for better performance
    let observer: IntersectionObserver | null = null;

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Pre-warm the animation when element is about to be visible
              gsap.set(entry.target, { willChange: 'transform, opacity' });
            } else {
              // Clean up when element is far from viewport
              gsap.set(entry.target, { clearProps: 'willChange' });
            }
          });
        },
        {
          rootMargin: '100px',
          threshold: 0.01,
        }
      );

      if (element) {
        observer.observe(element);
      }
    }

    // Cleanup function with improved cleanup
    return () => {
      if (observer) {
        observer.disconnect();
      }

      animation.kill();

      // More targeted cleanup
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === element || (trigger.trigger && element.contains(trigger.trigger))) {
          trigger.kill();
        }
      });

      // Clear any remaining transforms
      gsap.set(targets, { clearProps: 'all' });
    };
  }, [direction, distance, duration, delay, trigger, start, end, stagger]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}