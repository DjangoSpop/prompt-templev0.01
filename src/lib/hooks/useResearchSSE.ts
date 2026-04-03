'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SSEEvent, SSEEventType, CardEventData } from '@/lib/types/research';

interface UseResearchSSEOptions {
  jobId: string | null;
  enabled?: boolean;
  onCard?: (card: CardEventData) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

interface SSEState {
  events: SSEEvent[];
  currentStage: string;
  progress: number; // 0-100
  cards: CardEventData[];
  isStreaming: boolean;
  error: string | null;
  processingTimeMs: number | null;
}

const RESEARCH_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://prompt-temple-2777469a4e35.herokuapp.com';

export function useResearchSSE({
  jobId,
  enabled = true,
  onCard,
  onComplete,
  onError,
}: UseResearchSSEOptions) {
  const [state, setState] = useState<SSEState>({
    events: [],
    currentStage: '',
    progress: 0,
    cards: [],
    isStreaming: false,
    error: null,
    processingTimeMs: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  useEffect(() => {
    if (!jobId || !enabled) return;

    const url = `${RESEARCH_BASE_URL}/api/v2/research/jobs/${jobId}/stream/`;
    const es = new EventSource(url);
    eventSourceRef.current = es;
    setState((prev) => ({ ...prev, isStreaming: true, error: null }));

    const stageProgress: Record<string, number> = {
      planning: 10,
      searching: 25,
      fetching: 45,
      clustering: 55,
      chunking: 60,
      retrieving: 70,
      synthesis: 85,
      end: 100,
      complete: 100,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEvent = (eventType: SSEEventType, data: any) => {
      const event: SSEEvent = { event: eventType, data };

      setState((prev) => {
        const next = { ...prev, events: [...prev.events, event] };

        switch (eventType) {
          case 'planning':
          case 'searching':
          case 'fetching':
          case 'synthesis':
            next.currentStage = data.stage || eventType;
            next.progress = stageProgress[eventType] || prev.progress;
            if (eventType === 'fetching' && data.progress_percent) {
              next.progress = 30 + data.progress_percent * 0.3;
            }
            break;

          case 'card':
            next.cards = [...prev.cards, data as CardEventData];
            onCard?.(data as CardEventData);
            break;

          case 'end':
          case 'complete':
            next.progress = 100;
            next.isStreaming = false;
            next.processingTimeMs = data.processing_time_ms || null;
            onComplete?.();
            break;

          case 'error':
            next.error = data.message || data.error || 'Unknown error';
            next.isStreaming = false;
            onError?.(next.error!);
            break;

          case 'heartbeat':
            break;

          case 'answer':
            next.progress = 95;
            break;
        }

        return next;
      });
    };

    const eventTypes: SSEEventType[] = [
      'stream_start',
      'planning',
      'searching',
      'clustering',
      'fetching',
      'synthesis',
      'card',
      'update',
      'end',
      'error',
      'heartbeat',
      'answer',
      'complete',
      'timeout',
    ];

    for (const type of eventTypes) {
      es.addEventListener(type, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          handleEvent(type, data);
        } catch {
          handleEvent(type, { raw: e.data });
        }
      });
    }

    es.onmessage = (e) => {
      if (e.data === '[DONE]') {
        disconnect();
        return;
      }
      try {
        const data = JSON.parse(e.data);
        handleEvent('update', data);
      } catch {
        /* ignore parse errors */
      }
    };

    es.onerror = () => {
      setState((prev) => {
        if (prev.progress >= 100 || prev.error) {
          disconnect();
        }
        return prev;
      });
    };

    return () => disconnect();
  }, [jobId, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, disconnect };
}
