'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { researchClient } from '@/lib/api/research';
import { withCreditDeduction, CREDIT_COSTS } from '@/lib/api/helpers/credit-costs';
import type { CreateJobRequest } from '@/lib/types/research';

export const RESEARCH_CREDIT_COST = CREDIT_COSTS.research;

// ─── Keys ────────────────────────────────────────────────
export const researchKeys = {
  all: ['research'] as const,
  jobs: () => [...researchKeys.all, 'jobs'] as const,
  job: (id: string) => [...researchKeys.all, 'job', id] as const,
  jobDocs: (id: string) => [...researchKeys.all, 'docs', id] as const,
  health: () => [...researchKeys.all, 'health'] as const,
  stats: () => [...researchKeys.all, 'stats'] as const,
};

// ─── Queries ─────────────────────────────────────────────
export function useResearchJobs(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: [...researchKeys.jobs(), params],
    queryFn: () => researchClient.listJobs(params),
    staleTime: 30_000,
  });
}

export function useResearchJob(jobId: string | null) {
  return useQuery({
    queryKey: researchKeys.job(jobId!),
    queryFn: () => researchClient.getJob(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'queued' || status === 'running') return 3000;
      return false;
    },
  });
}

export function useResearchJobDocs(jobId: string) {
  return useQuery({
    queryKey: researchKeys.jobDocs(jobId),
    queryFn: () => researchClient.getJobDocs(jobId),
    enabled: !!jobId,
  });
}

export function useResearchHealth() {
  return useQuery({
    queryKey: researchKeys.health(),
    queryFn: () => researchClient.getHealth(),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useResearchStats() {
  return useQuery({
    queryKey: researchKeys.stats(),
    queryFn: () => researchClient.getStats(),
    staleTime: 30_000,
  });
}

// ─── Mutations ───────────────────────────────────────────
export function useCreateResearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobRequest) =>
      withCreditDeduction('research', undefined, () =>
        researchClient.quickResearch(data)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: researchKeys.jobs() });
    },
  });
}

export function useCreateFastIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobRequest) =>
      withCreditDeduction('research', undefined, () =>
        researchClient.intentFast(data)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: researchKeys.jobs() });
    },
  });
}
