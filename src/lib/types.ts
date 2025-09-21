import { z } from 'zod';

// Base API Response Schema
export const ApiResponseSchema = z.object({
  status: z.string(),
  message: z.string().optional(),
  data: z.any().optional(),
});

// Paginated Response Schema
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    count: z.number().optional(),
    next: z.string().nullable().optional(),
    previous: z.string().nullable().optional(),
    results: z.array(schema).optional(),
  });

// Field Type Enum (from Django API)
export const FieldTypeEnum = z.enum(['text', 'textarea', 'dropdown', 'checkbox', 'radio', 'number']);

// Prompt Field Schema (from Django API)
export const PromptFieldSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  placeholder: z.string().optional(),
  field_type: FieldTypeEnum.optional(),
  is_required: z.boolean().optional(),
  default_value: z.string().optional(),
  validation_pattern: z.string().optional(),
  help_text: z.string().optional(),
  options: z.any().optional(),
  order: z.number().optional(),
});

// Template Category Schema
export const TemplateCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  is_active: z.boolean().optional(),
  order: z.number().optional(),
  template_count: z.string(),
});

// User Minimal Schema
export const UserMinimalSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  avatar_url: z.string(),
  level: z.number(),
  user_rank: z.string(),
});

// Template List Schema (lightweight)
export const TemplateListSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: TemplateCategorySchema,
  author: z.string(),
  version: z.string().optional(),
  tags: z.any().optional(),
  usage_count: z.number().optional(),
  completion_rate: z.number().optional(),
  average_rating: z.number().optional(),
  popularity_score: z.number().optional(),
  is_featured: z.boolean().optional(),
  field_count: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Template Detail Schema (complete)
export const TemplateDetailSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: TemplateCategorySchema,
  template_content: z.string(),
  author: UserMinimalSchema,
  fields: z.array(PromptFieldSchema),
  version: z.string().optional(),
  tags: z.any().optional(),
  is_ai_generated: z.boolean().optional(),
  ai_confidence: z.number().optional(),
  extracted_keywords: z.any().optional(),
  smart_suggestions: z.any().optional(),
  usage_count: z.number().optional(),
  completion_rate: z.number().optional(),
  average_rating: z.number().optional(),
  popularity_score: z.number().optional(),
  is_public: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  field_count: z.string(),
  localizations: z.any().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Template Create/Update Schema
export const TemplateCreateUpdateSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.number(),
  template_content: z.string(),
  version: z.string().optional(),
  tags: z.any().optional(),
  is_public: z.boolean().optional(),
  fields_data: z.array(PromptFieldSchema.omit({ id: true })).optional(),
});

// Auth Schemas
export const ThemePreferenceEnum = z.enum(['light', 'dark', 'system']);

export const UserRegistrationSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  password_confirm: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  bio: z.string().optional(),
  theme_preference: ThemePreferenceEnum.optional(),
  language_preference: z.string().optional(),
});

export const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const TokenPairSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  avatar: z.string().optional().nullable(),
  avatar_url: z.string(),
  bio: z.string().optional(),
  date_joined: z.string(),
  last_login: z.string().nullable(),
  credits: z.number(),
  level: z.number(),
  experience_points: z.number(),
  daily_streak: z.number(),
  user_rank: z.string(),
  rank_info: z.string(),
  next_level_xp: z.string(),
  is_premium: z.boolean(),
  premium_expires_at: z.string().nullable(),
  theme_preference: ThemePreferenceEnum.optional(),
  language_preference: z.string().optional(),
  ai_assistance_enabled: z.boolean().optional(),
  analytics_enabled: z.boolean().optional(),
  templates_created: z.number(),
  templates_completed: z.number(),
  total_prompts_generated: z.number(),
  completion_rate: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const LoginResponseSchema = z.object({
  message: z.string(),
  user: UserProfileSchema,
  tokens: TokenPairSchema,
  daily_streak: z.number(),
});

// Health & Config Schemas
export const HealthStatusSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  checks: z.record(z.object({
    status: z.string(),
    message: z.string().optional(),
    timestamp: z.string(),
  })),
  timestamp: z.string(),
});

export const AppConfigSchema = z.object({
  features: z.record(z.boolean()).optional(),
  limits: z.record(z.number()).optional(),
  ui_settings: z.record(z.any()).optional(),
  version: z.string().optional(),
});

// Prompt History Schemas
export const PromptHistoryItemSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  variables: z.record(z.string()),
  template_id: z.string().uuid().optional(),
  template_title: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  usage_count: z.number().optional(),
  rating: z.number().optional(),
});

// Chat Analysis Schemas
export const ChatAnalysisSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  uploaded_at: z.string(),
  total_messages: z.number(),
  analysis_results: z.object({
    top_prompts: z.array(z.object({
      content: z.string(),
      frequency: z.number(),
      avg_response_length: z.number(),
      effectiveness_score: z.number(),
    })),
    prompt_clusters: z.array(z.object({
      name: z.string(),
      prompts: z.array(z.string()),
      similarity_score: z.number(),
    })),
    insights: z.object({
      most_effective_patterns: z.array(z.string()),
      improvement_suggestions: z.array(z.string()),
      usage_statistics: z.record(z.number()),
    }),
  }),
});

