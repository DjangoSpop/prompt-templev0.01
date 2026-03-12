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
// Field names match the API response exactly (see FRONTEND_INTEGRATION.md §6)
// ============================================

export interface PromptIteration {
  id: string;
  /** The saved-prompt UUID this iteration belongs to */
  parent_prompt: string;
  /** UUID of the prior iteration in the chain (null for the first) */
  previous_iteration: string | null;
  /** Auto-incremented by the server — do NOT send in requests */
  iteration_number: number;
  /** The versioned prompt text */
  prompt_text: string;
  /** How this version was produced */
  interaction_type: InteractionType;
  /** Human-readable summary of what changed */
  changes_summary?: string;
  /** Optional semantic label e.g. "v1.1" */
  version_tag?: string;
  /** Raw AI response text (if produced via optimization) */
  ai_response?: string;
  /** Model that produced this iteration */
  response_model?: string;
  /** Tokens consumed */
  tokens_input?: number;
  tokens_output?: number;
  response_time_ms?: number;
  credits_spent?: number;
  user_rating?: number;
  feedback_notes?: string;
  /** Character delta vs previous iteration — auto-computed by server */
  diff_size?: number;
  parameters?: Record<string, unknown>;
  tags?: string[];
  metadata?: Record<string, unknown>;
  /** True when this is the active/HEAD version */
  is_active: boolean;
  is_bookmarked: boolean;
  /** Total versions in the chain (read-only) */
  iteration_chain_length?: number;
  has_next_iteration?: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interaction type values accepted by the API for creating iterations.
 * Maps to the server-side `interaction_type` field.
 */
export type InteractionType =
  | 'manual'
  | 'optimization'
  | 'refinement'
  | 'extension'
  | 'correction'
  | 'experiment';

/** @deprecated Use InteractionType */
export type IterationChangeType = InteractionType;

/** Shape of GET /saved-prompts/{id}/iterations/ */
export interface IterationsResponse {
  iterations: PromptIteration[];
  count: number;
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
  /** Required: the new version text */
  prompt_text: string;
  /** UUID of the previous iteration — MUST be sent to maintain the version chain */
  previous_iteration?: string | null;
  interaction_type?: InteractionType;
  changes_summary?: string;
  version_tag?: string;
  ai_response?: string;
  response_model?: string;
  tokens_input?: number;
  tokens_output?: number;
  response_time_ms?: number;
  credits_spent?: number;
  user_rating?: number;
  feedback_notes?: string;
  parameters?: Record<string, unknown>;
  tags?: string[];
  metadata?: Record<string, unknown>;
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

export const ITERATION_CHANGE_TYPES: { value: InteractionType; label: string; description: string }[] = [
  { value: 'manual', label: 'Manual Edit', description: 'Free-form manual changes' },
  { value: 'refinement', label: 'Refinement', description: 'Fine-tune wording and clarity' },
  { value: 'optimization', label: 'Optimization', description: 'Improve for better AI responses' },
  { value: 'extension', label: 'Extension', description: 'Add more detail or context' },
  { value: 'correction', label: 'Correction', description: 'Fix an error or inaccuracy' },
  { value: 'experiment', label: 'Experiment', description: 'Try an experimental variation' },
];
