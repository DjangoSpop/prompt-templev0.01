export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ChatCompletionRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OptimizeRequest {
  session_id: string;
  original: string;
  mode: 'fast' | 'deep';
  context?: Record<string, any>;
  budget?: {
    max_tokens?: number;
    max_credits?: number;
  };
}

export interface OptimizeResponse {
  optimized: string;
  citations: Array<{
    id: string;
    source: string;
    title: string;
    url?: string;
    snippet: string;
    relevance_score: number;
  }>;
  diff_summary: string;
  usage: {
    tokens_in: number;
    tokens_out: number;
    credits: number;
  };
  improvements?: string[];
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  variables: Array<{
    name: string;
    type: string;
    label: string;
    description?: string;
    default_value?: any;
    required: boolean;
  }>;
  author: string;
  rating: number;
  usage_count: number;
  is_featured: boolean;
  is_premium: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  is_premium: boolean;
  discord_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  discord_id?: string;
}

// Enhanced API types for Proactive AI Co-Pilot features
export interface ContextAnalysisRequest {
  text: string;
  cursor_position?: number;
  context?: {
    user_id?: string;
    session_id?: string;
    current_template_id?: string;
    previous_prompts?: string[];
  };
}

export interface ContextAnalysisResponse {
  detected_intent: {
    primary: string;
    confidence: number;
    secondary?: string[];
  };
  suggested_template_ids: Array<{
    template_id: string;
    relevance_score: number;
    template_name: string;
    category: string;
  }>;
  potential_variables: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array';
    suggested_value?: any;
    position: [number, number]; // start, end indices
    confidence: number;
  }>;
  entity_recognition: Array<{
    entity: string;
    type: string;
    position: [number, number];
    confidence: number;
  }>;
  response_time_ms: number;
}

export interface SessionInsightsRequest {
  session_id: string;
  include_history?: boolean;
  depth?: 'shallow' | 'deep';
}

export interface SessionInsightsResponse {
  session_id: string;
  quality_score: {
    overall: number; // 0-100
    clarity: number;
    specificity: number;
    actionability: number;
    creativity: number;
  };
  suggested_improvements: Array<{
    type: 'clarity' | 'specificity' | 'structure' | 'context' | 'examples';
    suggestion: string;
    priority: 'low' | 'medium' | 'high';
    estimated_impact: number; // 0-100
  }>;
  is_template_candidate: boolean;
  template_potential_score: number; // 0-100
  conversation_analysis: {
    turn_count: number;
    avg_response_time: number;
    total_tokens_used: number;
    cost_estimate: number;
    optimization_opportunities: string[];
  };
  user_engagement: {
    session_duration: number;
    interaction_quality: number;
    follow_up_likelihood: number;
  };
}

export interface WorkflowGenerationRequest {
  goal: string;
  domain?: string;
  complexity?: 'simple' | 'medium' | 'advanced';
  max_steps?: number;
  user_preferences?: {
    preferred_style?: string;
    industry?: string;
    experience_level?: 'beginner' | 'intermediate' | 'expert';
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  template_id?: string;
  template_content?: string;
  variables: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    default_value?: any;
  }>;
  dependencies: string[]; // IDs of previous steps
  estimated_time: string;
  difficulty: 'easy' | 'medium' | 'hard';
  output_description: string;
}

export interface WorkflowGenerationResponse {
  workflow_id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  estimated_total_time: string;
  success_criteria: string[];
  tags: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'expert';
  metadata: {
    created_at: string;
    ai_confidence: number;
    template_sources: string[];
    revision_suggestions?: string[];
  };
}

// Real-time analytics and monitoring
export interface AnalyticsEvent {
  event_type: 'suggestion_accepted' | 'workflow_completed' | 'template_created' | 'context_analyzed' | 'insight_applied';
  session_id: string;
  user_id?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  performance_metrics?: {
    response_time_ms: number;
    tokens_used: number;
    cost: number;
    ai_confidence: number;
  };
}

// Enhanced template types for workflow integration
export interface EnhancedTemplate extends Template {
  workflow_compatibility: {
    can_be_workflow_step: boolean;
    suggested_position: 'start' | 'middle' | 'end' | 'any';
    typical_predecessors: string[];
    typical_successors: string[];
  };
  ai_metadata: {
    quality_score: number;
    optimization_suggestions: string[];
    usage_patterns: {
      most_common_variables: string[];
      success_rate: number;
      avg_completion_time: number;
    };
  };
}

// Social Authentication Types
export interface SocialProvider {
  id: string;
  name: string;
  display_name: string;
  icon_url?: string;
  is_enabled: boolean;
  configuration?: {
    scopes: string[];
    authorize_url: string;
    token_url: string;
  };
}

export interface SocialProvidersResponse {
  providers: SocialProvider[];
  enabled_count: number;
}

export interface SocialAuthInitiateRequest {
  provider: 'google' | 'github';
  redirect_uri?: string;
  state?: string;
}

export interface SocialAuthInitiateResponse {
  authorization_url: string;
  state: string;
  provider: string;
  expires_in: number;
}

export interface SocialAuthCallbackRequest {
  provider: 'google' | 'github';
  code: string;
  state: string;
  redirect_uri?: string;
}

export interface SocialAuthCallbackResponse {
  access: string;
  refresh: string;
  user: User & {
    social_avatar_url?: string;
    provider_id?: string;
    provider_name?: string;
  };
  is_new_user: boolean;
  linked_accounts: Array<{
    provider: string;
    provider_id: string;
    email: string;
    linked_at: string;
  }>;
}

export interface SocialLinkRequest {
  provider: 'google' | 'github';
  code: string;
  state: string;
}

export interface SocialLinkResponse {
  success: boolean;
  message: string;
  linked_account: {
    provider: string;
    provider_id: string;
    email: string;
    avatar_url?: string;
    linked_at: string;
  };
}

export interface SocialUnlinkRequest {
  provider: 'google' | 'github';
}

export interface SocialUnlinkResponse {
  success: boolean;
  message: string;
  remaining_accounts: Array<{
    provider: string;
    provider_id: string;
    email: string;
  }>;
}

// Enhanced User type with social auth fields
export interface EnhancedUser extends User {
  social_avatar_url?: string;
  provider_id?: string;
  provider_name?: string;
  linked_social_accounts?: Array<{
    provider: string;
    provider_id: string;
    email: string;
    avatar_url?: string;
    linked_at: string;
  }>;
  has_password: boolean; // Indicates if user has a traditional password
  primary_auth_method: 'email' | 'google' | 'github';
}

// Social auth error types
export interface SocialAuthError {
  error: string;
  error_description?: string;
  error_code?: string;
  provider?: string;
  suggested_action?: string;
}