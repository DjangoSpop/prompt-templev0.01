/**
 * Authenticated SSE Optimize hook for full features
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { OptimizeChunk, TOptimizeChunk, TOptimizeRequest } from "@/schemas/streams";
import { sseStream } from "@/lib/sse";

export function useOptimizeAuth() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<{ latency_ms?: number; tokens_generated?: number } | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const run = useCallback((request: TOptimizeRequest) => {
    // Reset state
    setOutput("");
    setSuggestions([]);
    setMetrics(null);
    setError(null);
    setLoading(true);

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const cleanup = sseStream(
      "/api/v2/optimize/",
      request,
      {
        onData: (line) => {
          try {
            const chunk = OptimizeChunk.parse(JSON.parse(line));

            if (chunk.token) {
              setOutput((prev) => prev + chunk.token);
            }

            if (chunk.suggestions && chunk.suggestions.length > 0) {
              setSuggestions(chunk.suggestions);
            }

            if (chunk.metrics) {
              setMetrics(chunk.metrics);
            }

            if (chunk.is_final) {
              setLoading(false);
            }

            if (chunk.error) {
              throw new Error(chunk.error);
            }
          } catch (err) {
            if (err instanceof Error) {
              console.error("Failed to parse optimize chunk:", err);
            }
          }
        },
        onError: (err) => {
          setError(err);
          setLoading(false);
        },
        onComplete: () => {
          setLoading(false);
        },
        signal: abortController.signal,
      }
    );

    stopRef.current = () => {
      cleanup();
      abortController.abort();
      setLoading(false);
    };
  }, []);

  const stop = useCallback(() => {
    stopRef.current?.();
    abortControllerRef.current?.abort();
    setLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRef.current?.();
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    output,
    loading,
    error,
    suggestions,
    metrics,
    run,
    stop,
  };
}
