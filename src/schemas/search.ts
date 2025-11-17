import { z } from "zod";
import { Template } from "./template";
import { PromptLibraryItem } from "./library";

/**
 * Unified search result schema
 */
export const SearchResult = z.object({
  type: z.enum(["template", "library"]),
  score: z.number().min(0).max(1),
  item: z.union([Template, PromptLibraryItem]),
});

export type TSearchResult = z.infer<typeof SearchResult>;

/**
 * Search response schema
 */
export const SearchResponse = z.object({
  query: z.string(),
  total_results: z.number(),
  results: z.array(SearchResult),
  took_ms: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
});

export type TSearchResponse = z.infer<typeof SearchResponse>;

/**
 * Related templates response
 */
export const RelatedTemplatesResponse = z.object({
  template_id: z.string().uuid(),
  related: z.array(Template),
  method: z.enum(["tags", "jaccard", "embeddings", "hybrid"]),
});

export type TRelatedTemplatesResponse = z.infer<typeof RelatedTemplatesResponse>;

/**
 * Search params
 */
export const SearchParams = z.object({
  q: z.string().min(1),
  type: z.enum(["all", "templates", "library"]).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type TSearchParams = z.infer<typeof SearchParams>;
