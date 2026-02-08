'use client';

import { cn } from '@/lib/utils';

interface AcademySigilLogoProps {
  className?: string;
  size?: number;
  compact?: boolean;
}

export function AcademySigilLogo({ className, size = 56, compact = false }: AcademySigilLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <div
        className="relative rounded-xl border border-royal-gold-400/60 bg-gradient-to-br from-obsidian-900 to-obsidian-950 p-2 shadow-[0_0_24px_rgba(203,161,53,0.22)]"
        aria-hidden
      >
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="16" r="10" stroke="#F5D77E" strokeWidth="2.5" />
          <circle cx="32" cy="16" r="4" fill="#F5D77E" />
          <path d="M16 49L32 24L48 49H16Z" fill="url(#pyramidGradient)" stroke="#C5A55A" strokeWidth="1.8" />
          <path d="M22 49H42" stroke="#F5D77E" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M32 31V56" stroke="#F5D77E" strokeWidth="2" strokeLinecap="round" />
          <path d="M26 40H38" stroke="#F5D77E" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 55H45" stroke="#A8872D" strokeWidth="2.2" strokeLinecap="round" />
          <defs>
            <linearGradient id="pyramidGradient" x1="16" y1="24" x2="48" y2="49" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5D77E" />
              <stop offset="0.5" stopColor="#C5A55A" />
              <stop offset="1" stopColor="#A8872D" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {!compact && (
        <div className="leading-tight">
          <div className="academy-display-font text-lg text-royal-gold-300 md:text-xl">PromptCraft Academy</div>
          <div className="academy-heading-font text-[11px] uppercase tracking-[0.2em] text-desert-sand-300">
            Temple Of Prompt Mastery
          </div>
        </div>
      )}
    </div>
  );
}

