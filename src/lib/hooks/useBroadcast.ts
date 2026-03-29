import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { streamBroadcast } from '@/lib/api/broadcast';
import { billingKeys } from '@/hooks/api/useBilling';
import { useCredits } from '@/hooks/api/useCredits';
import { useCreditsStore } from '@/store/credits';
import type {
  BroadcastModelState,
  BroadcastRequest,
  BroadcastResult,
  BroadcastStreamState,
  ModelScores,
  ModelStreamUpdate,
} from '@/types/broadcast';
import { AVAILABLE_PROVIDERS, BROADCAST_COST, getProviderMeta } from '@/types/broadcast';

const PREMIUM_PLANS = new Set(['PRO', 'POWER']);

function createModelState(providerId: string): BroadcastModelState {
  const meta = getProviderMeta(providerId);

  return {
    provider: providerId,
    model: meta?.model ?? providerId,
    name: meta?.name ?? providerId,
    description: meta?.description ?? 'AI model',
    icon: meta?.icon ?? 'AI',
    color: meta?.color ?? '#1E3A8A',
    content: '',
    latency_ms: null,
    tokens_out: null,
    status: 'waiting',
  };
}

function buildInitialStreamState(request: BroadcastRequest): BroadcastStreamState {
  const providerOrder =
    request.providers && request.providers.length > 0
      ? request.providers
      : AVAILABLE_PROVIDERS.slice(0, 3).map((provider) => provider.id);

  return {
    isStreaming: true,
    prompt: request.prompt,
    providerOrder,
    responses: new Map(providerOrder.map((providerId) => [providerId, createModelState(providerId)])),
  };
}

function mergeScores(
  current: ModelScores | undefined,
  incoming: Partial<ModelScores> | undefined
): ModelScores | undefined {
  if (!incoming && !current) {
    return undefined;
  }

  return {
    provider: incoming?.provider ?? current?.provider ?? '',
    completeness: incoming?.completeness ?? current?.completeness ?? 0,
    clarity: incoming?.clarity ?? current?.clarity ?? 0,
    accuracy: incoming?.accuracy ?? current?.accuracy ?? 0,
    creativity: incoming?.creativity ?? current?.creativity ?? 0,
    overall: incoming?.overall ?? current?.overall ?? 0,
  };
}

function mergeStreamUpdate(current: BroadcastModelState, update: ModelStreamUpdate): BroadcastModelState {
  const delta =
    typeof update.delta === 'string'
      ? update.delta
      : typeof update.content_delta === 'string'
        ? update.content_delta
        : typeof update.text === 'string' && !update.content
          ? update.text
          : '';

  const nextContent =
    typeof update.content === 'string'
      ? update.content
      : delta
        ? `${current.content}${delta}`
        : current.content;

  const nextStatus =
    update.error
      ? 'error'
      : update.isStreamComplete || update.status === 'complete'
        ? 'complete'
        : nextContent
          ? 'streaming'
          : current.status;

  return {
    ...current,
    model: update.model ?? current.model,
    content: nextContent,
    latency_ms:
      typeof update.latency_ms === 'number' ? update.latency_ms : current.latency_ms,
    tokens_out:
      typeof update.tokens_out === 'number' ? update.tokens_out : current.tokens_out,
    scores: mergeScores(current.scores, update.scores),
    error: update.error ?? current.error,
    status: nextStatus,
  };
}

function applyFinalResult(
  result: BroadcastResult,
  currentState: BroadcastStreamState | null
): BroadcastStreamState {
  const resultResponses = Array.isArray(result.responses) ? result.responses : [];

  const providerOrder =
    currentState?.providerOrder.length
      ? currentState.providerOrder
      : resultResponses.map((response) => response.provider);

  const responses = new Map<string, BroadcastModelState>();

  for (const providerId of providerOrder) {
    responses.set(providerId, createModelState(providerId));
  }

  for (const response of resultResponses) {
    const existing = responses.get(response.provider) ?? createModelState(response.provider);
    responses.set(response.provider, {
      ...existing,
      model: response.model,
      content: response.content,
      latency_ms: response.latency_ms,
      tokens_out: response.tokens_out,
      scores: response.scores,
      error: response.error,
      status: response.error ? 'error' : 'complete',
      isWinner: response.provider === result.best_overall,
    });
  }

  return {
    isStreaming: false,
    prompt: result.prompt,
    providerOrder,
    responses,
    bestOverall: result.best_overall,
    comparisonSummary: result.comparison_summary,
    totalLatency: result.total_latency_ms,
    creditsConsumed: result.credits_consumed,
  };
}

