'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useEvalRunCases } from '@/lib/hooks/usePromptGuard';
import { phoenixTraceUrl } from '@/lib/api/promptguard';
import type { EvalCase } from '../lib/types';
import { scoreColorClass } from '../lib/format';
import { cn } from '@/lib/utils';

/**
 * Story 4.2 — drill-down behind a clickable eval score.
 *
 * Opens when `runId` is set. `filterType` null = all cases; otherwise restrict
 * to one enhancement_type (so "creative: 2.1" shows only what pulled it down).
 * Cases are sorted worst-first so the regression is the first thing you read.
 */
export function EvalCasesDrillDown({
  runId,
  filterType,
  onClose,
}: {
  runId: string | null;
  filterType: string | null;
  onClose: () => void;
}) {
  const open = runId != null;
  const { data, isLoading, error } = useEvalRunCases(runId);

  const allCases = data?.cases ?? [];
  const cases = allCases
    .filter((c) => !filterType || c.enhancement_type === filterType)
    .slice()
    .sort((a, b) => (a.overall_score ?? 0) - (b.overall_score ?? 0)); // worst first

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] gap-3 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Eval Cases
            {filterType && (
              <Badge variant="secondary" className="capitalize">
                {filterType}
              </Badge>
            )}
            {data && (
              <span className="text-sm font-normal text-muted-foreground">
                {cases.length} of {data.cases.length}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {data
              ? `Why ${data.evaluated_version_label} scored ${data.overall_score.toFixed(2)}/5.0 — worst cases first.`
              : 'Per-case judge scores behind this number.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-3 py-2">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        )}

        {error && !isLoading && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {(error as Error)?.message ?? 'Could not load eval cases.'}
          </div>
        )}

        {data && !isLoading && cases.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No cases{filterType ? ` of type "${filterType}"` : ''} in this run.
          </p>
        )}

        {data && cases.length > 0 && (
          <ScrollArea className="max-h-[64vh] pr-3">
            <div className="space-y-3">
              {cases.map((c) => (
                <CaseRow key={c.case_id} c={c} />
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CaseRow({ c }: { c: EvalCase }) {
  return (
    <article className="rounded-lg border border-border bg-secondary/30 p-3">
      <header className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            'font-mono text-lg font-bold tabular-nums',
            scoreColorClass(c.overall_score)
          )}
        >
          {c.overall_score != null ? c.overall_score.toFixed(2) : 'n/a'}
        </span>
        {c.enhancement_type && (
          <Badge variant="secondary" className="capitalize">
            {c.enhancement_type}
          </Badge>
        )}
        {c.trace_id && (
          <a
            href={phoenixTraceUrl(c.trace_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs text-accent hover:underline"
          >
            View in Phoenix
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </header>

      {/* Original vs rewrite, side by side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Original
          </h5>
          <pre className="whitespace-pre-wrap break-words rounded bg-background/60 p-2 text-xs text-foreground">
            {c.original_prompt ?? '—'}
          </pre>
        </div>
        <div>
          <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Rewrite
          </h5>
          <pre className="whitespace-pre-wrap break-words rounded bg-background/60 p-2 text-xs text-foreground">
            {c.rewritten_prompt ?? '—'}
          </pre>
        </div>
      </div>

      {Object.keys(c.dimensions ?? {}).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Object.entries(c.dimensions).map(([dim, score]) => (
            <span
              key={dim}
              className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-xs text-muted-foreground"
            >
              {dim}: <strong className="text-foreground">{score}</strong>
            </span>
          ))}
        </div>
      )}

      {c.judge_reasoning && (
        <blockquote className="mt-2 border-l-2 border-accent/60 pl-3 text-xs italic leading-relaxed text-muted-foreground">
          <span className="font-semibold not-italic text-accent">Judge:</span>{' '}
          {c.judge_reasoning}
        </blockquote>
      )}
    </article>
  );
}
