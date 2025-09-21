import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TempleCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'pharaoh' | 'papyrus' | 'gold';
  elevation?: 'sm' | 'md' | 'lg';
}

export function TempleCard({ 
  children, 
  className, 
  variant = 'default',
  elevation = 'md'
}: TempleCardProps) {
  const variantStyles = {
    default: "bg-gradient-to-br from-card to-card/80 border-border",
    pharaoh: "bg-gradient-to-br from-gold-accent/10 to-yellow-500/10 border-gold-accent/30 border-2",
    papyrus: "bg-gradient-to-br from-papyrus to-desert-sand border-gold-accent/20",
    gold: "bg-gradient-to-br from-gold-accent/20 to-yellow-600/20 border-gold-accent/50 border-2"
  };

  const elevationStyles = {
    sm: "shadow-sm hover:shadow-md",
    md: "shadow-md hover:shadow-lg pyramid-elevation",
    lg: "shadow-lg hover:shadow-xl pyramid-elevation-lg"
  };

  return (
    <div className={cn(
      "rounded-2xl transition-all duration-300",
      "relative overflow-hidden",
      variantStyles[variant],
      elevationStyles[elevation],
      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-gold-accent/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
      className
    )}>
      {/* Pyramid corner accent */}
      <div className="absolute top-2 right-2 opacity-20">
        <svg className="h-3 w-3 text-gold-accent" viewBox="0 0 12 12" fill="currentColor">
          <polygon points="6,1 11,9 1,9" />
        </svg>
      </div>
      {children}
    </div>
  );
}
