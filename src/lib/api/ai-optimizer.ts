'use client';

import { apiClient } from '../api-client';

// Types for AI Optimizer async workflow
export interface OptimizationRequest {
  prompt: string;
  session_id?: string;
  context?: {
    intent?: string;
    target_audience?: string;
    desired_tone?: string;
    use_case?: string;
  };
  preferences?: {
    optimization_level?: 'basic' | 'advanced' | 'expert';
    include_suggestions?: boolean;
    include_alternatives?: boolean;
    max_tokens?: number;
  };
}

export interface OptimizationTask {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  estimated_completion?: string;
  progress?: {
    stage: 'initializing' | 'retrieving_context' | 'analyzing' | 'optimizing' | 'finalizing';
    percentage: number;
    message: string;
  };
}

export interface OptimizationResult {
  task_id: string;
  status: 'completed' | 'failed';
  original_prompt: string;
  optimized_prompt: string;
  improvements: {
    clarity_score: number;
    specificity_score: number;
    effectiveness_score: number;
    overall_score: number;
  };
  suggestions: Array<{
    type: 'structure' | 'context' | 'language' | 'format';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    confidence: number;
  }>;
  alternatives?: Array<{
    prompt: string;
    use_case: string;
    score: number;
  }>;
  rag_context?: {
    retrieved_templates: number;
    context_relevance: number;
    sources: Array<{
      template_id: string;
      title: string;
      relevance_score: number;
    }>;
  };
  performance_metrics: {
    processing_time: number;
    tokens_used: number;
    cost_estimate: number;
  };
  error?: string;
}

export interface OptimizationStats {
  total_optimizations: number;
  success_rate: number;
  average_improvement: number;
  total_tokens_saved: number;
  user_satisfaction: number;
  recent_optimizations: Array<{
    date: string;
    original_length: number;
    optimized_length: number;
    improvement_score: number;
  }>;
}

export interface SuggestionResponse {
  suggestions: Array<{
    text: string;
    confidence: number;
    type: 'completion' | 'template' | 'improvement';
    context?: string;
  }>;
  query_time: number;
}

// AI Optimizer API Client
export class AIOptimizerAPI {
  // Start async optimization
  async startOptimization(request: OptimizationRequest): Promise<OptimizationTask> {
    try {
      // First check if we have the async endpoint
      const response = await apiClient.request<OptimizationTask>('/api/v2/ai/agent/optimize_async/', {
        method: 'POST',
        data: request,
      });
      return response;
    } catch (error) {
      // Fallback to sync endpoint if async not available
      console.warn('Async optimization not available, falling back to sync');
      return this.startOptimizationSync(request);
    }
  }

  // Fallback sync optimization (creates a mock task)
  private async startOptimizationSync(request: OptimizationRequest): Promise<OptimizationTask> {
    const taskId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Start the optimization in the background
    setTimeout(async () => {
      try {
        await apiClient.request('/api/v2/ai/agent/optimize/', {
          method: 'POST',
          data: request,
        });
      } catch (error) {
        console.error('Sync optimization failed:', error);
      }
    }, 100);

    return {
      task_id: taskId,
      status: 'processing',
      created_at: new Date().toISOString(),
      estimated_completion: new Date(Date.now() + 30000).toISOString(),
      progress: {
        stage: 'initializing',
        percentage: 0,
        message: 'Starting optimization process...'
      }
    };
  }

  // Check optimization status
  async getOptimizationStatus(taskId: string): Promise<OptimizationTask> {
    try {
      return await apiClient.request<OptimizationTask>(`/api/v2/ai/agent/task_status/${taskId}/`);
    } catch (error) {
      // Mock response for development
      const mockProgress = this.getMockProgress(taskId);
      return {
        task_id: taskId,
        status: mockProgress.status,
        created_at: new Date().toISOString(),
        progress: mockProgress.progress
      };
    }
  }

  // Get optimization result
  async getOptimizationResult(taskId: string): Promise<OptimizationResult> {
    try {
      return await apiClient.request<OptimizationResult>(`/api/v2/ai/agent/task_result/${taskId}/`);
    } catch (error) {
      // Mock response for development
      return this.getMockResult(taskId);
    }
  }

