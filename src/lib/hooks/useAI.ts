import { useQuery, useMutation } from '@tanstack/react-query';
import { aiService } from '../api/ai';

interface GenerationRequest {
  model: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  context?: any;
}

export const useAIProviders = () => {
  return useQuery({
    queryKey: ['ai', 'providers'],
    queryFn: () => aiService.getProviders(),
    staleTime: 30 * 60 * 1000, // 30 minutes - providers don't change often
  });
};

export const useAIModels = () => {
  return useQuery({
    queryKey: ['ai', 'models'],
    queryFn: () => aiService.getModels(),
    staleTime: 30 * 60 * 1000, // 30 minutes - models don't change often
  });
};

export const useAIUsage = () => {
  return useQuery({
    queryKey: ['ai', 'usage'],
    queryFn: () => aiService.getUsage(),
    staleTime: 1 * 60 * 1000, // 1 minute - usage changes frequently
  });
};

export const useAIQuotas = () => {
  return useQuery({
    queryKey: ['ai', 'quotas'],
    queryFn: () => aiService.getQuotas(),
    staleTime: 1 * 60 * 1000, // 1 minute - quotas change frequently
  });
};

export const useAIGeneration = () => {
  const generateMutation = useMutation({
    mutationFn: (request: GenerationRequest) => aiService.generate(request),
  });

  return {
    generate: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    error: generateMutation.error,
    result: generateMutation.data,
    reset: generateMutation.reset,
  };
};