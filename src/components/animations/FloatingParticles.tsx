'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

export function FloatingParticles({ count = 50, className = '' }: FloatingParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particles: HTMLDivElement[] = [];

    // Create particles
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(0, 128, 128, 0.4) 100%);
        border-radius: 50%;
        pointer-events: none;
        opacity: ${Math.random() * 0.6 + 0.2};
      `;

      // Random starting position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;

      container.appendChild(particle);
      particles.push(particle);
    }

    // Animate particles
    particles.forEach((particle, index) => {
      const duration = Math.random() * 20 + 10; // 10-30 seconds
      const delay = Math.random() * 5; // 0-5 seconds delay

      gsap.to(particle, {
        x: `+=${Math.random() * 200 - 100}`,
        y: `+=${Math.random() * 200 - 100}`,
        rotation: 360,
        duration: duration,
        delay: delay,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Floating animation
      gsap.to(particle, {
        y: `+=${Math.random() * 30 + 10}`,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: Math.random() * 2,
      });

      // Opacity pulsing
      gsap.to(particle, {
        opacity: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 4 + 2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        delay: Math.random() * 3,
      });
    });

    // Cleanup
    return () => {
      particles.forEach((particle) => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{
        background: 'transparent',
      }}
    />
  );
}