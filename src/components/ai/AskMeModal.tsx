'use client';

/**
 * AskMe — Guided AI Prompt Builder Modal
 * Walks the user through a multi-step Q&A powered by DeepSeek
 * to generate a high-quality, personalized prompt.
 *
 * Flow: goal → questions → finalize → result → save
 */

import React, { useState, useCallback } from 'react';
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
  Save,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStartAskMe, useAnswerAskMe, useFinalizeAskMe } from '@/hooks/api/useAskMe';
import { useCreateSavedPrompt } from '@/hooks/api/useSavedPrompts';
import type { AskMeSession, AskMeFinalResult } from '@/lib/api/typed-client';

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
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [finalResult, setFinalResult] = useState<AskMeFinalResult | null>(null);
  const [saved, setSaved] = useState(false);

  const startMutation = useStartAskMe();
  const answerMutation = useAnswerAskMe();
  const finalizeMutation = useFinalizeAskMe();
  const createPrompt = useCreateSavedPrompt();

  // ---- Reset ----
  const reset = useCallback(() => {
    setStep('goal');
    setGoal('');
    setContext('');
    setSession(null);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setFinalResult(null);
    setSaved(false);
  }, []);

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
    const result = await startMutation.mutateAsync({
      goal: goal.trim(),
      context: context.trim() || undefined,
    });
    setSession(result);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setStep('questions');
  };

  // ---- Step 2: Answer a question ----
  const handleAnswer = async () => {
    if (!session || !currentAnswer.trim()) {
      toast.error('Please provide an answer before continuing');
      return;
    }
    const currentQ = session.questions[currentQuestionIndex];
    const response = await answerMutation.mutateAsync({
      session_id: session.session_id,
      question_id: currentQ.id,
      answer: currentAnswer.trim(),
    });

    const isLastQuestion = currentQuestionIndex >= session.questions.length - 1;
    if (response.is_complete || isLastQuestion) {
      setStep('building');
      await handleFinalize(session.session_id);
    } else if (response.next_question) {
      // Backend sent a new follow-up question — add it
      setSession((prev) =>
        prev
          ? {
              ...prev,
              questions: [...prev.questions, response.next_question!],
            }
          : prev
      );
      setCurrentQuestionIndex((i) => i + 1);
      setCurrentAnswer('');
    } else {
      setCurrentQuestionIndex((i) => i + 1);
      setCurrentAnswer('');
    }
  };

  // ---- Step 3: Finalize ----
  const handleFinalize = async (sessionId?: string) => {
    const sid = sessionId ?? session?.session_id;
    if (!sid) return;
    const result = await finalizeMutation.mutateAsync({ session_id: sid });
    setFinalResult(result);
    setStep('result');
  };

  // ---- Step 4: Save to library ----
  const handleSave = async () => {
    if (!finalResult) return;
    await createPrompt.mutateAsync({
      title: finalResult.title || goal.slice(0, 80) || 'AI-Generated Prompt',
      content: finalResult.prompt,
      description: finalResult.explanation,
      category: finalResult.category || 'General',
      tags: ['ai-generated', 'askme'],
      source: 'manual',
    });
    setSaved(true);
    setTimeout(() => onOpenChange(false), 800);
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
    const total = session.questions.length;
    const current = session.questions[currentQuestionIndex];
    if (!current) return null;

    const isChoice = current.type === 'choice' && Array.isArray(current.options) && current.options.length > 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            <MessageSquare className="h-3 w-3 mr-1" />
            Question {currentQuestionIndex + 1} of {total}
          </Badge>
          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium leading-relaxed">{current.question}</p>
          {current.help_text && (
            <p className="text-xs text-muted-foreground mt-1">{current.help_text}</p>
          )}
        </div>

        <div>
          {isChoice ? (
            <div className="flex flex-col gap-2">
              {current.options!.map((opt) => (
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
              if (currentQuestionIndex === 0) {
                setStep('goal');
                setSession(null);
              } else {
                setCurrentQuestionIndex((i) => i - 1);
                setCurrentAnswer('');
              }
            }}
            disabled={answerMutation.isPending}
          >
            ← Back
          </Button>
          <Button
            onClick={handleAnswer}
            disabled={!currentAnswer.trim() || answerMutation.isPending}
            className="flex-1 flex items-center gap-2"
          >
            {answerMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {answerMutation.isPending
              ? 'Processing…'
              : currentQuestionIndex >= total - 1
              ? 'Build My Prompt →'
              : 'Next Question →'}
          </Button>
        </div>
      </div>
    );
  };

  const renderBuilding = () => (
    <div className="space-y-4 py-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Wand2 className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <div>
          <p className="font-semibold">Composing your prompt…</p>
          <p className="text-sm text-muted-foreground mt-1">
            AI is crafting a high-quality prompt based on your answers
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );

  const renderResult = () => {
    if (!finalResult) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          <p className="font-semibold text-sm">Your prompt is ready!</p>
        </div>

        {finalResult.title && (
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {finalResult.title}
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
          <Button
            onClick={handleSave}
            disabled={createPrompt.isPending || saved}
            className="flex-1 flex items-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved!
              </>
            ) : createPrompt.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save to Library
              </>
            )}
          </Button>
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
