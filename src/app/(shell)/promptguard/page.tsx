'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Zap, AlertTriangle, Loader2, GaugeCircle } from 'lucide-react';
import {
  useDashboardState,
  useTriggerIncident,
  useEvaluateActive,
} from '@/lib/hooks/usePromptGuard';
import { ActiveVersionCard } from './components/ActiveVersionCard';
import { EvalScoreCard } from './components/EvalScoreCard';
import { PendingProposalCard } from './components/PendingProposalCard';
import { ActivityStream } from './components/ActivityStream';
import { FeedbackSummaryCard } from './components/FeedbackSummaryCard';
import { EvalTheater } from './components/EvalTheater';
import { EmptyState } from './components/EmptyState';

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="lg:col-span-2">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

export default function PromptGuardDashboard() {
  const { data, error, isLoading, isError } = useDashboardState();
  const trigger = useTriggerIncident();
  const evaluate = useEvaluateActive();

  // Surface the trigger result. Without this the button fires but the common
  // "no regression" path (and the "no active monitored enhancer" guard) leave
  // the dashboard unchanged — looking like the button does nothing.
  const handleTrigger = () => {
    if (trigger.isPending) return;
    trigger.mutate(undefined, {
      onSuccess: (res) => {
        if (res.ok === false) {
          toast.error(
            `Cannot trigger: ${res.error ?? 'no active monitored enhancer'}`
          );
          return;
        }
        if (res.no_regression) {
          toast.success('No regression detected — the live prompt set is healthy.');
          return;
        }
        if (res.incident_id) {
          toast.success(
            `Incident opened — the agent is diagnosing now (${res.incident_id.slice(0, 8)}). ` +
              'Watch the activity stream below.'
          );
          return;
        }
        toast.success('Incident trigger accepted.');
      },
      onError: (err) => {
        toast.error(
          `Trigger failed: ${err instanceof Error ? err.message : String(err)}`
        );
      },
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="pg-headline flex items-center gap-3 text-3xl sm:text-4xl md:text-5xl">
            <ShieldCheck className="h-8 w-8 text-accent" />
            PromptGuard
          </h1>
          <p className="pg-tagline max-w-2xl text-sm sm:text-[0.95rem]">
            The agent that improves the agent · watch it think in real time
          </p>
        </div>
        <div className="flex flex-wrap items-stretch gap-2 sm:gap-3 lg:items-center lg:justify-end">
          {data && data.open_incidents > 0 && (
            <Badge variant="destructive" className="h-9 gap-1.5 px-3 text-xs sm:h-10">
              <AlertTriangle className="h-3 w-3" />
              {data.open_incidents} open
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={() => evaluate.mutate()}
            disabled={evaluate.isPending}
            title="Evaluate the live prompt set against the eval suite (real LLM judging)"
            className="h-10 px-4 text-sm sm:px-5"
          >
            {evaluate.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <GaugeCircle className="mr-1.5 h-4 w-4" />
            )}
            {evaluate.isPending ? 'Evaluating…' : 'Run evaluation'}
          </Button>
          <Button
            onClick={handleTrigger}
            disabled={trigger.isPending}
            className="h-10 px-4 text-sm sm:px-5"
          >
            {trigger.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-1.5 h-4 w-4" />
            )}
            {trigger.isPending ? 'Triggering…' : 'Trigger incident'}
          </Button>
        </div>
      </header>

      {/* Transient error banner (keep last-known data visible while polling) */}
      {isError && data && (
        <div className="flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 p-3 text-sm text-foreground">
          <AlertTriangle className="h-4 w-4 text-accent" />
          Backend transiently unreachable — showing last known state.
        </div>
      )}

      {/* Body */}
      {isLoading && !data ? (
        <LoadingSkeleton />
      ) : isError && !data ? (
        <EmptyState
          title="Could not reach PromptGuard"
          message={(error as Error)?.message ?? 'Unknown error'}
          hint="The backend may be deploying. The dashboard retries automatically every 2 seconds."
          icon={<AlertTriangle className="h-8 w-8" />}
        />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Hero — the live Eval Theater. Attach to an in-flight run on load
                if one exists, else show the last scored run. */}
            <div className="lg:col-span-2">
              <EvalTheater
                initialRunId={
                  data.running_run?.run_id ?? data.latest_eval?.run_id ?? null
                }
              />
            </div>
            {/* Sidebar column */}
            <div className="space-y-4 sm:space-y-5 lg:col-span-1">
              <ActiveVersionCard active={data.active_version} />
              <EvalScoreCard
                evalSummary={data.latest_eval}
                runId={data.latest_eval?.run_id}
              />
              <FeedbackSummaryCard
                summary={data.feedback_summary_24h}
                total={data.feedback_total_24h}
              />
              <PendingProposalCard pending={data.pending_proposals} />
            </div>
          </div>
          {/* Activity stream — full width below the fold */}
          <ActivityStream
            incidents={data.recent_incidents}
            pending={data.pending_proposals}
          />
        </div>
      ) : null}
    </div>
  );
}
