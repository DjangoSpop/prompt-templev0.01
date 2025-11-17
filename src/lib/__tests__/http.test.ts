/**
 * Unit tests for HTTP API client
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { api, apiGet, apiPost, buildQueryString, ApiError } from "../http";
import { z } from "zod";

// Mock fetch
global.fetch = vi.fn();

const mockSchema = z.object({
  message: z.string(),
  status: z.string(),
});

describe("HTTP API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
  });

  describe("buildQueryString", () => {
    it("builds query string from params", () => {
      const params = { page: 1, limit: 10, search: "test" };
      const result = buildQueryString(params);
      expect(result).toBe("?page=1&limit=10&search=test");
    });

    it("handles array params", () => {
      const params = { tags: ["ai", "ml", "nlp"] };
      const result = buildQueryString(params);
      expect(result).toContain("tags=ai");
      expect(result).toContain("tags=ml");
      expect(result).toContain("tags=nlp");
    });

    it("filters out undefined and null values", () => {
      const params = { page: 1, limit: undefined, search: null, category: "" };
      const result = buildQueryString(params);
      expect(result).toBe("?page=1");
    });

    it("returns empty string for empty params", () => {
      const result = buildQueryString({});
      expect(result).toBe("");
    });
  });

  describe("api", () => {
    it("makes successful GET request", async () => {
      const mockResponse = { message: "success", status: "ok" };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiGet("/test", mockSchema);
      expect(result).toEqual(mockResponse);
    });

    it("throws ApiError on HTTP error", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => "Resource not found",
      });

      await expect(apiGet("/test", mockSchema)).rejects.toThrow(ApiError);
    });

    it("validates response with Zod schema", async () => {
      const invalidResponse = { invalid: "data" };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => invalidResponse,
      });

      await expect(apiGet("/test", mockSchema)).rejects.toThrow(ApiError);
    });

    it("handles 204 No Content", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const emptySchema = z.object({});
      const result = await api("/test", emptySchema, { method: "DELETE" });
      expect(result).toEqual({});
    });
  });

  describe("apiPost", () => {
    it("sends POST request with body", async () => {
      const mockResponse = { message: "created", status: "ok" };
      const requestBody = { name: "Test" };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      await apiPost("/test", mockSchema, requestBody);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/test"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(requestBody),
        })
      );
    });
  });
});
