'use client';

import { useRef, useState, useId, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trash2, Heart, Copy, BookmarkPlus, MoreVertical, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Swipeable Mobile Card Component
 *
 * Provides swipe-to-delete/like/actions functionality for mobile cards.
 * Works with both touch and mouse interactions.
 *
 * @example
 * <SwipeableCard onSwipeDelete={() => handleDelete()}>
 *   <Card>Content</Card>
 * </SwipeableCard>
 */

interface SwipeableCardProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onLike?: () => void;
  onCopy?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  className?: string;
  swipeThreshold?: number; // Pixels to trigger swipe action
}

export function SwipeableCard({
  children,
  onDelete,
  onLike,
  onCopy,
  onBookmark,
  onShare,
  className,
  swipeThreshold = 100,
}: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const uniqueId = useId();

  // Motion values for tracking swipe
  const x = useMotionValue(0);
  const rotate = useMotionValue(0);
  const scale = useMotionValue(1);

  // Animation configuration
  const controls = useAnimation();

  // Handle drag constraints
  const handleDrag = (_: any, info: PanInfo) => {
    const { offset } = info;
    const newDirection = offset.x < 0 ? 'left' : offset.x > 0 ? 'right' : null;

    setSwipeDirection(newDirection);
    setIsDragging(true);

    // Limit drag distance
    if (Math.abs(offset.x) > swipeThreshold) {
      const clampedX = offset.x > 0 ? swipeThreshold : -swipeThreshold;
      x.set(clampedX);
      return;
    }

    x.set(offset.x);
  };

  // Handle drag end - trigger actions
  const handleDragEnd = () => {
    setIsDragging(false);

    const absoluteX = x.get();
    const absX = Math.abs(absoluteX);

    if (absX > swipeThreshold) {
      // Determine which action to trigger
      if (swipeDirection === 'left' && onDelete) {
        onDelete();
        triggerSwipeFeedback('delete');
      } else if (swipeDirection === 'left' && onLike) {
        onLike();
        triggerSwipeFeedback('like');
      } else if (swipeDirection === 'right' && onBookmark) {
        onBookmark();
        triggerSwipeFeedback('bookmark');
      } else if (swipeDirection === 'right' && onCopy) {
        onCopy();
        triggerSwipeFeedback('copy');
      } else if (swipeDirection === 'right' && onShare) {
        onShare();
        triggerSwipeFeedback('share');
      }

      // Animate off screen
      controls.start({
        x: swipeDirection === 'left' ? -300 : 300,
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.3 }
      });

      // Reset animation after it completes
      setTimeout(() => {
        x.set(0);
        rotate.set(0);
        scale.set(1);
        setSwipeDirection(null);
      }, 400);
    } else {
      // Snap back to original position
      controls.start({
        x: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      });
      setSwipeDirection(null);
    }
  };

  // Visual feedback during swipe
  const triggerSwipeFeedback = (action: 'delete' | 'like' | 'bookmark' | 'copy' | 'share') => {
    // Haptic feedback if supported (mobile)
    if ('vibrate' in navigator) {
      switch (action) {
        case 'delete':
          navigator.vibrate([50, 50, 50]); // Three short pulses
          break;
        case 'like':
          navigator.vibrate(100); // Gentle vibration
          break;
        default:
          navigator.vibrate(20); // Subtle feedback
      }
    }

    // Toast notification
    const messages = {
      delete: 'Deleted',
      like: 'Added to favorites',
      bookmark: 'Saved',
      copy: 'Copied to clipboard',
      share: 'Share options opened',
    };
    toast(messages[action]);
  };

  // Swipe hint animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDragging(false);
      setSwipeDirection(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Swipe indicators - show when card is interactable */}
      {onDelete && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none transition-colors duration-200',
            swipeDirection === 'left' && 'bg-red-500/20',
            !swipeDirection && 'opacity-0'
          )}
        >
          <Trash2 className="h-4 w-4 text-red-500" strokeWidth={2} />
        </div>
      )}
      {onBookmark && (
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none transition-colors duration-200',
            swipeDirection === 'right' && 'bg-amber-500/20',
            !swipeDirection && 'opacity-0'
          )}
        >
          <BookmarkPlus className="h-4 w-4 text-amber-500" strokeWidth={2} />
        </div>
      )}

      {/* Draggable card */}
      <motion.div
        ref={cardRef}
        id={uniqueId}
        style={{ x, rotate, scale, touchAction: 'none' }}
        drag="x"
        dragConstraints={{ left: -swipeThreshold, right: swipeThreshold }}
        dragElastic={0.05}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="w-full"
      >
        {children}
      </motion.div>

      {/* Swipe hint overlay (fades in after 2s of inactivity) */}
      {!isDragging && !swipeDirection && (
        <div
          className={cn(
            'absolute inset-0 pointer-events-none flex items-center justify-between px-4 opacity-0 transition-opacity duration-500',
            'animate-in fade-in delay-[2000ms] duration-500'
          )}
        >
          {onDelete && (
            <div className="flex items-center gap-1">
              <ChevronLeft className="h-3 w-3 text-white/40" />
              <span className="text-xs text-white/60 font-medium">Swipe to delete</span>
            </div>
          )}
          {onBookmark && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/60 font-medium">Swipe to save</span>
              <ChevronRight className="h-3 w-3 text-white/40" />
            </div>
          )}
        </div>
      )}

      {/* Action buttons overlay - show on swipe */}
      {(swipeDirection === 'left' || swipeDirection === 'right') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'absolute inset-0 flex items-center justify-center pointer-events-none',
            swipeDirection === 'left' && 'bg-gradient-to-r from-red-500 via-red-400 to-red-500',
            swipeDirection === 'right' && 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500'
          )}
        >
          {swipeDirection === 'left' && (
            <div className="flex items-center gap-2 text-white">
              <Trash2 className="h-6 w-6" />
              <span className="font-semibold">Delete</span>
            </div>
          )}
          {swipeDirection === 'right' && (
            <div className="flex items-center gap-2 text-white">
              <BookmarkPlus className="h-6 w-6" />
              <span className="font-semibold">Save</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Mobile Touch Button Component
 *
 * Ensures all buttons meet 44x44px minimum touch target size
 * for iOS and Android guidelines.
 *
 * @example
 * <MobileTouchButton onClick={handleAction} variant="primary">
 *   <Zap className="h-4 w-4" />
 *   <span>Optimize</span>
 * </MobileTouchButton>
 */

interface MobileTouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
  fullWidth?: boolean;
}

export function MobileTouchButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className,
  ariaLabel,
  fullWidth = false,
}: MobileTouchButtonProps) {
  const baseStyles = cn(
    // Minimum 44x44px touch target
    'min-h-[44px] min-w-[44px]',
    // Flexible sizing based on size prop
    size === 'sm' && 'px-3 py-2',
    size === 'md' && 'px-4 py-2.5',
    size === 'lg' && 'px-5 py-3',
    // Full width if specified
    fullWidth && 'w-full',
    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed',
    // Loading state
    loading && 'cursor-wait'
  );

  const variantStyles = cn(
    variant === 'primary' && [
      'bg-gradient-to-r from-[#C9A227] to-[#CBA135]',
      'text-white',
      'shadow-pyramid',
      'hover:from-[#E9C25A] hover:to-[#D4A574]'
    ],
    variant === 'secondary' && [
      'bg-obsidian-800',
      'text-desert-sand-200',
      'border-2 border-[#C9A227]/30',
      'hover:bg-obsidian-700'
    ],
    variant === 'ghost' && [
      'bg-transparent',
      'text-foreground',
      'hover:bg-foreground/5'
    ],
    variant === 'danger' && [
      'bg-red-500',
      'text-white',
      'hover:bg-red-600'
    ]
  );

  const loadingSpinner = (
    <div className="flex items-center justify-center">
      <div className="h-4 w-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={cn(
        baseStyles,
        variantStyles,
        'flex',
        iconPosition === 'left' && 'flex-row',
        iconPosition === 'right' && 'flex-row-reverse',
        'items-center',
        'justify-center',
        'gap-2',
        'rounded-xl',
        'font-semibold',
        'transition-all',
        'duration-200',
        'active:scale-95',
        'disabled:active:scale-100',
        className
      )}
    >
      {loading ? loadingSpinner : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className={icon ? 'flex-1' : ''}>{children}</span>
        </>
      )}
    </button>
  );
}

