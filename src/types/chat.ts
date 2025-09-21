export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  ts: number;
  partial?: boolean;
  error?: string;
  sessionId?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  starred?: boolean;
  archived?: boolean;
}

export interface WsOutbound {
  type: 'chat.send' | 'session.create' | 'session.select' | 'ping';
  content?: string;
  sessionId?: string;
  meta?: Record<string, unknown>;
  ts?: number;
}

export interface WsInbound {
  type: 'token' | 'final' | 'status' | 'error' | 'metrics' | 'pong' | 'session.created';
  content?: string;
  messageId?: string;
  sessionId?: string;
  metrics?: {
    p50: number;
    p95: number;
    latency?: number;
  };
  code?: string;
  data?: Record<string, unknown>;
  ts?: number;
}

export interface WebSocketStatus {
  connected: boolean;
  reconnecting: boolean;
  offline: boolean;
  lastConnected?: number;
  reconnectAttempts: number;
  error?: string;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: Record<string, ChatMessage[]>;
  streaming: boolean;
  wsStatus: WebSocketStatus;
  rateLimited: boolean;
  rateLimitCooldown?: number;
}

export interface LatencyMetrics {
  p50: number;
  p95: number;
  current?: number;
  lastMeasured: number;
}

export interface Template {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface SlashCommand {
  command: string;
  description: string;
  category: string;
  template?: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    command: '/summarize',
    description: 'Summarize the provided text',
    category: 'Analysis',
    template: 'Please provide a concise summary of the following text:'
  },
  {
    command: '/code',
    description: 'Generate or explain code',
    category: 'Development',
    template: 'Please help me with the following code task:'
  },
  {
    command: '/rewrite',
    description: 'Rewrite and improve text',
    category: 'Writing',
    template: 'Please rewrite and improve the following text:'
  },
  {
    command: '/intent',
    description: 'Analyze intent and suggest improvements',
    category: 'Analysis',
    template: 'Please analyze the intent of the following and suggest improvements:'
  }
];
