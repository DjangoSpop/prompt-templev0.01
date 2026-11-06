import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Brand System — ExplainLine: the one-sentence "why" under an action (line) or a
 * lapis learning block. Styling is gated to the brand flag (`v2:`); without it the
 * line renders as plain muted small text.
 */
export interface ExplainLineProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'line' | 'block';
  /** Bold lead for the block variant, e.g. "Why this works". */
  lead?: string;
  children: React.ReactNode;
}

export function ExplainLine({ variant = 'line', lead, className, children, ...rest }: ExplainLineProps) {
  if (variant === 'block') {
    return (
      <div
        className={cn('rounded-md px-4 py-3 text-sm leading-relaxed v2:rounded-md v2:border-l-2 v2:border-lapis v2:bg-lapis-soft v2:text-ink', className)}
        data-explain="block"
        {...rest}
      >
        {lead && <strong className="mr-1 font-semibold v2:text-lapis">{lead}</strong>}
        {children}
      </div>
    );
  }
  return (
    <p className={cn('text-sm leading-snug text-muted-foreground v2:text-ink-muted', className)} data-explain="line" {...rest}>
      {children}
    </p>
  );
}

export default ExplainLine;
