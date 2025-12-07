'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Lightbulb, CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { ContextAnalyzer, trackAnalyticsEvent } from '@/lib/api/client';
import { ContextAnalysisResponse, AnalyticsEvent } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth'; // Assuming this hook exists

interface LivingPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onTemplateSelect?: (templateId: string) => void;
  sessionId?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

interface GhostSuggestion {
  text: string;
  confidence: number;
  templateId?: string;
  templateName?: string;
}

interface VariableHighlight {
  name: string;
  start: number;
  end: number;
  type: string;
  confidence: number;
}

export const LivingPromptEditor: React.FC<LivingPromptEditorProps> = ({
  value,
  onChange,
  onTemplateSelect,
  sessionId,
  className = '',
  placeholder = 'Start typing your prompt...',
  disabled = false,
}) => {
  const { user, token } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contextAnalyzer = useRef(new ContextAnalyzer(300));

  const [ghostSuggestion, setGhostSuggestion] = useState<GhostSuggestion | null>(null);
  const [variableHighlights, setVariableHighlights] = useState<VariableHighlight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<ContextAnalysisResponse | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Real-time context analysis
  const analyzeContext = useCallback(async (text: string, position: number) => {
    if (!text.trim() || text.length < 3) {
      setGhostSuggestion(null);
      setVariableHighlights([]);
      setAnalysisData(null);
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await contextAnalyzer.current.analyzeWithDebounce(
        text,
        {
          user_id: user?.id,
          session_id: sessionId,
          cursor_position: position,
        },
        token
      );

      if (response) {
        setAnalysisData(response);

        // Extract variable highlights
        const highlights: VariableHighlight[] = response.potential_variables.map(variable => ({
          name: variable.name,
          start: variable.position[0],
          end: variable.position[1],
          type: variable.type,
          confidence: variable.confidence,
        }));
        setVariableHighlights(highlights);

        // Generate ghost suggestion from best template match
        const bestTemplate = response.suggested_template_ids[0];
        if (bestTemplate && bestTemplate.relevance_score > 0.7) {
          setGhostSuggestion({
            text: ` (suggested from "${bestTemplate.template_name}")`,
            confidence: bestTemplate.relevance_score,
            templateId: bestTemplate.template_id,
            templateName: bestTemplate.template_name,
          });
        } else {
          setGhostSuggestion(null);
        }

        // Track analytics
        if (token) {
          await trackAnalyticsEvent({
            event_type: 'context_analyzed',
            session_id: sessionId || 'unknown',
            user_id: user?.id,
            timestamp: new Date().toISOString(),
            metadata: {
              text_length: text.length,
              intent: response.detected_intent.primary,
              suggestions_count: response.suggested_template_ids.length,
            },
            performance_metrics: {
              response_time_ms: response.response_time_ms,
              tokens_used: Math.ceil(text.length / 4), // Rough estimate
              cost: 0.001, // Placeholder
              ai_confidence: response.detected_intent.confidence,
            },
          }, token);
        }
      }
    } catch (error) {
      console.error('Context analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [user?.id, sessionId, token]);

  // Handle text changes
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart;

    onChange(newValue);
    setCursorPosition(position);

    // Trigger context analysis
    analyzeContext(newValue, position);
  }, [onChange, analyzeContext]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab to accept ghost suggestion
    if (e.key === 'Tab' && ghostSuggestion && !e.shiftKey) {
      e.preventDefault();

      if (ghostSuggestion.templateId && onTemplateSelect) {
        onTemplateSelect(ghostSuggestion.templateId);

        // Track acceptance
        if (token) {
          trackAnalyticsEvent({
            event_type: 'suggestion_accepted',
            session_id: sessionId || 'unknown',
            user_id: user?.id,
            timestamp: new Date().toISOString(),
            metadata: {
              suggestion_type: 'template',
              template_id: ghostSuggestion.templateId,
              confidence: ghostSuggestion.confidence,
            },
          }, token);
        }
      }

      setGhostSuggestion(null);
    }

    // Escape to dismiss suggestions
    if (e.key === 'Escape') {
      setGhostSuggestion(null);
    }
  }, [ghostSuggestion, onTemplateSelect, sessionId, token, user?.id]);

  // Handle cursor position changes
  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  }, []);

  // Generate highlighted text with variable overlays
  const renderHighlightedText = () => {
    if (!value || variableHighlights.length === 0) return null;

    const segments: Array<{ text: string; isVariable: boolean; variable?: VariableHighlight }> = [];
    let lastIndex = 0;

    // Sort highlights by position
    const sortedHighlights = [...variableHighlights].sort((a, b) => a.start - b.start);

    sortedHighlights.forEach((highlight) => {
      // Add text before highlight
      if (lastIndex < highlight.start) {
        segments.push({
          text: value.slice(lastIndex, highlight.start),
          isVariable: false,
        });
      }

      // Add highlighted variable
      segments.push({
        text: value.slice(highlight.start, highlight.end),
        isVariable: true,
        variable: highlight,
      });

      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < value.length) {
      segments.push({
        text: value.slice(lastIndex),
        isVariable: false,
      });
    }

    return (
      <div
        className="absolute inset-0 p-3 text-transparent whitespace-pre-wrap break-words pointer-events-none font-mono text-sm leading-6"
        style={{
          fontSize: '14px',
          lineHeight: '1.5',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
        }}
      >
        {segments.map((segment, index) => (
          <span key={index}>
            {segment.isVariable ? (
              <motion.span
                className="bg-amber-200/40 border-b-2 border-amber-400 rounded-sm px-1"
                initial={{ backgroundColor: 'transparent' }}
                animate={{ backgroundColor: 'rgba(251, 191, 36, 0.4)' }}
                transition={{ duration: 0.2 }}
                title={`Variable: ${segment.variable?.name} (${segment.variable?.type})`}
              >
                {segment.text}
              </motion.span>
            ) : (
              segment.text
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main editor container */}
      <div className="relative">
        {/* Highlighted text overlay */}
        {renderHighlightedText()}

        {/* Main textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelectionChange}
          onClick={handleSelectionChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full min-h-[120px] p-3 text-sm font-mono leading-6 bg-white border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors duration-200"
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
          }}
        />

        {/* Ghost suggestion */}
        <AnimatePresence>
          {ghostSuggestion && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute bottom-3 right-3"
            >
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-amber-200 rounded-md px-2 py-1 shadow-sm">
                <Wand2 className="w-3 h-3 text-amber-600" />
                <span className="text-xs text-amber-700 font-medium">
                  {ghostSuggestion.templateName}
                </span>
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                  Tab to apply
                </Badge>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis status indicator */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-3 right-3"
            >
              <div className="flex items-center space-x-1 bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
                <Loader className="w-3 h-3 text-blue-600 animate-spin" />
                <span className="text-xs text-blue-700">Analyzing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick suggestions panel */}
      <AnimatePresence>
        {analysisData && analysisData.suggested_template_ids.length > 0 && !disabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  Suggested Templates
                </span>
              </div>
              <Badge variant="outline" className="text-xs bg-white/60">
                {analysisData.detected_intent.primary}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {analysisData.suggested_template_ids.slice(0, 4).map((template, index) => (
                <motion.button
                  key={template.template_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onTemplateSelect?.(template.template_id)}
                  className="flex items-center justify-between p-2 bg-white/60 hover:bg-white/80 border border-amber-200/60 rounded-md transition-colors group"
                >
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {template.template_name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {template.category}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(template.relevance_score * 100)}%
                    </Badge>
                    <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Quick stats */}
            <div className="mt-2 pt-2 border-t border-amber-200/60">
              <div className="flex items-center justify-between text-xs text-amber-800">
                <span>
                  Intent: {analysisData.detected_intent.primary}
                  ({Math.round(analysisData.detected_intent.confidence)}% confidence)
                </span>
                <span>
                  {analysisData.response_time_ms}ms
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts hint */}
      <div className="mt-2 text-xs text-gray-500 flex items-center space-x-4">
        <span className="flex items-center space-x-1">
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Tab</kbd>
          <span>Accept suggestion</span>
        </span>
        <span className="flex items-center space-x-1">
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Esc</kbd>
          <span>Dismiss</span>
        </span>
      </div>
    </div>
  );
};

export default LivingPromptEditor;