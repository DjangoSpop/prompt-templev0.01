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
      aria-label="Prompt Temple Logo"
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
          interactive && isHovered && 'scale-110 rotate-3'
        )}
        style={{
          filter: glow
            ? `drop-shadow(0 0 ${size / 6}px ${colors.glow})`
            : undefined,
        }}
      >
        {/* ========== GRADIENT DEFINITIONS ========== */}
        <defs>
          <linearGradient id={`gold-gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
            <stop offset="50%" stopColor={colors.secondary} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.tertiary} stopOpacity="1" />
          </linearGradient>

          <radialGradient id={`sphere-gradient-${variant}`}>
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </radialGradient>

          <filter id={`temple-glow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={`eye-glow-${variant}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ========== BACKGROUND CIRCLE ========== */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill={`url(#sphere-gradient-${variant})`}
          filter={`url(#temple-glow-${variant})`}
        />

        {!simplified && (
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(0, 0, 0, 0.2)"
            strokeWidth="1"
          />
        )}

        {/* ========== MAIN PYRAMID STRUCTURE ========== */}
        <g className="pyramid-main">
          {/* Base Pyramid - Foundation */}
          <path
            d="M 50 15 L 75 75 L 25 75 Z"
            fill="rgba(26, 26, 26, 0.9)"
            strokeWidth="1.5"
            stroke={`url(#gold-gradient-${variant})`}
          />

          {/* Middle Pyramid - Knowledge */}
          <path
            d="M 50 25 L 68 65 L 32 65 Z"
            fill="rgba(26, 26, 26, 0.7)"
            strokeWidth="1"
            stroke={`url(#gold-gradient-${variant})`}
          />

          {!simplified && (
            /* Inner Pyramid - Wisdom */
            <path
              d="M 50 35 L 60 55 L 40 55 Z"
              fill="rgba(26, 26, 26, 0.5)"
              strokeWidth="0.5"
              stroke={`url(#gold-gradient-${variant})`}
            />
          )}

          {/* Capstone - All-Seeing Eye */}
          <circle
            cx="50"
            cy="25"
            r="4"
            fill={colors.primary}
            filter={`url(#eye-glow-${variant})`}
          />

          {/* Eye Pupil */}
          <circle cx="50" cy="25" r="2" fill="rgba(26, 26, 26, 1)" />

          {!simplified && (
            /* Eye Highlight */
            <circle cx="51" cy="24" r="0.8" fill="rgba(255, 255, 255, 0.6)" />
          )}
        </g>

        {/* ========== TEMPLE PILLARS ========== */}
        <g className="temple-pillars">
          <rect
            x="28"
            y="75"
            width="6"
            height="15"
            fill={`${colors.secondary}CC`}
            rx="1"
          />
          <rect
            x="66"
            y="75"
            width="6"
            height="15"
            fill={`${colors.secondary}CC`}
            rx="1"
          />
          <line
            x1="25"
            y1="90"
            x2="75"
            y2="90"
            stroke={colors.tertiary}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* ========== SACRED SYMBOLS ========== */}
        {!simplified && (
          <g className="sacred-symbols" opacity="0.6">
            {/* Top Star */}
            <path d="M 50 12 L 51 14 L 49 14 Z" fill={colors.primary} />

            {/* Side Ankhs */}
            <circle cx="20" cy="50" r="2" fill={`${colors.primary}80`} />
            <circle cx="80" cy="50" r="2" fill={`${colors.primary}80`} />
          </g>
        )}

        {/* ========== ENERGY LINES ========== */}
        {!simplified && isHovered && (
          <g className="energy-lines" opacity="0.4">
            <line
              x1="50"
              y1="25"
              x2="50"
              y2="10"
              stroke={colors.primary}
              strokeWidth="1"
              strokeDasharray="2,2"
            >
              <animate
                attributeName="y1"
                values="25;20;25"
                dur="2s"
                repeatCount="indefinite"
              />
            </line>
          </g>
        )}
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
