/**
 * Server-Sent Events (SSE) Client
 * For streaming API responses with automatic auth headers
 */

import { API_URL, authHeaders } from "./http";

export interface SSEOptions {
  onData: (line: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
  signal?: AbortSignal;
}

/**
 * SSE stream helper with error handling and cleanup
 */
export function sseStream(
  path: string,
  body: any,
  options: SSEOptions
): () => void {
  const { onData, onError, onComplete, signal } = options;
  const ctrl = signal ? undefined : new AbortController();
  const abortSignal = signal || ctrl?.signal;

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  fetch(url, {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
    signal: abortSignal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text().catch(() => res.statusText);
        throw new Error(`SSE HTTP ${res.status}: ${errorText}`);
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // Keep the last incomplete line in buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();

              if (data === "[DONE]") {
                onComplete?.();
                return;
              }

              onData(data);
            }
          }
        }

        onComplete?.();
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          onError?.(error);
        }
      } finally {
        reader.releaseLock();
      }
    })
    .catch((error) => {
      if (error instanceof Error && error.name !== "AbortError") {
        onError?.(error);
      }
    });

  return () => {
    ctrl?.abort();
  };
}

/**
 * SSE stream with typed chunks (using Zod validation)
 */
export function sseTypedStream<T>(
  path: string,
  body: any,
  parser: (data: string) => T | null,
  options: {
    onChunk: (chunk: T) => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
    signal?: AbortSignal;
  }
): () => void {
  return sseStream(path, body, {
    onData: (line) => {
      try {
        const chunk = parser(line);
        if (chunk !== null) {
          options.onChunk(chunk);
        }
      } catch (error) {
        console.error("Failed to parse SSE chunk:", error);
        options.onError?.(
          error instanceof Error
            ? error
            : new Error("Failed to parse SSE chunk")
        );
      }
    },
    onError: options.onError,
    onComplete: options.onComplete,
    signal: options.signal,
  });
}

/**
 * Simple async generator for SSE streams (alternative API)
 */
export async function* sseGenerator<T>(
  path: string,
  body: any,
  parser: (data: string) => T | null
): AsyncGenerator<T, void, unknown> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`SSE HTTP ${response.status}: ${errorText}`);
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();

          if (data === "[DONE]") {
            return;
          }

          const chunk = parser(data);
          if (chunk !== null) {
            yield chunk;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
