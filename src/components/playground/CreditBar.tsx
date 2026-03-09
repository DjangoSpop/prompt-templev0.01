'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingDown, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEntitlements } from '@/hooks/api/useBilling';
import Link from 'next/link';

interface CreditBarProps {
  className?: string;
}

/**
 * Live Credit Bar — reads from useEntitlements() and animates deductions.
 * Refetches every 60 s (via useBilling hook stale-time). Flashes yellow on drop.
 */
export function CreditBar({ className }: CreditBarProps) {
  const { data: ent, isLoading } = useEntitlements();
  const prevCredits = useRef<number | null>(null);
  const [flash, setFlash] = useState<'deducted' | 'idle'>('idle');

  const credits = ent?.credits_available ?? null;
  const monthly = ent?.monthly_credits ?? null;
  const planCode = ent?.plan_code ?? 'FREE';

  // Detect credit deduction and flash the bar
  useEffect(() => {
    if (credits === null) return;
    if (prevCredits.current !== null && credits < prevCredits.current) {
      setFlash('deducted');
      const t = setTimeout(() => setFlash('idle'), 1200);
      return () => clearTimeout(t);
    }
    prevCredits.current = credits;
  }, [credits]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-secondary border border-border animate-pulse', className)}>
        <Zap className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-xs text-text-muted w-16 h-3 bg-bg-tertiary rounded" />
      </div>
    );
  }

  const pct = monthly && monthly > 0 ? Math.min(100, ((credits ?? 0) / monthly) * 100) : null;
  const isLow = credits !== null && credits < 20;
  const isEmpty = credits !== null && credits === 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={credits ?? 'loading'}
          initial={{ opacity: 0.6, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors duration-300',
            flash === 'deducted'
              ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'
              : isEmpty
              ? 'bg-red-500/10 border-red-500/40 text-red-400'
              : isLow
              ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
              : 'bg-bg-secondary border-border text-text-secondary'
          )}
        >
          {flash === 'deducted' ? (
            <TrendingDown className="w-3.5 h-3.5" />
          ) : isEmpty || isLow ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-brand" />
          )}

          <span>
            {credits === null ? '—' : credits.toLocaleString()}
            {monthly !== null && (
              <span className="opacity-60"> / {monthly.toLocaleString()}</span>
            )}
            <span className="ml-1 opacity-60">credits</span>
          </span>

          {/* Inline progress bar */}
          {pct !== null && (
            <div className="w-14 h-1.5 bg-bg-tertiary rounded-full overflow-hidden ml-1">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  pct < 20 ? 'bg-red-500' : pct < 50 ? 'bg-orange-400' : 'bg-brand'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}

          {/* Plan badge */}
          <span className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide',
            planCode === 'POWER' ? 'bg-purple-500/20 text-purple-300' :
            planCode === 'PRO' ? 'bg-brand/20 text-brand' :
            'bg-bg-tertiary text-text-muted'
          )}>
            {planCode}
          </span>
        </motion.div>
      </AnimatePresence>

      {(isEmpty || isLow) && (
        <Link
          href="/billing"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-full bg-brand text-white hover:bg-brand/90 transition-colors"
        >
          Upgrade
          <ExternalLink className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
