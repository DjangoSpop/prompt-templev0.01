'use client';

import React from 'react';
import { apiClient } from '@/lib/api-client';
import { webSocketChatService } from './websocket-chat';
import type { components } from '@/types/api';

type TemplateList = components['schemas']['TemplateList'];

export interface PromptCraftIntegrationConfig {
  enableRealTimeOptimization: boolean;
  enableTemplateRecommendations: boolean;
  enableAnalytics: boolean;
  enableGamification: boolean;
  maxConcurrentRequests: number;
}

export interface OptimizationRequest {
  prompt: string;
  intent?: string;
  targetAudience?: string;
  desiredTone?: string;
  maxTokens?: number;
  context?: string[];
}

export interface OptimizationResponse {
  originalPrompt: string;
  optimizedPrompt: string;
  improvements: string[];
  score: number;
  suggestions: string[];
  intent: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedTokens: number;
  confidenceScore: number;
}

export interface TemplateRecommendation {
  template: TemplateList;
  relevanceScore: number;
  reason: string;
  suggestedVariables?: Record<string, string>;
}

export interface UserAnalytics {
  totalPrompts: number;
  optimizationsUsed: number;
  templatesCreated: number;
  templatesUsed: number;
  averageOptimizationScore: number;
  streakDays: number;
  level: number;
  experiencePoints: number;
  badges: string[];
}

export class PromptCraftIntegrationService {
  private config: PromptCraftIntegrationConfig;
  private requestQueue: Map<string, Promise<unknown>> = new Map();
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(config: Partial<PromptCraftIntegrationConfig> = {}) {
    this.config = {
      enableRealTimeOptimization: true,
      enableTemplateRecommendations: true,
      enableAnalytics: true,
      enableGamification: true,
      maxConcurrentRequests: 10,
      ...config,
    };

    this.initializeWebSocketHandlers();
  }

  private initializeWebSocketHandlers(): void {
    webSocketChatService.on('messageResponse', this.handleMessageResponse.bind(this));
    webSocketChatService.on('optimizationResult', this.handleOptimizationResult.bind(this));
    webSocketChatService.on('templateRecommendation', this.handleTemplateRecommendation.bind(this));
  }

  private handleMessageResponse(data: unknown): void {
    // Handle incoming message responses
    console.log('Message response received:', data);
  }

  private handleOptimizationResult(data: unknown): void {
    // Handle optimization results
    console.log('Optimization result received:', data);
  }

  private handleTemplateRecommendation(data: unknown): void {
    // Handle template recommendations
    console.log('Template recommendation received:', data);
  }

  /**
   * Optimize a prompt using the PromptCraft API
   */
  async optimizePrompt(request: OptimizationRequest): Promise<OptimizationResponse> {
    const cacheKey = `optimize_${JSON.stringify(request)}`;
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached as OptimizationResponse;
    }

    try {
      // Use WebSocket for real-time optimization if available
      if (this.config.enableRealTimeOptimization && webSocketChatService.isConnected()) {
        const requestId = await webSocketChatService.optimizePrompt(request.prompt, {
          intent: request.intent,
          targetAudience: request.targetAudience,
          desiredTone: request.desiredTone,
          maxTokens: request.maxTokens,
        });

        // Wait for the response via WebSocket
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Optimization timeout'));
          }, 30000);

          const handler = (data: unknown) => {
            const result = data as { id: string; optimization: OptimizationResponse };
            if (result.id === requestId) {
              clearTimeout(timeout);
              webSocketChatService.off('optimizationResult', handler);
              this.setCache(cacheKey, result.optimization);
              resolve(result.optimization);
            }
          };

