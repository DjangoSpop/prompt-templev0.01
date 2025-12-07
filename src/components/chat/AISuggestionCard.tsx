'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Wand2, Copy, ArrowRight, Star, Loader, Clock, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export interface AISuggestion {
  id: string;
  type: 'prompt_improvement' | 'follow_up' | 'template_suggestion' | 'optimization';
  title: string;
  suggestion: string;
  originalPrompt?: string;
  improvedPrompt?: string;
  reasoning?: string;
  confidence: number; // 0-100
  category?: string;
  tags?: string[];
  estimatedImprovement?: {
    clarity: number;
    effectiveness: number;
    tokenEfficiency: number;
  };
  metadata?: {
    cost?: number;
    tokensUsed?: number;
    responseTime?: number;
    templateId?: string;
    source?: 'backend' | 'mock';
  };
}

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  onApply?: (suggestion: AISuggestion) => void;
  onCopy?: (content: string) => void;
  onDismiss?: (suggestionId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const AISuggestionCard: React.FC<AISuggestionCardProps> = ({
  suggestion,
  onApply,
  onCopy,
  onDismiss,
  isLoading = false,
  className = ''
}) => {
  const getSuggestionIcon = () => {
    if (isLoading) {
      return <Loader className="w-4 h-4 animate-spin" />;
    }

    switch (suggestion.type) {
      case 'prompt_improvement':
        return <Wand2 className="w-4 h-4" />;
      case 'follow_up':
        return <MessageSquare className="w-4 h-4" />;
      case 'template_suggestion':
        return <Star className="w-4 h-4" />;
      case 'optimization':
        return <ArrowRight className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getSuggestionColors = () => {
    if (isLoading) {
      return 'bg-gray-50 border-gray-200 text-gray-600 animate-pulse';
    }

    switch (suggestion.type) {
      case 'prompt_improvement':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'follow_up':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'template_suggestion':
        return 'bg-violet-50 border-violet-200 text-violet-800';
      case 'optimization':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getConfidenceColor = () => {
    if (suggestion.confidence >= 85) return 'text-green-600';
    if (suggestion.confidence >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <motion.div
      className={`rounded-lg border p-4 ${getSuggestionColors()} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getSuggestionIcon()}
          <div>
            <h3 className="font-medium text-sm">
              {suggestion.title}
            </h3>
            <p className="text-xs opacity-70">
              {formatType(suggestion.type)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`text-xs font-medium ${getConfidenceColor()}`}>
            {suggestion.confidence}%
          </div>

          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDismiss(suggestion.id)}
              className="h-6 w-6 p-0 hover:bg-white/50"
            >
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Main suggestion content */}
      <div className="space-y-3 mb-4">
        <p className="text-sm opacity-90">
          {suggestion.suggestion}
        </p>

        {/* Show original vs improved prompt for prompt improvements */}
        {suggestion.type === 'prompt_improvement' && suggestion.originalPrompt && suggestion.improvedPrompt && (
          <div className="space-y-2">
            <div className="bg-white/50 rounded-md p-2">
              <p className="text-xs font-medium opacity-70 mb-1">Original:</p>
              <p className="text-xs opacity-80 italic">
                "{suggestion.originalPrompt}"
              </p>
            </div>

            <div className="bg-white/70 rounded-md p-2">
              <p className="text-xs font-medium opacity-70 mb-1">Improved:</p>
              <p className="text-xs font-medium">
                "{suggestion.improvedPrompt}"
              </p>
            </div>
          </div>
        )}

        {/* Reasoning */}
        {suggestion.reasoning && (
          <div className="bg-white/30 rounded-md p-2">
            <p className="text-xs font-medium opacity-70 mb-1">Why this helps:</p>
            <p className="text-xs opacity-85">
              {suggestion.reasoning}
            </p>
          </div>
        )}

        {/* Estimated improvements */}
        {suggestion.estimatedImprovement && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/40 rounded-md p-2">
              <p className="text-xs font-medium">Clarity</p>
              <p className="text-sm font-bold">
                +{suggestion.estimatedImprovement.clarity}%
              </p>
            </div>
            <div className="bg-white/40 rounded-md p-2">
              <p className="text-xs font-medium">Effectiveness</p>
              <p className="text-sm font-bold">
                +{suggestion.estimatedImprovement.effectiveness}%
              </p>
            </div>
            <div className="bg-white/40 rounded-md p-2">
              <p className="text-xs font-medium">Efficiency</p>
              <p className="text-sm font-bold">
                +{suggestion.estimatedImprovement.tokenEfficiency}%
              </p>
            </div>
          </div>
        )}

        {/* Backend metadata */}
        {suggestion.metadata && (
          <div className="bg-white/20 rounded-md p-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium opacity-70">Backend Data:</span>
              <Badge variant="outline" className="text-xs bg-white/50">
                {suggestion.metadata.source || 'backend'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {suggestion.metadata.cost && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span>${suggestion.metadata.cost.toFixed(4)}</span>
                </div>
              )}

              {suggestion.metadata.responseTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{suggestion.metadata.responseTime}ms</span>
                </div>
              )}

              {suggestion.metadata.tokensUsed && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs">🎯</span>
                  <span>{suggestion.metadata.tokensUsed} tokens</span>
                </div>
              )}

              {suggestion.metadata.templateId && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs">📄</span>
                  <span>ID: {suggestion.metadata.templateId}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      {suggestion.tags && suggestion.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {suggestion.tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs px-1 py-0 bg-white/50"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {suggestion.category && (
            <Badge variant="outline" className="text-xs bg-white/50">
              {suggestion.category}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onCopy && (suggestion.improvedPrompt || suggestion.suggestion) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(suggestion.improvedPrompt || suggestion.suggestion)}
              disabled={isLoading}
              className="h-7 px-2 text-xs bg-white/50 hover:bg-white/80 disabled:opacity-50"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          )}

          {onApply && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApply(suggestion)}
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
                  <ArrowRight className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Container for multiple suggestions
interface AISuggestionsPanelProps {
  suggestions: AISuggestion[];
  onApply?: (suggestion: AISuggestion) => void;
  onCopy?: (content: string) => void;
  onDismiss?: (suggestionId: string) => void;
  onDismissAll?: () => void;
  className?: string;
}

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  suggestions,
  onApply,
  onCopy,
  onDismiss,
  onDismissAll,
  className = ''
}) => {
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      className={`space-y-3 ${className}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700 flex items-center">
          <Wand2 className="w-4 h-4 mr-2" />
          AI Suggestions ({suggestions.length})
        </h2>

        {onDismissAll && suggestions.length > 1 && (
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
        {suggestions.map((suggestion) => (
          <AISuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onApply={onApply}
            onCopy={onCopy}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </motion.div>
  );
};