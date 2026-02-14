import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TEMPLE LOGO COMPONENT - Sacred Geometric Design
// Professional, Scalable, Animated SVG Logo
// ============================================================================

export interface TempleLogoProps {
  /** Size of the logo in pixels */
  size?: number;
  
  /** Enable floating particle animations */
  animate?: boolean;
  
  /** Enable glow effect */
  glow?: boolean;
  
  /** Custom className for the container */
  className?: string;
  
  /** Color variant */
  variant?: 'gold' | 'silver' | 'bronze' | 'emerald';
  
  /** Simplified version (fewer details) */
  simplified?: boolean;
  
  /** Enable hover effects */
  interactive?: boolean;
}

const colorVariants = {
  gold: {
    primary: '#f59e0b',
    secondary: '#d97706',
    tertiary: '#b45309',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  silver: {
    primary: '#94a3b8',
    secondary: '#64748b',
    tertiary: '#475569',
    glow: 'rgba(148, 163, 184, 0.3)',
  },
  bronze: {
    primary: '#92400e',
    secondary: '#78350f',
    tertiary: '#451a03',
    glow: 'rgba(146, 64, 14, 0.3)',
  },
  emerald: {
    primary: '#10b981',
    secondary: '#059669',
    tertiary: '#047857',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
};

/**
 * TempleLogo - Sacred geometric logo component
 * 
 * Features:
 * - SVG-based for perfect scaling
 * - Multiple color variants
 * - Optional animations (glow, particles)
 * - Interactive hover states
 * - Simplified mode for small sizes
 * - Accessible and semantic
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <TempleLogo size={48} />
 * 
 * // Animated with glow
 * <TempleLogo size={64} animate glow />
 * 
 * // Silver variant, simplified
 * <TempleLogo size={32} variant="silver" simplified />
 * 
 * // Interactive with custom class
 * <TempleLogo size={80} interactive className="my-logo" />
 * ```
 */
export const TempleLogo: React.FC<TempleLogoProps> = ({
  size = 48,
  animate = false,
  glow = false,
  className,
  variant = 'gold',
  simplified = false,
  interactive = false,
}) => {
  const colors = colorVariants[variant];
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (interactive) setIsHovered(false);
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      style={{ width: size, height: size }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label="Eye of Horus Temple Logo"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'transition-all duration-500',
          glow && 'animate-temple-glow',
          interactive && isHovered && 'scale-105'
        )}
        style={{
          filter: glow
            ? `drop-shadow(0 0 ${Math.max(6, size / 8)}px ${colors.glow})`
            : undefined,
        }}
      >
        {/* ========== GRADIENTS & FILTERS ========== */}
        <defs>
          <linearGradient id={`eye-gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="60%" stopColor={colors.secondary} />
          </linearGradient>

          <radialGradient id={`iris-gradient-${variant}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.tertiary} stopOpacity="0.9" />
          </radialGradient>

          <filter id={`eye-glow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* BACKGROUND SPHERE */}
        <circle cx="50" cy="50" r="48" fill={`url(#iris-gradient-${variant})`} />

        {!simplified && (
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
        )}

        {/* EYE SHAPE - Almond / Horus Eye */}
        <g className="eye-group" transform="translate(0,0)">
          <path
            d="M15 50 C28 28 72 28 85 50 C72 72 28 72 15 50 Z"
            fill="rgba(0,0,0,0.06)"
            stroke={`url(#eye-gradient-${variant})`}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Eyebrow / Brow curve */}
          <path
            d="M18 34 C36 18 64 18 82 34"
            fill="none"
            stroke={colors.secondary}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* Iris + pupil */}
          <circle cx="50" cy="50" r="9" fill={`url(#iris-gradient-${variant})`} filter={`url(#eye-glow-${variant})`} />
          <circle cx="50" cy="50" r="4" fill="rgba(12,12,12,1)" />

          {!simplified && (
            <circle cx="53" cy="47" r="1.2" fill="rgba(255,255,255,0.75)" />
          )}

          {/* Horus stylized tail / marking */}
          {!simplified && (
            <path
              d="M28 62 C22 68 36 76 46 70"
              stroke={colors.tertiary}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Teardrop / accent beneath eye (animated when hovered) */}
          {!simplified && (
            <path
              d="M62 62 C64 66 60 72 56 74 C53 75 50 74 49 71 C48 68 52 66 54 65 C58 63 60 62 62 62 Z"
              fill={colors.primary}
              opacity={interactive && isHovered ? 0.95 : 0.65}
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 1; 0 0"
                dur="1.6s"
                repeatCount={interactive && isHovered ? 'indefinite' : '0'}
              />
            </path>
          )}
        </g>
      </svg>

      {/* ========== FLOATING PARTICLES ========== */}
      {animate && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{
              background: colors.primary,
              animation: 'float-particle-1 3s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full"
            style={{
              background: colors.secondary,
              animation: 'float-particle-2 3.5s ease-in-out infinite 0.5s',
            }}
          />
          <div
            className="absolute top-1/4 right-1/4 w-1 h-1 rounded-full"
            style={{
              background: colors.primary,
              animation: 'float-particle-3 4s ease-in-out infinite 1s',
            }}
          />
        </div>
      )}

      {/* ========== PULSE RING ON HOVER ========== */}
      {interactive && isHovered && (
        <div
          className="absolute inset-0 rounded-full border-2 animate-ping"
          style={{
            borderColor: colors.primary,
            opacity: 0.3,
          }}
        />
      )}

      {/* Required CSS Animations - Include in your global styles */}
      <style jsx global>{`
        @keyframes temple-glow {
          0%,
          100% {
            filter: drop-shadow(0 0 8px ${colors.glow});
          }
          50% {
            filter: drop-shadow(0 0 16px ${colors.glow});
          }
        }

        @keyframes float-particle-1 {
          0%,
          100% {
            transform: translate(-50%, 0px) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -20px) scale(1.2);
            opacity: 1;
          }
        }

        @keyframes float-particle-2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translate(-5px, -15px) scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes float-particle-3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(5px, -18px) scale(1.15);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// EXPORT VARIANTS FOR CONVENIENCE
// ============================================================================

export const TempleLogoAnimated: React.FC<Omit<TempleLogoProps, 'animate' | 'glow'>> = (
  props
) => <TempleLogo {...props} animate glow />;

export const TempleLogoSimple: React.FC<Omit<TempleLogoProps, 'simplified'>> = (props) => (
  <TempleLogo {...props} simplified />
);

export const TempleLogoInteractive: React.FC<Omit<TempleLogoProps, 'interactive'>> = (
  props
) => <TempleLogo {...props} interactive />;

// Default export
export default TempleLogo;
