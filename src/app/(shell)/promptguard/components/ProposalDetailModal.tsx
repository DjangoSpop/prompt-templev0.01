'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, AlertTriangle, ExternalLink } from 'lucide-react';
import { getProposalFull, isProposalError } from '@/lib/api/promptguard';
import {
  useApproveProposal,
  useProposalDiagnoserTrail,
  useRejectProposal,
} from '@/lib/hooks/usePromptGuard';
import { PromptDiff } from './PromptDiff';
import { deltaColorClass, formatDelta, scoreColorClass } from '../lib/format';
import { cn } from '@/lib/utils';

export function ProposalDetailModal({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const open = id != null;

  const { data, isLoading, error } = useQuery({
    queryKey: ['promptguard', 'proposal', id],
    queryFn: () => getProposalFull(id as string),
    enabled: open,
  });

  // Diagnoser reasoning trail (model + Phoenix deep-links). Fetched on open.
  const { data: trail } = useProposalDiagnoserTrail(open ? id : null);

  const approve = useApproveProposal();
  const reject = useRejectProposal();
  const busy = approve.isPending || reject.isPending;

  const notFound = data ? isProposalError(data) : false;
  const proposal = data && !isProposalError(data) ? data : null;

  const handleApprove = () => {
    if (!id) return;
    approve.mutate({ id }, { onSuccess: onClose });
  };

  const handleReject = () => {
    if (!id) return;
    const reason = window.prompt('Rejection reason (optional):') ?? '';
    reject.mutate({ id, reason }, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Proposal Detail</DialogTitle>
          <DialogDescription>
            Review the diagnoser&apos;s candidate prompt set before promoting it to active.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-3 py-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {(error || notFound) && !isLoading && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {notFound
              ? 'This proposal could not be found. It may have already been resolved.'
              : (error as Error)?.message}
          </div>
        )}

        {proposal && !isLoading && (
          <div className="space-y-5">
            {/* Score comparison */}
            <section className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Baseline</div>
                <div className={cn('text-lg font-bold', scoreColorClass(proposal.baseline_score))}>
                  {proposal.baseline_score?.toFixed(2) ?? 'n/a'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Candidate</div>
                <div className={cn('text-lg font-bold', scoreColorClass(proposal.candidate_score))}>
                  {proposal.candidate_score?.toFixed(2) ?? 'n/a'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Delta</div>
                <div className={cn('text-lg font-bold', deltaColorClass(proposal.score_delta))}>
                  Δ {formatDelta(proposal.score_delta)}
                </div>
              </div>
            </section>

            {/* Rationale */}
            <section>
              <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
                Diagnoser Rationale
                <Badge variant="secondary" className="font-normal capitalize">
                  {proposal.status.replace(/_/g, ' ')}
                </Badge>
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {proposal.rationale}
              </p>
              {trail && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="font-mono font-normal">
                    {trail.diagnoser_model}
                  </Badge>
                  {trail.trace_urls.length > 0 ? (
                    trail.trace_urls.map((url, i) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent hover:underline"
                      >
                        Trace {i + 1}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))
                  ) : (
                    <a
                      href={trail.phoenix_project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      Open in Phoenix
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </section>

            {/* Diff */}
            <section>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Prompt Diff</h3>
              <PromptDiff
                baseline={proposal.current_active?.system_prompts ?? {}}
                candidate={proposal.candidate_system_prompts}
              />
            </section>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button variant="destructive" onClick={handleReject} disabled={busy}>
                <X className="mr-1.5 h-4 w-4" />
                {reject.isPending ? 'Rejecting…' : 'Reject'}
              </Button>
              <Button onClick={handleApprove} disabled={busy}>
                <Check className="mr-1.5 h-4 w-4" />
                {approve.isPending ? 'Approving…' : 'Approve & Activate'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
