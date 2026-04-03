'use client';

import { useRouter } from 'next/navigation';
import { Search, Brain, Sparkles, Shield } from 'lucide-react';
import { ResearchInput } from '@/components/research/ResearchInput';
import { JobCard } from '@/components/research/JobCard';
import { ResearchStats } from '@/components/research/ResearchStats';
import { useResearchJobs, useCreateResearch } from '@/lib/hooks/useResearch';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCredits } from '@/hooks/api/useCredits';
import { useCreditsStore } from '@/store/credits';
import { Button } from '@/components/ui/button';

export default function ResearchPage() {
  const router = useRouter();
  const { isAuthenticated, isLoadingUser } = useAuth();
  const { available: creditsAvailable } = useCredits();
  const openUpgradeModal = useCreditsStore((s) => s.openUpgradeModal);
  const { data: jobsData, isLoading: jobsLoading } = useResearchJobs();
  const createResearch = useCreateResearch();

  // Auth gate — show login prompt if not authenticated
  if (!isLoadingUser && !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="glass-pharaoh mx-auto max-w-md rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-lapis-blue-500/10">
            <Shield className="h-8 w-8 text-lapis-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Sign in to use Research Agent
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The AI Research Agent requires authentication to create and track your research jobs.
          </p>
          <Button
            onClick={() => router.push('/auth/login')}
            className="mt-6 w-full gap-2 bg-lapis-blue-500 text-white hover:bg-lapis-blue-600"
          >
            Sign In
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/register')}
              className="font-medium text-royal-gold-600 hover:underline dark:text-royal-gold-400"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="h-12 w-64 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-32 animate-pulse rounded-xl bg-muted/50" />
        <div className="h-48 animate-pulse rounded-xl bg-muted/50" />
      </div>
    );
  }

  const handleSubmit = async (query: string, topK?: number) => {
    try {
      const result = await createResearch.mutateAsync({
        query,
        top_k: topK,
      });
      router.push(`/research/${result.job_id}`);
    } catch (err: unknown) {
      // withCreditDeduction throws with status 402 when insufficient
      const error = err as { status?: number; code?: string };
      if (error?.status === 402 || error?.code === 'INSUFFICIENT_CREDITS') {
        openUpgradeModal('research');
      } else {
        console.error('Failed to create research job:', err);
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lapis-blue-500 to-lapis-blue-700 text-white shadow-lg shadow-lapis-blue-500/20">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Research Agent
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-royal-gold-500" />
            AI-powered deep research with real-time insights
          </p>
        </div>
      </div>

      {/* Stats */}
      <ResearchStats />

      {/* Input */}
      <ResearchInput
        onSubmit={handleSubmit}
        isLoading={createResearch.isPending}
        creditsAvailable={creditsAvailable}
      />

      {/* Job list */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          Recent Research
          {jobsData?.count !== undefined && (
            <span className="text-sm font-normal text-muted-foreground">
              ({jobsData.count})
            </span>
          )}
        </h2>

        {jobsLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-muted/50"
              />
            ))}
          </div>
        )}

        {jobsData?.results && jobsData.results.length > 0 ? (
          <div className="space-y-2">
            {jobsData.results.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => router.push(`/research/${job.id}`)}
              />
            ))}
            {jobsData.next && (
              <Button
                variant="outline"
                className="w-full border-border/60 text-muted-foreground hover:text-foreground"
              >
                Load more
              </Button>
            )}
          </div>
        ) : (
          !jobsLoading && (
            <div className="glass-pharaoh rounded-xl border border-dashed border-border/60 p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No research jobs yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ask a question above to get started with AI-powered research
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
