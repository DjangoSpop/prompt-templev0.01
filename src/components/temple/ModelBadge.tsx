 'use client';

import React from 'react';
import clsx from 'clsx';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export interface ModelBadgeProps {
  label: string;
  color?: string; // css color or tailwind token
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

export function ModelBadge({ label, color = 'var(--pharaoh-gold)', size = 'md', title }: ModelBadgeProps) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-full',
    md: 'text-sm px-3 py-1 rounded-full',
    lg: 'text-base px-4 py-1.5 rounded-full',
  } as const;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="status"
            aria-label={`${label} model compatibility`}
            className={clsx('inline-flex items-center space-x-2 font-medium', sizes[size], 'border', 'bg-card-bg/70')}
            style={{ borderColor: color, color: color }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden focusable={false}>
              <circle cx="12" cy="12" r="8" fill={color} opacity={0.14} />
              <circle cx="12" cy="12" r="3" fill={color} />
            </svg>
            <span className="truncate">{label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{title || label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
