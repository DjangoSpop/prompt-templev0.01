import { useMutation, useQuery } from '@tanstack/react-query';
import { orchestratorService } from '../api/orchestrator';

interface IntentDetectionRequest {
  user_input: string;
  context?: any;
}

interface PromptAssessmentRequest {
  original_prompt: string;
  llm_response: string;
  context?: any;
}

interface TemplateRenderRequest {
  template_id: string;
  variables: Record<string, string>;
}

interface TemplateSearchRequest {
  query: string;
  filters?: {
    category?: string;
    difficulty?: string;
    rating?: number;
  };
}

export const useIntentDetection = () => {
  const detectIntentMutation = useMutation({
    mutationFn: (request: IntentDetectionRequest) => orchestratorService.detectIntent(request),
  });

  return {
    detectIntent: detectIntentMutation.mutate,
    isDetecting: detectIntentMutation.isPending,
    error: detectIntentMutation.error,
    result: detectIntentMutation.data,
    reset: detectIntentMutation.reset,
  };
};

export const usePromptAssessment = () => {
  const assessPromptMutation = useMutation({
    mutationFn: (request: PromptAssessmentRequest) => orchestratorService.assessPrompt(request),
  });

  return {
    assessPrompt: assessPromptMutation.mutate,
    isAssessing: assessPromptMutation.isPending,
    error: assessPromptMutation.error,
    result: assessPromptMutation.data,
    reset: assessPromptMutation.reset,
  };
};

export const useTemplateRender = () => {
  const renderTemplateMutation = useMutation({
    mutationFn: (request: TemplateRenderRequest) => orchestratorService.renderTemplate(request),
  });

  return {
    renderTemplate: renderTemplateMutation.mutate,
    isRendering: renderTemplateMutation.isPending,
    error: renderTemplateMutation.error,
    result: renderTemplateMutation.data,
    reset: renderTemplateMutation.reset,
  };
};

export const useTemplateSearch = () => {
  const searchTemplatesMutation = useMutation({
    mutationFn: (request: TemplateSearchRequest) => orchestratorService.searchTemplates(request),
  });

  return {
    searchTemplates: searchTemplatesMutation.mutate,
    isSearching: searchTemplatesMutation.isPending,
    error: searchTemplatesMutation.error,
    results: searchTemplatesMutation.data,
    reset: searchTemplatesMutation.reset,
  };
};

export const useOrchestratorTemplate = (templateId: number | undefined) => {
  return useQuery({
    queryKey: ['orchestrator', 'template', templateId],
    queryFn: () => orchestratorService.getOrchestratorTemplate(templateId!),
    enabled: !!templateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOrchestratorTemplateByName = (templateName: string | undefined) => {
  return useQuery({
    queryKey: ['orchestrator', 'template-by-name', templateName],
    queryFn: () => orchestratorService.getOrchestratorTemplateByName(templateName!),
    enabled: !!templateName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};