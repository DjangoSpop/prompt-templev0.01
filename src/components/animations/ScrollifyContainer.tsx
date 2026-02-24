'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollifyContainerProps {
  children: ReactNode;
  className?: string;
}

export function ScrollifyContainer({ children, className = '' }: ScrollifyContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // ── Respect prefers-reduced-motion ──────────────────────────
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return; // sections stay fully visible – no animations

    const container = containerRef.current;
    const sections = container.querySelectorAll('.scrollify-section');

    // ── Responsive breakpoints ─────────────────────────────────
    const isMobile  = window.innerWidth < 768;
    const isTablet  = window.innerWidth >= 768 && window.innerWidth < 1024;

    // Use softer values on smaller screens
    const sectionY        = isMobile ? 40 : 60;
    const sectionScale    = isMobile ? 0.97 : 0.95;
    const sectionRotX     = isMobile ? 0 : 8;
    const sectionDuration = isMobile ? 0.8 : 1.1;
    const triggerStart    = isMobile ? 'top 92%' : isTablet ? 'top 88%' : 'top 85%';

    const cleanups: (() => void)[] = [];

    // Create smooth scrolling animations for each section
    sections.forEach((section) => {
      // Gentle fade-in from below
      gsap.fromTo(
        section,
        {
          opacity: 0,
          y: sectionY,
          scale: sectionScale,
          rotationX: sectionRotX,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: sectionDuration,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: triggerStart,
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            fastScrollEnd: true,
            preventOverlaps: true,
            invalidateOnRefresh: true,
          },
        }
      );

      // Parallax — desktop only
      if (!isMobile) {
        const parallaxElements = section.querySelectorAll('.parallax-element');
        parallaxElements.forEach((element, i) => {
          gsap.to(element, {
            yPercent: -20 - (i * 8),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
              invalidateOnRefresh: true,
            },
          });
        });
      }

      // Stagger children
      const staggerElements = section.querySelectorAll('.stagger-element');
      if (staggerElements.length > 0) {
        gsap.fromTo(
          staggerElements,
          { opacity: 0, y: isMobile ? 20 : 30, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: isMobile ? 0.6 : 0.8,
            stagger: { amount: 0.4, from: 'start', ease: 'power2.out' },
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: triggerStart,
              end: 'bottom 25%',
              toggleActions: 'play none none reverse',
              fastScrollEnd: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      // Scale elements (cards)
      const scaleElements = section.querySelectorAll('.scale-element');
      scaleElements.forEach((element, i) => {
        gsap.fromTo(
          element,
          { scale: 0.85, opacity: 0, y: isMobile ? 30 : 50 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.7 : 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 93%',
              end: 'bottom 15%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );

        // Only apply hover effects on devices that support hover
        if (!isMobile && window.matchMedia('(hover: hover)').matches) {
          const onEnter = () => gsap.to(element, { scale: 1.03, duration: 0.25, ease: 'power2.out' });
          const onLeave = () => gsap.to(element, { scale: 1, duration: 0.25, ease: 'power2.out' });
          element.addEventListener('mouseenter', onEnter);
          element.addEventListener('mouseleave', onLeave);
          cleanups.push(() => {
            element.removeEventListener('mouseenter', onEnter);
            element.removeEventListener('mouseleave', onLeave);
          });
        }
      });

      // Magnetic button effect — pointer devices only
      if (!isMobile && window.matchMedia('(hover: hover)').matches) {
        const magneticElements = section.querySelectorAll('button, a, .magnetic-element');
        magneticElements.forEach((element) => {
          const onMove = (e: Event) => {
            const me = e as MouseEvent;
            const rect = element.getBoundingClientRect();
            const x = me.clientX - rect.left - rect.width / 2;
            const y = me.clientY - rect.top  - rect.height / 2;
            gsap.to(element, { x: x * 0.12, y: y * 0.12, duration: 0.3, ease: 'power2.out' });
          };
          const onLeave = () => gsap.to(element, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1,0.4)' });
          element.addEventListener('mousemove', onMove);
          element.addEventListener('mouseleave', onLeave);
          cleanups.push(() => {
            element.removeEventListener('mousemove', onMove);
            element.removeEventListener('mouseleave', onLeave);
          });
        });
      }
    });

    // Scroll progress bar
    const progressEl = document.querySelector('.scroll-progress');
    if (progressEl) {
      gsap.to(progressEl, {
        scaleX: 1,
        transformOrigin: 'left center',
        ease: 'none',
        scrollTrigger: { trigger: container, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
      });
    }

    // Refresh on resize
    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanups.forEach((fn) => fn());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`scrollify-container ${className}`}
      style={{ overscrollBehavior: 'none' }}
    >
      {children}
    </div>
  );
}