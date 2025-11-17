/**
 * Unit tests for useOptimizeTry hook
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOptimizeTry } from "../useOptimizeTry";

// Mock the SSE stream
vi.mock("@/lib/sse", () => ({
  sseStream: vi.fn((path, body, options) => {
    // Simulate SSE streaming
    setTimeout(() => {
      // Send some chunks
      options.onData(JSON.stringify({ token: "Hello " }));
      options.onData(JSON.stringify({ token: "world!" }));
      options.onData(
        JSON.stringify({
          is_final: true,
          suggestions: ["Add more context"],
        })
      );
      options.onComplete();
    }, 10);

    return () => {}; // cleanup function
  }),
}));

describe("useOptimizeTry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useOptimizeTry());

    expect(result.current.output).toBe("");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.suggestions).toEqual([]);
  });

  it("streams output when run is called", async () => {
    const { result } = renderHook(() => useOptimizeTry());

    act(() => {
      result.current.run({ prompt: "Test prompt" });
    });

    expect(result.current.loading).toBe(true);

    // Wait for streaming to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(result.current.output).toContain("Hello");
    expect(result.current.output).toContain("world");
    expect(result.current.suggestions).toContain("Add more context");
    expect(result.current.loading).toBe(false);
  });

  it("stops streaming when stop is called", async () => {
    const { result } = renderHook(() => useOptimizeTry());

    act(() => {
      result.current.run({ prompt: "Test prompt" });
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      result.current.stop();
    });

    expect(result.current.loading).toBe(false);
  });
});
