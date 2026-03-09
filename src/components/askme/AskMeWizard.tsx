'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStartAskMe, useSubmitAllAskMe } from '@/hooks/api/useAskMe';
import { useCreditsStore } from '@/store/credits';
import { CostConfirmation } from '@/components/credits/CostConfirmation';
import EgyptianLoading from '@/components/EgyptianLoading';
import { AskMeQuestion } from './AskMeQuestion';
import { PromptComparison } from './PromptComparison';
import {
  Sparkles,
  Copy,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/errors/handle-api-error';
import type {
  AskMeSession,
  AskMeQuestion as AskMeQuestionType,
  AskMeSubmitAllResult,
} from '@/lib/api/typed-client';

type WizardStep = 'intent' | 'questions' | 'submitting' | 'result';

export function AskMeWizard() {
  const [step, setStep] = useState<WizardStep>('intent');
  const [intent, setIntent] = useState('');
  const [session, setSession] = useState<AskMeSession | null>(null);
  const [firstUserQIdx, setFirstUserQIdx] = useState(0);

  // Collect answers locally â€” no per-answer API cost
  const [localAnswers, setLocalAnswers] = useState<Map<string, string>>(new Map());
  const [missingQids, setMissingQids] = useState<string[]>([]);

  const [finalResult, setFinalResult] = useState<AskMeSubmitAllResult | null>(null);

  const deductOptimistic = useCreditsStore((s) => s.deductOptimistic);
  const refundOptimistic = useCreditsStore((s) => s.refundOptimistic);

  const startMutation = useStartAskMe();
  const submitAllMutation = useSubmitAllAskMe();

  // â”€â”€â”€ Derived state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const userQuestions: AskMeQuestionType[] = session
    ? session.questions.slice(firstUserQIdx)
    : [];

  const totalUserQuestions = userQuestions.length;
  const answeredQuestions = userQuestions.filter((q) => localAnswers.has(q.qid));
  const currentQuestion = userQuestions.find((q) => !localAnswers.has(q.qid)) ?? null;
  const allRequiredAnswered = userQuestions
    .filter((q) => q.required)
    .every((q) => localAnswers.has(q.qid));
  const canSubmit = allRequiredAnswered && answeredQuestions.length > 0;

  // â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleStartConfirm = useCallback(() => {
    deductOptimistic(2);
    startMutation.mutate(
      { intent },
      {
        onSuccess: (data) => {
          const firstUnansweredIdx = data.questions.findIndex((q) => !q.is_answered);
          const startIdx = firstUnansweredIdx >= 0 ? firstUnansweredIdx : 0;
          setFirstUserQIdx(startIdx);
          setSession(data);
          setStep('questions');
        },
        onError: (err) => {
          refundOptimistic(2);
          handleApiError(err, 'askme_start');
        },
      }
    );
  }, [intent, deductOptimistic, startMutation, refundOptimistic]);

  const handleLocalAnswer = useCallback((qid: string, value: string) => {
    setLocalAnswers((prev) => {
      const next = new Map(prev);
      next.set(qid, value);
      return next;
    });
    setMissingQids((prev) => prev.filter((id) => id !== qid));
  }, []);

  const triggerSubmitAll = useCallback(() => {
    if (!session) return;
    deductOptimistic(3);
    setStep('submitting');

    const answers = Array.from(localAnswers.entries()).map(([qid, value]) => ({ qid, value }));

    submitAllMutation.mutate(
      { session_id: session.session_id, answers },
      {
        onSuccess: (data) => {
          setFinalResult(data);
          setStep('result');
          toast.success('Prompt crafted and saved to your library!');
        },
        onError: (err: unknown) => {
          const apiErr = err as { status?: number; data?: Record<string, unknown> };

          // 409 â€” session already finalized, show existing prompt
          if (apiErr?.status === 409) {
            const existing = apiErr?.data ?? {};
            if (existing.prompt) {
              setFinalResult({ session_id: session.session_id, ...(existing as Partial<AskMeSubmitAllResult>) } as AskMeSubmitAllResult);
              setStep('result');
              toast.info('Session already completed â€” showing your existing prompt.');
              return;
            }
          }

          // 400 â€” missing required questions
          if (apiErr?.status === 400) {
            const missing = (apiErr?.data as { missing_qids?: string[] })?.missing_qids;
            if (missing?.length) {
              setMissingQids(missing);
              toast.error('Please answer all required questions before generating.');
            } else {
              toast.error('Some answers are invalid. Please review and try again.');
            }
            refundOptimistic(3);
            setStep('questions');
            return;
          }

          refundOptimistic(3);
          setStep('questions');
          handleApiError(err, 'askme_submit_all');
        },
      }
    );
  }, [session, localAnswers, deductOptimistic, submitAllMutation, refundOptimistic]);

  const handleCopy = useCallback(() => {
    if (!finalResult) return;
    navigator.clipboard.writeText(finalResult.prompt);
    toast.success('Prompt copied to clipboard!');
  }, [finalResult]);

  const handleStartOver = useCallback(() => {
    setStep('intent');
    setIntent('');
    setSession(null);
    setFirstUserQIdx(0);
    setLocalAnswers(new Map());
    setMissingQids([]);
    setFinalResult(null);
  }, []);

  // â”€â”€â”€ Quality / comparison data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const specCompleteness =
    finalResult?.comparison?.spec_completeness ?? finalResult?.spec_completeness;
  const qualityScore = finalResult?.quality_score;

  const comparison = finalResult
    ? {
        original_length: intent.length,
        optimized_length: finalResult.optimized_length ?? finalResult.prompt.length,
        improvement_ratio:
          finalResult.comparison?.improvement_ratio ??
          (finalResult.optimized_length
            ? finalResult.optimized_length / Math.max(intent.length, 1)
            : finalResult.prompt.length / Math.max(intent.length, 1)),
        spec_completeness: (specCompleteness ?? 0) / 100,
        quality_indicators:
          finalResult.comparison?.quality_indicators ??
          (qualityScore ? [`Quality Score: ${qualityScore}/10`] : []),
      }
    : null;

  const isStarting = startMutation.isPending;

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">

        {/* â”€â”€ Step 1: Enter Intent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 'intent' && (
          <motion.div
            key="intent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="relative">
              <textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="What do you need help with? e.g., 'Write a marketing email for my AI fitness app'"
                className="w-full min-h-[120px] p-4 rounded-xl border border-[#C9A227]/30 bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] resize-none transition-all"
                disabled={isStarting}
              />
              <Sparkles className="absolute top-4 right-4 w-5 h-5 text-[#C9A227] opacity-50" />
            </div>

            {intent.length > 5 && (
              <CostConfirmation
                feature="askme_start"
                onConfirm={handleStartConfirm}
                onCancel={() => setIntent('')}
              />
            )}
          </motion.div>
        )}

        {/* â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {(isStarting || step === 'submitting') && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-8"
          >
            <EgyptianLoading
              isLoading={true}
              message={step === 'submitting' ? 'Crafting your promptâ€¦' : 'Analyzing your intentâ€¦'}
              size="medium"
              overlay={false}
            />
          </motion.div>
        )}

        {/* â”€â”€ Step 2: Answer Questions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 'questions' && !isStarting && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Progress bar */}
            {totalUserQuestions > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
                    {answeredQuestions.length > 0
                      ? `${answeredQuestions.length} of ${totalUserQuestions} answered`
                      : 'Starting interviewâ€¦'}
                    {canSubmit && !currentQuestion && ' â€” Ready to generate!'}
                  </span>
                  <span>{Math.round((answeredQuestions.length / totalUserQuestions) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#C9A227] to-[#1E3A8A]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(answeredQuestions.length / totalUserQuestions) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            )}

            {/* Answered history (read-only) */}
            <AnimatePresence>
              {answeredQuestions.map((q) => (
                <motion.div
                  key={q.qid}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-[#C9A227]/5 border border-[#C9A227]/20"
                >
                  <p className="text-sm font-medium text-muted-foreground">{q.title}</p>
                  <p className="text-foreground mt-1 text-sm">{localAnswers.get(q.qid)}</p>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Missing required questions alert */}
            {missingQids.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2 p-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 text-sm text-red-700 dark:text-red-300"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Some required questions are unanswered. Please complete them to generate your prompt.</span>
              </motion.div>
            )}

            {/* Current unanswered question */}
            {currentQuestion && (
              <AskMeQuestion
                key={currentQuestion.qid}
                question={{
                  qid: currentQuestion.qid,
                  title: currentQuestion.title,
                  help_text: currentQuestion.help_text ?? '',
                  kind: currentQuestion.kind,
                  options: currentQuestion.options,
                  variable: currentQuestion.variable,
                  required: currentQuestion.required,
                  suggested: currentQuestion.suggested,
                }}
                value={localAnswers.get(currentQuestion.qid) ?? ''}
                onAnswer={(value) => handleLocalAnswer(currentQuestion.qid, value)}
                disabled={false}
              />
            )}

            {/* Submit-all when all required answered */}
            {canSubmit && !currentQuestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-2"
              >
                <CostConfirmation
                  feature="askme_submit_all"
                  onConfirm={triggerSubmitAll}
                  onCancel={() => {}}
                />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* â”€â”€ Step 3: Result â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {step === 'result' && finalResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <PromptComparison
              originalIntent={intent}
              finalPrompt={finalResult.prompt}
              comparison={comparison}
            />

            {/* Quality / spec badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {qualityScore != null && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  qualityScore >= 8
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : qualityScore >= 5
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  âœ¦ Quality {qualityScore.toFixed(1)}/10
                </span>
              )}
              {specCompleteness != null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {specCompleteness}% spec coverage
                </span>
              )}
              {finalResult.credits_used != null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                  {finalResult.credits_used} credit{finalResult.credits_used !== 1 ? 's' : ''} used
                </span>
              )}
              {/* Auto-saved indicator â€” backend saves to PromptHistory automatically */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                Saved to library
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>

              {finalResult.prompt_history_id ? (
                <a
                  href="/library"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#E9C25A] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
                >
                  <ExternalLink className="w-4 h-4" />
                  View in Library
                </a>
              ) : (
                <div className="flex-1 py-3 rounded-xl bg-[#C9A227]/20 text-[#C9A227] font-semibold flex items-center justify-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved to Library
                </div>
              )}

              <button
                onClick={handleStartOver}
                title="Start over"
                className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
