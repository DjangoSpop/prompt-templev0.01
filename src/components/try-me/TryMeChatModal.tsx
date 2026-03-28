'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from './ChatInterface';
import Eyehorus from '@/components/pharaonic/Eyehorus';

interface TryMeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TryMeChatModal({ isOpen, onClose }: TryMeChatModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      lastFocusedElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      if (lastFocusedElement.current) {
        lastFocusedElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (!isOpen || e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleFocusTrap);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen, onClose]);

  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 400, duration: 0.2 },
    },
    exit: { opacity: 0, y: 12, scale: 0.95, transition: { duration: 0.15 } },
  } as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: 'rgba(10, 10, 18, 0.7)' }}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            {...(prefersReducedMotion ? { transition: { duration: 0.15 } } : {})}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className="relative w-full max-w-4xl h-[85vh] mx-4 overflow-hidden rounded-2xl border border-amber-500/15 shadow-[0_0_60px_rgba(212,175,55,0.1)]"
            style={{
              background: 'linear-gradient(180deg, #0E0F14 0%, #12131a 100%)',
            }}
            variants={prefersReducedMotion ? undefined : modalVariants}
            initial={prefersReducedMotion ? { opacity: 0 } : 'hidden'}
            animate={prefersReducedMotion ? { opacity: 1 } : 'visible'}
            exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            {/* Gold top edge */}
            <div
              className="absolute left-0 right-0 top-0 h-px z-10"
              style={{
                background: 'linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.5) 30%, rgba(255,224,102,0.6) 50%, rgba(212,175,55,0.5) 70%, transparent 95%)',
              }}
            />

            {/* Header */}
            <div
              className="relative flex items-center justify-between px-5 py-4 border-b border-amber-500/10"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.04) 0%, rgba(14,15,20,0.8) 100%)',
              }}
            >
              {/* Dot pattern in header */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, #d4af37 0.5px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative flex items-center gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.5))' }}
                >
                  <Eyehorus
                    size={36}
                    variant="tryme"
                    glow
                    glowIntensity="medium"
                    animated
                    speedMultiplier={2}
                    showLabel={false}
                  />
                </div>
                <div>
                  <h2
                    id="modal-title"
                    className="text-lg font-bold"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      background: 'linear-gradient(135deg, #ffe066 0%, #d4af37 50%, #CBA135 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    The Sacred Forge
                  </h2>
                  <p id="modal-description" className="text-xs text-stone-400">
                    Paste your prompt — watch it transform
                  </p>
                </div>
              </div>

              <div className="relative flex items-center gap-2">
                {/* Powered by badge */}
                <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/15 bg-amber-500/5 px-3 py-1">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span className="text-[10px] font-semibold text-amber-300/70 tracking-wide uppercase">
                    AI Powered
                  </span>
                </div>

                <Button
                  ref={firstFocusableRef}
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 rounded-full text-stone-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 65px)' }}>
              <ChatInterface onClose={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
