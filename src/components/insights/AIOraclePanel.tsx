'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  TrendingUp,
  Zap,
  Star,
  CheckCircle,
  AlertTriangle,
  Save,
  Sparkles,
  Clock,
  Target,
  Award,
  Loader,
  RefreshCw
} from 'lucide-react';
import { getSessionInsights, trackAnalyticsEvent } from '@/lib/api/client';
import { SessionInsightsResponse, AnalyticsEvent } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';

interface AIOraclePanelProps {
  sessionId: string;
  onSaveAsTemplate?: () => void;
  onApplyImprovement?: (improvement: string) => void;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface QualityMetrics {
  overall: number;
  clarity: number;
  specificity: number;
  actionability: number;
  creativity: number;
}

export const AIOraclePanel: React.FC<AIOraclePanelProps> = ({
  sessionId,
  onSaveAsTemplate,
  onApplyImprovement,
  className = '',
  autoRefresh = true,
  refreshInterval = 10000, // 10 seconds
}) => {
  const { user, token } = useAuth();
  const [insights, setInsights] = useState<SessionInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isTemplateGlowing, setIsTemplateGlowing] = useState(false);

  // Fetch session insights
  const fetchInsights = useCallback(async (showLoading = true) => {
    if (!sessionId || !token) return;

    if (showLoading) setIsLoading(true);
    setError(null);

    try {
      const response = await getSessionInsights(
        sessionId,
        { depth: 'deep', include_history: true },
        token
      );

      setInsights(response);
      setLastUpdated(new Date());

      // Trigger template glow if quality is high
      if (response.is_template_candidate && !isTemplateGlowing) {
        setIsTemplateGlowing(true);
        setTimeout(() => setIsTemplateGlowing(false), 3000);
      }

      // Track analytics
      if (token) {
        await trackAnalyticsEvent({
          event_type: 'insight_applied',
          session_id: sessionId,
          user_id: user?.id,
          timestamp: new Date().toISOString(),
          metadata: {
            quality_score: response.quality_score.overall,
            is_template_candidate: response.is_template_candidate,
            improvements_count: response.suggested_improvements.length,
          },
        }, token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [sessionId, token, user?.id, isTemplateGlowing]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !sessionId) return;

    fetchInsights();
    const interval = setInterval(() => fetchInsights(false), refreshInterval);

    return () => clearInterval(interval);
  }, [fetchInsights, autoRefresh, refreshInterval, sessionId]);

  // Quality score color mapping
  const getQualityColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  // Quality score gradient
  const getQualityGradient = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-green-400';
    if (score >= 70) return 'from-amber-500 to-yellow-400';
    if (score >= 50) return 'from-orange-500 to-red-400';
    return 'from-red-500 to-pink-400';
  };

  // Render quality metrics radial progress
  const renderQualityMetrics = (metrics: QualityMetrics) => {
    const metricItems = [
      { key: 'clarity', label: 'Clarity', value: metrics.clarity, icon: Eye },
      { key: 'specificity', label: 'Specificity', value: metrics.specificity, icon: Target },
      { key: 'actionability', label: 'Actionability', value: metrics.actionability, icon: Zap },
      { key: 'creativity', label: 'Creativity', value: metrics.creativity, icon: Sparkles },
    ];

    return (
      <div className="grid grid-cols-2 gap-3">
        {metricItems.map(({ key, label, value, icon: Icon }) => (
          <motion.div
            key={key}
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative w-16 h-16 mx-auto mb-2">
              {/* Background circle */}
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgb(229 231 235)"
                  strokeWidth="2"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray={`${value}, 100`}
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${value}, 100` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={value >= 70 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444'} />
                    <stop offset="100%" stopColor={value >= 70 ? '#059669' : value >= 50 ? '#d97706' : '#dc2626'} />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center icon and value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Icon className="w-4 h-4 text-gray-600 mb-1" />
                <span className={`text-xs font-bold ${getQualityColor(value)}`}>
                  {value}
                </span>
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700">{label}</p>
          </motion.div>
        ))}
      </div>
    );
  };

  if (isLoading && !insights) {
    return (
      <div className={`p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <Loader className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="text-sm text-indigo-700">Analyzing conversation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 text-red-700">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">Failed to load insights: {error}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fetchInsights()}
          className="mt-2 text-red-700 border-red-300"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <motion.div
      className={`p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-indigo-900">AI Oracle</h3>
            <p className="text-xs text-indigo-600">Real-time insights</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <Badge variant="outline" className="text-xs text-indigo-700 bg-white/60">
              <Clock className="w-3 h-3 mr-1" />
              {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fetchInsights()}
            disabled={isLoading}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overall Quality Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Overall Quality</span>
          <span className={`text-lg font-bold ${getQualityColor(insights.quality_score.overall)}`}>
            {insights.quality_score.overall}/100
          </span>
        </div>

        <div className="relative">
          <Progress
            value={insights.quality_score.overall}
            className="h-3 bg-gray-200"
          />
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${getQualityGradient(insights.quality_score.overall)} rounded-full opacity-20`}
            initial={{ width: 0 }}
            animate={{ width: `${insights.quality_score.overall}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quality Breakdown</h4>
        {renderQualityMetrics(insights.quality_score)}
      </div>

      {/* Template Candidate Section */}
      <AnimatePresence>
        {insights.is_template_candidate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 rounded-lg ${
              isTemplateGlowing
                ? 'border-amber-400 shadow-lg shadow-amber-200/50'
                : 'border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={isTemplateGlowing ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isTemplateGlowing ? 3 : 0 }}
                >
                  <Award className="w-5 h-5 text-amber-600" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Template Potential Detected!
                  </p>
                  <p className="text-xs text-amber-700">
                    Score: {insights.template_potential_score}/100
                  </p>
                </div>
              </div>

              {onSaveAsTemplate && (
                <motion.div
                  animate={isTemplateGlowing ? {
                    boxShadow: ['0 0 0 0 rgba(251, 191, 36, 0.4)', '0 0 0 8px rgba(251, 191, 36, 0)', '0 0 0 0 rgba(251, 191, 36, 0)']
                  } : {}}
                  transition={{ duration: 1, repeat: isTemplateGlowing ? Infinity : 0 }}
                >
                  <Button
                    size="sm"
                    onClick={onSaveAsTemplate}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save as Template
                  </Button>
                </motion.div>
              )}
            </div>

            {isTemplateGlowing && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs text-amber-800"
              >
                This conversation has high potential. Save it to your library!
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Improvements Section */}
      {insights.suggested_improvements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested Improvements</h4>
          <div className="space-y-2">
            {insights.suggested_improvements.slice(0, 3).map((improvement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-white/60 border border-indigo-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          improvement.priority === 'high'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : improvement.priority === 'medium'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}
                      >
                        {improvement.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
                        {improvement.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{improvement.suggestion}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        +{improvement.estimated_impact}% improvement
                      </span>
                    </div>
                  </div>

                  {onApplyImprovement && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApplyImprovement(improvement.suggestion)}
                      className="ml-2 h-7 px-2 text-xs bg-white/80 hover:bg-white"
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Session Analytics */}
      <div className="pt-4 border-t border-indigo-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Session Analytics</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="text-center">
            <div className="text-lg font-semibold text-indigo-600">
              {insights.conversation_analysis.turn_count}
            </div>
            <div className="text-gray-600">Exchanges</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">
              {Math.round(insights.conversation_analysis.avg_response_time)}ms
            </div>
            <div className="text-gray-600">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {insights.conversation_analysis.total_tokens_used.toLocaleString()}
            </div>
            <div className="text-gray-600">Tokens Used</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-amber-600">
              ${insights.conversation_analysis.cost_estimate.toFixed(4)}
            </div>
            <div className="text-gray-600">Cost Est.</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIOraclePanel;