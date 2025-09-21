export interface Assistant {
  id: string;
  name: string;
  description: string;
  model: string;
  system_prompt?: string;
  tags: string[];
  is_default: boolean;
  capabilities: string[];
  created_at: string;
  updated_at: string;
}

export interface Thread {
  id: string;
  title: string;
  assistant_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count: number;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    context?: TavilyContext[];
    usage?: TokenUsage;
    tool_calls?: ToolCall[];
  };
  created_at: string;
}

export interface TavilyContext {
  title: string;
  url: string;
  content: string;
  score?: number;
  published_date?: string;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost?: number;
}

export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
  result?: any;
}

export interface AssistantChannelMap {
  [assistantId: string]: WebSocket;
}

export interface StreamMessage {
  type: 'assistant.message' | 'assistant.error' | 'assistant.thinking' | 'assistant.done';
  data: {
    thread_id: string;
    content?: string;
    delta?: string;
    context?: TavilyContext[];
    usage?: TokenUsage;
    error?: string;
    done?: boolean;
  };
}

export interface RunMessageRequest {
  assistant_id: string;
  message: string;
  thread_id?: string;
  metadata?: Record<string, any>;
}

export interface RunMessageResponse {
  message: Message;
  thread: Thread;
  usage: TokenUsage;
}