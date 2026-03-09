'use client';

import Link from 'next/link';
import { Coins, AlertTriangle, Zap } from 'lucide-react';
import { useCredits } from '@/hooks/api/useCredits';
import { cn } from '@/lib/utils';

interface CreditBadgeProps {
  /** Compact mode for collapsed sidebar */
  compact?: boolean;
  className?: string;
}

export function CreditBadge({ compact = false, className }: CreditBadgeProps) {
  const { available, plan, isLow, isDepleted, isLoading, balance } = useCredits();

  // Don't render while loading initial data or if no balance synced yet
  if (isLoading && balance === null) return null;

  const displayBalance = available ?? balance ?? 0;

  const Icon = isDepleted ? AlertTriangle : isLow ? Zap : Coins;

  const badgeClasses = cn(
    'flex items-center gap-1.5 rounded-full border text-xs font-medium transition-colors',
    isDepleted
      ? 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/30'
      : isLow
        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
        : 'bg-amber-500/5 text-amber-700 dark:text-amber-300 border-amber-500/20',
    compact ? 'px-1.5 py-1' : 'px-2.5 py-1',
    className
  );

  if (compact) {
    return (
      <Link href="/billing" title={`${displayBalance} credits (${plan})`}>
        <div className={badgeClasses}>
          <Icon className="h-3.5 w-3.5" />
          <span className="font-mono text-[11px]">{displayBalance}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/billing" title="View billing & credits">
      <div className={badgeClasses}>
        <Icon className="h-3.5 w-3.5" />
        <span className="font-mono">{displayBalance}</span>
        <span className="text-[10px] opacity-60 uppercase">{plan}</span>
      </div>
    </Link>
  );
}
