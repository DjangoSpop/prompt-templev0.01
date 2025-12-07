'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  ContextAnalyzer,
  getSessionInsights,
  generateWorkflow,
  trackAnalyticsEvent
} from '@/lib/api/client';
import {
  ContextAnalysisResponse,
  SessionInsightsResponse,
  WorkflowGenerationResponse,
  AnalyticsEvent
} from '@/lib/api/types';
import { useAuth } from './useAuth';

interface ProactiveAIConfig {
  enableContextAnalysis?: boolean;
  enableInsightMonitoring?: boolean;
  contextDebounceMs?: number;
  insightRefreshInterval?: number;
  autoTrackEvents?: boolean;
}

interface ProactiveAIState {
  // Context Analysis
  contextAnalysis: ContextAnalysisResponse | null;
  isAnalyzingContext: boolean;

  // Session Insights
  sessionInsights: SessionInsightsResponse | null;
  isLoadingInsights: boolean;

  // Workflow Generation
  generatedWorkflow: WorkflowGenerationResponse | null;
  isGeneratingWorkflow: boolean;

  // Error States
  contextError: string | null;
  insightsError: string | null;
  workflowError: string | null;

  // Analytics
  eventsTracked: number;
  lastEventTime: Date | null;
}

interface ProactiveAIActions {
  // Context Analysis
  analyzeText: (text: string, context?: any) => Promise<ContextAnalysisResponse | null>;
  clearContextAnalysis: () => void;

  // Session Insights
  refreshInsights: (sessionId: string) => Promise<SessionInsightsResponse | null>;
  clearInsights: () => void;

  // Workflow Generation
  generateWorkflowFromGoal: (goal: string, preferences?: any) => Promise<WorkflowGenerationResponse | null>;
  clearWorkflow: () => void;

  // Analytics
  trackEvent: (event: Omit<AnalyticsEvent, 'timestamp' | 'user_id'>) => Promise<void>;

  // Error Handling
  clearErrors: () => void;
  retryLastAction: () => Promise<void>;
}

const defaultConfig: ProactiveAIConfig = {
  enableContextAnalysis: true,
  enableInsightMonitoring: true,
  contextDebounceMs: 300,
  insightRefreshInterval: 15000,
  autoTrackEvents: true,
};

