'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ChevronDown, ChevronUp, Sparkles, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PromptEditorLite } from './PromptEditorLite';
import { EgyptianLoadingLight } from './EgyptianLoadingLight';
import { AIInsightCard } from './AIInsightCard';
import { AISuggestionCard } from './AISuggestionCard';
import { sseClient } from '@/lib/tryme/sseClient';
import { renderSafeMarkdown } from '@/lib/tryme/sanitize';
import { getGuestSessionId } from '@/lib/tryme/session';
import { ragInsights } from '@/lib/tryme/insights';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface OptimizationResult {
  before: string;
  after: string;
  insights: Array<{ text: string; confidence: number }>;
  suggestions: string[];
}

interface ChatInterfaceProps {
  onClose: () => void;
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [successfulCompletions, setSuccessfulCompletions] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [latency, setLatency] = useState<number | undefined>();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamBuffer, scrollToBottom]);

  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = async () => {
    if (!currentPrompt.trim() || isThinking) return;

    const promptToOptimize = currentPrompt.trim();
    addMessage('user', promptToOptimize);
    setCurrentPrompt('');
    setIsThinking(true);
    setStreamBuffer('');
    setOptimizationResult(null);
    startTimeRef.current = performance.now();

    const context = {
      currentPrompt: promptToOptimize,
      recentPrompts,
    };

    const relevantContext = ragInsights.generateRelevantContext(context);

    try {
      await sseClient.optimizePrompt(
        {
          prompt: promptToOptimize,
          guest_session_id: getGuestSessionId(),
          model: 'deepseek-chat',
          temperature: 0.7,
          max_tokens: 512,
        },
        {
          onStart: () => {
            setIsThinking(true);
          },
          onToken: ({ token }) => {
            setStreamBuffer(prev => prev + token);
          },
          onInsight: ({ items }) => {
            setOptimizationResult(prev => prev ? { ...prev, insights: items } : {
              before: promptToOptimize,
              after: '',
              insights: items,
              suggestions: [],
            });
          },
          onSuggestions: ({ items }) => {
            setOptimizationResult(prev => prev ? { ...prev, suggestions: items } : {
              before: promptToOptimize,
              after: '',
              insights: [],
              suggestions: items,
            });
          },
          onResult: ({ after }) => {
            setOptimizationResult(prev => prev ? { ...prev, after } : {
              before: promptToOptimize,
              after,
              insights: [],
              suggestions: [],
            });
          },
          onComplete: () => {
            setIsThinking(false);
            if (startTimeRef.current) {
              setLatency(performance.now() - startTimeRef.current);
            }

            // Add to messages
            if (streamBuffer) {
              addMessage('assistant', streamBuffer);
            }

            // Update tracking
            setSuccessfulCompletions(prev => {
              const newCount = prev + 1;
              if (newCount >= 3 && !showCTA) {
                setShowCTA(true);
              }
              return newCount;
            });

            // Update recent prompts
            setRecentPrompts(prev => ragInsights.addToRecentPrompts(prev, promptToOptimize));

            setStreamBuffer('');
          },
          onError: ({ message }) => {
            setIsThinking(false);
            addMessage('assistant', `Sorry, there was an error: ${message}`);
            setStreamBuffer('');
          },
        }
      );
    } catch (error) {
      setIsThinking(false);
      addMessage('assistant', 'Sorry, something went wrong. Please try again.');
      setStreamBuffer('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const newPrompt = currentPrompt ? `${currentPrompt}\n\n${suggestion}` : suggestion;
    setCurrentPrompt(newPrompt);
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateContextualSuggestions = () => {
    const context = { currentPrompt, recentPrompts };
    return ragInsights.generateSuggestions(context);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[80%] rounded-lg px-4 py-3 text-sm
                ${message.type === 'user'
                  ? 'bg-[#6366F1] text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                }
              `}
            >
              <div dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(message.content) }} />
            </div>
          </motion.div>
        ))}

        {/* Streaming Message */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[80%] rounded-lg px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              {streamBuffer ? (
                <div aria-live="polite">
                  <div dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(streamBuffer) }} />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <EgyptianLoadingLight size="sm" />
                  <span className="text-gray-600 dark:text-gray-400">Assistant is thinking...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Optimization Result Cards */}
        <AnimatePresence>
          {optimizationResult && !isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Insights */}
              {optimizationResult.insights.length > 0 && (
                <AIInsightCard items={optimizationResult.insights} />
              )}

              {/* Suggestions */}
              {optimizationResult.suggestions.length > 0 && (
                <AISuggestionCard
                  items={optimizationResult.suggestions}
                  onSuggestionClick={handleSuggestionClick}
                />
              )}

              {/* Before & After */}
              {optimizationResult.after && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Before & After Comparison</span>
                    </div>
                    {showBeforeAfter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  <AnimatePresence>
                    {showBeforeAfter && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Original</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(optimizationResult.before, 'before')}
                                className="h-6 w-6 p-0"
                              >
                                {copiedStates.before ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                              {optimizationResult.before}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-green-600">Optimized</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(optimizationResult.after, 'after')}
                                className="h-6 w-6 p-0"
                              >
                                {copiedStates.after ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
                              {optimizationResult.after}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Banner */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                <UserPlus className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    <strong>Love what you see?</strong> Sign up to unlock 100+ advanced features, save your work, and access the full template library.
                  </span>
                  <Button size="sm" asChild className="ml-4">
                    <a href="/auth/register">Sign Up for Free</a>
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contextual Suggestions */}
        {!isThinking && currentPrompt && (
          <AISuggestionCard
            items={generateContextualSuggestions()}
            onSuggestionClick={handleSuggestionClick}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <PromptEditorLite
          value={currentPrompt}
          onChange={setCurrentPrompt}
          onSubmit={handleSubmit}
          isLoading={isThinking}
          latency={latency}
          placeholder="Enter your prompt to optimize..."
        />
      </div>
    </div>
  );
}