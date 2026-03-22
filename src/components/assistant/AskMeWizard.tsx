'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Send,
  Copy,
  RotateCcw,
  CheckCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
  Wand2,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useStartAskMe, useSubmitAllAskMe } from '@/hooks/api/useAskMe';
import { handleApiError } from '@/lib/errors/handle-api-error';
import { CostPreviewPill } from '@/components/credits/CostPreviewPill';
import { useCreditsStore } from '@/store/credits';
import type { AskMeSession, AskMeSubmitAllResult } from '@/lib/api/typed-client';

// ─── Types ─────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'questions' | 'building' | 'result';

// ─── Sub-components ────────────────────────────────────────────────────────

function QABubble({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="bg-muted/50 border rounded-lg px-4 py-2 text-sm max-w-prose">
          {question}
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm max-w-prose">
          {answer}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function AskMeWizard({ className }: { className?: string }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  const [session, setSession] = useState<AskMeSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [firstUserQuestionIndex, setFirstUserQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [localAnswers, setLocalAnswers] = useState<Map<string, string>>(new Map());
  const [missingQids, setMissingQids] = useState<string[]>([]);
  const [finalResult, setFinalResult] = useState<AskMeSubmitAllResult | null>(null);

  // Streaming compose state
  const [streamedText, setStreamedText] = useState('');
  const [streamStatus, setStreamStatus] = useState<'idle' | 'thinking' | 'streaming' | 'done'>('idle');
  const eventSourceRef = useRef<EventSource | null>(null);

  // Q&A history for chat-style display
  const [history, setHistory] = useState<Array<{ question: string; answer: string }>>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const startMutation = useStartAskMe();
  const submitAllMutation = useSubmitAllAskMe();
  const deductOptimistic = useCreditsStore((s) => s.deductOptimistic);
  const refundOptimistic = useCreditsStore((s) => s.refundOptimistic);

  // Scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [history.length, phase, streamedText]);

  // Focus input when question changes
  useEffect(() => {
    if (phase === 'questions') inputRef.current?.focus();
  }, [phase, currentQuestionIndex]);

  // Cleanup EventSource on unmount
  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  // ---- Reset ----
  const reset = useCallback(() => {
    stopStream();
    setPhase('idle');
    setGoal('');
    setContext('');
    setSession(null);
    setCurrentQuestionIndex(0);
    setFirstUserQuestionIndex(0);
    setCurrentAnswer('');
    setLocalAnswers(new Map());
    setMissingQids([]);
    setFinalResult(null);
    setStreamedText('');
    setStreamStatus('idle');
    setHistory([]);
  }, [stopStream]);

  // ---- Step 1: Start session (POST /askme/start/) ----
  const handleStart = async () => {
    if (!goal.trim()) return;
    try {
      const result = await startMutation.mutateAsync({
        goal: goal.trim(),
        context: context.trim() || undefined,
      });
      setSession(result);
      const firstUnanswered = result.questions.findIndex((q) => !q.is_answered);
      const startIdx = firstUnanswered >= 0 ? firstUnanswered : 0;
      setCurrentQuestionIndex(startIdx);
      setFirstUserQuestionIndex(startIdx);
      setCurrentAnswer('');
      setHistory([]);
      setPhase('questions');
    } catch (err) {
      handleApiError(err as Error, 'askme_start');
    }
  };

  // ---- Step 2: Store answer locally and advance ----
  const handleAnswer = () => {
    if (!session || !currentAnswer.trim()) return;
    const currentQ = session.questions[currentQuestionIndex];
    const answerText = currentAnswer.trim();

    // Record in local answers map
    const newAnswers = new Map(localAnswers);
    newAnswers.set(currentQ.qid, answerText);
    setLocalAnswers(newAnswers);
    setMissingQids((prev) => prev.filter((id) => id !== currentQ.qid));

    // Add to chat history
    setHistory((prev) => [...prev, { question: currentQ.title, answer: answerText }]);

    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < session.questions.length) {
      setCurrentQuestionIndex(nextIdx);
      setCurrentAnswer('');
    } else {
      setCurrentAnswer('');
      handleSubmitAll(newAnswers);
    }
  };

  // ---- Start compose stream (GET EventSource with JWT token) ----
  const startComposeStream = useCallback(
    (sessionId: string, result: AskMeSubmitAllResult) => {
      stopStream();
      setStreamedText('');
      setStreamStatus('thinking');

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const url = `${baseUrl}/api/v2/ai/askme/stream/?session_id=${encodeURIComponent(sessionId)}&mode=compose${token ? `&token=${encodeURIComponent(token)}` : ''}`;

      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.addEventListener('thinking', () => {
        setStreamStatus('thinking');
      });

      es.addEventListener('token', (e: MessageEvent) => {
        setStreamStatus('streaming');
        try {
          const data = JSON.parse(e.data);
          setStreamedText((prev) => prev + (data.t || ''));
        } catch {
          setStreamedText((prev) => prev + e.data);
        }
      });

      es.addEventListener('prompt_done', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.content) setStreamedText(data.content);
        } catch { /* ignore */ }
        setStreamStatus('done');
      });

      es.addEventListener('status', () => {});

      es.addEventListener('complete', () => {
        es.close();
        eventSourceRef.current = null;
        setStreamStatus('done');
        setTimeout(() => {
          setFinalResult(result);
          setPhase('result');
        }, 800);
      });

      es.addEventListener('error', () => {
        es.close();
        eventSourceRef.current = null;
        setFinalResult(result);
        setPhase('result');
      });

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        setFinalResult(result);
        setPhase('result');
      };
    },
    [stopStream],
  );

  // ---- Step 3: Submit all answers (POST /askme/submit-all/) ----
  const handleSubmitAll = async (answers?: Map<string, string>) => {
    if (!session) return;
    const answersMap = answers ?? localAnswers;

    const missingRequired = session.questions
      .slice(firstUserQuestionIndex)
      .filter((q) => q.required && !answersMap.has(q.qid))
      .map((q) => q.qid);

    if (missingRequired.length > 0) {
      setMissingQids(missingRequired);
      toast.error('Please answer all required questions.');
      return;
    }

    deductOptimistic(3);
    setPhase('building');

    const answersList = Array.from(answersMap.entries()).map(([qid, value]) => ({ qid, value }));

    try {
      const result = await submitAllMutation.mutateAsync({
        session_id: session.session_id,
        answers: answersList,
      });
      startComposeStream(session.session_id, result);
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: Record<string, unknown> };

      if (apiErr?.status === 409) {
        const existing = apiErr?.data ?? {};
        if (existing.prompt) {
          setFinalResult({ session_id: session.session_id, ...(existing as Partial<AskMeSubmitAllResult>) } as AskMeSubmitAllResult);
          setPhase('result');
          toast.info('Session already completed — showing your existing prompt.');
          return;
        }
      }

      if (apiErr?.status === 400) {
        const missing = (apiErr?.data as { missing_qids?: string[] })?.missing_qids;
        if (missing?.length) setMissingQids(missing);
        refundOptimistic(3);
        setPhase('questions');
        toast.error('Some required questions are missing.');
        return;
      }

      refundOptimistic(3);
      setPhase('questions');
      handleApiError(err as Error, 'askme_submit_all');
    }
  };

  const handleCopy = () => {
    if (!finalResult?.prompt) return;
    navigator.clipboard.writeText(finalResult.prompt);
    toast.success('Prompt copied to clipboard');
  };

  // ============================================
  // Render
  // ============================================

  const currentQ = session?.questions[currentQuestionIndex];
  const isChoice = currentQ?.kind === 'choice' && Array.isArray(currentQ.options) && currentQ.options.length > 0;
  const userQuestionNumber = currentQuestionIndex - firstUserQuestionIndex + 1;
  const totalUserQuestions = session ? session.questions.length - firstUserQuestionIndex : 0;
  const isLastQuestion = session ? currentQuestionIndex >= session.questions.length - 1 : false;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Guided Prompt Builder
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Answer a few questions and let the AI craft the perfect prompt for you.
        </p>
      </div>

      {/* ── Phase: idle — Goal Input ── */}
      {phase === 'idle' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            What would you like to create? <span className="text-destructive">*</span>
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleStart();
            }}
            placeholder="e.g. A professional email declining a client request, a Python function that parses JSON, marketing copy for a new SaaS product…"
            rows={3}
            className="w-full p-4 border rounded-lg resize-none text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Additional context (optional): target audience, tone, industry…"
            rows={2}
            className="w-full p-3 border rounded-lg resize-none text-sm bg-background text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <Button
            onClick={handleStart}
            disabled={!goal.trim() || startMutation.isPending}
            className="w-full flex items-center gap-2"
            size="lg"
          >
            {startMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {startMutation.isPending ? 'Preparing questions…' : 'Start Guided Build'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">Ctrl+Enter to start</p>
        </div>
      )}

      {/* ── Phase: questions — Q&A Conversation ── */}
      {phase === 'questions' && session && currentQ && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Question {userQuestionNumber} of {totalUserQuestions}
            </Badge>
            <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(userQuestionNumber / totalUserQuestions) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {missingQids.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Please answer all required questions before generating.</span>
            </div>
          )}

          {/* Previous Q&A history */}
          {history.map((pair, i) => (
            <QABubble key={i} question={pair.question} answer={pair.answer} />
          ))}

          {/* Current question */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className={cn(
              'border rounded-lg px-4 py-3 text-sm max-w-prose',
              missingQids.includes(currentQ.qid)
                ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20'
                : 'bg-muted/50',
            )}>
              <p className="font-medium">{currentQ.title}</p>
              {currentQ.help_text && (
                <p className="text-xs text-muted-foreground mt-1">{currentQ.help_text}</p>
              )}
              {currentQ.required && (
                <span className="text-xs text-red-500 mt-1 block">Required</span>
              )}
            </div>
          </div>

          {/* Answer input */}
          <div className="pl-10">
            {isChoice ? (
              <div className="flex flex-col gap-2">
                {currentQ.options!.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCurrentAnswer(opt)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors',
                      currentAnswer === opt
                        ? 'border-primary bg-primary/10 font-medium'
                        : 'border-border bg-background hover:bg-muted',
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                ref={inputRef}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAnswer();
                  }
                }}
                placeholder="Your answer… (Enter to submit)"
                rows={2}
                className="w-full p-3 text-sm border rounded-lg resize-none bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pl-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (currentQuestionIndex <= firstUserQuestionIndex) {
                  reset();
                } else {
                  const prevQ = session.questions[currentQuestionIndex - 1];
                  if (prevQ) {
                    setLocalAnswers((prev) => {
                      const next = new Map(prev);
                      next.delete(prevQ.qid);
                      return next;
                    });
                  }
                  setHistory((prev) => prev.slice(0, -1));
                  setCurrentQuestionIndex((i) => i - 1);
                  setCurrentAnswer('');
                }
              }}
            >
              ← Back
            </Button>
            <Button
              onClick={handleAnswer}
              disabled={!currentAnswer.trim() || submitAllMutation.isPending}
              className="flex-1 flex items-center gap-2"
              size="sm"
            >
              {submitAllMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isLastQuestion ? 'Build My Prompt' : 'Next'}
            </Button>
          </div>

          {isLastQuestion && (
            <div className="flex justify-center">
              <CostPreviewPill feature="askme_submit_all" size="sm" />
            </div>
          )}
        </div>
      )}

      {/* ── Phase: building — Streaming typewriter ── */}
      {phase === 'building' && (
        <div className="space-y-4">
          {/* Previous Q&A */}
          {history.map((pair, i) => (
            <QABubble key={i} question={pair.question} answer={pair.answer} />
          ))}

          {/* Building indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Wand2 className={cn('h-5 w-5 text-primary', streamStatus !== 'done' && 'animate-pulse')} />
            </div>
            <div>
              <p className="font-semibold text-sm">
                {streamStatus === 'done'
                  ? 'Prompt composed!'
                  : streamedText.length > 0
                  ? 'Composing your prompt…'
                  : 'AI is thinking…'}
              </p>
              <p className="text-xs text-muted-foreground">
                {streamedText.length > 0 ? 'Streaming live from AI' : 'Analyzing your answers'}
              </p>
            </div>
          </div>

          {/* Streaming text */}
          <div className="rounded-lg border bg-muted/30 p-4 font-mono text-sm leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap min-h-[6rem]">
            {streamedText.length > 0 ? (
              <>
                {streamedText}
                {streamStatus === 'streaming' && (
                  <motion.span
                    className="inline-block w-[2px] h-4 bg-primary ml-0.5 align-text-bottom"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                  />
                )}
              </>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}
          </div>

          {streamedText.length > 0 && streamStatus === 'streaming' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>{streamedText.length} characters generated</span>
            </div>
          )}
        </div>
      )}

      {/* ── Phase: result — Final Prompt ── */}
      {phase === 'result' && finalResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold text-sm">Your prompt is ready!</span>
            </div>
            <div className="flex items-center gap-2">
              {finalResult.quality_score != null && (
                <Badge
                  className={cn(
                    'text-xs',
                    finalResult.quality_score >= 8
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : finalResult.quality_score >= 5
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-red-100 text-red-800',
                  )}
                >
                  {finalResult.quality_score.toFixed(1)}/10
                </Badge>
              )}
              <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            </div>
          </div>

          {/* Spec completeness */}
          {(finalResult.comparison?.spec_completeness ?? finalResult.spec_completeness) != null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Spec coverage</span>
                <span>{finalResult.comparison?.spec_completeness ?? finalResult.spec_completeness}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    (finalResult.comparison?.spec_completeness ?? finalResult.spec_completeness ?? 0) >= 80
                      ? 'bg-green-500'
                      : (finalResult.comparison?.spec_completeness ?? finalResult.spec_completeness ?? 0) >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500',
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${finalResult.comparison?.spec_completeness ?? finalResult.spec_completeness ?? 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Final prompt */}
          <div className="relative group">
            <pre className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
              {finalResult.prompt}
            </pre>
          </div>

          {finalResult.explanation && (
            <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2">
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                {finalResult.explanation}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-1.5">
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
            {finalResult.prompt_history_id ? (
              <a
                href="/library"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View in Library
              </a>
            ) : (
              <div className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
                <CheckCircle className="h-3.5 w-3.5" />
                Saved to Library
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={reset} title="Start over">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
