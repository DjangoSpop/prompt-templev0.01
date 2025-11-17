import { z } from "zod";
import { Pagination } from "./common";

/**
 * Template category schema
 */
export const TemplateCategory = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
});

export type TTemplateCategory = z.infer<typeof TemplateCategory>;

/**
 * Template schema (list view)
 */
export const Template = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: TemplateCategory,
  template_content: z.string(),
  tags: z.array(z.string()).default([]),
  usage_count: z.number().default(0),
  average_rating: z.number().min(0).max(5).default(0),
  popularity_score: z.number().default(0),
  is_public: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TTemplate = z.infer<typeof Template>;

/**
 * Template detail schema (includes additional fields)
 */
export const TemplateDetail = Template.extend({
  author: z.object({
    id: z.string(),
    username: z.string(),
    display_name: z.string().optional(),
  }).optional(),
  variables: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional(),
  is_bookmarked: z.boolean().optional(),
  user_rating: z.number().min(0).max(5).optional().nullable(),
});

export type TTemplateDetail = z.infer<typeof TemplateDetail>;

/**
 * Paginated template list
 */
export const TemplateList = Pagination.extend({
  results: z.array(Template),
});

export type TTemplateList = z.infer<typeof TemplateList>;

/**
 * Template create/update schemas
 */
export const TemplateCreate = z.object({
  title: z.string().min(1).max(200),
  description: z.string(),
  template_content: z.string().min(1),
  category_id: z.number(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().optional(),
  variables: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type TTemplateCreate = z.infer<typeof TemplateCreate>;

export const TemplateUpdate = TemplateCreate.partial();

export type TTemplateUpdate = z.infer<typeof TemplateUpdate>;

/**
 * Template rating schema
 */
export const TemplateRating = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
});

export type TTemplateRating = z.infer<typeof TemplateRating>;

/**
 * Template bookmark response
 */
export const BookmarkResponse = z.object({
  is_bookmarked: z.boolean(),
  message: z.string(),
});

export type TBookmarkResponse = z.infer<typeof BookmarkResponse>;
