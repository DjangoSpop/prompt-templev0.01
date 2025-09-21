import { BaseApiClient } from './base';
import type { components } from '../../types/api';
import type { Template } from '@/lib/types';

type TemplateList = components['schemas']['TemplateList'];

interface IntentDetectionRequest {
  user_input: string;
  context?: any;
}

// Utility functions for template variable processing
export function extractTemplateVariables(content: string): string[] {
  const variablePattern = /\{\{([^}]+)\}\}/g;
  const variables = new Set<string>();
  let match;
  
  while ((match = variablePattern.exec(content)) !== null) {
    const variableName = match[1].trim();
    variables.add(variableName);
  }
  
  return Array.from(variables);
}

export function prepareRenderVariables(template: Template, variables: Record<string, string>): Record<string, string> {
  // For now, just return the variables as-is
  // This could be extended to validate against template schema, apply transformations, etc.
  return { ...variables };
}

interface IntentDetectionResponse {
  intent: string;
  confidence: number;
  entities: any[];
  suggested_actions: string[];
}

interface PromptAssessmentRequest {
  original_prompt: string;
  llm_response: string;
  context?: any;
}

interface PromptAssessmentResponse {
  quality_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  optimization_tips: string[];
}

interface TemplateRenderRequest {
  template_id: string;
  variables: Record<string, string>;
}

interface TemplateRenderResponse {
  rendered_content: string;
  variables_used: string[];
  warnings?: string[];
}

interface TemplateSearchRequest {
  query: string;
  filters?: {
    category?: string;
    difficulty?: string;
    rating?: number;
  };
}

export class OrchestratorService extends BaseApiClient {
  async detectIntent(request: IntentDetectionRequest): Promise<IntentDetectionResponse> {
    return this.request<IntentDetectionResponse>('/api/v2/orchestrator/intent/', {
      method: 'POST',
      data: request,
    });
  }

  async assessPrompt(request: PromptAssessmentRequest): Promise<PromptAssessmentResponse> {
    return this.request<PromptAssessmentResponse>('/api/v2/orchestrator/assess/', {
      method: 'POST',
      data: request,
    });
  }

  async renderTemplate(request: TemplateRenderRequest): Promise<TemplateRenderResponse> {
    return this.request<TemplateRenderResponse>('/api/v2/orchestrator/render/', {
      method: 'POST',
      data: request,
    });
  }

  async searchTemplates(request: TemplateSearchRequest): Promise<TemplateList[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', request.query);
    
    if (request.filters) {
      Object.entries(request.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    return this.request<TemplateList[]>(`/api/v2/orchestrator/search/?${searchParams.toString()}`);
  }

  async getOrchestratorTemplate(templateId: number): Promise<any> {
    return this.request<any>(`/api/v2/orchestrator/template/${templateId}/`);
  }

  async getOrchestratorTemplateByName(templateName: string): Promise<any> {
    return this.request<any>(`/api/v2/orchestrator/template/?name=${encodeURIComponent(templateName)}`);
  }
}

export const orchestratorService = new OrchestratorService();