'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Bookmark, RefreshCw, MessageSquare } from 'lucide-react';
import type { FeedbackSignalCount } from '../lib/types';
import type { ReactNode } from 'react';

/**
 * Story 4.3 — the feedback loop, made visible. Renders the last-24h aggregate
 * of accept/dismiss/save signals the extension sends back. Absent on older
 * backends (field optional) → the card hides itself rather than showing zeros.
 */
const SIGNAL_META: Record<
  string,
  { label: string; icon: ReactNode; tone: string }
> = {
  accept: { label: 'accepts', icon: <ThumbsUp className="h-4 w-4" />, tone: 'text-emerald-500' },
  dismiss: { label: 'dismisses', icon: <ThumbsDown className="h-4 w-4" />, tone: 'text-destructive' },
  save: { label: 'saves', icon: <Bookmark className="h-4 w-4" />, tone: 'text-accent' },
  regenerate: { label: 'regens', icon: <RefreshCw className="h-4 w-4" />, tone: 'text-muted-foreground' },
};

export function FeedbackSummaryCard({
  summary,
  total,
}: {
  summary?: FeedbackSignalCount[];
  total?: number;
}) {
  // Field absent → backend predates Sprint 4; don't render an empty shell.
  if (summary == null) return null;

  // Keep a stable, meaningful order regardless of backend sort.
  const order = ['accept', 'dismiss', 'save', 'regenerate'];
  const counts = new Map(summary.map((s) => [s.signal, s.count]));
  const rows = order
    .filter((sig) => counts.has(sig))
    .map((sig) => ({ signal: sig, count: counts.get(sig) ?? 0 }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MessageSquare className="h-4 w-4 text-accent" />
          Feedback · last 24h
        </CardTitle>
        <span className="text-xs tabular-nums text-muted-foreground">
          {total ?? 0} total
        </span>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No feedback signals in the last 24h yet.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {rows.map(({ signal, count }) => {
              const meta = SIGNAL_META[signal] ?? {
                label: signal,
                icon: <MessageSquare className="h-4 w-4" />,
                tone: 'text-muted-foreground',
              };
              return (
                <div
                  key={signal}
                  className="flex flex-col items-center gap-1 rounded-lg border border-border bg-secondary/30 p-2 text-center"
                >
                  <span className={meta.tone}>{meta.icon}</span>
                  <span className="text-xl font-bold tabular-nums text-foreground">
                    {count}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{meta.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