// Search and Filter Schemas
export const SearchSuggestionSchema = z.object({
  text: z.string(),
  type: z.enum(['template', 'category', 'tag']),
});

export const TemplateSearchSchema = z.object({
  search: z.string().optional(),
  category: z.number().optional(),
  author: z.string().uuid().optional(),
  is_public: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  ordering: z.string().optional(),
  page: z.number().optional(),
});

// Analytics & Gamification Schemas
export const AnalyticsEventSchema = z.object({
  event_type: z.string(),
  properties: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
});

export const GamificationAchievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  points: z.number(),
  unlocked: z.boolean(),
  unlocked_at: z.string().nullable(),
  progress: z.number(),
  total_required: z.number(),
});

export const GamificationBadgeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  earned_at: z.string(),
});

export const GamificationStatsSchema = z.object({
  level: z.number(),
  experience_points: z.number(),
  daily_streak: z.number(),
  achievements_unlocked: z.number(),
  badges_earned: z.number(),
  rank: z.string(),
  next_level_xp: z.number(),
});

export const DashboardDataSchema = z.object({
  total_templates_used: z.number(),
  total_renders: z.number(),
  favorite_categories: z.array(z.string()),
  recent_activity: z.array(z.object({
    template_name: z.string(),
    used_at: z.string(),
    category: z.string(),
  })),
  gamification: GamificationStatsSchema,
});

// Orchestrator Schemas
export const IntentRequestSchema = z.object({
  user_input: z.string(),
  context: z.record(z.any()).optional(),
});

export const IntentResponseSchema = z.object({
  intent: z.string(),
  confidence: z.number(),
  suggested_templates: z.array(z.string()),
  parameters: z.record(z.any()).optional(),
});

export const RenderRequestSchema = z.object({
  template_id: z.string(),
  variables: z.record(z.string()),
  include_variants: z.boolean().default(true),
});

export const RenderResponseSchema = z.object({
  primary_result: z.string(),
  variants: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const AssessmentRequestSchema = z.object({
  original_prompt: z.string(),
  llm_response: z.string(),
  context: z.record(z.any()).optional(),
});

export const AssessmentResponseSchema = z.object({
  critique: z.string(),
  suggestions: z.array(z.object({
    text: z.string(),
    action: z.string(),
  })),
  score: z.number(),
});

// Template Variable Interface (for mock data compatibility)
export interface Variable {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  required: boolean;
  description?: string;
  default_value?: string;
  options?: string[];
}

// Template Interface (for mock data compatibility)
export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  is_premium: boolean;
  usage_cost: number;
  rating: number;
  usage_count: number;
  variables: Variable[];
  created_at: string;
  updated_at: string;
}

// Category Interface (for mock data compatibility)
export interface Category {
  id: string;
  name: string;
  description: string;
  template_count: number;
}

// Quota Interface (app settings usage)
export interface Quota {
  daily_limit: number;
  daily_used: number;
  monthly_limit: number;
  monthly_used: number;
  reset_date: string; // ISO timestamp
}

// Type exports
export type FieldType = z.infer<typeof FieldTypeEnum>;
export type PromptField = z.infer<typeof PromptFieldSchema>;
export type TemplateCategory = z.infer<typeof TemplateCategorySchema>;
export type UserMinimal = z.infer<typeof UserMinimalSchema>;
export type TemplateList = z.infer<typeof TemplateListSchema>;
export type TemplateDetail = z.infer<typeof TemplateDetailSchema>;
export type TemplateCreateUpdate = z.infer<typeof TemplateCreateUpdateSchema>;
export type ThemePreference = z.infer<typeof ThemePreferenceEnum>;
export type UserRegistration = z.infer<typeof UserRegistrationSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type TokenPair = z.infer<typeof TokenPairSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type HealthStatus = z.infer<typeof HealthStatusSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
export type PromptHistoryItem = z.infer<typeof PromptHistoryItemSchema>;
export type ChatAnalysis = z.infer<typeof ChatAnalysisSchema>;
export type SearchSuggestion = z.infer<typeof SearchSuggestionSchema>;
export type TemplateSearch = z.infer<typeof TemplateSearchSchema>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
export type GamificationAchievement = z.infer<typeof GamificationAchievementSchema>;
export type GamificationBadge = z.infer<typeof GamificationBadgeSchema>;
export type GamificationStats = z.infer<typeof GamificationStatsSchema>;
export type DashboardData = z.infer<typeof DashboardDataSchema>;
export type IntentRequest = z.infer<typeof IntentRequestSchema>;
export type IntentResponse = z.infer<typeof IntentResponseSchema>;
export type RenderRequest = z.infer<typeof RenderRequestSchema>;
export type RenderResponse = z.infer<typeof RenderResponseSchema>;
export type AssessmentRequest = z.infer<typeof AssessmentRequestSchema>;
export type AssessmentResponse = z.infer<typeof AssessmentResponseSchema>;
export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & { data?: T };

// Paginated Response Type
export type PaginatedResponse<T> = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
};
