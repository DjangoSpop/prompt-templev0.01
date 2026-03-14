'use client';

import { motion } from 'framer-motion';
import { Button } from './button';
import { cn } from '@/lib/utils';
import {
  Search,
  Sparkles,
  ScrollText,
  Pyramid,
  Coins,
  FileQuestion,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface EmptyStateProps {
  type: 'no-results' | 'no-usage' | 'no-broadcasts' | 'no-credits' | 'no-templates' | 'custom';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

// SVG Illustrations for each empty state type
function PyramidIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto opacity-20">
      <defs>
        <linearGradient id="pyramidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#8B7355" />
        </linearGradient>
      </defs>
      {/* Main pyramid */}
      <polygon
        points="100,40 160,160 40,160"
        fill="url(#pyramidGrad)"
        stroke="#C9A227"
        strokeWidth="2"
      />
      {/* Pyramid layers */}
      <line x1="55" y1="145" x2="145" y2="145" stroke="#D4A574" strokeWidth="1" opacity="0.5" />
      <line x1="65" y1="130" x2="135" y2="130" stroke="#D4A574" strokeWidth="1" opacity="0.5" />
      <line x1="75" y1="115" x2="125" y2="115" stroke="#D4A574" strokeWidth="1" opacity="0.5" />
      {/* Sun */}
      <circle cx="170" cy="30" r="20" fill="#E9C25A" opacity="0.3" />
    </svg>
  );
}

function PillarIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto opacity-20">
      {/* Three pillars */}
      <rect x="30" y="40" width="30" height="120" fill="#C9A227" opacity="0.3" rx="2" />
      <rect x="85" y="40" width="30" height="120" fill="#D4A574" opacity="0.4" rx="2" />
      <rect x="140" y="40" width="30" height="120" fill="#C9A227" opacity="0.3" rx="2" />

      {/* Lotus capitals */}
      <path d="M25 40 Q30 30 45 40 Q30 50 25 40" fill="#C9A227" opacity="0.4" />
      <path d="M80 40 Q85 30 100 40 Q85 50 80 40" fill="#D4A574" opacity="0.5" />
      <path d="M135 40 Q140 30 155 40 Q140 50 135 40" fill="#C9A227" opacity="0.4" />

      {/* Base */}
      <rect x="20" y="160" width="160" height="10" fill="#C9A227" opacity="0.2" rx="2" />
    </svg>
  );
}

function GoldCoinIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto opacity-20">
      <defs>
        <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E9C25A" />
          <stop offset="50%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#A58129" />
        </linearGradient>
      </defs>
      {/* Main coin */}
      <circle cx="100" cy="100" r="50" fill="url(#coinGrad)" stroke="#C9A227" strokeWidth="2" />
      {/* Inner circle */}
      <circle cx="100" cy="100" r="40" fill="none" stroke="#D4A574" strokeWidth="1" opacity="0.5" />
      {/* Eye of Horus symbol (simplified) */}
      <path d="M85 90 L95 100 L85 110 M115 90 L105 100 L115 110 M85 100 L115 100" stroke="#1E3A8A" strokeWidth="2" fill="none" opacity="0.3" />
      {/* Shine effect */}
      <circle cx="75" cy="75" r="10" fill="#FFFFFF" opacity="0.3" />
    </svg>
  );
}

function ScrollIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto opacity-20">
      {/* Top scroll roll */}
      <ellipse cx="100" cy="50" rx="60" ry="15" fill="#C9A227" opacity="0.4" />
      {/* Scroll body */}
      <rect x="40" y="50" width="120" height="100" fill="#EBD5A7" opacity="0.2" />
      {/* Lines on scroll */}
      <line x1="50" y1="70" x2="150" y2="70" stroke="#C9A227" strokeWidth="2" opacity="0.3" />
      <line x1="50" y1="90" x2="150" y2="90" stroke="#C9A227" strokeWidth="2" opacity="0.3" />
      <line x1="50" y1="110" x2="130" y2="110" stroke="#C9A227" strokeWidth="2" opacity="0.3" />
      {/* Bottom scroll roll */}
      <ellipse cx="100" cy="150" rx="60" ry="15" fill="#C9A227" opacity="0.4" />
    </svg>
  );
}

function SunriseIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto opacity-20">
      {/* Sun */}
      <circle cx="100" cy="40" r="25" fill="#E9C25A" opacity="0.6" />
      {/* Sun rays */}
      {[...Array(8)].map((_, i) => (
        <line
          key={i}
          x1={100 + Math.cos((i * Math.PI) / 4) * 35}
          y1={40 + Math.sin((i * Math.PI) / 4) * 35}
          x2={100 + Math.cos((i * Math.PI) / 4) * 45}
          y2={40 + Math.sin((i * Math.PI) / 4) * 45}
          stroke="#C9A227"
          strokeWidth="2"
          opacity="0.5"
        />
      ))}
      {/* Pyramid */}
      <polygon
        points="100,80 150,160 50,160"
        fill="#C9A227"
        opacity="0.2"
        stroke="#C9A227"
        strokeWidth="1"
      />
      {/* Ground */}
      <line x1="20" y1="160" x2="180" y2="160" stroke="#D4A574" strokeWidth="2" opacity="0.3" />
    </svg>
  );
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  className,
  compact = false,
}: EmptyStateProps) {
  const config = {
    'no-results': {
      illustration: <PyramidIllustration />,
      defaultTitle: 'No Scrolls Match Your Query',
      defaultDescription: 'Try adjusting your search terms or filters to discover ancient wisdom.',
      icon: <Search className="h-12 w-12 text-pharaoh-gold" />,
    },
    'no-usage': {
      illustration: <SunriseIllustration />,
      defaultTitle: 'Begin Your Journey',
      defaultDescription: 'Start optimizing your prompts to unlock insights and track your progress.',
      icon: <Sparkles className="h-12 w-12 text-pharaoh-gold" />,
    },
    'no-broadcasts': {
      illustration: <PillarIllustration />,
      defaultTitle: 'Summon the Oracles',
      defaultDescription: 'Create your first multi-AI broadcast to compare insights from different models.',
      icon: <ScrollText className="h-12 w-12 text-pharaoh-gold" />,
    },
    'no-credits': {
      illustration: <GoldCoinIllustration />,
      defaultTitle: 'Recharge at the Temple',
      defaultDescription: 'Your credit balance is empty. Upgrade your plan to continue your journey.',
      icon: <Coins className="h-12 w-12 text-pharaoh-gold" />,
    },
    'no-templates': {
      illustration: <ScrollIllustration />,
      defaultTitle: 'Your Library is Empty',
      defaultDescription: 'Save your optimized prompts and templates to build your collection.',
      icon: <FileQuestion className="h-12 w-12 text-pharaoh-gold" />,
    },
    'custom': {
      illustration: <PyramidIllustration />,
      defaultTitle: title || 'No Content Available',
      defaultDescription: description || 'Check back later for new content.',
      icon: <Plus className="h-12 w-12 text-pharaoh-gold" />,
    },
  };

  const currentConfig = config[type];
  const displayTitle = title || currentConfig.defaultTitle;
  const displayDescription = description || currentConfig.defaultDescription;
  const displayActionLabel = actionLabel || (type === 'no-templates' ? 'Create Template' : type === 'no-credits' ? 'Upgrade Plan' : type === 'no-usage' ? 'Start Optimizing' : type === 'no-broadcasts' ? 'Create Broadcast' : type === 'no-results' ? 'Clear Filters' : undefined);

  if (compact) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-4 text-pharaoh-gold/40"
        >
          {currentConfig.icon}
        </motion.div>
        <h3 className="text-sm font-semibold text-foreground mb-1">{displayTitle}</h3>
        <p className="text-xs text-muted-foreground">{displayDescription}</p>
        {onAction && displayActionLabel && (
          <Button
            onClick={onAction}
            variant="ghost"
            size="sm"
            className="mt-3 text-pharaoh-gold hover:text-pharaoh-gold/80"
          >
            {displayActionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center max-w-lg mx-auto",
        className
      )}
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        {currentConfig.illustration}
      </motion.div>

      {/* Icon (mobile friendly) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.2,
        }}
        className="mb-4 text-pharaoh-gold"
      >
        {currentConfig.icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-xl font-display-bold text-foreground mb-2"
      >
        {displayTitle}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="text-sm text-temple-stone mb-6 max-w-md"
      >
        {displayDescription}
      </motion.p>

      {/* Action button */}
      {onAction && displayActionLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Button
            onClick={onAction}
            className="bg-gradient-to-r from-pharaoh-gold to-royal-gold hover:from-pharaoh-gold/90 hover:to-royal-gold/90 text-white font-semibold shadow-pyramid transition-all duration-300 transform hover:scale-[1.02]"
            size="lg"
          >
            {displayActionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-20 -right-20 w-40 h-40 border-2 border-pharaoh-gold rounded-full"
        />
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 80,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-20 -left-20 w-32 h-32 border-2 border-pharaoh-gold rounded-full"
        />
      </div>
    </motion.div>
  );
}

// Pre-configured empty states for common use cases
export function NoResultsFound({ onClear, ...props }: Partial<EmptyStateProps> & { onClear?: () => void }) {
  return (
    <EmptyState
      type="no-results"
      actionLabel="Clear Filters"
      onAction={onClear}
      {...props}
    />
  );
}

export function NoUsageData({ onStart, ...props }: Partial<EmptyStateProps> & { onStart?: () => void }) {
  return (
    <EmptyState
      type="no-usage"
      actionLabel="Start Optimizing"
      onAction={onStart}
      {...props}
    />
  );
}

export function NoBroadcastsYet({ onCreate, ...props }: Partial<EmptyStateProps> & { onCreate?: () => void }) {
  return (
    <EmptyState
      type="no-broadcasts"
      actionLabel="Create Broadcast"
      onAction={onCreate}
      {...props}
    />
  );
}

export function NoCreditsLeft({ onUpgrade, ...props }: Partial<EmptyStateProps> & { onUpgrade?: () => void }) {
  return (
    <EmptyState
      type="no-credits"
      actionLabel="Upgrade Plan"
      onAction={onUpgrade}
      {...props}
    />
  );
}

export function NoTemplates({ onCreate, ...props }: Partial<EmptyStateProps> & { onCreate?: () => void }) {
  return (
    <EmptyState
      type="no-templates"
      actionLabel="Create Template"
      onAction={onCreate}
      {...props}
    />
  );
}
