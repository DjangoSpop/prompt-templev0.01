'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Settings, Bot, User, BookOpen, Save, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

// Import our new SSE components
import { StreamingMessageBubble } from './StreamingMessageBubble';
import { ErrorToast, ConnectionStatus, type ChatError } from './ErrorToast';
import { AIInsightsPanel, type AIInsight } from './AIInsightCard';
import { AISuggestionsPanel, type AISuggestion } from './AISuggestionCard';

// Import SSE service and template extraction
import { useSSEChat, type SSEChatConfig } from '../../lib/services/sse-chat';
import type { ChatMessage } from '../../types/chat';
import { templatesService } from '../../lib/api/templates';
import type { AppTemplate } from '../../lib/types/adapters';

interface EnhancedChatInterfaceProps {
  className?: string;
  config?: SSEChatConfig;
  onMessageSent?: (message: string) => void;
  placeholder?: string;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  className = '',
  config,
  onMessageSent,
  placeholder = 'Type your message...'
}) => {
  // SSE Chat service
  const { service, isConnected, isConnecting, error: connectionError } = useSSEChat(config);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [currentStreamingMessageId, setCurrentStreamingMessageId] = useState<string | null>(null);

  // AI Enhancement state
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [chatError, setChatError] = useState<ChatError | null>(null);
  const [showEgyptianLoader, setShowEgyptianLoader] = useState(false);

  // Template extraction state
  const [extractedTemplates, setExtractedTemplates] = useState<Partial<AppTemplate>[]>([]);
  const [showTemplateExtraction, setShowTemplateExtraction] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Handle SSE events
  useEffect(() => {
    if (!service) return;

    const handleMessageResponse = (message: any) => {
      console.log('Message response received:', message);

      if (message.status === 'completed') {
        // Finalize the streaming message
        setMessages(prev => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage && lastMessage.id === currentStreamingMessageId) {
            lastMessage.content = message.content;
            lastMessage.partial = false;
            lastMessage.metadata = message.metadata;
          }
          return updated;
        });

        setIsStreaming(false);
        setStreamingContent('');
        setCurrentStreamingMessageId(null);
        setShowEgyptianLoader(false);

        // Generate insights/suggestions based on the completed message
        generateInsightsAndSuggestions(message.content);

        // Check for template extraction opportunities
        analyzeForTemplateExtraction(message.content);
      }
    };

    const handleMessageUpdate = (update: any) => {
      console.log('Message update received:', update);
      setStreamingContent(update.content || '');
    };

    const handleError = (error: any) => {
      console.error('SSE Error:', error);
      setChatError({
        status: error.status || 500,
        message: error.message || 'An error occurred',
        retryable: true
      });
      setIsStreaming(false);
      setShowEgyptianLoader(false);
    };

    service.on('messageResponse', handleMessageResponse);
    service.on('messageUpdate', handleMessageUpdate);
    service.on('error', handleError);

    return () => {
      service.off('messageResponse', handleMessageResponse);
      service.off('messageUpdate', handleMessageUpdate);
      service.off('error', handleError);
    };
  }, [service, currentStreamingMessageId]);

  // Handle connection errors
  useEffect(() => {
    if (connectionError) {
      setChatError({
        status: 500,
        message: connectionError.message,
        retryable: true
      });
    }
  }, [connectionError]);

  // Send message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      ts: Date.now()
    };

    const assistantMessageId = `assistant_${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      ts: Date.now(),
      partial: true
    };

    // Add messages to chat
    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setCurrentStreamingMessageId(assistantMessageId);
    setIsStreaming(true);
    setStreamingContent('');
    setChatError(null);

    // Determine if we should show Egyptian loader (for complex prompts)
    const isComplexPrompt = input.length > 200 ||
                          input.includes('analyze') ||
                          input.includes('complex') ||
                          input.includes('detailed');
    setShowEgyptianLoader(isComplexPrompt);

    const messageContent = input;
    setInput('');
    onMessageSent?.(messageContent);

    try {
      // Send to SSE service
      await service.sendMessage(messageContent, messages.filter(m => m.role !== 'system'));
    } catch (error) {
      console.error('Error sending message:', error);
      setChatError({
        status: 500,
        message: error instanceof Error ? error.message : 'Failed to send message',
        retryable: true
      });
      setIsStreaming(false);
      setShowEgyptianLoader(false);
    }
  }, [input, isStreaming, messages, service, onMessageSent]);

  // Generate mock insights and suggestions (in real app, these would come from the backend)
  const generateInsightsAndSuggestions = useCallback((messageContent: string) => {
    // Generate insights
    const newInsights: AIInsight[] = [];

    if (messageContent.length > 100) {
      newInsights.push({
        id: `insight_${Date.now()}`,
        type: 'optimization',
        title: 'Response Quality Detected',
        description: 'This response shows high quality reasoning. Consider saving as a template for future similar queries.',
        confidence: 85,
        impact: 'medium',
        actionable: true,
        metadata: {
          category: 'Template Creation',
          tags: ['high-quality', 'template-worthy'],
          estimatedTimeToImplement: '2 minutes'
        }
      });
    }

    // Generate suggestions
    const newSuggestions: AISuggestion[] = [];

    if (Math.random() > 0.5) { // 50% chance to show suggestion
      newSuggestions.push({
        id: `suggestion_${Date.now()}`,
        type: 'follow_up',
        title: 'Suggested Follow-up',
        suggestion: 'Would you like me to provide more specific examples or dive deeper into any particular aspect?',
        confidence: 80,
        category: 'Conversation Flow',
        tags: ['follow-up', 'engagement']
      });
    }

    setInsights(prev => [...prev, ...newInsights]);
    setSuggestions(prev => [...prev, ...newSuggestions]);
  }, []);

  // Analyze conversation for template extraction opportunities
  const analyzeForTemplateExtraction = useCallback(async (messageContent: string) => {
    if (messageContent.length < 50) return; // Skip short responses

    // Analyze if this response contains reusable patterns
    const hasStructuredContent = messageContent.includes('1.') ||
                                messageContent.includes('•') ||
                                messageContent.includes('##') ||
                                messageContent.includes('**');

    const hasInstructions = messageContent.toLowerCase().includes('step') ||
                          messageContent.toLowerCase().includes('follow') ||
                          messageContent.toLowerCase().includes('guide') ||
                          messageContent.toLowerCase().includes('process');

    const isHighQuality = messageContent.length > 200 &&
                         messageContent.split(' ').length > 30;

    if (hasStructuredContent || hasInstructions || isHighQuality) {
      const extractedTemplate: Partial<AppTemplate> = {
        title: generateTemplateTitle(messageContent),
        description: generateTemplateDescription(messageContent),
        content: messageContent,
        category: detectTemplateCategory(messageContent),
        tags: extractTemplateTags(messageContent),
        variables: extractVariables(messageContent),
        isPublic: false,
        isActive: true
      };

      setExtractedTemplates(prev => [...prev, extractedTemplate]);
      setShowTemplateExtraction(true);

      // Add insight about template extraction
      const extractionInsight: AIInsight = {
        id: `template_extraction_${Date.now()}`,
        type: 'optimization',
        title: 'Template Extraction Opportunity',
        description: 'This response contains structured content that could be saved as a reusable template.',
        confidence: 88,
        impact: 'high',
        actionable: true,
        metadata: {
          category: 'Template Creation',
          tags: ['template-extraction', 'reusable-content'],
          estimatedTimeToImplement: '1 minute'
        }
      };

      setInsights(prev => [...prev, extractionInsight]);
    }
  }, []);

  // Helper functions for template extraction
  const generateTemplateTitle = (content: string): string => {
    const lines = content.split('\n').filter(line => line.trim());
    const firstLine = lines[0]?.trim() || '';

    if (firstLine.length > 0 && firstLine.length < 100) {
      return firstLine.replace(/[#*]/g, '').trim();
    }

    // Generate title based on content type
    if (content.toLowerCase().includes('step')) return 'Step-by-Step Guide';
    if (content.toLowerCase().includes('analysis')) return 'Analysis Template';
    if (content.toLowerCase().includes('plan')) return 'Planning Template';
    if (content.toLowerCase().includes('email')) return 'Email Template';

    return 'Custom Template';
  };

  const generateTemplateDescription = (content: string): string => {
    const summary = content.substring(0, 150) + '...';
    return `Auto-extracted template from conversation. ${summary}`;
  };

  const detectTemplateCategory = (content: string): string => {
    const lower = content.toLowerCase();

    if (lower.includes('email') || lower.includes('message')) return 'Communication';
    if (lower.includes('plan') || lower.includes('strategy')) return 'Planning';
    if (lower.includes('analysis') || lower.includes('research')) return 'Analysis';
    if (lower.includes('code') || lower.includes('programming')) return 'Development';
    if (lower.includes('write') || lower.includes('content')) return 'Writing';

    return 'General';
  };

  const extractTemplateTags = (content: string): string[] => {
    const tags: string[] = ['auto-extracted'];
    const lower = content.toLowerCase();

    if (lower.includes('step')) tags.push('step-by-step');
    if (lower.includes('guide')) tags.push('guide');
    if (lower.includes('analysis')) tags.push('analysis');
    if (lower.includes('plan')) tags.push('planning');
    if (content.includes('1.') || content.includes('•')) tags.push('structured');

    return tags.slice(0, 5); // Limit to 5 tags
  };

  const extractVariables = (content: string): Record<string, any> => {
    const variables: Record<string, any> = {};

    // Look for placeholder patterns like [something], {something}, or {{something}}
    const placeholderPatterns = [
      /\[([^\]]+)\]/g,
      /\{([^}]+)\}/g,
      /\{\{([^}]+)\}\}/g
    ];

    placeholderPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const varName = match.replace(/[\[\]{}]/g, '').trim();
          if (varName && !variables[varName]) {
            variables[varName] = {
              type: 'text',
              description: `Variable: ${varName}`,
              required: true
            };
          }
        });
      }
    });

    return variables;
  };

  // Save extracted template
  const saveTemplate = useCallback(async (template: Partial<AppTemplate>) => {
    setIsExtracting(true);
    try {
      // In a real app, this would call the templates API
      console.log('Saving template:', template);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add success insight
      const successInsight: AIInsight = {
        id: `template_saved_${Date.now()}`,
        type: 'success',
        title: 'Template Saved Successfully',
        description: `"${template.title}" has been saved to your template library.`,
        confidence: 100,
        impact: 'high',
        actionable: false,
        metadata: {
          category: 'Template Management',
          tags: ['template-saved', 'success'],
          estimatedTimeToImplement: '0 minutes'
        }
      };

      setInsights(prev => [...prev, successInsight]);

      // Remove from extracted templates
      setExtractedTemplates(prev => prev.filter(t => t !== template));

      if (extractedTemplates.length <= 1) {
        setShowTemplateExtraction(false);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setChatError({
        status: 500,
        message: 'Failed to save template. Please try again.',
        retryable: true
      });
    } finally {
      setIsExtracting(false);
    }
  }, [extractedTemplates]);

  // Dismiss extracted template
  const dismissTemplate = useCallback((template: Partial<AppTemplate>) => {
    setExtractedTemplates(prev => prev.filter(t => t !== template));
    if (extractedTemplates.length <= 1) {
      setShowTemplateExtraction(false);
    }
  }, [extractedTemplates]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Copy to clipboard
  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  // Insert content to composer
  const handleInsertToComposer = useCallback((content: string) => {
    setInput(prev => prev + (prev ? '\n\n' : '') + content);
    textareaRef.current?.focus();
  }, []);

  // Apply insight/suggestion
  const handleApplyInsight = useCallback((insight: AIInsight) => {
    console.log('Applying insight:', insight);
    // In a real app, this would perform the insight action
  }, []);

  const handleApplySuggestion = useCallback((suggestion: AISuggestion) => {
    if (suggestion.improvedPrompt) {
      setInput(suggestion.improvedPrompt);
    } else {
      setInput(suggestion.suggestion);
    }
    textareaRef.current?.focus();
  }, []);

  // Dismiss functions
  const handleDismissInsight = useCallback((insightId: string) => {
    setInsights(prev => prev.filter(i => i.id !== insightId));
  }, []);

  const handleDismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  const handleRetryLastMessage = useCallback(() => {
    if (messages.length >= 2) {
      const lastUserMessage = messages[messages.length - 2];
      if (lastUserMessage.role === 'user') {
        setInput(lastUserMessage.content);
        // Remove the failed assistant message
        setMessages(prev => prev.slice(0, -1));
      }
    }
    setChatError(null);
  }, [messages]);

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header with connection status */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">AI Assistant</h1>
            <p className="text-xs text-gray-500">Powered by SSE Streaming</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ConnectionStatus
            isConnected={isConnected}
            isConnecting={isConnecting}
            error={connectionError ? { status: 500, message: connectionError.message } : null}
          />
          {extractedTemplates.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplateExtraction(!showTemplateExtraction)}
              className="text-blue-600 hover:text-blue-800"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              {extractedTemplates.length}
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <StreamingMessageBubble
              key={message.id}
              message={message}
              isStreaming={isStreaming && message.id === currentStreamingMessageId}
              streamingContent={message.id === currentStreamingMessageId ? streamingContent : undefined}
              showEgyptianLoader={showEgyptianLoader && message.id === currentStreamingMessageId}
              onCopy={handleCopy}
              onInsertToComposer={handleInsertToComposer}
            />
          ))}
        </AnimatePresence>

        {/* AI Insights Panel */}
        {insights.length > 0 && (
          <AIInsightsPanel
            insights={insights}
            onApply={handleApplyInsight}
            onDismiss={handleDismissInsight}
            onDismissAll={() => setInsights([])}
            className="mt-4"
          />
        )}

        {/* AI Suggestions Panel */}
        {suggestions.length > 0 && (
          <AISuggestionsPanel
            suggestions={suggestions}
            onApply={handleApplySuggestion}
            onCopy={handleCopy}
            onDismiss={handleDismissSuggestion}
            onDismissAll={() => setSuggestions([])}
            className="mt-4"
          />
        )}

        {/* Template Extraction Panel */}
        {showTemplateExtraction && extractedTemplates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Template Extraction</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplateExtraction(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </Button>
            </div>

            <div className="space-y-3">
              {extractedTemplates.map((template, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {template.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {template.description}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {template.category}
                        </span>
                        {template.tags?.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <Button
                        size="sm"
                        onClick={() => saveTemplate(template)}
                        disabled={isExtracting}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissTemplate(template)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {isExtracting && (
              <div className="mt-3 text-sm text-blue-700 flex items-center">
                <div className="animate-spin mr-2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                Saving template to your library...
              </div>
            )}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={isStreaming}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {isStreaming && (
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <div className="animate-pulse mr-2">●</div>
            Assistant is responding...
          </div>
        )}
      </div>

      {/* Error Toast */}
      <ErrorToast
        error={chatError}
        onRetry={handleRetryLastMessage}
        onDismiss={() => setChatError(null)}
      />
    </div>
  );
};