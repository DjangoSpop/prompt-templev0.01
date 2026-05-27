import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveProposal,
  evaluateActive,
  getDashboardState,
  getEvalRunAgentTrail,
  getEvalRunCases,
  getProposalDiagnoserTrail,
  rejectProposal,
  triggerIncident,
} from '@/lib/api/promptguard';
import type { DashboardState } from '@/app/(shell)/promptguard/lib/types';

/** Live dashboard state, polled every 2s (matches backend agent cadence). */
export const useDashboardState = () => {
  return useQuery<DashboardState>({
    queryKey: ['promptguard', 'dashboard'],
    queryFn: () => getDashboardState(),
    refetchInterval: 2000,
    staleTime: 0,
  });
};

export const useApproveProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approver }: { id: string; approver?: string }) =>
      approveProposal(id, approver),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptguard'] });
    },
  });
};

export const useRejectProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectProposal(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptguard'] });
    },
  });
};

export const useTriggerIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => triggerIncident(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptguard'] });
    },
  });
};

// ---------------------------------------------------------------------------
// Story 4.1/4.2 — reasoning drill-downs (read-only, fetched on open)
// ---------------------------------------------------------------------------

/** Per-case scores for an eval run; only fetches once a runId is set (modal open). */
export const useEvalRunCases = (runId: string | null) =>
  useQuery({
    queryKey: ['promptguard', 'eval-cases', runId],
    queryFn: () => getEvalRunCases(runId as string),
    enabled: runId != null,
    staleTime: 60_000,
  });

/** The agent's reasoning trail (Phoenix links + step timeline) for an eval run. */
export const useEvalRunAgentTrail = (runId: string | null) =>
  useQuery({
    queryKey: ['promptguard', 'agent-trail', runId],
    queryFn: () => getEvalRunAgentTrail(runId as string),
    enabled: runId != null,
    staleTime: 60_000,
  });

/** The diagnoser's reasoning trail for a proposal (Phoenix deep-links). */
export const useProposalDiagnoserTrail = (proposalId: string | null) =>
  useQuery({
    queryKey: ['promptguard', 'diagnoser-trail', proposalId],
    queryFn: () => getProposalDiagnoserTrail(proposalId as string),
    enabled: proposalId != null,
    staleTime: 60_000,
  });

/** Run a real evaluation of the live prompt set; dashboard reflects it on next poll. */
export const useEvaluateActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => evaluateActive(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptguard'] });
    },
  });
};
