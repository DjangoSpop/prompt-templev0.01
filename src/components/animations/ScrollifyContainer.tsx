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

    const container = containerRef.current;
    const sections = container.querySelectorAll('.scrollify-section');

    // Create smooth scrolling animations for each section
    sections.forEach((section, index) => {
      // Fade in from bottom animation
      gsap.fromTo(
        section,
        {
          opacity: 0,
          y: 60,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            markers: false,
          },
        }
      );

      // Parallax effect for background elements
      const parallaxElements = section.querySelectorAll('.parallax-element');
      parallaxElements.forEach((element) => {
        gsap.to(element, {
          yPercent: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });

      // Stagger animation for child elements
      const staggerElements = section.querySelectorAll('.stagger-element');
      if (staggerElements.length > 0) {
        gsap.fromTo(
          staggerElements,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'bottom 30%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Scale effect for cards/elements on scroll
      const scaleElements = section.querySelectorAll('.scale-element');
      scaleElements.forEach((element) => {
        gsap.fromTo(
          element,
          {
            scale: 0.8,
            opacity: 0,
          },
          {
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: 'elastic.out(1, 0.8)',
            scrollTrigger: {
              trigger: element,
              start: 'top 90%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    });

    // Smooth scroll behavior for the entire container
    gsap.to(container, {
      scrollBehavior: 'smooth',
      duration: 0,
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`scrollify-container ${className}`}
      style={{
        scrollBehavior: 'smooth',
        overscrollBehavior: 'none',
      }}
    >
      {children}
    </div>
  );
}