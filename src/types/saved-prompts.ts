/**
 * Saved Prompts & Iteration Types
 * Full type system for prompt library management, versioning, and iteration
 */

// ============================================
// Core Saved Prompt Types
// ============================================

export interface SavedPrompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  description?: string;
  category: string;
  tags: string[];
  is_favorite: boolean;
  is_public: boolean;
  use_count: number;
  last_used_at?: string;
  source: 'manual' | 'chat' | 'template' | 'optimization' | 'iteration';
  source_template_id?: string;
  source_template_name?: string;
  variables_snapshot?: Record<string, string | number | boolean>;
  metadata?: PromptMetadata;
  current_version: number;
  created_at: string;
  updated_at: string;
}

export interface PromptMetadata {
  model_used?: string;
  tokens_estimated?: number;
  quality_score?: number;
  effectiveness_rating?: number;
  optimization_count?: number;
  original_prompt?: string;
  notes?: string;
  custom_fields?: Record<string, unknown>;
}

// ============================================
// Prompt Iteration / Version Types
// ============================================

export interface PromptIteration {
  id: string;
  prompt_id: string;
  version: number;
  content: string;
  change_description: string;
  change_type: IterationChangeType;
  diff_summary?: string;
  performance_metrics?: IterationMetrics;
  created_by: string;
  created_at: string;
}

export type IterationChangeType =
  | 'initial'
  | 'refinement'
  | 'optimization'
  | 'expansion'
  | 'simplification'
  | 'tone_change'
  | 'format_change'
  | 'variable_update'
  | 'ai_suggested'
  | 'manual_edit';

export interface IterationMetrics {
  tokens_before?: number;
  tokens_after?: number;
  quality_score_before?: number;
  quality_score_after?: number;
  user_rating?: number;
  a_b_test_results?: Record<string, unknown>;
}

// ============================================
// Prompt History (usage log)
// ============================================

export interface PromptUsageLog {
  id: string;
  prompt_id: string;
  used_at: string;
  context?: string;
  response_preview?: string;
  model_used?: string;
  tokens_used?: number;
  rating?: number;
}

// ============================================
// API Request/Response Types
// ============================================

export interface SavePromptRequest {
  title: string;
  content: string;
  description?: string;
  category: string;
  tags?: string[];
  is_favorite?: boolean;
  is_public?: boolean;
  source?: SavedPrompt['source'];
  source_template_id?: string;
  variables_snapshot?: Record<string, string | number | boolean>;
  metadata?: Partial<PromptMetadata>;
}

export interface UpdatePromptRequest {
  title?: string;
  content?: string;
  description?: string;
  category?: string;
  tags?: string[];
  is_favorite?: boolean;
  is_public?: boolean;
  metadata?: Partial<PromptMetadata>;
}

export interface CreateIterationRequest {
  content: string;
  change_description: string;
  change_type: IterationChangeType;
  performance_metrics?: Partial<IterationMetrics>;
}

export interface SavedPromptFilters {
  search?: string;
  category?: string;
  tags?: string[];
  is_favorite?: boolean;
  is_public?: boolean;
  source?: SavedPrompt['source'];
  sort_by?: 'created_at' | 'updated_at' | 'use_count' | 'title' | 'last_used_at';
  sort_order?: 'asc' | 'desc';
  ordering?: string; // Django REST convention: '-field' for desc, 'field' for asc
  page?: number;
  limit?: number;
}

export interface PaginatedSavedPrompts {
  count: number;
  next: string | null;
  previous: string | null;
  results: SavedPrompt[];
}

export interface SavedPromptStats {
  total_prompts: number;
  total_favorites: number;
  total_iterations: number;
  total_uses: number;
  categories: { name: string; count: number }[];
  most_used: SavedPrompt[];
  recently_used: SavedPrompt[];
}

// ============================================
// UI State Types
// ============================================

export interface SavePromptModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'save-from-chat' | 'save-from-template';
  initialData?: Partial<SavePromptRequest>;
  promptId?: string;
  sourceTemplateId?: string;
  sourceTemplateName?: string;
}

export interface IterationModalState {
  isOpen: boolean;
  prompt: SavedPrompt | null;
  iterations: PromptIteration[];
}

// ============================================
// Category constants
// ============================================

export const PROMPT_CATEGORIES = [
  'General',
  'Writing',
  'Development',
  'Business',
  'Education',
  'Marketing',
  'Creative',
  'Analysis',
  'Research',
  'Translation',
  'Summarization',
  'Custom',
] as const;

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];

export const ITERATION_CHANGE_TYPES: { value: IterationChangeType; label: string; description: string }[] = [
  { value: 'refinement', label: 'Refinement', description: 'Fine-tune wording and clarity' },
  { value: 'optimization', label: 'Optimization', description: 'Improve for better AI responses' },
  { value: 'expansion', label: 'Expansion', description: 'Add more detail or context' },
  { value: 'simplification', label: 'Simplification', description: 'Make shorter and more concise' },
  { value: 'tone_change', label: 'Tone Change', description: 'Adjust the tone or style' },
  { value: 'format_change', label: 'Format Change', description: 'Change the output format' },
  { value: 'variable_update', label: 'Variable Update', description: 'Modify template variables' },
  { value: 'manual_edit', label: 'Manual Edit', description: 'Free-form manual changes' },
];
