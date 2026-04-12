'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { researchClient } from '@/lib/api/research';
import { CREDIT_COSTS } from '@/lib/api/helpers/credit-costs';
import { useCreditsStore } from '@/store/credits';
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

/**
 * Creates a research job via the credit-aware proxy at /api/v2/research/create.
 *
 * Credit flow:
 * 1. Client optimistically deducts 10 credits (instant UI feedback)
 * 2. Proxy validates credits against Django entitlements (server truth)
 * 3. Proxy forwards to Heroku research backend
 * 4. Proxy calls Django billing to record consumption
 * 5. Response headers sync the real balance back to the store
 *
 * On 402: optimistic deduction is refunded + upgrade modal opens.
 */
export function useCreateResearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobRequest) => {
      // Optimistic deduction for instant UI feedback
      useCreditsStore.getState().deductOptimistic(RESEARCH_CREDIT_COST);
      try {
        return await researchClient.quickResearch(data);
      } catch (err: unknown) {
        const error = err as { status?: number };
        // Refund on 402 (insufficient) or 502 (proxy couldn't verify)
        if (error?.status === 402 || error?.status === 502) {
          useCreditsStore.getState().refundOptimistic(RESEARCH_CREDIT_COST);
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: researchKeys.jobs() });
    },
  });
}

export function useCreateFastIntent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobRequest) => {
      useCreditsStore.getState().deductOptimistic(RESEARCH_CREDIT_COST);
      try {
        return await researchClient.intentFast(data);
      } catch (err: unknown) {
        const error = err as { status?: number };
        if (error?.status === 402 || error?.status === 502) {
          useCreditsStore.getState().refundOptimistic(RESEARCH_CREDIT_COST);
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: researchKeys.jobs() });
    },
  });
}