          webSocketChatService.on('optimizationResult', handler);
        });
      }

      // Fallback to HTTP API
      const response = await this.makeApiRequest('orchestrator.assess', {
        prompt: request.prompt,
        intent: request.intent,
        context: request.context || [],
      });

      const optimizationResult = this.processOptimizationResponse(response, request);
      this.setCache(cacheKey, optimizationResult);
      
      return optimizationResult;
    } catch (error) {
      console.error('Prompt optimization failed:', error);
      throw error;
    }
  }

  private processOptimizationResponse(response: unknown, request: OptimizationRequest): OptimizationResponse {
    // Process the API response and convert to our format
    return {
      originalPrompt: request.prompt,
      optimizedPrompt: request.prompt, // Would be replaced with actual optimized version
      improvements: ['Enhanced clarity', 'Better structure'], // Mock improvements
      score: 85,
      suggestions: ['Consider adding context', 'Specify desired output format'],
      intent: request.intent || 'general',
      complexity: 'medium',
      estimatedTokens: Math.floor(request.prompt.length / 4),
      confidenceScore: 0.9,
    };
  }

  /**
   * Get template recommendations based on user input
   */
  async getTemplateRecommendations(
    prompt: string,
    intent?: string,
    limit = 5
  ): Promise<TemplateRecommendation[]> {
    if (!this.config.enableTemplateRecommendations) {
      return [];
    }

    const cacheKey = `recommendations_${prompt}_${intent}_${limit}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached as TemplateRecommendation[];
    }

    try {
      // Search for relevant templates
      const searchResponse = await apiClient.getTemplates({
        search: prompt,
        is_public: true,
        ordering: '-created_at',
      });

      const recommendations: TemplateRecommendation[] = (searchResponse.results || [])
        .slice(0, limit)
        .map(template => ({
          template,
          relevanceScore: this.calculateRelevanceScore(template, prompt, intent),
          reason: this.generateRecommendationReason(template, prompt),
          suggestedVariables: this.extractSuggestedVariables(template, prompt),
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      this.setCache(cacheKey, recommendations);
      return recommendations;
    } catch (error) {
      console.error('Template recommendations failed:', error);
      return [];
    }
  }

  private calculateRelevanceScore(template: TemplateList, prompt: string, intent?: string): number {
    let score = 0;

    // Basic text similarity
    const promptWords = prompt.toLowerCase().split(/\s+/);
    const templateTitle = template.title.toLowerCase();
    const templateDesc = template.description.toLowerCase();

    promptWords.forEach(word => {
      if (templateTitle.includes(word)) score += 3;
      if (templateDesc.includes(word)) score += 1;
    });

    // Intent matching
    if (intent && template.category?.name.toLowerCase().includes(intent.toLowerCase())) {
      score += 5;
    }

    // Normalize score (0-100)
    return Math.min(100, score * 2);
  }

  private generateRecommendationReason(template: TemplateList, _prompt: string): string {
    return `This template matches your prompt's context and is in the ${template.category?.name} category.`;
  }

  private extractSuggestedVariables(template: TemplateList, prompt: string): Record<string, string> {
    // Extract potential variable values from the prompt
    const variables: Record<string, string> = {};
    
    // Simple extraction logic - could be enhanced with NLP
    if (prompt.includes('write') || prompt.includes('create')) {
      variables.task = 'writing';
    }
    
    return variables;
  }

  /**
   * Get user analytics and gamification data
   */
  async getUserAnalytics(): Promise<UserAnalytics> {
    if (!this.config.enableAnalytics) {
      return this.getDefaultAnalytics();
    }

    const cacheKey = 'user_analytics';
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached as UserAnalytics;
    }

    try {
      const [profileResponse, _statsResponse, _gamificationResponse] = await Promise.all([
        apiClient.getProfile(),
        this.makeApiRequest('auth.stats', {}),
        this.config.enableGamification 
          ? this.makeApiRequest('gamification.achievements', {})
          : Promise.resolve(null),
      ]);

      const analytics: UserAnalytics = {
        totalPrompts: profileResponse.total_prompts_generated || 0,
        optimizationsUsed: 0, // Would come from stats
        templatesCreated: profileResponse.templates_created || 0,
        templatesUsed: profileResponse.templates_completed || 0,
        averageOptimizationScore: 0, // Would be calculated from history
        streakDays: profileResponse.daily_streak || 0,
        level: profileResponse.level || 1,
        experiencePoints: profileResponse.experience_points || 0,
        badges: [], // Would come from gamification response
      };

      this.setCache(cacheKey, analytics, 2 * 60 * 1000); // 2 minutes TTL
      return analytics;
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  private getDefaultAnalytics(): UserAnalytics {
    return {
      totalPrompts: 0,
      optimizationsUsed: 0,
      templatesCreated: 0,
      templatesUsed: 0,
      averageOptimizationScore: 0,
      streakDays: 0,
      level: 1,
      experiencePoints: 0,
      badges: [],
    };
  }

  /**
   * Search templates with advanced filtering
   */
  async searchTemplates(options: {
    query: string;
    category?: string;
    author?: string;
    featured?: boolean;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{ templates: TemplateList[]; total: number }> {
    try {
      const response = await apiClient.getTemplates({
        search: options.query,
        category: options.category ? parseInt(options.category) : undefined,
        author: options.author,
        is_featured: options.featured,
        ordering: '-created_at',
      });

      return {
        templates: response.results || [],
        total: response.count || 0,
      };
    } catch (error) {
      console.error('Template search failed:', error);
      return { templates: [], total: 0 };
    }
  }

  /**
   * Render a template with provided variables
   */
  async renderTemplate(
    templateId: string,
    variables: Record<string, string>
  ): Promise<string> {
    try {
      const response = await this.makeApiRequest('orchestrator.render', {
        templateId,
        variables,
      });

      return (response as { rendered: string }).rendered || '';
    } catch (error) {
      console.error('Template rendering failed:', error);
      throw error;
    }
  }

  /**
   * Track user interaction for analytics
   */
  async trackInteraction(event: string, data: Record<string, unknown>): Promise<void> {
    if (!this.config.enableAnalytics) {
      return;
    }

    try {
      await this.makeApiRequest('analytics.track', {
        event,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          sessionId: this.getSessionId(),
        },
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('promptcraft_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('promptcraft_session_id', sessionId);
    }
    return sessionId;
  }

  private async makeApiRequest(endpoint: string, data: unknown): Promise<unknown> {
    const requestKey = `${endpoint}_${JSON.stringify(data)}`;
    
    // Prevent duplicate concurrent requests
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    // Check request limit
    if (this.requestQueue.size >= this.config.maxConcurrentRequests) {
      throw new Error('Too many concurrent requests');
    }

    const request = this.executeApiRequest(endpoint, data);
    this.requestQueue.set(requestKey, request);

    try {
      const result = await request;
      return result;
    } finally {
      this.requestQueue.delete(requestKey);
    }
  }

  private async executeApiRequest(endpoint: string, _data: unknown): Promise<unknown> {
    // Map endpoints to actual API calls
    switch (endpoint) {
      case 'orchestrator.assess':
        // Would call the actual assess endpoint
        return { score: 85, improvements: [] };
      
      case 'orchestrator.render':
        // Would call the actual render endpoint
        return { rendered: 'Rendered template content' };
      
      case 'auth.stats':
        // Would call the actual stats endpoint
        return {};
      
      case 'gamification.achievements':
        // Would call the actual achievements endpoint
        return { achievements: [] };
      
      case 'analytics.track':
        // Would call the actual track endpoint
        return { success: true };
      
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
  }

  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: unknown, ttl = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    try {
      await webSocketChatService.connect();
      console.log('PromptCraft Integration Service initialized');
    } catch (error) {
      console.error('Failed to initialize PromptCraft Integration Service:', error);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    webSocketChatService.disconnect();
    this.requestQueue.clear();
    this.cache.clear();
  }
}

// Export singleton instance
export const promptCraftIntegration = new PromptCraftIntegrationService();

// React hook for easy integration
export function usePromptCraftIntegration() {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    promptCraftIntegration.initialize()
      .then(() => {
        if (mounted) {
          setIsInitialized(true);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    service: promptCraftIntegration,
    isInitialized,
    isLoading,
    error,
  };
}
