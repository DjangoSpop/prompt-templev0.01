import { BaseApiClient } from './base';

interface AIProvider {
  id: string;
  name: string;
  description: string;
  supported_models: string[];
  pricing: any;
  status: 'active' | 'inactive';
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  pricing: any;
  context_length: number;
  status: 'active' | 'inactive';
}

interface GenerationRequest {
  model: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  context?: any;
}

interface GenerationResponse {
  id: string;
  model: string;
  choices: Array<{
    text: string;
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface AIUsage {
  total_requests: number;
  total_tokens: number;
  cost: number;
  period: string;
  breakdown_by_model: any;
}

interface AIQuota {
  model: string;
  limit: number;
  used: number;
  remaining: number;
  reset_at: string;
}

export class AIService extends BaseApiClient {
  async getProviders(): Promise<AIProvider[]> {
    return this.request<AIProvider[]>('/api/v2/ai/providers/');
  }

  async getModels(): Promise<AIModel[]> {
    return this.request<AIModel[]>('/api/v2/ai/models/');
  }

  async generate(data: GenerationRequest): Promise<GenerationResponse> {
    return this.request<GenerationResponse>('/api/v2/ai/generate/', {
      method: 'POST',
      data,
    });
  }

  async getUsage(): Promise<AIUsage> {
    return this.request<AIUsage>('/api/v2/ai/usage/');
  }

  async getQuotas(): Promise<AIQuota[]> {
    return this.request<AIQuota[]>('/api/v2/ai/quotas/');
  }
}

export const aiService = new AIService();