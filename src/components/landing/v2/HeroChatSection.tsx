'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Copy, Sparkles, CheckCircle2, RotateCcw, BookOpen, Lightbulb, TrendingUp, MessageSquare, Eye } from 'lucide-react';
import Eyehorus from '@/components/pharaonic/Eyehorus';
import { EgyptianLoadingAnimation } from '@/components/chat/EgyptianLoadingAnimation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { trackLanding, LANDING_EVENTS } from '@/lib/landing/analytics';
import { useSSECompletion } from '@/hooks/useSSECompletion';
import { COPY } from '@/lib/landing/copy';
import { slideUp, fadeIn } from '@/lib/landing/motion';
import { triggerGoldConfetti } from '@/lib/utils/confetti';
import Link from 'next/link';

const { hero } = COPY;

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: {
    processingTime?: number;
    tokens?: number;
    improvements?: number;
  };
}

interface OptimizationResult {
  original: string;
  optimized: string;
  improvements: string[];
  score: number;
  suggestions: string[];
}

export function HeroChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'initializing' | 'retrieving_context' | 'analyzing' | 'optimizing' | 'finalizing' | null>(null);
  const [progress, setProgress] = useState(0);
  const [showOptimization, setShowOptimization] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [eyeState, setEyeState] = useState<'idle' | 'processing' | 'thinking' | 'optimizing'>('idle');
  const [useSSE, setUseSSE] = useState(true); // Toggle between mock and real SSE

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortController = useRef<AbortController | null>(null);

  // SSE completion hook for real AI integration
  const sseCompletion = useSSECompletion();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle SSE streaming output
  useEffect(() => {
    if (useSSE && sseCompletion.isStreaming && sseCompletion.text) {
      // Update or create streaming message
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];

        if (lastMessage && lastMessage.type === 'assistant' && lastMessage.isStreaming) {
          // Update existing streaming message
          return prev.map((m, i) =>
            i === prev.length - 1
              ? { ...m, content: sseCompletion.text }
              : m
          );
        } else {
          // Create new streaming message
          return [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'assistant',
              content: sseCompletion.text,
              timestamp: new Date(),
              isStreaming: true,
            },
          ];
        }
      });

      // Update progress based on streaming
      if (sseCompletion.text.length > 0) {
        setProgress(Math.min(90, 40 + (sseCompletion.text.length / 50)));
        setLoadingStage('finalizing');
      }
    }

    // Handle completion
    if (!sseCompletion.isStreaming && sseCompletion.text && useSSE) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.type === 'assistant') {
          // Mark last message as completed
          return prev.map((m, i) =>
            i === prev.length - 1
              ? { ...m, isStreaming: false, metadata: { processingTime: sseCompletion.elapsed_time, tokens: sseCompletion.token_count } }
              : m
          );
        }
        return prev;
      });

      setProgress(100);
      setLoadingStage(null);
      setIsProcessing(false);
      setEyeState('idle');
      void triggerGoldConfetti({
        particleCount: 28,
        spread: 48,
        startVelocity: 24,
        origin: { y: 0.62 },
      });
    }

    // Handle errors
    if (sseCompletion.error && useSSE) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'assistant',
          content: `❌ Error: ${sseCompletion.error}`,
          timestamp: new Date(),
        },
      ]);
      setLoadingStage(null);
      setIsProcessing(false);
      setEyeState('idle');
    }
  }, [useSSE, sseCompletion.isStreaming, sseCompletion.text, sseCompletion.error, sseCompletion.elapsed_time, sseCompletion.token_count]);

  // Update Eye of Horus state based on processing
  useEffect(() => {
    if (isProcessing) {
      if (loadingStage === 'analyzing' || loadingStage === 'retrieving_context') {
        setEyeState('thinking');
      } else if (loadingStage === 'optimizing') {
        setEyeState('optimizing');
      } else {
        setEyeState('processing');
      }
    } else {
      setEyeState('idle');
    }
  }, [isProcessing, loadingStage]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackLanding(LANDING_EVENTS.HERO_OPTIMIZER_COPY, { action: 'copy_response' });
  }, []);

  const simulateProgress = useCallback(async () => {
    const stages: Array<{ stage: typeof loadingStage; duration: number }> = [
      { stage: 'initializing', duration: 500 },
      { stage: 'retrieving_context', duration: 1000 },
      { stage: 'analyzing', duration: 1500 },
      { stage: 'optimizing', duration: 2000 },
      { stage: 'finalizing', duration: 500 },
    ];

    // Use real SSE if enabled
    if (useSSE) {
      try {
        setLoadingStage('initializing');
        setProgress(10);

        // Call SSE endpoint
        await sseCompletion.start({
          messages: messages.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
          stream: true,
        });

        // Stream response will be handled by effect below
      } catch (error) {
        console.error('SSE error:', error);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'assistant',
            content: `❌ Error: Unable to connect to AI. Please try again.`,
            timestamp: new Date(),
            metadata: {
              processingTime: 0,
            },
          },
        ]);
        setLoadingStage(null);
        setIsProcessing(false);
        setEyeState('idle');
      }
      return;
    }

    // Fallback to mock simulation
    let currentIndex = 0;
    const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);

    const updateProgress = () => {
      if (currentIndex < stages.length) {
        setLoadingStage(stages[currentIndex].stage);
        const progressSoFar = stages.slice(0, currentIndex + 1).reduce((sum, s) => sum + s.duration, 0);
        setProgress(Math.round((progressSoFar / totalDuration) * 100));

        currentIndex++;
        setTimeout(updateProgress, stages[currentIndex - 1].duration);
      } else {
        setProgress(100);
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              type: 'assistant',
              content: `✨ Here's the knowledge from my analysis:\n\n## Key Insights:\n- **Clarity**: Your prompt is now ${Math.floor(Math.random() * 30 + 70)}% more specific\n- **Context**: Added relevant domain knowledge\n- **Structure**: Follows AI prompt engineering best practices\n\n## Optimized Version:\n${input}\n\n## Suggested Improvements:\n1. Be more specific about your desired outcome\n2. Include examples of what you want\n3. Specify any constraints or preferences\n\n## Why This Works Better:\nThe optimized prompt reduces ambiguity and provides the AI with clearer guidance, leading to more accurate and useful responses.`,
              timestamp: new Date(),
              metadata: {
                processingTime: 4500,
                improvements: Math.floor(Math.random() * 5 + 3),
              },
            },
          ]);
          setLoadingStage(null);
          setIsProcessing(false);
          setEyeState('idle');
        }, 500);
      }
    };

    updateProgress();
  }, [input, useSSE, messages, sseCompletion]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isProcessing) return;

    trackLanding(LANDING_EVENTS.HERO_OPTIMIZER_SUBMIT, { inputLength: text.length });

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: text,
        timestamp: new Date(),
      },
    ]);

    setInput('');
    setIsProcessing(true);
    setShowOptimization(false);

    // Simulate AI processing with Pharaonic loading
    simulateProgress();
  }, [input, isProcessing, simulateProgress]);

  const handleOptimize = useCallback(() => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'user') {
      const optimizedVersion = `As a ${lastMessage.content.includes('Create') || lastMessage.content.includes('Write') || lastMessage.content.includes('Generate') ? 'creative AI assistant' : 'knowledgeable guide'}, I want you to ${lastMessage.content.toLowerCase()}\n\nContext: This request is for professional AI interaction, aiming for clear, actionable, and high-quality output.\n\nRequirements:\n- Provide specific and detailed response\n- Include relevant examples\n- Maintain professional tone\n- Focus on practical application\n- Address potential edge cases`;

      setOptimizationResult({
        original: lastMessage.content,
        optimized: optimizedVersion,
        improvements: [
          'Added context about the AI assistant persona',
          'Specified requirements for quality output',
          'Included focus on examples and edge cases',
          'Clarified the goal of the request',
        ],
        score: 8.5,
        suggestions: [
          'Consider adding specific formatting requirements',
          'Mention any constraints or limitations',
          'Include preferred style or tone guidelines',
        ],
      });
      setShowOptimization(true);
      void triggerGoldConfetti({
        particleCount: 20,
        spread: 36,
        startVelocity: 18,
        origin: { y: 0.7 },
      });
      trackLanding(LANDING_EVENTS.HERO_OPTIMIZER_SUBMIT, { action: 'optimize_prompt' });
    }
  }, [messages]);

  const handleRetry = useCallback(() => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.type === 'user');
      if (lastUserMessage) {
        setInput(lastUserMessage.content);
        setMessages(prev => prev.slice(0, -1)); // Remove last AI response
        trackLanding(LANDING_EVENTS.HERO_OPTIMIZER_SUBMIT, { action: 'retry' });
      }
    }
  }, [messages]);

  return (
    <section
      id="hero-section"
      className="landing-hero-bg relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-16 md:py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #fdf8f0 0%, #f5efe3 100%)',
      }}
    >
      {/* Subtle geometric background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #d4a853 0px, #d4a853 1px, transparent 1px, transparent 40px),
                            repeating-linear-gradient(-45deg, #d4a853 0px, #d4a853 1px, transparent 1px, transparent 40px)`,
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header with Eye of Horus */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-4 mb-4">
            <Eyehorus
              size={64}
              animated={true}
              glowIntensity="high"
              glow={true}
            />
            <div className="text-left">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-sand-900 mb-2 leading-tight">
                {hero.headline}
              </h1>
              <p className="font-display text-lg sm:text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r from-[#CBA135] to-[#d4a853] bg-clip-text text-transparent">
                {hero.headlineGradient}
              </p>
              <p className="font-body text-base text-sand-600 max-w-xl leading-relaxed">
                {hero.subtitle}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Chat Interface */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-[#161A22] rounded-2xl border-2 border-sand-200 shadow-temple overflow-hidden max-w-3xl mx-auto"
        >
          {/* Chat Messages Area */}
          <div className="h-[400px] overflow-y-auto p-6 space-y-4">
            <AnimatePresence mode="wait">
              {messages.length === 0 && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="text-sand-400 mb-4">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Paste your prompt below to get started</p>
                    <p className="text-xs mt-2">AI will analyze, optimize, and provide knowledge from iteration</p>
                  </div>
                </motion.div>
              )}

              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gradient-to-br from-royal-gold-400 to-royal-gold-600 text-white'
                  }`}>
                    {message.type === 'user' ? (
                      <MessageSquare className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-2xl ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`relative inline-block px-4 py-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-stone-50 dark:bg-[#1C1F26] text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-[#2A2E38]'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed text-sm">
                        {message.content}
                        {message.isStreaming && (
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="ml-1"
                          >
                            ▋
                          </motion.span>
                        )}
                      </div>

                      {/* Metadata */}
                      {message.metadata && (
                        <div className="mt-2 text-xs text-sand-500 space-y-1">
                          {message.metadata.processingTime && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Processed in {message.metadata.processingTime}ms</span>
                            </div>
                          )}
                          {message.metadata.improvements && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{message.metadata.improvements} improvements applied</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {message.type === 'assistant' && !message.isStreaming && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center gap-2 mt-3"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(message.content)}
                            className="h-8"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            {copied ? 'Copied!' : 'Copy'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowOptimization(!showOptimization)}
                            className="h-8"
                          >
                            <Lightbulb className="w-3 h-3 mr-1" />
                            {showOptimization ? 'Hide' : 'Optimize'}
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Optimization Panel */}
            <AnimatePresence>
              {showOptimization && optimizationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 border-t border-sand-200 pt-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-royal-gold-600" />
                      <h3 className="font-semibold text-lg text-sand-900">Prompt Optimization</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-semibold text-sand-700">Original:</span>
                        <p className="mt-1 text-sand-600 italic bg-sand-50 dark:bg-[#1C1F26] p-2 rounded">
                          {optimizationResult.original}
                        </p>
                      </div>

                      <div className="text-sm">
                        <span className="font-semibold text-sand-700">Optimized (Score: {optimizationResult.score}/10):</span>
                        <p className="mt-1 text-stone-700 bg-green-50 dark:bg-green-900/10 p-2 rounded border border-green-200 dark:border-green-800">
                          {optimizationResult.optimized}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-sand-700 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Improvements Applied:
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {optimizationResult.improvements.map((improvement, i) => (
                          <li key={i} className="flex items-start gap-2 text-sand-600">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-sand-700 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Suggestions:
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {optimizationResult.suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2 text-sand-600">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleCopy(optimizationResult.optimized)}
                        variant="default"
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Optimized
                      </Button>
                      <Button
                        onClick={handleRetry}
                        variant="outline"
                        className="flex-1"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Use This Version
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pharaonic Loading */}
            <AnimatePresence>
              {isProcessing && loadingStage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="my-8"
                >
                  <EgyptianLoadingAnimation
                    stage={loadingStage}
                    progress={progress}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-sand-200 p-4 bg-stone-50 dark:bg-[#14161B]">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Paste your prompt here and press Enter, or click Send..."
                rows={3}
                className="resize-none text-sm"
                disabled={isProcessing}
              />
              <Button
                onClick={handleSend}
                disabled={isProcessing || !input.trim()}
                className="self-end h-auto min-h-[76px] px-6"
                size="lg"
              >
                <Send className="w-5 h-5 mr-2" />
                {isProcessing ? 'Sending...' : 'Send'}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-sand-500">
              <p>Eye of Horus will analyze and optimize your prompt</p>
              <p>Press Shift+Enter for new line</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
        >
          <Link href="/auth/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              onClick={() => trackLanding(LANDING_EVENTS.HERO_CTA_CLICK, { cta: 'primary' })}
              className="w-full sm:w-auto bg-gradient-to-r from-[#CBA135] to-[#d4a853] hover:from-[#b8922f] hover:to-[#c9a048] dark:from-[#E9C25A] dark:to-[#CBA135] dark:hover:from-[#d4b44e] dark:hover:to-[#b8922f]"
            >
              {hero.ctaPrimary}
            </Button>
          </Link>
          <Link href="/template-library" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              onClick={() => trackLanding(LANDING_EVENTS.LIBRARY_CARD_CLICK, { source: 'hero' })}
              className="w-full sm:w-auto"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Templates
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroChatSection;
