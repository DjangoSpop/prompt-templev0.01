'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assistantApi } from '@/lib/api/assistant-client';
import type { AskMeFinalizeResponse } from '@/types/assistant';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AskMePhase =
  | 'idle'
  | 'starting'
  | 'questioning'
  | 'finalizing'
  | 'complete'
  | 'error';

export interface AskMeQAPair {
  question: string;
  answer: string;
}

export interface AskMeWizardState {
  phase: AskMePhase;
  sessionId: string | null;
  currentQuestion: string | null;
  questionsAnswered: number;
  history: AskMeQAPair[];
  result: AskMeFinalizeResponse | null;
  error: string | null;
}

const INITIAL_STATE: AskMeWizardState = {
  phase: 'idle',
  sessionId: null,
  currentQuestion: null,
  questionsAnswered: 0,
  history: [],
  result: null,
  error: null,
};

// ─── Main hook ───────────────────────────────────────────────────────────────

/**
 * Manages the full AskMe guided prompt-building wizard:
 *   idle → starting → questioning (loop) → finalizing → complete
 *
 * Usage:
 *   const { state, start, answer, finalize, reset } = useAskMeWizard();
 */
export function useAskMeWizard() {
  const [state, setState] = useState<AskMeWizardState>(INITIAL_STATE);

  // Helper to update only the changed fields
  const patch = useCallback((updates: Partial<AskMeWizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Start a new guided session.
   * @param request - User's initial description of what they want to create.
   */
  const start = useCallback(async (request: string) => {
    patch({ phase: 'starting', error: null, history: [], result: null });
    try {
      const res = await assistantApi.startAskMe(request);
      patch({
        phase: 'questioning',
        sessionId: res.session_id,
        currentQuestion: res.question,
        questionsAnswered: 0,
      });
    } catch (err: any) {
      patch({
        phase: 'error',
        error: err?.response?.data?.error ?? err?.message ?? 'Failed to start session',
      });
    }
  }, [patch]);

  /**
   * Submit an answer to the current question.
   * If the backend signals completion or has no follow-up, we auto-finalize.
   */
  const answer = useCallback(async (userAnswer: string) => {
    if (!state.sessionId || !state.currentQuestion) return;

    // Record this Q&A pair in history
    const newPair: AskMeQAPair = {
      question: state.currentQuestion,
      answer: userAnswer,
    };

    patch({ phase: 'starting' }); // show loading while we wait

    try {
      const res = await assistantApi.answerAskMe(state.sessionId, userAnswer);

      const updatedHistory = [...state.history, newPair];

      if (res.is_complete || !res.follow_up_question) {
        // No more questions — auto-finalize
        patch({
          phase: 'finalizing',
          history: updatedHistory,
          questionsAnswered: res.questions_answered,
          currentQuestion: null,
        });
        try {
          const final = await assistantApi.finalizeAskMe(state.sessionId);
          patch({ phase: 'complete', result: final });
        } catch (err: any) {
          patch({
            phase: 'error',
            error: err?.response?.data?.error ?? err?.message ?? 'Failed to finalize',
          });
        }
      } else {
        // More questions to answer
        patch({
          phase: 'questioning',
          history: updatedHistory,
          questionsAnswered: res.questions_answered,
          currentQuestion: res.follow_up_question,
        });
      }
    } catch (err: any) {
      patch({
        phase: 'error',
        error: err?.response?.data?.error ?? err?.message ?? 'Failed to submit answer',
      });
    }
  }, [state, patch]);

  /**
   * Manually trigger finalization (user can finalize early after ≥1 answer).
   */
  const finalize = useCallback(async () => {
    if (!state.sessionId) return;

    patch({ phase: 'finalizing', error: null });
    try {
      const final = await assistantApi.finalizeAskMe(state.sessionId);
      patch({ phase: 'complete', result: final });
    } catch (err: any) {
      patch({
        phase: 'error',
        error: err?.response?.data?.error ?? err?.message ?? 'Failed to finalize',
      });
    }
  }, [state.sessionId, patch]);

  /** Reset the wizard back to idle */
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { state, start, answer, finalize, reset };
}

// ─── Sessions list hook ───────────────────────────────────────────────────────

export function useAskMeSessions() {
  return useQuery({
    queryKey: ['askme', 'sessions'],
    queryFn: () => assistantApi.getAskMeSessions(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useDeleteAskMeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => assistantApi.deleteAskMeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['askme', 'sessions'] });
    },
  });
}
