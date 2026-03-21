'use client';

/**
 * AskMe — Guided AI Prompt Builder Modal
 * Walks the user through a multi-step Q&A powered by DeepSeek
 * to generate a high-quality, personalized prompt.
 *
 * Flow: goal → questions (local collection) → submit-all → result
 * Cost: 2 credits (start) + 3 credits (submit-all) = 5 total
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ChevronRight,
  RotateCcw,
  Copy,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Wand2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStartAskMe, useSubmitAllAskMe } from '@/hooks/api/useAskMe';
import { handleApiError } from '@/lib/errors/handle-api-error';
import { CostPreviewPill } from '@/components/credits/CostPreviewPill';
import { useCreditsStore } from '@/store/credits';
import type { AskMeSession, AskMeSubmitAllResult } from '@/lib/api/typed-client';

// ============================================
// Types
// ============================================

type Step = 'goal' | 'questions' | 'building' | 'result';

interface AskMeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================
// Step indicators
// ============================================

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'goal', label: 'Your Goal' },
    { key: 'questions', label: 'Q&A' },
    { key: 'building', label: 'Building' },
    { key: 'result', label: 'Result' },
  ];

  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, i) => (
        <React.Fragment key={step.key}>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i < currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : i === currentIndex
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < currentIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                i === currentIndex ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px ${i < currentIndex ? 'bg-primary' : 'bg-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================
// Main Modal
// ============================================

export function AskMeModal({ open, onOpenChange }: AskMeModalProps) {
  const [step, setStep] = useState<Step>('goal');
  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  const [session, setSession] = useState<AskMeSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [firstUserQuestionIndex, setFirstUserQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Local answer collection — no per-answer API cost
  const [localAnswers, setLocalAnswers] = useState<Map<string, string>>(new Map());
  const [missingQids, setMissingQids] = useState<string[]>([]);

  const [finalResult, setFinalResult] = useState<AskMeSubmitAllResult | null>(null);

  // Streaming compose state
  const [streamedText, setStreamedText] = useState('');
  const [streamStatus, setStreamStatus] = useState<'idle' | 'thinking' | 'streaming' | 'done'>('idle');
  const eventSourceRef = useRef<EventSource | null>(null);

  const startMutation = useStartAskMe();
  const submitAllMutation = useSubmitAllAskMe();
  const deductOptimistic = useCreditsStore((s) => s.deductOptimistic);
  const refundOptimistic = useCreditsStore((s) => s.refundOptimistic);

  // ---- Cleanup streaming ----
  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // ---- Reset ----
  const reset = useCallback(() => {
    stopStream();
    setStep('goal');
    setGoal('');
    setContext('');
    setSession(null);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setLocalAnswers(new Map());
    setMissingQids([]);
    setFinalResult(null);
    setStreamedText('');
    setStreamStatus('idle');
  }, [stopStream]);

  // Cleanup on unmount
  useEffect(() => () => stopStream(), [stopStream]);

  const handleOpenChange = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  // ---- Step 1: Start session ----
  const handleStart = async () => {
    if (!goal.trim()) {
      toast.error('Please describe what you want this prompt to do');
      return;
    }
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
      setStep('questions');
    } catch (err) {
      handleApiError(err as Error, 'askme_start');
    }
  };

  // ---- Step 2: Store answer locally and advance ----
  const handleAnswer = () => {
    if (!session || !currentAnswer.trim()) {
      toast.error('Please provide an answer before continuing');
      return;
    }
    const currentQ = session.questions[currentQuestionIndex];
    const newAnswers = new Map(localAnswers);
    newAnswers.set(currentQ.qid, currentAnswer.trim());
    setLocalAnswers(newAnswers);
    setMissingQids((prev) => prev.filter((id) => id !== currentQ.qid));

    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < session.questions.length) {
      setCurrentQuestionIndex(nextIdx);
      setCurrentAnswer('');
    } else {
      // All questions answered — proceed to submit-all
      setCurrentAnswer('');
      handleSubmitAll(newAnswers);
    }
  };

  // ---- Start compose stream (typewriter effect via GET EventSource) ----
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

      es.addEventListener('thinking', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          // data.step contains status message like "Crafting your optimized prompt..."
          void data;
        } catch { /* ignore */ }
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
          // Replace accumulated text with the final complete prompt for safety
          if (data.content) setStreamedText(data.content);
        } catch { /* ignore */ }
        setStreamStatus('done');
      });

      es.addEventListener('status', () => {
        // data.is_complete, data.can_finalize — informational only
      });

      es.addEventListener('complete', () => {
        es.close();
        eventSourceRef.current = null;
        setStreamStatus('done');
        // Brief pause so user sees the full prompt before transitioning
        setTimeout(() => {
          setFinalResult(result);
          setStep('result');
        }, 800);
      });

      es.addEventListener('error', () => {
        // SSE error event from server — fallback to result
        es.close();
        eventSourceRef.current = null;
        setFinalResult(result);
        setStep('result');
      });

      es.onerror = () => {
        // EventSource connection error — fallback to showing result immediately
        es.close();
        eventSourceRef.current = null;
        setFinalResult(result);
        setStep('result');
      };
    },
    [stopStream]
  );

  // ---- Step 3: Submit all answers at once ----
  const handleSubmitAll = async (answers?: Map<string, string>) => {
    if (!session) return;
    const answersMap = answers ?? localAnswers;

    // Check all required questions answered
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
    setStep('building');

    const answersList = Array.from(answersMap.entries()).map(([qid, value]) => ({ qid, value }));

    try {
      const result = await submitAllMutation.mutateAsync({
        session_id: session.session_id,
        answers: answersList,
      });
      // Start streaming typewriter effect instead of jumping to result
      startComposeStream(session.session_id, result);
    } catch (err: unknown) {
      const apiErr = err as { status?: number; data?: Record<string, unknown> };

      // 409 — already finalized
      if (apiErr?.status === 409) {
        const existing = apiErr?.data ?? {};
        if (existing.prompt) {
          setFinalResult({ session_id: session.session_id, ...(existing as Partial<AskMeSubmitAllResult>) } as AskMeSubmitAllResult);
          setStep('result');
          toast.info('Session already completed — showing your existing prompt.');
          return;
        }
      }

      // 400 — missing required qids from server
      if (apiErr?.status === 400) {
        const missing = (apiErr?.data as { missing_qids?: string[] })?.missing_qids;
        if (missing?.length) setMissingQids(missing);
        refundOptimistic(3);
        setStep('questions');
        toast.error('Some required questions are missing. Please review and try again.');
        return;
      }

      refundOptimistic(3);
      setStep('questions');
      handleApiError(err as Error, 'askme_submit_all');
    }
  };

  const handleCopy = () => {
    if (!finalResult) return;
    navigator.clipboard.writeText(finalResult.prompt);
    toast.success('Prompt copied to clipboard');
  };

  // ============================================
  // Render Steps
  // ============================================

  const renderGoal = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1.5">
          What should this prompt accomplish? <span className="text-destructive">*</span>
        </label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Write compelling product descriptions for an e-commerce store that boost conversions"
          rows={3}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleStart();
          }}
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5 text-muted-foreground">
          Additional context <span className="text-xs">(optional)</span>
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. Target audience, tone, industry, constraints…"
          rows={2}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-muted-foreground placeholder:text-muted-foreground/60"
        />
      </div>
      <Button
        onClick={handleStart}
        disabled={!goal.trim() || startMutation.isPending}
        className="w-full flex items-center gap-2"
      >
        {startMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {startMutation.isPending ? 'AI is preparing your questions…' : 'Start Building →'}
      </Button>
    </div>
  );

  const renderQuestions = () => {
    if (!session) return null;
    const current = session.questions[currentQuestionIndex];
    if (!current) return null;

    const userQuestionNumber = currentQuestionIndex - firstUserQuestionIndex + 1;
    const totalUserQuestions = session.questions.length - firstUserQuestionIndex;
    const isLastUserQuestion = currentQuestionIndex >= session.questions.length - 1;
    const isMissing = missingQids.includes(current.qid);

    const isChoice = current.kind === 'choice' && Array.isArray(current.options) && current.options.length > 0;

    return (
      <div className="space-y-4">
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

        <div className={`rounded-lg border p-4 ${isMissing ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : 'bg-muted/30'}`}>
          <p className="text-sm font-medium leading-relaxed">{current.title}</p>
          {current.help_text && (
            <p className="text-xs text-muted-foreground mt-1">{current.help_text}</p>
          )}
          {current.required && (
            <span className="text-xs text-red-500 mt-1 block">Required</span>
          )}
        </div>

        <div>
          {isChoice ? (
            <div className="flex flex-col gap-2">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCurrentAnswer(opt)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    currentAnswer === opt
                      ? 'border-primary bg-primary/10 text-foreground font-medium'
                      : 'border-border bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Your answer…"
                rows={3}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAnswer();
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">⌘/Ctrl + Enter to continue</p>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (currentQuestionIndex <= firstUserQuestionIndex) {
                setStep('goal');
                setSession(null);
              } else {
                // Go back: remove last answer from the map
                const prevQ = session.questions[currentQuestionIndex - 1];
                if (prevQ) {
                  setLocalAnswers((prev) => {
                    const next = new Map(prev);
                    next.delete(prevQ.qid);
                    return next;
                  });
                }
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
          >
            {submitAllMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {isLastUserQuestion ? 'Build My Prompt →' : 'Next Question →'}
          </Button>
        </div>
        {isLastUserQuestion && (
          <div className="flex justify-center">
            <CostPreviewPill feature="askme_submit_all" size="sm" />
          </div>
        )}
      </div>
    );
  };

  const renderBuilding = () => {
    const isThinking = streamStatus === 'thinking' || streamStatus === 'idle';
    const hasText = streamedText.length > 0;

    return (
      <div className="space-y-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Wand2 className={`h-5 w-5 text-primary ${streamStatus !== 'done' ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {isThinking && !hasText
                ? 'AI is thinking…'
                : streamStatus === 'done'
                ? 'Prompt composed!'
                : 'Composing your prompt…'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isThinking && !hasText
                ? 'Analyzing your answers'
                : streamStatus === 'done'
                ? 'Finalizing…'
                : 'Streaming live from AI'}
            </p>
          </div>
        </div>

        {/* Streaming text area */}
        <div className="rounded-lg border bg-muted/30 p-4 font-mono text-sm leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap min-h-[6rem]">
          {hasText ? (
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

        {/* Progress hint */}
        {hasText && streamStatus === 'streaming' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>{streamedText.length} characters generated</span>
          </motion.div>
        )}
      </div>
    );
  };

  const renderResult = () => {
    if (!finalResult) return null;
    const specCompleteness =
      finalResult.comparison?.spec_completeness ?? finalResult.spec_completeness;
    const originalIntent =
      finalResult.comparison?.original_intent ?? finalResult.original_intent;

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            <p className="font-semibold text-sm">Your prompt is ready!</p>
          </div>
          <div className="flex items-center gap-2">
            {finalResult.quality_score != null && (
              <Badge
                className={`text-xs ${
                  finalResult.quality_score >= 8
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : finalResult.quality_score >= 5
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                ✦ {finalResult.quality_score.toFixed(1)}/10
              </Badge>
            )}
            {finalResult.credits_used != null && (
              <Badge variant="outline" className="text-xs">
                {finalResult.credits_used} credit{finalResult.credits_used !== 1 ? 's' : ''}
              </Badge>
            )}
            {/* Auto-saved badge */}
            <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          </div>
        </div>

        {finalResult.title && (
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {finalResult.title}
          </p>
        )}

        {/* Spec completeness */}
        {specCompleteness != null && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Spec coverage</span>
              <span>{specCompleteness}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  specCompleteness >= 80
                    ? 'bg-green-500'
                    : specCompleteness >= 50
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${specCompleteness}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {originalIntent && (
          <p className="text-xs text-muted-foreground italic">
            &ldquo;{originalIntent}&rdquo;
          </p>
        )}

        <div className="rounded-lg border bg-muted/30 p-4 font-mono text-sm leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap">
          {finalResult.prompt}
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
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved to Library
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={reset} title="Start over">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create with AI
          </DialogTitle>
          <DialogDescription>
            Answer a few questions and AI will build a high-quality prompt for you.
          </DialogDescription>
        </DialogHeader>

        <StepIndicator current={step} />

        {step === 'goal' && renderGoal()}
        {step === 'questions' && renderQuestions()}
        {step === 'building' && renderBuilding()}
        {step === 'result' && renderResult()}
      </DialogContent>
    </Dialog>
  );
}
