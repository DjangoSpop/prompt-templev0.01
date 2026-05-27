'use client';

/**
 * useEvalStream — consume the PromptGuard eval-run SSE stream (Sprint 5).
 *
 * Connects a native EventSource to `/api/promptguard/eval-runs/{id}/stream` and
 * reduces the event sequence (snapshot → run_started → case_started/
 * case_complete* → run_complete | run_failed) into render-ready state for the
 * Eval Theater. Mirrors the shape of useResearchSSE (the codebase's existing
 * SSE hook) so the two read consistently.
 */
import { useEffect, useRef, useState } from 'react';
import { promptguardStreamUrl } from '@/lib/api/promptguard';
import type {
  CaseStartedPayload,
  RunCompletePayload,
  SnapshotPayload,
  StreamCase,
} from '@/app/(shell)/promptguard/lib/types';

export type StreamStatus =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'done'
  | 'failed';

export interface EvalStreamState {
  snapshot: SnapshotPayload | null;
  activeCase: CaseStartedPayload | null;
  completedCases: StreamCase[];
  finalResult: RunCompletePayload | null;
  error: string | null;
  status: StreamStatus;
}

const INITIAL: EvalStreamState = {
  snapshot: null,
  activeCase: null,
  completedCases: [],
  finalResult: null,
  error: null,
  status: 'idle',
};

export function useEvalStream(
  runId: string | null,
  onComplete?: () => void
): EvalStreamState {
  const [state, setState] = useState<EvalStreamState>(INITIAL);
  const sourceRef = useRef<EventSource | null>(null);
  // Keep the latest onComplete without re-subscribing the stream on each render.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!runId) {
      setState(INITIAL);
      return;
    }

    setState({ ...INITIAL, status: 'connecting' });
    const source = new EventSource(promptguardStreamUrl(runId));
    sourceRef.current = source;

    const parse = <T,>(e: MessageEvent): T | null => {
      try {
        return JSON.parse(e.data) as T;
      } catch {
        return null;
      }
    };

    source.addEventListener('snapshot', (e: MessageEvent) => {
      const data = parse<SnapshotPayload>(e as MessageEvent);
      if (!data) return;
      setState((prev) => ({
        ...prev,
        snapshot: data,
        completedCases: data.completed_cases ?? [],
        status:
          data.status === 'complete'
            ? 'done'
            : data.status === 'failed'
              ? 'failed'
              : 'streaming',
      }));
    });

    source.addEventListener('case_started', (e: MessageEvent) => {
      const data = parse<CaseStartedPayload>(e as MessageEvent);
      if (data) setState((prev) => ({ ...prev, activeCase: data }));
    });

    source.addEventListener('case_complete', (e: MessageEvent) => {
      const data = parse<StreamCase>(e as MessageEvent);
      if (!data) return;
      setState((prev) => {
        // De-dupe: a mid-run snapshot may already include this case.
        const seen = prev.completedCases.some((c) => c.case_id === data.case_id);
        return {
          ...prev,
          status: 'streaming',
          activeCase: null,
          completedCases: seen
            ? prev.completedCases
            : [...prev.completedCases, data],
        };
      });
    });

    source.addEventListener('run_complete', (e: MessageEvent) => {
      const data = parse<RunCompletePayload>(e as MessageEvent);
      setState((prev) => ({
        ...prev,
        finalResult: data,
        activeCase: null,
        status: 'done',
      }));
      onCompleteRef.current?.();
      source.close();
    });

    source.addEventListener('run_failed', (e: MessageEvent) => {
      const data = parse<{ error?: string }>(e as MessageEvent);
      setState((prev) => ({
        ...prev,
        error: data?.error ?? 'Run failed',
        status: 'failed',
      }));
      source.close();
    });

    source.onerror = () => {
      // EventSource auto-reconnects on transient drops; only surface an error
      // if we hadn't already reached a terminal state.
      setState((prev) =>
        prev.status === 'done' || prev.status === 'failed'
          ? prev
          : { ...prev, error: 'Stream connection lost', status: 'failed' }
      );
      source.close();
    };

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [runId]);

  return state;
}
