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

    // Add a master timeline for coordinated animations
    const masterTimeline = gsap.timeline();

    // Create smooth scrolling animations for each section
    sections.forEach((section, index) => {
      // Enhanced fade in from bottom animation with better easing
      gsap.fromTo(
        section,
        {
          opacity: 0,
          y: 80,
          scale: 0.92,
          rotationX: 15,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: 1.4,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 90%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse',
            markers: false,
            fastScrollEnd: true,
            preventOverlaps: true,
          },
        }
      );

      // Enhanced parallax effect for background elements
      const parallaxElements = section.querySelectorAll('.parallax-element');
      parallaxElements.forEach((element, i) => {
        gsap.to(element, {
          yPercent: -30 - (i * 10), // Vary the parallax effect
          xPercent: Math.sin(i) * 5, // Add subtle horizontal movement
          rotation: Math.sin(i) * 2, // Add subtle rotation
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

      // Enhanced stagger animation for child elements
      const staggerElements = section.querySelectorAll('.stagger-element');
      if (staggerElements.length > 0) {
        gsap.fromTo(
          staggerElements,
          {
            opacity: 0,
            y: 40,
            scale: 0.95,
            rotationY: 15,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationY: 0,
            duration: 1,
            stagger: {
              amount: 0.5,
              from: 'start',
              ease: 'power2.out',
            },
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              end: 'bottom 25%',
              toggleActions: 'play none none reverse',
              fastScrollEnd: true,
            },
          }
        );
      }

      // Enhanced scale effect for cards/elements on scroll
      const scaleElements = section.querySelectorAll('.scale-element');
      scaleElements.forEach((element, i) => {
        gsap.fromTo(
          element,
          {
            scale: 0.7,
            opacity: 0,
            y: 60,
            rotationZ: -5 + (i % 2) * 10, // Alternate rotation
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            rotationZ: 0,
            duration: 1.5,
            ease: 'elastic.out(1, 0.6)',
            scrollTrigger: {
              trigger: element,
              start: 'top 95%',
              end: 'bottom 15%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );

        // Add hover enhancement
        element.addEventListener('mouseenter', () => {
          gsap.to(element, {
            scale: 1.05,
            rotationY: 5,
            duration: 0.3,
            ease: 'power2.out',
          });
        });

        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            scale: 1,
            rotationY: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        });
      });

      // Add magnetic effect for interactive elements
      const magneticElements = section.querySelectorAll('button, a, .magnetic-element');
      magneticElements.forEach((element) => {
        element.addEventListener('mousemove', (e) => {
          const rect = element.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;

          gsap.to(element, {
            x: x * 0.15,
            y: y * 0.15,
            duration: 0.3,
            ease: 'power2.out',
          });
        });

        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)',
          });
        });
      });
    });

    // Enhanced smooth scroll behavior
    gsap.set(container, {
      scrollBehavior: 'smooth',
    });

    // Add scroll progress indicator
    gsap.to('.scroll-progress', {
      scaleX: 1,
      transformOrigin: 'left center',
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });

    // Refresh ScrollTrigger on window resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      masterTimeline.kill();
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