/**
 * Multi-AI Broadcast Types
 *
 * Types for the broadcast feature that sends prompts to multiple AI models
 * simultaneously and compares results side-by-side.
 */

export interface ModelScores {
  provider: string;
  completeness: number;
  clarity: number;
  accuracy: number;
  creativity: number;
  overall: number;
}

export interface ModelResponse {
  provider: string;
  model: string;
  content: string;
  latency_ms: number;
  tokens_out: number;
  scores?: ModelScores;
  error?: string;
  isStreamComplete?: boolean;
}

export interface ModelStreamUpdate extends Partial<ModelResponse> {
  provider: string;
  model?: string;
  delta?: string;
  content_delta?: string;
  text?: string;
  status?: BroadcastModelStatus;
}

export type BroadcastModelStatus = 'idle' | 'waiting' | 'streaming' | 'complete' | 'error';

export interface BroadcastModelState {
  provider: string;
  model: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  content: string;
  latency_ms: number | null;
  tokens_out: number | null;
  scores?: ModelScores;
  error?: string;
  status: BroadcastModelStatus;
  isWinner?: boolean;
}

export interface BroadcastResult {
  prompt: string;
  responses: ModelResponse[];
  best_overall?: string;
  comparison_summary?: string;
  total_latency_ms: number;
  credits_consumed: number;
}

export interface BroadcastRequest {
  prompt: string;
  providers?: string[];
  score?: boolean;
}

export interface BroadcastStreamEvent {
  type: 'broadcast_start' | 'model_response' | 'broadcast_complete' | 'error';
  data: any;
}

export interface BroadcastStreamState {
  isStreaming: boolean;
  prompt: string;
  responses: Map<string, BroadcastModelState>;
  providerOrder: string[];
  bestOverall?: string;
  comparisonSummary?: string;
  error?: string;
  totalLatency?: number;
  creditsConsumed?: number;
}

export const BROADCAST_COST = 8;

export const AVAILABLE_PROVIDERS = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    model: 'deepseek-chat',
    description: 'Fast and efficient',
    icon: '🔮',
    color: '#FF6B35',
  },
  {
    id: 'openrouter_qwen',
    name: 'Qwen 80B',
    model: 'qwen/qwen3-next-80b-a3b-instruct:free',
    description: 'Open source powerhouse',
    icon: '🐉',
    color: '#4F46E5',
  },
  {
    id: 'openrouter_deepseek_r1',
    name: 'DeepSeek R1',
    model: 'deepseek/deepseek-r1-0528:free',
    description: 'Reasoning specialist',
    icon: '🧠',
    color: '#0891B2',
  },
  {
    id: 'anthropic_haiku',
    name: 'Claude Haiku',
    model: 'claude-3-haiku-20240307',
    description: 'Compact and clever',
    icon: '🤖',
    color: '#D97706',
    requiresKey: true,
  },
] as const;

export type ProviderId = typeof AVAILABLE_PROVIDERS[number]['id'];

export function getProviderMeta(providerId: string) {
  return AVAILABLE_PROVIDERS.find((provider) => provider.id === providerId);
}
