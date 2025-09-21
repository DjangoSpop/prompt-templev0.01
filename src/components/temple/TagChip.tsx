'use client';

import React from 'react';
import clsx from 'clsx';

export interface TagChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function TagChip({ label, active = false, onClick }: TagChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-2xl text-sm font-medium focus:outline-none focus-visible:ring-2',
        active ? 'bg-gold-accent/15 text-gold-accent border border-gold-accent/30' : 'bg-card-bg/60 text-foreground/90 border border-border'
      )}
      aria-pressed={active}
    >
      <svg className="mr-2 h-3 w-3 text-gold-accent" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <circle cx="12" cy="12" r="6" />
      </svg>
      <span className="truncate">{label}</span>
    </button>
  );
}
