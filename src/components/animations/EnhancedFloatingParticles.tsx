'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface EnhancedFloatingParticlesProps {
  count?: number;
  className?: string;
  colors?: string[];
  size?: { min: number; max: number };
  speed?: { min: number; max: number };
  interactive?: boolean;
}

export function EnhancedFloatingParticles({
  count = 30,
  className = '',
  colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'],
  size = { min: 2, max: 8 },
  speed = { min: 2, max: 8 },
  interactive = true,
}: EnhancedFloatingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const animationsRef = useRef<gsap.core.Timeline[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // ── Respect prefers-reduced-motion ─────────────────────────
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // ── Responsive: fewer particles on mobile ─────────────────
    const mobile = window.innerWidth < 768;
    const effectiveCount = mobile ? Math.min(count, 10) : count;

    const container = containerRef.current;
    particlesRef.current = [];
    animationsRef.current = [];

    // Create particles
    for (let i = 0; i < effectiveCount; i++) {
      const particle = document.createElement('div');
      const particleSize = gsap.utils.random(size.min, size.max);
      const color = colors[Math.floor(Math.random() * colors.length)];

      particle.style.cssText = `
        position: absolute;
        width: ${particleSize}px;
        height: ${particleSize}px;
        background: radial-gradient(circle, ${color}80, ${color}40);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        box-shadow: 0 0 ${particleSize * 2}px ${color}40;
        filter: blur(0.5px);
      `;

      // Random starting position
      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        opacity: gsap.utils.random(0.3, 0.8),
        scale: gsap.utils.random(0.5, 1.5),
      });

      container.appendChild(particle);
      particlesRef.current.push(particle);

      // Create floating animation timeline
      const tl = gsap.timeline({ repeat: -1 });

      // Random movement pattern
      const duration = gsap.utils.random(speed.min, speed.max);
      const xMovement = gsap.utils.random(-200, 200);
      const yMovement = gsap.utils.random(-150, 150);

      tl.to(particle, {
        x: `+=${xMovement}`,
        y: `+=${yMovement}`,
        duration: duration,
        ease: 'power1.inOut',
      })
      .to(particle, {
        x: `+=${-xMovement * 0.8}`,
        y: `+=${-yMovement * 0.8}`,
        duration: duration * 0.8,
        ease: 'power1.inOut',
      })
      .to(particle, {
        x: `+=${xMovement * 0.6}`,
        y: `+=${yMovement * 0.6}`,
        duration: duration * 0.6,
        ease: 'power1.inOut',
      });

      // Add subtle pulsing
      gsap.to(particle, {
        opacity: gsap.utils.random(0.2, 0.9),
        scale: gsap.utils.random(0.3, 1.8),
        duration: gsap.utils.random(2, 5),
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });

      // Add rotation
      gsap.to(particle, {
        rotation: 360,
        duration: gsap.utils.random(10, 20),
        repeat: -1,
        ease: 'none',
      });

      animationsRef.current.push(tl);
    }

    // Mouse interaction effect — pointer-capable devices only
    let mouseX = 0;
    let mouseY = 0;
    const hasHover = window.matchMedia('(hover: hover)').matches;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (interactive && hasHover) {
        particlesRef.current.forEach((particle, index) => {
          const rect = particle.getBoundingClientRect();
          const particleX = rect.left + rect.width / 2;
          const particleY = rect.top + rect.height / 2;

          const distance = Math.sqrt(
            Math.pow(mouseX - particleX, 2) + Math.pow(mouseY - particleY, 2)
          );

          if (distance < 100) {
            const force = (100 - distance) / 100;
            const angle = Math.atan2(particleY - mouseY, particleX - mouseX);
            const pushX = Math.cos(angle) * force * 50;
            const pushY = Math.sin(angle) * force * 50;

            gsap.to(particle, {
              x: `+=${pushX}`,
              y: `+=${pushY}`,
              scale: `+=${force * 0.5}`,
              duration: 0.3,
              ease: 'power2.out',
            });
          }
        });
      }
    };

    // Screen boundary collision detection
    const checkBoundaries = () => {
      particlesRef.current.forEach((particle) => {
        const rect = particle.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        if (rect.left < containerRect.left) {
          gsap.set(particle, { x: containerRect.width });
        }
        if (rect.right > containerRect.right) {
          gsap.set(particle, { x: 0 });
        }
        if (rect.top < containerRect.top) {
          gsap.set(particle, { y: containerRect.height });
        }
        if (rect.bottom > containerRect.bottom) {
          gsap.set(particle, { y: 0 });
        }
      });
    };

    // Parallax on scroll — desktop only (avoids jank on mobile)
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        particlesRef.current.forEach((particle, index) => {
          const s = (index % 3 + 1) * 0.05;
          gsap.to(particle, { y: `+=${scrollY * s}`, duration: 0.1, ease: 'none' });
        });
        ticking = false;
      });
    };

    if (interactive && hasHover) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    const boundaryInterval = setInterval(checkBoundaries, 5000);

    if (!mobile) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Resize handler
    const handleResize = () => {
      particlesRef.current.forEach((particle) => {
        gsap.set(particle, {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        });
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (interactive && hasHover) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (!mobile) {
        window.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleResize);
      clearInterval(boundaryInterval);

      animationsRef.current.forEach((tl) => tl.kill());
      particlesRef.current.forEach((particle) => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });

      particlesRef.current = [];
      animationsRef.current = [];
    };
  }, [count, colors, size.min, size.max, speed.min, speed.max, interactive]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{
        background: 'transparent',
        zIndex: 1,
      }}
    />
  );
}