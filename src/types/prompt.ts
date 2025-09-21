export interface PromptVariable {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean';
  description: string;
  required: boolean;
  default?: string | number | boolean;
  options?: string[]; // For select type
  min?: number; // For number type
  max?: number; // For number type
  placeholder?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  variables: PromptVariable[];
  created_at: string;
  updated_at: string;
  author: string;
  usage_count: number;
  is_public: boolean;
  is_pinned: boolean;
}

export interface TemplateVariableValues {
  [key: string]: string | number | boolean;
}

export interface PromptCompletion {
  id: string;
  template_id: string;
  variables: TemplateVariableValues;
  rendered_prompt: string;
  response: string;
  created_at: string;
  tokens_used?: number;
  model?: string;
  trace_id?: string;
}

export interface TemplateCategory {
  name: string;
  description: string;
  count: number;
  icon?: string;
}

export interface TemplateSearchFilters {
  category?: string;
  tags?: string[];
  author?: string;
  is_public?: boolean;
  is_pinned?: boolean;
}

export interface TemplateSearchResult {
  templates: PromptTemplate[];
  total: number;
  page: number;
  per_page: number;
  categories: TemplateCategory[];
}

export interface PromptVariableValidation {
  field: string;
  message: string;
  type: 'required' | 'type' | 'min' | 'max' | 'pattern';
}

export interface PromptPreview {
  rendered: string;
  variables_used: string[];
  missing_variables: string[];
  word_count: number;
  estimated_tokens: number;
}

// Transport and completion types
export interface SSECompletionState {
  isStreaming: boolean;
  text: string;
  error: string | null;
  isComplete: boolean;
  trace_id?: string;
}

export interface CompletionRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export type TransportType = 'sse' | 'websocket';

export interface TransportCapabilities {
  sse: boolean;
  websocket: boolean;
  preferred: TransportType;
}