export function useProactiveAI(
  sessionId?: string,
  config: ProactiveAIConfig = {}
): ProactiveAIState & ProactiveAIActions {
  const { user, token } = useAuth();
  const finalConfig = { ...defaultConfig, ...config };

  // Refs
  const contextAnalyzer = useRef(new ContextAnalyzer(finalConfig.contextDebounceMs));
  const insightIntervalRef = useRef<NodeJS.Timeout>();
  const lastActionRef = useRef<() => Promise<any>>();

  // State
  const [state, setState] = useState<ProactiveAIState>({
    contextAnalysis: null,
    isAnalyzingContext: false,
    sessionInsights: null,
    isLoadingInsights: false,
    generatedWorkflow: null,
    isGeneratingWorkflow: false,
    contextError: null,
    insightsError: null,
    workflowError: null,
    eventsTracked: 0,
    lastEventTime: null,
  });

  // Error handling utility
  const handleError = useCallback((error: unknown, type: 'context' | 'insights' | 'workflow') => {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    setState(prev => ({
      ...prev,
      [`${type}Error`]: errorMessage,
    }));

    // Show user-friendly error toast
    const friendlyMessages = {
      context: 'Failed to analyze context. Please check your connection.',
      insights: 'Unable to load session insights. Retrying in a moment...',
      workflow: 'Workflow generation failed. Please try again.',
    };

    toast.error(friendlyMessages[type], {
      action: {
        label: 'Retry',
        onClick: () => retryLastAction(),
      },
    });

    console.error(`Proactive AI ${type} error:`, error);
  }, []);

  // Context Analysis
  const analyzeText = useCallback(async (
    text: string,
    context?: any
  ): Promise<ContextAnalysisResponse | null> => {
    if (!finalConfig.enableContextAnalysis || !token || text.length < 3) {
      return null;
    }

    setState(prev => ({ ...prev, isAnalyzingContext: true, contextError: null }));

    try {
      const response = await contextAnalyzer.current.analyzeWithDebounce(
        text,
        {
          user_id: user?.id,
          session_id: sessionId,
          ...context,
        },
        token
      );

      if (response) {
        setState(prev => ({ ...prev, contextAnalysis: response }));

        // Auto-track analytics
        if (finalConfig.autoTrackEvents) {
          await trackEvent({
            event_type: 'context_analyzed',
            session_id: sessionId || 'unknown',
            metadata: {
              text_length: text.length,
              intent: response.detected_intent.primary,
              suggestions_count: response.suggested_template_ids.length,
            },
            performance_metrics: {
              response_time_ms: response.response_time_ms,
              tokens_used: Math.ceil(text.length / 4),
              cost: 0.001, // Placeholder
              ai_confidence: response.detected_intent.confidence,
            },
          });
        }
      }

      return response;
    } catch (error) {
      handleError(error, 'context');
      return null;
    } finally {
      setState(prev => ({ ...prev, isAnalyzingContext: false }));
    }
  }, [finalConfig.enableContextAnalysis, finalConfig.autoTrackEvents, token, user?.id, sessionId, handleError]);

  // Session Insights
  const refreshInsights = useCallback(async (
    targetSessionId: string
  ): Promise<SessionInsightsResponse | null> => {
    if (!finalConfig.enableInsightMonitoring || !token) {
      return null;
    }

    setState(prev => ({ ...prev, isLoadingInsights: true, insightsError: null }));
    lastActionRef.current = () => refreshInsights(targetSessionId);

    try {
      const response = await getSessionInsights(
        targetSessionId,
        { depth: 'deep', include_history: true },
        token
      );

      setState(prev => ({ ...prev, sessionInsights: response }));

      // Auto-track analytics
      if (finalConfig.autoTrackEvents) {
        await trackEvent({
          event_type: 'insight_applied',
          session_id: targetSessionId,
          metadata: {
            quality_score: response.quality_score.overall,
            is_template_candidate: response.is_template_candidate,
            improvements_count: response.suggested_improvements.length,
          },
        });
      }

      return response;
    } catch (error) {
      handleError(error, 'insights');
      return null;
    } finally {
      setState(prev => ({ ...prev, isLoadingInsights: false }));
    }
  }, [finalConfig.enableInsightMonitoring, finalConfig.autoTrackEvents, token, handleError]);

  // Workflow Generation
  const generateWorkflowFromGoal = useCallback(async (
    goal: string,
    preferences?: any
  ): Promise<WorkflowGenerationResponse | null> => {
    if (!token || !goal.trim()) {
      return null;
    }

    setState(prev => ({ ...prev, isGeneratingWorkflow: true, workflowError: null }));
    lastActionRef.current = () => generateWorkflowFromGoal(goal, preferences);

    try {
      const response = await generateWorkflow(
        {
          goal,
          complexity: 'medium',
          max_steps: 6,
          user_preferences: {
            preferred_style: 'pharaonic',
            experience_level: user?.is_premium ? 'expert' : 'intermediate',
            ...preferences,
          },
        },
        token
      );

      setState(prev => ({ ...prev, generatedWorkflow: response }));

      // Auto-track analytics
      if (finalConfig.autoTrackEvents) {
        await trackEvent({
          event_type: 'workflow_completed',
          session_id: sessionId || 'workflow-session',
          metadata: {
            goal,
            steps_count: response.steps.length,
            difficulty: response.difficulty_level,
            estimated_time: response.estimated_total_time,
          },
        });
      }

      // Show success toast
      toast.success(`Pharaonic quest generated with ${response.steps.length} steps!`, {
        description: `Estimated completion time: ${response.estimated_total_time}`,
      });

      return response;
    } catch (error) {
      handleError(error, 'workflow');
      return null;
    } finally {
      setState(prev => ({ ...prev, isGeneratingWorkflow: false }));
    }
  }, [token, user?.is_premium, sessionId, finalConfig.autoTrackEvents, handleError]);

  // Analytics Tracking
  const trackEvent = useCallback(async (
    event: Omit<AnalyticsEvent, 'timestamp' | 'user_id'>
  ): Promise<void> => {
    if (!token) return;

    try {
      await trackAnalyticsEvent(
        {
          ...event,
          user_id: user?.id,
          timestamp: new Date().toISOString(),
        },
        token
      );

      setState(prev => ({
        ...prev,
        eventsTracked: prev.eventsTracked + 1,
        lastEventTime: new Date(),
      }));
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      // Don't show error toast for analytics failures
    }
  }, [token, user?.id]);

  // Clear functions
  const clearContextAnalysis = useCallback(() => {
    setState(prev => ({ ...prev, contextAnalysis: null, contextError: null }));
    contextAnalyzer.current.clearCache();
  }, []);

  const clearInsights = useCallback(() => {
    setState(prev => ({ ...prev, sessionInsights: null, insightsError: null }));
  }, []);

  const clearWorkflow = useCallback(() => {
    setState(prev => ({ ...prev, generatedWorkflow: null, workflowError: null }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      contextError: null,
      insightsError: null,
      workflowError: null,
    }));
  }, []);

  // Retry last action
  const retryLastAction = useCallback(async () => {
    if (lastActionRef.current) {
      try {
        await lastActionRef.current();
        toast.success('Retry successful!');
      } catch (error) {
        toast.error('Retry failed. Please check your connection.');
      }
    }
  }, []);

  // Auto-refresh insights effect
  useEffect(() => {
    if (finalConfig.enableInsightMonitoring && sessionId && token) {
      // Initial load
      refreshInsights(sessionId);

      // Set up interval
      insightIntervalRef.current = setInterval(() => {
        refreshInsights(sessionId);
      }, finalConfig.insightRefreshInterval);

      return () => {
        if (insightIntervalRef.current) {
          clearInterval(insightIntervalRef.current);
        }
      };
    }
  }, [finalConfig.enableInsightMonitoring, finalConfig.insightRefreshInterval, sessionId, token, refreshInsights]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (insightIntervalRef.current) {
        clearInterval(insightIntervalRef.current);
      }
      contextAnalyzer.current.clearCache();
    };
  }, []);

  return {
    // State
    ...state,

    // Actions
    analyzeText,
    clearContextAnalysis,
    refreshInsights,
    clearInsights,
    generateWorkflowFromGoal,
    clearWorkflow,
    trackEvent,
    clearErrors,
    retryLastAction,
  };
}

export default useProactiveAI;