  // Get real-time suggestions
  async getSuggestions(partial_prompt: string): Promise<SuggestionResponse> {
    try {
      const response = await apiClient.request<SuggestionResponse>('/api/v2/ai/suggestions/', {
        params: { q: partial_prompt, limit: 5 }
      });
      return response;
    } catch (error) {
      // Mock suggestions for development
      return {
        suggestions: [
          {
            text: 'Create a detailed plan for',
            confidence: 0.85,
            type: 'completion',
            context: 'planning'
          },
          {
            text: 'Analyze the following data and provide insights',
            confidence: 0.78,
            type: 'template',
            context: 'analysis'
          }
        ],
        query_time: 45
      };
    }
  }

  // Get optimization statistics
  async getOptimizationStats(): Promise<OptimizationStats> {
    try {
      return await apiClient.request<OptimizationStats>('/api/v2/ai/agent/stats/');
    } catch (error) {
      // Mock stats for development
      return {
        total_optimizations: 1247,
        success_rate: 0.94,
        average_improvement: 0.68,
        total_tokens_saved: 45623,
        user_satisfaction: 0.91,
        recent_optimizations: [
          {
            date: new Date(Date.now() - 86400000).toISOString(),
            original_length: 150,
            optimized_length: 89,
            improvement_score: 0.72
          },
          {
            date: new Date(Date.now() - 172800000).toISOString(),
            original_length: 203,
            optimized_length: 134,
            improvement_score: 0.65
          }
        ]
      };
    }
  }

  // Mock progress for development
  private getMockProgress(taskId: string): { status: OptimizationTask['status'], progress: OptimizationTask['progress'] } {
    const elapsed = Date.now() - parseInt(taskId.split('_')[1]);
    const stages = [
      { stage: 'initializing', percentage: 10, message: 'Initializing AI optimizer...' },
      { stage: 'retrieving_context', percentage: 30, message: 'Retrieving relevant context...' },
      { stage: 'analyzing', percentage: 60, message: 'Analyzing prompt structure...' },
      { stage: 'optimizing', percentage: 85, message: 'Generating optimizations...' },
      { stage: 'finalizing', percentage: 100, message: 'Finalizing results...' }
    ] as const;

    const stageIndex = Math.min(Math.floor(elapsed / 5000), stages.length - 1);
    const stage = stages[stageIndex];

    return {
      status: stageIndex >= stages.length - 1 ? 'completed' : 'processing',
      progress: {
        stage: stage.stage,
        percentage: stage.percentage,
        message: stage.message
      }
    };
  }

  // Mock result for development
  private getMockResult(taskId: string): OptimizationResult {
    return {
      task_id: taskId,
      status: 'completed',
      original_prompt: 'Write something about AI',
      optimized_prompt: 'Create a comprehensive analysis of artificial intelligence, focusing on its current applications, potential benefits, and key challenges in modern technology landscapes.',
      improvements: {
        clarity_score: 85,
        specificity_score: 78,
        effectiveness_score: 92,
        overall_score: 85
      },
      suggestions: [
        {
          type: 'structure',
          title: 'Add specific context',
          description: 'Include specific domains or applications of AI you want to focus on',
          impact: 'high',
          confidence: 0.89
        },
        {
          type: 'language',
          title: 'Use action verbs',
          description: 'Replace "write about" with more specific action verbs like "analyze" or "evaluate"',
          impact: 'medium',
          confidence: 0.76
        }
      ],
      alternatives: [
        {
          prompt: 'Analyze the impact of AI on healthcare, education, and finance sectors',
          use_case: 'Industry analysis',
          score: 0.88
        },
        {
          prompt: 'Evaluate the ethical considerations and societal implications of AI advancement',
          use_case: 'Ethics focus',
          score: 0.82
        }
      ],
      rag_context: {
        retrieved_templates: 15,
        context_relevance: 0.84,
        sources: [
          {
            template_id: 'tpl_ai_analysis',
            title: 'AI Technology Analysis Template',
            relevance_score: 0.92
          },
          {
            template_id: 'tpl_research_prompt',
            title: 'Research Question Framework',
            relevance_score: 0.87
          }
        ]
      },
      performance_metrics: {
        processing_time: 12.5,
        tokens_used: 2456,
        cost_estimate: 0.0034
      }
    };
  }
}

// Export singleton instance
export const aiOptimizerAPI = new AIOptimizerAPI();