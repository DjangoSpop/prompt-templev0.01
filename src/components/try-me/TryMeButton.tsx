'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TryMeChatModal } from './TryMeChatModal';
import { gsap } from 'gsap';

interface TryMeButtonProps {
  className?: string;
  onHeroComplete?: boolean;
}

export function TryMeButton({ className, onHeroComplete = false }: TryMeButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pulseAnimation = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initial state
    gsap.set(button, { opacity: 0, scale: 0.98 });

    // Animate in after hero completion
    if (onHeroComplete) {
      gsap.to(button, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.2,
      });

      // Add pulse effect if motion is allowed
      if (!prefersReducedMotion) {
        pulseAnimation.current = gsap.to(button, {
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)',
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
          delay: 1,
        });
      }
    }

    return () => {
      if (pulseAnimation.current) {
        pulseAnimation.current.kill();
      }
    };
  }, [onHeroComplete]);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={handleClick}
        className={`
          relative bg-gradient-to-r from-[#667eea] to-[#764ba2]
          hover:from-[#5a6fd8] hover:to-[#6a4190]
          text-white font-semibold px-8 py-3 rounded-lg
          transition-all duration-300 ease-out
          transform hover:scale-105 hover:shadow-xl
          focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-opacity-50
          ${className}
        `}
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
      >
        <span className="relative z-10">Try Me</span>
        <div className="absolute inset-0 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-lg opacity-0 hover:opacity-20 transition-opacity duration-300" />
      </Button>

      <TryMeChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}