import { z } from "zod";
import { Pagination } from "./common";

/**
 * Prompt Library Item schema
 */
export const PromptLibraryItem = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  subcategory: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  intent_category: z.string().optional().nullable(),
  use_case: z.string().optional().nullable(),
  usage_count: z.number().default(0),
  success_rate: z.number().min(0).max(1).default(0),
  average_rating: z.number().min(0).max(5).default(0),
  ai_enhanced: z.boolean().default(false),
  complexity_score: z.number().min(1).max(10).default(5),
  estimated_tokens: z.number().default(0),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  quality_score: z.number().min(0).max(100).default(50),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TLibraryItem = z.infer<typeof PromptLibraryItem>;

/**
 * Paginated library list
 */
export const LibraryList = Pagination.extend({
  results: z.array(PromptLibraryItem),
});

export type TLibraryList = z.infer<typeof LibraryList>;

/**
 * Library item detail (includes additional metadata)
 */
export const LibraryItemDetail = PromptLibraryItem.extend({
  examples: z.array(z.object({
    input: z.string(),
    output: z.string(),
    description: z.string().optional(),
  })).optional(),
  related_items: z.array(z.string().uuid()).optional(),
  version: z.string().optional(),
  author: z.object({
    id: z.string(),
    username: z.string(),
  }).optional(),
});

export type TLibraryItemDetail = z.infer<typeof LibraryItemDetail>;

/**
 * Library search/filter params
 */
export const LibrarySearchParams = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  intent_category: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  min_quality_score: z.number().min(0).max(100).optional(),
  ordering: z.enum([
    "created_at",
    "-created_at",
    "updated_at",
    "-updated_at",
    "usage_count",
    "-usage_count",
    "quality_score",
    "-quality_score",
    "average_rating",
    "-average_rating",
  ]).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type TLibrarySearchParams = z.infer<typeof LibrarySearchParams>;
