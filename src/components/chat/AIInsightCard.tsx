'use client';

import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Target, Zap, ChevronRight, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export interface AIInsight {
  id: string;
  type: 'optimization' | 'performance' | 'suggestion' | 'template' | 'success' | 'error';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  metadata?: {
    category?: string;
    tags?: string[];
    estimatedTimeToImplement?: string;
    relatedTemplates?: string[];
    templateId?: string;
    cost?: number;
    tokensUsed?: number;
  };
}

interface AIInsightCardProps {
  insight: AIInsight;
  onApply?: (insight: AIInsight) => void;
  onDismiss?: (insightId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  insight,
  onApply,
  onDismiss,
  isLoading = false,
  className = ''
}) => {
  const getInsightIcon = () => {
    if (isLoading) {
      return <Loader className="w-4 h-4 animate-spin" />;
    }

    switch (insight.type) {
      case 'optimization':
        return <TrendingUp className="w-4 h-4" />;
      case 'performance':
        return <Zap className="w-4 h-4" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4" />;
      case 'template':
        return <Target className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getInsightColors = () => {
    if (isLoading) {
      return 'bg-gray-50 border-gray-200 text-gray-600 animate-pulse';
    }

    switch (insight.type) {
      case 'optimization':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'performance':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'suggestion':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'template':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getImpactBadgeColor = () => {
    switch (insight.impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = () => {
    if (insight.confidence >= 80) return 'text-green-600';
    if (insight.confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      className={`rounded-lg border p-4 ${getInsightColors()} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getInsightIcon()}
          <h3 className="font-medium text-sm">
            {insight.title}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className={`text-xs ${getImpactBadgeColor()}`}
          >
            {insight.impact} impact
          </Badge>

          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDismiss(insight.id)}
              className="h-6 w-6 p-0 hover:bg-white/50"
            >
              ×
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm opacity-90 mb-3">
        {insight.description}
      </p>

      {/* Metadata */}
      {insight.metadata && (
        <div className="space-y-2 mb-3">
          {insight.metadata.category && (
            <div className="text-xs">
              <span className="font-medium">Category:</span> {insight.metadata.category}
            </div>
          )}

          {insight.metadata.estimatedTimeToImplement && (
            <div className="text-xs">
              <span className="font-medium">Time to implement:</span> {insight.metadata.estimatedTimeToImplement}
            </div>
          )}

          {insight.metadata.tags && insight.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {insight.metadata.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-1 py-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Enhanced metadata for real backend data */}
          {insight.metadata?.cost && (
            <div className="text-xs">
              <span className="font-medium">Estimated cost:</span> ${insight.metadata.cost.toFixed(4)}
            </div>
          )}

          {insight.metadata?.tokensUsed && (
            <div className="text-xs">
              <span className="font-medium">Tokens used:</span> {insight.metadata.tokensUsed.toLocaleString()}
            </div>
          )}

          {insight.metadata?.templateId && (
            <div className="text-xs">
              <span className="font-medium">Template ID:</span> {insight.metadata.templateId}
            </div>
          )}
        </div>
      )}

      {/* Confidence and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs">
          <span className="opacity-70">Confidence:</span>
          <span className={`font-medium ${getConfidenceColor()}`}>
            {insight.confidence}%
          </span>
        </div>

        {insight.actionable && onApply && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onApply(insight)}
            disabled={isLoading}
            className="h-7 px-2 text-xs bg-white/50 hover:bg-white/80 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader className="w-3 h-3 mr-1 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                Apply
                <ChevronRight className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// Container for multiple insights
interface AIInsightsPanelProps {
  insights: AIInsight[];
  onApply?: (insight: AIInsight) => void;
  onDismiss?: (insightId: string) => void;
  onDismissAll?: () => void;
  className?: string;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  onApply,
  onDismiss,
  onDismissAll,
  className = ''
}) => {
  if (insights.length === 0) return null;

  return (
    <motion.div
      className={`space-y-3 ${className}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700 flex items-center">
          <Lightbulb className="w-4 h-4 mr-2" />
          AI Insights ({insights.length})
        </h2>

        {onDismissAll && insights.length > 1 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismissAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Dismiss All
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {insights.map((insight) => (
          <AIInsightCard
            key={insight.id}
            insight={insight}
            onApply={onApply}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </motion.div>
  );
};