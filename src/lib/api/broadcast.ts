/**
 * Multi-AI Broadcast API Client
 *
 * Handles API calls for sending prompts to multiple AI models simultaneously.
 * Supports both regular and SSE streaming endpoints.
 */

import type {
  BroadcastRequest,
  BroadcastResult,
  ModelResponse,
  ModelStreamUpdate,
} from '@/types/broadcast';
import { apiConfig } from '@/lib/config/env';
import { useCreditsStore } from '@/store/credits';

// Broadcast uses the local Next.js API route (not the Django backend)
// so that we can call AI providers directly from the Next.js server.
const BROADCAST_ENDPOINT = '/api/v2/ai/broadcast/stream/';
const BROADCAST_STREAM_ENDPOINT = '/api/v2/ai/broadcast/stream/';

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

function syncCreditsFromHeaders(response: Response) {
  if (typeof window === 'undefined') {
    return;
  }

  const remaining = response.headers.get('X-Credits-Remaining');
  const used = response.headers.get('X-Credits-Used');
  const low = response.headers.get('X-Low-Credits');
  const balance = response.headers.get('X-Credits-Balance');
  const reserved = response.headers.get('X-Credits-Reserved');

  if (remaining !== null || low !== null || balance !== null) {
    useCreditsStore.getState().syncFromHeaders(
      remaining !== null ? Number(remaining) : null,
      used !== null ? Number(used) : null,
      low === 'true',
      balance !== null ? Number(balance) : null,
      reserved !== null ? Number(reserved) : null
    );
  }
}

async function parseFailedResponse(response: Response) {
  const raw = await response.text().catch(() => '');
  let message = `Broadcast failed with status ${response.status}`;
  let errorKey = '';

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      errorKey = (parsed.error || parsed.code || '').toString();
      message = parsed.error || parsed.detail || parsed.message || message;
    } catch {
      message = raw;
    }
  }

  const error = new Error(message) as Error & { status: number; code?: string };
  error.status = response.status;
  if (response.status === 402) {
    error.code =
      errorKey === 'no_subscription'
        ? 'NO_SUBSCRIPTION'
        : errorKey === 'insufficient_credits'
          ? 'INSUFFICIENT_CREDITS'
          : 'INSUFFICIENT_CREDITS';
  }

  throw error;
}

type ParsedSseEvent = {
  event: string;
  data: string;
};

function parseSseChunk(chunk: string): ParsedSseEvent | null {
  const normalized = chunk.replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return null;
  }

  const lines = normalized.split('\n');
  let event = 'message';
  const dataParts: string[] = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
      continue;
    }

    if (line.startsWith('data:')) {
      dataParts.push(line.slice(5).trim());
    }
  }

  if (dataParts.length === 0) {
    return null;
  }

  return {
    event,
    data: dataParts.join('\n'),
  };
}

async function readSseStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: ParsedSseEvent) => void,
  signal: AbortSignal
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      if (signal.aborted) {
        await reader.cancel();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const normalizedBuffer = buffer.replace(/\r\n/g, '\n');
      const parts = normalizedBuffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        const parsed = parseSseChunk(part);
        if (parsed) {
          onEvent(parsed);
        }
      }
    }

    const finalEvent = parseSseChunk(buffer);
    if (finalEvent) {
      onEvent(finalEvent);
    }
  } finally {
    reader.releaseLock();
  }
}

function safeParseJson<T>(payload: string): T | null {
  try {
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
}

/**
 * Send a prompt to multiple AI models (non-streaming)
 *
 * @param request - Broadcast request with prompt and optional providers
 * @returns Promise with broadcast result containing all model responses
 */
export async function broadcastToAll(request: BroadcastRequest): Promise<BroadcastResult> {
  const response = await fetch(BROADCAST_ENDPOINT, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(request),
  });

  syncCreditsFromHeaders(response);

  if (!response.ok) {
    await parseFailedResponse(response);
  }

  return response.json();
}

/**
 * Send a prompt to multiple AI models with SSE streaming
 *
 * @param request - Broadcast request with prompt and optional providers
 * @param onMessage - Callback for each SSE event
 * @param onComplete - Callback when broadcast completes
 * @param onError - Callback for errors
 * @returns AbortController to cancel the stream
 */
export function streamBroadcast(
  request: BroadcastRequest,
  callbacks: {
    onStart?: (prompt: string) => void;
    onResponse?: (response: ModelStreamUpdate) => void;
    onComplete?: (result: BroadcastResult) => void;
    onError?: (error: string, code?: string) => void;
  }
): AbortController {
  const controller = new AbortController();

  void (async () => {
    let completed = false;

    try {
      const response = await fetch(BROADCAST_STREAM_ENDPOINT, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      syncCreditsFromHeaders(response);

      if (!response.ok) {
        await parseFailedResponse(response);
      }

      if (!response.body) {
        throw new Error('Streaming is not supported by this browser.');
      }

      await readSseStream(
        response.body,
        (event) => {
          const payload = safeParseJson<any>(event.data);
          if (!payload) {
            return;
          }

          switch (event.event) {
            case 'broadcast_start':
              callbacks.onStart?.(payload.prompt ?? request.prompt);
              break;
            case 'model_response':
              callbacks.onResponse?.(payload as ModelStreamUpdate);
              break;
            case 'broadcast_complete':
              completed = true;
              callbacks.onComplete?.(payload as BroadcastResult);
              break;
            case 'error':
              callbacks.onError?.(
                payload.error || payload.detail || 'Broadcast stream failed.',
                payload.error === 'no_subscription'
                  ? 'NO_SUBSCRIPTION'
                  : payload.error === 'insufficient_credits'
                    ? 'INSUFFICIENT_CREDITS'
                    : undefined
              );
              break;
            default:
              break;
          }
        },
        controller.signal
      );

      if (!controller.signal.aborted && !completed) {
        callbacks.onError?.('Broadcast stream ended before completion.');
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      const typedError = error as Error & { code?: string };
      const message =
        typedError instanceof Error
          ? typedError.message
          : 'An unexpected streaming error occurred.';
      callbacks.onError?.(message, typedError.code);
    }
  })();

  return controller;
}