export function useBroadcast() {
  const queryClient = useQueryClient();
  const { available, plan, isLoading: isCreditsLoading } = useCredits();
  const openUpgradeModal = useCreditsStore((state) => state.openUpgradeModal);
  const deductOptimistic = useCreditsStore((state) => state.deductOptimistic);
  const refundOptimistic = useCreditsStore((state) => state.refundOptimistic);

  const [phase, setPhase] = useState<'idle' | 'streaming' | 'complete' | 'error'>('idle');
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [streamState, setStreamState] = useState<BroadcastStreamState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const planCode = plan;
  const creditsAvailable = available;
  const isPremium = PREMIUM_PLANS.has(planCode);
  const canAfford = creditsAvailable >= BROADCAST_COST;

  const finalState = result ? applyFinalResult(result, streamState) : null;

  const modelStates = streamState
    ? streamState.providerOrder.map(
        (providerId) => streamState.responses.get(providerId) ?? createModelState(providerId)
      )
    : finalState
      ? finalState.providerOrder.map(
          (providerId) => finalState.responses.get(providerId) ?? createModelState(providerId)
        )
      : [];

  const cancelBroadcast = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setPhase((currentPhase) => (currentPhase === 'streaming' ? 'idle' : currentPhase));
    setStreamState((currentState) =>
      currentState
        ? {
            ...currentState,
            isStreaming: false,
          }
        : null
    );
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setPhase('idle');
    setResult(null);
    setStreamState(null);
    setError(null);
  }, []);

  const startBroadcast = useCallback(
    async (request: BroadcastRequest) => {
      if (isCreditsLoading || !isPremium || !canAfford) {
        openUpgradeModal('broadcast');
        return null;
      }

      controllerRef.current?.abort();

      setError(null);
      setResult(null);
      setPhase('streaming');

      const initialState = buildInitialStreamState(request);
      setStreamState(initialState);
      deductOptimistic(BROADCAST_COST);

      let settled = false;

      const controller = streamBroadcast(request, {
        onStart: (prompt) => {
          setStreamState((currentState) =>
            currentState
              ? {
                  ...currentState,
                  prompt,
                }
              : currentState
          );
        },
        onResponse: (response) => {
          setStreamState((currentState) => {
            if (!currentState) {
              return currentState;
            }

            const existing =
              currentState.responses.get(response.provider) ?? createModelState(response.provider);
            const nextResponses = new Map(currentState.responses);
            nextResponses.set(response.provider, mergeStreamUpdate(existing, response));

            if (!currentState.providerOrder.includes(response.provider)) {
              return {
                ...currentState,
                providerOrder: [...currentState.providerOrder, response.provider],
                responses: nextResponses,
              };
            }

            return {
              ...currentState,
              responses: nextResponses,
            };
          });
        },
        onComplete: (finalResult) => {
          settled = true;
          controllerRef.current = null;
          setResult(finalResult);
          setStreamState((currentState) => applyFinalResult(finalResult, currentState));
          setPhase('complete');
          queryClient.invalidateQueries({ queryKey: billingKeys.entitlements() });
          queryClient.invalidateQueries({ queryKey: billingKeys.usage() });
        },
        onError: (message, code) => {
          if (settled) {
            return;
          }

          controllerRef.current = null;
          refundOptimistic(BROADCAST_COST);
          setPhase('error');
          setError(message);
          setStreamState((currentState) =>
            currentState
              ? {
                  ...currentState,
                  isStreaming: false,
                  error: message,
                }
              : currentState
          );

          if (
            code === 'INSUFFICIENT_CREDITS' ||
            code === 'NO_SUBSCRIPTION' ||
            message.toLowerCase().includes('credit') ||
            message.toLowerCase().includes('subscription') ||
            message.toLowerCase().includes('plan')
          ) {
            openUpgradeModal('broadcast');
          }
        },
      });

      controllerRef.current = controller;
      return controller;
    },
    [
      canAfford,
      deductOptimistic,
      isCreditsLoading,
      isPremium,
      openUpgradeModal,
      queryClient,
      refundOptimistic,
    ]
  );

  return {
    phase,
    isLoading: phase === 'streaming',
    isStreaming: phase === 'streaming',
    result,
    streamState,
    modelStates,
    error,
    planCode,
    isPremium,
    creditsAvailable,
    cost: BROADCAST_COST,
    canBroadcast: !isCreditsLoading && isPremium && canAfford,
    startBroadcast,
    cancelBroadcast,
    reset,
  };
}