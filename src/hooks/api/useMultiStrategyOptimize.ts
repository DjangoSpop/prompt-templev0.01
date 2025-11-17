/**
 * Multi-Strategy Optimization Hook with SSE Streaming
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  TMultiStrategyOptimizationRequest,
  TMultiStrategyOptimizationResponse,
  TStrategyImprovement,
  OptimizationStrategy,
  MultiStrategyChunk,
} from "@/schemas/optimization";
import { sseStream } from "@/lib/sse";

interface UseMultiStrategyOptimizeReturn {
  // State
  isOptimizing: boolean;
  error: Error | null;
  progress: number;
  currentStrategy: OptimizationStrategy | null;
  strategyResults: TStrategyImprovement[];
  finalResult: TMultiStrategyOptimizationResponse | null;

  // Actions
  optimize: (request: TMultiStrategyOptimizationRequest) => void;
  stop: () => void;
  reset: () => void;
}

export function useMultiStrategyOptimize(): UseMultiStrategyOptimizeReturn {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStrategy, setCurrentStrategy] = useState<OptimizationStrategy | null>(null);
  const [strategyResults, setStrategyResults] = useState<TStrategyImprovement[]>([]);
  const [finalResult, setFinalResult] = useState<TMultiStrategyOptimizationResponse | null>(null);

  const stopRef = useRef<(() => void) | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setIsOptimizing(false);
    setError(null);
    setProgress(0);
    setCurrentStrategy(null);
    setStrategyResults([]);
    setFinalResult(null);
  }, []);

  const stop = useCallback(() => {
    stopRef.current?.();
    abortControllerRef.current?.abort();
    setIsOptimizing(false);
  }, []);

  const optimize = useCallback((request: TMultiStrategyOptimizationRequest) => {
    // Reset state
    reset();
    setIsOptimizing(true);
    setError(null);

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const cleanup = sseStream(
      "/api/v2/ai/optimize-multi-strategy/",
      request,
      {
        onData: (line) => {
          try {
            const chunk = MultiStrategyChunk.parse(JSON.parse(line));

            switch (chunk.type) {
              case "strategy_start":
                if (chunk.strategy) {
                  setCurrentStrategy(chunk.strategy);
                }
                break;

              case "strategy_progress":
                if (chunk.progress !== undefined) {
                  setProgress(chunk.progress);
                }
                break;

              case "strategy_complete":
                if (chunk.data) {
                  setStrategyResults((prev) => [...prev, chunk.data]);
                }
                break;

              case "final_result":
                if (chunk.data) {
                  setFinalResult(chunk.data);
                  setProgress(100);
                  setIsOptimizing(false);
                }
                break;

              case "error":
                throw new Error(chunk.message || "Optimization failed");
            }
          } catch (err) {
            if (err instanceof Error) {
              console.error("Failed to parse optimization chunk:", err);
              setError(err);
            }
          }
        },
        onError: (err) => {
          setError(err);
          setIsOptimizing(false);
        },
        onComplete: () => {
          setIsOptimizing(false);
        },
        signal: abortController.signal,
      }
    );

    stopRef.current = () => {
      cleanup();
      abortController.abort();
      setIsOptimizing(false);
    };
  }, [reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRef.current?.();
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    isOptimizing,
    error,
    progress,
    currentStrategy,
    strategyResults,
    finalResult,
    optimize,
    stop,
    reset,
  };
}
