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