/**
 * Mobile Optimized Modal Component
 *
 * Full-screen modal optimized for mobile with proper
 * scrolling, touch targets, and gesture support.
 */

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
}

export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
}: MobileModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute inset-x-0 bottom-0 flex flex-col max-h-[90vh]"
      >
        {/* Handle bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-obsidian-900 border-b border-[#C9A227]/20">
          <span className="text-lg font-semibold text-desert-sand-200">{title}</span>

          {showCloseButton && (
            <MobileTouchButton
              onClick={onClose}
              variant="ghost"
              size="sm"
              ariaLabel="Close modal"
              icon={<Share2 className="h-5 w-5 rotate-45" />}
            >
              Done
            </MobileTouchButton>
          )}
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 py-3 bg-obsidian-900 border-t border-[#C9A227]/20">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Mobile Loading Skeleton Component
 *
 * Optimized loading state for mobile with proper touch hints
 * and reduced complexity for faster rendering.
 */

interface MobileSkeletonProps {
  variant?: 'card' | 'list' | 'text';
  lines?: number;
}

export function MobileSkeleton({
  variant = 'card',
  lines = 3,
}: MobileSkeletonProps) {
  return (
    <div className="space-y-3">
      {variant === 'card' && (
        <div className="h-40 bg-gradient-to-br from-[#EBD5A7]/20 to-transparent rounded-xl border border-[#C9A227]/20 overflow-hidden relative">
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent"
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
            }}
          />
          {/* Content placeholder */}
          <div className="space-y-2 p-4">
            <div className="h-4 bg-white/10 rounded" />
            <div className="h-4 w-3/4 bg-white/10 rounded" />
            <div className="h-4 w-1/2 bg-white/10 rounded" />
          </div>
        </div>
      )}

      {variant === 'list' && (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="h-16 bg-gradient-to-r from-[#EBD5A7]/10 to-transparent rounded-xl border border-[#C9A227]/20 flex items-center gap-3 px-4 relative overflow-hidden">
              {/* Avatar skeleton */}
              <div className="h-12 w-12 rounded-full bg-white/20 flex-shrink-0" />

              {/* Text skeletons */}
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-full" />
              </div>

              {/* Shimmer effect */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {variant === 'text' && (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="h-4 bg-gradient-to-r from-[#EBD5A7]/10 to-transparent rounded-lg relative overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C9A227]/30 to-transparent"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite',
                }}
              />
              <div className="h-full w-2/3 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Add shimmer keyframes if not already present
if (typeof document !== 'undefined' && !document.querySelector('#shimmer-keyframes')) {
  const style = document.createElement('style');
  style.id = 'shimmer-keyframes';
  style.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `;
  document.head.appendChild(style);
}
