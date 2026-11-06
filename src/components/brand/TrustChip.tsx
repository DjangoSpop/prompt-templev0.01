import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Brand System — TrustChip family: judged-sample score (gilt star), form badge,
 * trend reason, state. One pill shape, four uses. A score below 3.5 renders nothing
 * (unpublished samples carry no chip).
 */
export const TRUST_MIN_SCORE = 3.5;

export interface TrustChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  kind?: 'trust' | 'form' | 'trend' | 'state';
  score?: number;
  label?: string;
}

const BASE = 'inline-flex h-6 items-center gap-1 rounded-full border border-border bg-card px-2.5 text-xs font-semibold v2:border-line v2:bg-surface v2:text-ink';

export function TrustChip({ kind = 'trust', score, label, className, children, ...rest }: TrustChipProps) {
  if (kind === 'trust') {
    if (typeof score !== 'number' || Number.isNaN(score) || score < TRUST_MIN_SCORE) return null;
    return (
      <span className={cn(BASE, 'tabular-nums', className)} title="Sample quality, judged automatically. 5 is best." data-chip="trust" {...rest}>
        <span aria-hidden className="v2:text-gilt">★</span>
        {score.toFixed(1)}
        <span className="font-normal text-muted-foreground v2:text-ink-muted">{label ?? 'judged sample'}</span>
      </span>
    );
  }
  const text = label ?? children;
  if (kind === 'form') {
    return (
      <span className={cn(BASE, 'uppercase tracking-[0.06em] text-muted-foreground v2:text-ink-muted', className)} data-chip="form" {...rest}>
        {text}
      </span>
    );
  }
  if (kind === 'trend') {
    return (
      <span className={cn(BASE, 'border-transparent v2:border-transparent v2:bg-faience-soft v2:text-faience', className)} data-chip="trend" {...rest}>
        {text}
      </span>
    );
  }
  return (
    <span className={cn(BASE, 'border-transparent v2:border-transparent v2:bg-ochre-soft v2:text-ochre', className)} data-chip="state" {...rest}>
      {text}
    </span>
  );
}

export default TrustChip;
