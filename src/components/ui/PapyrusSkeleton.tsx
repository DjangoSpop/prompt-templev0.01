import { cn } from "@/lib/utils"
import { motion } from 'framer-motion';

interface PapyrusSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
  shimmerIntensity?: 'subtle' | 'medium' | 'strong';
}

function PapyrusSkeletonBase({
  className,
  variant = 'default',
  width,
  height,
  shimmerIntensity = 'medium',
  ...props
}: PapyrusSkeletonProps) {
  // Gold shimmer gradient colors based on intensity
  const shimmerGradients = {
    subtle: 'from-transparent via-desert-sand/30 to-transparent',
    medium: 'from-transparent via-desert-sand/50 to-transparent',
    strong: 'from-transparent via-pharaoh-gold/40 to-transparent',
  };

  const shimmerDuration = shimmerIntensity === 'subtle' ? '2.5s' : shimmerIntensity === 'medium' ? '2s' : '1.5s';

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-desert-sand/10 to-royal-gold/5",
        variant === 'circular' && 'rounded-full',
        (variant === 'default' || variant === 'rectangular') && 'rounded-lg',
        variant === 'card' && 'rounded-xl',
        className
      )}
      style={{
        width,
        height,
      }}
      {...props}
    >
      {/* Papyrus shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-desert-sand/30 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `linear-gradient(90deg, transparent, rgba(235, 213, 167, ${shimmerIntensity === 'subtle' ? '0.2' : shimmerIntensity === 'medium' ? '0.35' : '0.5'}), transparent)`,
        }}
      />

      {/* Subtle texture overlay for papyrus effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(203, 161, 53, 0.03) 2px,
              rgba(203, 161, 53, 0.03) 4px
            )
          `,
        }}
      />
    </div>
  );
}

// Text skeleton with multiple lines
function PapyrusSkeletonText({
  className,
  lines = 3,
  ...props
}: Omit<PapyrusSkeletonProps, 'variant'> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <PapyrusSkeletonBase
          key={index}
          className="h-4"
          style={{
            width: index === lines - 1 ? '75%' : '100%',
          }}
          shimmerIntensity="medium"
        />
      ))}
    </div>
  );
}

// Card skeleton for templates
function PapyrusSkeletonCard({ className, ...props }: PapyrusSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Header image area */}
      <PapyrusSkeletonBase
        className="h-40 w-full rounded-xl"
        shimmerIntensity="medium"
      />

      {/* Title */}
      <PapyrusSkeletonBase
        className="h-6 w-3/4"
        shimmerIntensity="medium"
      />

      {/* Description lines */}
      <div className="space-y-2">
        <PapyrusSkeletonBase
          className="h-4 w-full"
          shimmerIntensity="subtle"
        />
        <PapyrusSkeletonBase
          className="h-4 w-5/6"
          shimmerIntensity="subtle"
        />
      </div>

      {/* Tags */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <PapyrusSkeletonBase
            key={i}
            className="h-6 w-16 rounded-full"
            shimmerIntensity="subtle"
          />
        ))}
      </div>

      {/* Action button */}
      <PapyrusSkeletonBase
        className="h-10 w-full rounded-lg"
        shimmerIntensity="medium"
      />
    </div>
  );
}

// Dashboard stats skeleton
function PapyrusSkeletonStat({ className, ...props }: PapyrusSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {/* Circular icon */}
      <div className="flex justify-center mb-4">
        <PapyrusSkeletonBase
          variant="circular"
          className="h-12 w-12"
          shimmerIntensity="medium"
        />
      </div>

      {/* Value */}
      <PapyrusSkeletonBase
        className="h-8 w-24 mx-auto"
        shimmerIntensity="strong"
      />

      {/* Label */}
      <PapyrusSkeletonBase
        className="h-4 w-32 mx-auto"
        shimmerIntensity="subtle"
      />
    </div>
  );
}

// Optimizer result skeleton
function PapyrusSkeletonOptimizer({ className, ...props }: PapyrusSkeletonProps) {
  return (
    <div className={cn("space-y-5", className)} {...props}>
      {/* Wow score section */}
      <div className="space-y-2">
        <PapyrusSkeletonBase
          className="h-20 w-20 mx-auto rounded-full"
          shimmerIntensity="strong"
        />
        <PapyrusSkeletonBase
          className="h-6 w-40 mx-auto"
          shimmerIntensity="medium"
        />
      </div>

      {/* Result text area */}
      <div className="space-y-3">
        <PapyrusSkeletonText lines={5} shimmerIntensity="subtle" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <PapyrusSkeletonBase
          className="h-10 flex-1 rounded-lg"
          shimmerIntensity="medium"
        />
        <PapyrusSkeletonBase
          className="h-10 flex-1 rounded-lg"
          shimmerIntensity="medium"
        />
      </div>
    </div>
  );
}

// Broadcast column skeleton
function PapyrusSkeletonBroadcast({ className, ...props }: PapyrusSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Model header */}
      <div className="space-y-2">
        <PapyrusSkeletonBase
          className="h-6 w-32"
          shimmerIntensity="medium"
        />
        <PapyrusSkeletonBase
          className="h-4 w-48"
          shimmerIntensity="subtle"
        />
      </div>

      {/* Response area */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-start">
            <PapyrusSkeletonBase
              variant="circular"
              className="h-8 w-8 flex-shrink-0"
              shimmerIntensity="medium"
            />
            <div className="flex-1 space-y-2">
              <PapyrusSkeletonText lines={2} shimmerIntensity="subtle" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// AskMe question skeleton
function PapyrusSkeletonAskMe({ className, ...props }: PapyrusSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Question number */}
      <PapyrusSkeletonBase
        className="h-8 w-16 rounded-full"
        shimmerIntensity="medium"
      />

      {/* Question text */}
      <div className="space-y-2">
        <PapyrusSkeletonText lines={2} shimmerIntensity="medium" />
      </div>

      {/* Option buttons */}
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <PapyrusSkeletonBase
            key={i}
            className="h-12 w-full rounded-lg"
            shimmerIntensity="subtle"
          />
        ))}
      </div>

      {/* Next button */}
      <PapyrusSkeletonBase
        className="h-12 w-full rounded-lg"
        shimmerIntensity="medium"
      />
    </div>
  );
}

// Export all variants
export {
  PapyrusSkeletonBase,
  PapyrusSkeletonText,
  PapyrusSkeletonCard,
  PapyrusSkeletonStat,
  PapyrusSkeletonOptimizer,
  PapyrusSkeletonBroadcast,
  PapyrusSkeletonAskMe,
};

// Default export for backward compatibility
export function PapyrusSkeleton(props: PapyrusSkeletonProps) {
  return <PapyrusSkeletonBase {...props} />;
}
