/**
 * Unit tests for Zod schemas
 */

import { describe, it, expect } from "vitest";
import {
  Template,
  TemplateDetail,
  TemplateCreate,
  TemplateRating,
} from "@/schemas/template";
import { PromptLibraryItem } from "@/schemas/library";
import { OptimizeChunk, OptimizeRequest } from "@/schemas/streams";

describe("Zod Schemas", () => {
  describe("Template Schema", () => {
    it("validates valid template data", () => {
      const validTemplate = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Test Template",
        description: "A test template",
        category: {
          id: 1,
          name: "Marketing",
          slug: "marketing",
        },
        template_content: "Hello {name}",
        tags: ["test", "demo"],
        usage_count: 10,
        average_rating: 4.5,
        popularity_score: 85,
        is_public: true,
        is_featured: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const result = Template.safeParse(validTemplate);
      expect(result.success).toBe(true);
    });

    it("rejects invalid template data", () => {
      const invalidTemplate = {
        id: "invalid-uuid",
        title: "Test",
        // Missing required fields
      };

      const result = Template.safeParse(invalidTemplate);
      expect(result.success).toBe(false);
    });
  });

  describe("TemplateCreate Schema", () => {
    it("validates template creation data", () => {
      const validData = {
        title: "New Template",
        description: "Description",
        template_content: "Content",
        category_id: 1,
        tags: ["ai", "ml"],
      };

      const result = TemplateCreate.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects empty title", () => {
      const invalidData = {
        title: "",
        description: "Description",
        template_content: "Content",
        category_id: 1,
      };

      const result = TemplateCreate.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("TemplateRating Schema", () => {
    it("validates rating between 1 and 5", () => {
      const validRating = {
        rating: 4,
        review: "Great template!",
      };

      const result = TemplateRating.safeParse(validRating);
      expect(result.success).toBe(true);
    });

    it("rejects rating outside range", () => {
      const invalidRating = {
        rating: 6,
      };

      const result = TemplateRating.safeParse(invalidRating);
      expect(result.success).toBe(false);
    });
  });

  describe("PromptLibraryItem Schema", () => {
    it("validates library item", () => {
      const validItem = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Library Item",
        content: "Content here",
        category: "Writing",
        tags: ["creative"],
        keywords: ["write", "story"],
        usage_count: 100,
        success_rate: 0.85,
        average_rating: 4.2,
        ai_enhanced: true,
        complexity_score: 7,
        estimated_tokens: 150,
        is_active: true,
        is_featured: true,
        quality_score: 92,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const result = PromptLibraryItem.safeParse(validItem);
      expect(result.success).toBe(true);
    });
  });

  describe("OptimizeChunk Schema", () => {
    it("validates SSE chunk with token", () => {
      const validChunk = {
        token: "Hello",
        is_final: false,
      };

      const result = OptimizeChunk.safeParse(validChunk);
      expect(result.success).toBe(true);
    });

    it("validates SSE chunk with suggestions", () => {
      const validChunk = {
        is_final: true,
        suggestions: ["Add more context", "Be more specific"],
        metrics: {
          latency_ms: 250,
          tokens_generated: 100,
        },
      };

      const result = OptimizeChunk.safeParse(validChunk);
      expect(result.success).toBe(true);
    });
  });

  describe("OptimizeRequest Schema", () => {
    it("validates optimize request", () => {
      const validRequest = {
        prompt: "Write an email",
        optimize_for: "clarity",
        max_tokens: 500,
      };

      const result = OptimizeRequest.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("rejects empty prompt", () => {
      const invalidRequest = {
        prompt: "",
      };

      const result = OptimizeRequest.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});
