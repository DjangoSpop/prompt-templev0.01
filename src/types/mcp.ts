// ─────────────────────────────────────────────────────────
// MCP KNOWLEDGE BASE TYPES
// ─────────────────────────────────────────────────────────

export interface MCPCategory {
  id: string;
  name: string;
  slug: string;
  category_type: MCPCategoryType;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  document_count: number;
  prompt_count: number;
}

export type MCPCategoryType =
  | 'mcp_servers'
  | 'mcp_clients'
  | 'mcp_prompts'
  | 'agent_patterns'
  | 'agent_frameworks'
  | 'a2a_protocol'
  | 'tool_integration'
  | 'context_engineering'
  | 'security'
  | 'enterprise'
  | 'tutorials'
  | 'use_cases';

export interface PromptVariable {
  name: string;
  description: string;
  example: string;
}

export type PromptDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type PromptUseCase =
  | 'mcp_server_build'
  | 'mcp_client_config'
  | 'agent_design'
  | 'tool_creation'
  | 'prompt_engineering'
  | 'multi_agent'
  | 'context_engineering'
  | 'security_audit'
  | 'migration'
  | 'testing'
  | 'monitoring'
  | 'enterprise_deploy'
  | 'workflow_automation'
  | 'data_pipeline'
  | 'code_review'
  | 'customer_support'
  | 'content_creation'
  | 'research_agent'
  | 'devops_agent'
  | 'marketing_agent';

/** Prompt list item (no full template text) */
export interface MCPPromptListItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  category_name: string;
  category_icon: string;
  description: string;
  use_case: PromptUseCase;
  difficulty: PromptDifficulty;
  target_models: string[];
  tags: string[];
  quality_score: number;
  is_featured: boolean;
  is_premium: boolean;
  credit_cost: number;
  usage_count: number;
  avg_rating: number | null;
  created_at: string;
}

/** Full prompt detail (includes template + variables) */
export interface MCPPromptDetail extends MCPPromptListItem {
  prompt_template: string;
  example_output: string;
  variables: PromptVariable[];
  conversion_rate: number | null;
  is_active: boolean;
  updated_at: string;
}

export type DocumentSourceType = 'manual' | 'crawled' | 'curated' | 'generated' | 'community';

/** Knowledge document list item */
export interface MCPDocumentListItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  category_name: string;
  category_icon: string;
  excerpt: string;
  summary: string;
  source_type: DocumentSourceType;
  status: string;
  quality_score: number;
  tags: string[];
  mcp_version: string;
  view_count: number;
  created_at: string;
  published_at: string | null;
}

/** Full document detail */
export interface MCPDocumentDetail extends MCPDocumentListItem {
  content_md: string;
}

// ─────────────────────────────────────────────────────────
// ACADEMY TYPES
// ─────────────────────────────────────────────────────────

export type AcademyLevel = 'awareness' | 'practitioner' | 'expert' | 'architect';
export type LessonContentType = 'article' | 'video' | 'quiz' | 'exercise' | 'prompt_lab';

export interface AcademyCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: AcademyLevel;
  thumbnail_url: string;
  is_free: boolean;
  credit_cost: number;
  total_lessons: number;
  estimated_minutes: number;
  total_enrollments: number;
  completion_rate: number;
  is_published: boolean;
  display_order: number;
}

export interface AcademyCourseDetail extends AcademyCourse {
  lessons: AcademyLesson[];
}

export interface AcademyLesson {
  id: string;
  title: string;
  slug: string;
  content_type: LessonContentType;
  content_md?: string;
  section_number: number;
  lesson_number: number;
  estimated_minutes: number;
  is_free_preview: boolean;
  is_published: boolean;
}

export interface AcademyEnrollment {
  id: string;
  course: string;
  course_title: string;
  course_slug: string;
  completed_lessons: string[];
  progress_percentage: number;
  quiz_scores: Record<string, number>;
  is_completed: boolean;
  completed_at: string | null;
  certificate_id: string;
  enrolled_at: string;
  last_activity_at: string;
}

// ─────────────────────────────────────────────────────────
// SEARCH + PAGINATION
// ─────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MCPSearchResults {
  query: string;
  results: {
    documents: MCPDocumentListItem[];
    prompts: MCPPromptListItem[];
    courses: AcademyCourse[];
  };
}

// ─────────────────────────────────────────────────────────
// FILTER PARAMS
// ─────────────────────────────────────────────────────────

export interface MCPPromptFilters {
  category?: string;
  use_case?: PromptUseCase;
  difficulty?: PromptDifficulty;
  is_premium?: string;
  tags?: string;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface MCPDocumentFilters {
  category?: string;
  source_type?: DocumentSourceType;
  tags?: string;
  search?: string;
  ordering?: string;
  page?: number;
}

// ─────────────────────────────────────────────────────────
// SKILL TYPES
// ─────────────────────────────────────────────────────────

export type SkillType =
  | 'mcp_server'
  | 'mcp_tool'
  | 'prompt_technique'
  | 'agentic_pattern'
  | 'framework'
  | 'model_technique'
  | 'rag_pattern'
  | 'workflow'
  | 'best_practice'
  | 'tutorial';

export type MCPTransport = 'stdio' | 'sse' | 'streamable-http';

export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  parent?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface MCPPackage {
  registry: string;
  name: string;
  version: string;
}

export interface MCPTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface Skill {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: SkillCategory;
  skill_type: SkillType;
  difficulty: PromptDifficulty;
  tags: string[];
  source_url: string;
  mcp_server_name: string;
  mcp_version: string;
  mcp_transport: MCPTransport;
  mcp_packages: MCPPackage[];
  mcp_tools: MCPTool[];
  github_stars: number;
  github_language: string;
  is_featured: boolean;
  is_verified: boolean;
  view_count: number;
  save_count: number;
  use_count: number;
  relevance_score: number;
  published_at: string;
  created_at: string;
}

export interface SkillBookmark {
  id: string;
  skill: Skill;
  created_at: string;
}

export interface SkillFilters {
  category?: string;
  skill_type?: SkillType;
  difficulty?: PromptDifficulty;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface SkillsStats {
  total_skills: number;
  by_type: Record<string, number>;
  by_difficulty: Record<string, number>;
}
