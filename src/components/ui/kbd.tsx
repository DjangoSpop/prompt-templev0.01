'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(({
  children,
  size = 'sm',
  variant = 'default',
  className,
  ...props
}, ref) => {
  return (
    <kbd
      ref={ref}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        'font-mono font-medium',
        'border rounded',
        'transition-all duration-200',
        'select-none',
        
        // Size variants
        {
          'h-5 min-w-[1.25rem] px-1.5 text-[10px]': size === 'sm',
          'h-6 min-w-[1.5rem] px-2 text-xs': size === 'md',
          'h-7 min-w-[1.75rem] px-2.5 text-sm': size === 'lg',
        },
        
        // Variant styles
        {
          'bg-muted text-muted-foreground border-border shadow-sm': variant === 'default',
          'bg-background text-foreground border-border': variant === 'outline',
          'bg-transparent text-muted-foreground border-transparent': variant === 'ghost',
        },
        
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
});

Kbd.displayName = 'Kbd';

export { Kbd };