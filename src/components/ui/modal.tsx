/**
 * Professional Modal/Dialog System with comprehensive features
 * - Proper scrolling and mobile support
 * - Form handling with validation
 * - Loading states and error handling
 * - Keyboard shortcuts (ESC to close)
 * - Focus management and accessibility
 * - Backdrop click to close
 * - Responsive sizing
 */

'use client';

import React, { useEffect, useCallback, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  preventBodyScroll?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  isLoading?: boolean;
  footer?: ReactNode;
  headerActions?: ReactNode;
}

export interface ModalHeaderProps {
  title?: string;
  description?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  actions?: ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

// ============================================
// Size Configurations
// ============================================

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
};

// sm+ (desktop) size classes — static strings so Tailwind JIT detects them
const SM_SIZE_CLASSES: Record<keyof typeof SIZE_CLASSES, string> = {
  sm:   'sm:max-w-md',
  md:   'sm:max-w-lg',
  lg:   'sm:max-w-2xl',
  xl:   'sm:max-w-4xl',
  full: 'sm:max-w-7xl',
};

// ============================================
// Modal Component
// ============================================

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  preventBodyScroll = true,
  className,
  overlayClassName,
  contentClassName,
  isLoading = false,
  footer,
  headerActions,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Handle body scroll lock
  useEffect(() => {
    if (!preventBodyScroll) return;

    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${getScrollbarWidth()}px`;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen, preventBodyScroll]);

  // Handle ESC key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement;
      
      // Focus modal
      modalRef.current?.focus();
    } else {
      // Restore focus to previous element
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose, closeOnBackdropClick]
  );

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex animate-in fade-in-0 duration-200',
        // Mobile: anchor to bottom; sm+: center
        'items-end sm:items-center sm:justify-center sm:p-6',
        className
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm',
          'animate-in fade-in-0 duration-200',
          overlayClassName
        )}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full bg-background shadow-2xl',
          'border border-border',
          'flex flex-col',
          // Mobile: full-width bottom sheet
          'rounded-t-2xl max-h-[90dvh]',
          'animate-in slide-in-from-bottom duration-300',
          // sm+: centered dialog with rounded corners
          'sm:rounded-2xl sm:max-h-[90vh]',
          SM_SIZE_CLASSES[size],
          contentClassName
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile visual cue) */}
        <div className="flex shrink-0 justify-center pt-2 pb-1 sm:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>
        {/* Header */}
        {(title || description || showCloseButton) && (
          <ModalHeader
            title={title}
            description={description}
            onClose={onClose}
            showCloseButton={showCloseButton}
            actions={headerActions}
          />
        )}

        {/* Body */}
        <div
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden',
            'px-6 py-4',
            'scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </div>
    </div>
  );

  // Render in portal
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

// ============================================
// Modal Header Component
// ============================================

export function ModalHeader({
  title,
  description,
  onClose,
  showCloseButton = true,
  actions,
  className,
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4',
        'px-6 py-4 border-b border-border',
        'shrink-0',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h2
            id="modal-title"
            className="text-lg font-semibold text-foreground leading-tight"
          >
            {title}
          </h2>
        )}
        {description && (
          <p
            id="modal-description"
            className="text-sm text-muted-foreground mt-1"
          >
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actions}
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'p-2 rounded-md',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-muted',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            )}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// Modal Footer Component
// ============================================

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3',
        'px-6 py-4 border-t border-border',
        'shrink-0 bg-muted/30',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// Modal Body Component
// ============================================

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}

// ============================================
// Utility Functions
// ============================================

function getScrollbarWidth(): number {
  if (typeof window === 'undefined') return 0;
  
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  document.body.appendChild(outer);
  
  const inner = document.createElement('div');
  outer.appendChild(inner);
  
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.parentNode?.removeChild(outer);
  
  return scrollbarWidth;
}

// ============================================
// Hook for Modal State Management
// ============================================

export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

// ============================================
// Confirmation Modal Component
// ============================================

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const variantStyles = {
    danger: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    info: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      description={description}
      isLoading={isLoading}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-md',
              'border border-border',
              'text-foreground hover:bg-muted',
              'transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-md',
              'transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2',
              variantStyles[variant]
            )}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </>
      }
    >
      {description && !title && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </Modal>
  );
}
