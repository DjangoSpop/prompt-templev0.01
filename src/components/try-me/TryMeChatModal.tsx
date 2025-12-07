'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from './ChatInterface';

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
      // Store the last focused element
      lastFocusedElement.current = document.activeElement as HTMLElement;

      // Lock scroll
      document.body.style.overflow = 'hidden';

      // Focus the modal
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
    } else {
      // Restore scroll
      document.body.style.overflow = '';

      // Restore focus
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

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: 12,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 400,
        duration: 0.2
      }
    },
    exit: {
      opacity: 0,
      y: 12,
      scale: 0.95,
      transition: {
        duration: 0.15
      }
    }
  };

  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animationProps = prefersReducedMotion ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 }
  } : {};

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
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
            className="relative w-full max-w-6xl h-[90vh] mx-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden"
            variants={prefersReducedMotion ? undefined : modalVariants}
            initial={prefersReducedMotion ? { opacity: 0 } : "hidden"}
            animate={prefersReducedMotion ? { opacity: 1 } : "visible"}
            exit={prefersReducedMotion ? { opacity: 0 } : "exit"}
            {...animationProps}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                  Try Prompt Temple
                </h2>
                <p id="modal-description" className="text-sm text-gray-600 dark:text-gray-400">
                  Experience prompt optimization in seconds
                </p>
              </div>
              <Button
                ref={firstFocusableRef}
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <ChatInterface onClose={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}