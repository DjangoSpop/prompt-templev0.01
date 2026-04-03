'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Database,
  Layers,
  Shield,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { JobTimeline } from '@/components/research/JobTimeline';
import { InsightCard } from '@/components/research/InsightCard';
import { AnswerRenderer } from '@/components/research/AnswerRenderer';
import { useResearchJob, useResearchJobDocs } from '@/lib/hooks/useResearch';
import { useResearchSSE } from '@/lib/hooks/useResearchSSE';
import { useResearchStore } from '@/lib/stores/researchStore';
import { useAuth } from '@/lib/hooks/useAuth';
import type { SourceDoc } from '@/lib/types/research';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId;
  const { isAuthenticated, isLoadingUser } = useAuth();

  const { data: job, isLoading } = useResearchJob(jobId);
  const { selectedTab, setSelectedTab } = useResearchStore();

  const isRunning = job?.status === 'queued' || job?.status === 'running';

  const sse = useResearchSSE({
    jobId,
    enabled: isRunning,
  });

  const { data: docs } = useResearchJobDocs(jobId);

  // Auth gate
  if (!isLoadingUser && !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="glass-pharaoh mx-auto max-w-md rounded-2xl p-8 text-center">
          <Shield className="mx-auto h-10 w-10 text-lapis-blue-500" />
          <h2 className="mt-4 text-xl font-bold text-foreground">
            Sign in required
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to view research results.
          </p>
          <Button
            onClick={() => router.push('/auth/login')}
            className="mt-6 w-full bg-lapis-blue-500 text-white hover:bg-lapis-blue-600"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || isLoadingUser) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-28 animate-pulse rounded-xl bg-muted/50" />
        <div className="h-64 animate-pulse rounded-xl bg-muted/50" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center">
        <div className="glass-pharaoh rounded-2xl p-10">
          <p className="text-lg font-medium text-foreground">Job not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This research job may have been deleted or the ID is invalid.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/research')}
            className="mt-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Research
          </Button>
        </div>
      </div>
    );
  }

  const cards = sse.cards.length > 0 ? sse.cards : [];
  const stage = isRunning ? sse.currentStage || job.stage : job.stage;
  const progress = isRunning ? sse.progress : job.status === 'done' ? 100 : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/research')}
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold leading-tight text-foreground">
            {job.query}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              Created{' '}
              {formatDistanceToNow(new Date(job.created_at), {
                addSuffix: true,
              })}
            </span>
            {job.finished_at && (
              <>
                <span className="text-border">·</span>
                <span>
                  Completed{' '}
                  {formatDistanceToNow(new Date(job.finished_at), {
                    addSuffix: true,
                  })}
                </span>
              </>
            )}
            {sse.processingTimeMs && (
              <>
                <span className="text-border">·</span>
                <span className="font-medium text-foreground/70">
                  {(sse.processingTimeMs / 1000).toFixed(1)}s
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      {(isRunning || job.status === 'done') && (
        <JobTimeline stage={stage} progress={progress} events={sse.events} />
      )}

      {/* Error state */}
      {job.status === 'error' && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              Research failed
            </p>
            <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/70">
              {job.error || sse.error || 'An unknown error occurred.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/research')}
              className="mt-3 border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              Try a new query
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={(v) =>
          setSelectedTab(v as 'results' | 'sources' | 'chunks')
        }
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="results" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Results
            {cards.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {cards.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sources" className="gap-1.5">
            <Database className="h-4 w-4" />
            Sources
            {job.docs_count ? (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {job.docs_count}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="chunks" className="gap-1.5">
            <Layers className="h-4 w-4" />
            Chunks
            {job.chunks_count ? (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {job.chunks_count}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        {/* Results tab */}
        <TabsContent value="results" className="mt-4 space-y-4">
          {cards.length > 0 && (
            <div className="space-y-4">
              {cards.map((card) => (
                <InsightCard
                  key={card.id}
                  card={card}
                  isStreaming={sse.isStreaming}
                />
              ))}
            </div>
          )}

          {job.answer && (
            <div className="mt-6">
              <AnswerRenderer answer={job.answer} />
            </div>
          )}

          {!isRunning && cards.length === 0 && !job.answer && (
            <div className="glass-pharaoh rounded-xl border border-dashed border-border/60 p-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No results available yet.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Sources tab */}
        <TabsContent value="sources" className="mt-4 space-y-3">
          {docs && docs.length > 0 ? (
            docs.map((doc: SourceDoc) => (
              <div key={doc.id} className="glass-pharaoh rounded-xl p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-lapis-blue-500 hover:text-lapis-blue-600 hover:underline dark:text-lapis-blue-400"
                    >
                      {doc.title || doc.url}
                      <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{doc.domain}</span>
                      {doc.status_code && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'h-5 px-1.5 text-[10px]',
                            doc.status_code === 200
                              ? 'border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400'
                              : 'border-red-200 text-red-600 dark:border-red-800 dark:text-red-400'
                          )}
                        >
                          {doc.status_code}
                        </Badge>
                      )}
                      {doc.fetched_ms != null && (
                        <span>{doc.fetched_ms}ms</span>
                      )}
                      {doc.word_count != null && (
                        <span>{doc.word_count.toLocaleString()} words</span>
                      )}
                    </div>
                  </div>
                </div>
                {doc.snippet && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {doc.snippet}
                  </p>
                )}
                {doc.fetch_error && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                    <AlertTriangle className="h-3 w-3" />
                    {doc.fetch_error}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="glass-pharaoh rounded-xl border border-dashed border-border/60 p-10 text-center">
              <Database className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                {isRunning
                  ? 'Sources will appear as they are fetched...'
                  : 'No source documents available.'}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Chunks tab */}
        <TabsContent value="chunks" className="mt-4">
          <div className="glass-pharaoh rounded-xl border border-dashed border-border/60 p-10 text-center">
            <Layers className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              {job.chunks_count
                ? `${job.chunks_count} chunks processed. Detailed view coming soon.`
                : 'No chunks available.'}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
