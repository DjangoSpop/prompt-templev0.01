'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Clock3, Sparkles, Trophy, Brain, Zap, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAcademyStore } from '@/lib/stores/academyStore';
import { cn } from '@/lib/utils';

interface PromptIQTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartLearning?: () => void;
}

type QuestionCategory = 'prompt-engineering' | 'ai-knowledge';

interface PromptIQQuestion {
  id: string;
  category: QuestionCategory;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

const CATEGORY_LABELS: Record<QuestionCategory, { label: string; icon: typeof Brain }> = {
  'prompt-engineering': { label: 'Prompt Engineering', icon: Zap },
  'ai-knowledge': { label: 'AI Knowledge', icon: Brain },
};

const QUESTIONS: PromptIQQuestion[] = [
  // ── Prompt Engineering (5 questions) ──
  {
    id: 'pe-1',
    category: 'prompt-engineering',
    question: 'What is the main goal of prompt engineering?',
    options: [
      'Training a new AI model from scratch',
      'Communicating with AI to get reliable outcomes',
      'Writing only technical prompts for developers',
      'Replacing human decision making',
    ],
    answer: 1,
    explanation: 'Prompt engineering is about crafting clear instructions for AI to produce consistent, useful results.',
  },
  {
    id: 'pe-2',
    category: 'prompt-engineering',
    question: 'Which prompt is strongest for business use?',
    options: [
      'Write something about growth',
      'Give me ideas',
      'Write a 120-word B2B growth email for CTOs with 3 bullet points',
      'Make it better',
    ],
    answer: 2,
    explanation: 'Specificity wins: format, audience, length constraints, and purpose dramatically improve output quality.',
  },
  {
    id: 'pe-3',
    category: 'prompt-engineering',
    question: 'When should you provide examples in your prompts?',
    options: [
      'Only when asking for definitions',
      'Never — examples confuse the model',
      'When style, tone, or structure must match a pattern',
      'Only for coding tasks',
    ],
    answer: 2,
    explanation: 'Few-shot examples are most valuable when you need the AI to match a specific style or output format.',
  },
  {
    id: 'pe-4',
    category: 'prompt-engineering',
    question: 'What gives the fastest quality gain for most prompts?',
    options: [
      'Longer prompts with more detail everywhere',
      'Clear role + context + constraints',
      'Using more emojis and emphasis',
      'Switching AI models for each question',
    ],
    answer: 1,
    explanation: 'A clear role, relevant context, and explicit constraints dramatically improve first-attempt accuracy.',
  },
  {
    id: 'pe-5',
    category: 'prompt-engineering',
    question: 'What is "chain-of-thought" prompting?',
    options: [
      'Asking multiple unrelated questions at once',
      'Instructing the AI to reason step-by-step before answering',
      'Chaining multiple AI models together',
      'Repeating the same prompt until you get a good answer',
    ],
    answer: 1,
    explanation: 'Chain-of-thought asks the model to show its reasoning steps, improving accuracy on complex tasks.',
  },

  // ── AI Knowledge (5 questions) ──
  {
    id: 'ai-1',
    category: 'ai-knowledge',
    question: 'What does "temperature" control in AI model settings?',
    options: [
      'How fast the model processes your request',
      'The creativity/randomness of the output',
      'The maximum length of the response',
      'How many sources the model references',
    ],
    answer: 1,
    explanation: 'Temperature controls randomness — lower values give more focused outputs, higher values increase creativity.',
  },
  {
    id: 'ai-2',
    category: 'ai-knowledge',
    question: 'What is a "context window" in large language models?',
    options: [
      'The browser window where you type prompts',
      'The maximum amount of text the model can process at once',
      'A setting that controls response speed',
      'The number of conversations you can have per day',
    ],
    answer: 1,
    explanation: 'The context window is the token limit — it determines how much conversation history and input the model can consider.',
  },
  {
    id: 'ai-3',
    category: 'ai-knowledge',
    question: 'What is an AI "hallucination"?',
    options: [
      'When the AI generates creative content',
      'When the AI confidently produces incorrect or fabricated information',
      'When the AI refuses to answer a question',
      'When the AI takes too long to respond',
    ],
    answer: 1,
    explanation: 'Hallucinations are when AI presents false information as fact — a key risk to verify against.',
  },
  {
    id: 'ai-4',
    category: 'ai-knowledge',
    question: 'What is the difference between "zero-shot" and "few-shot" prompting?',
    options: [
      'Zero-shot is free, few-shot costs money',
      'Zero-shot gives no examples, few-shot includes examples in the prompt',
      'Zero-shot works offline, few-shot needs internet',
      'There is no real difference',
    ],
    answer: 1,
    explanation: 'Zero-shot relies on the model\'s training alone; few-shot provides examples so the model can match the pattern.',
  },
  {
    id: 'ai-5',
    category: 'ai-knowledge',
    question: 'Why might the same prompt produce different outputs each time?',
    options: [
      'The AI is broken and needs to be restarted',
      'Different users get different versions of the model',
      'Sampling randomness (temperature) introduces variation in token selection',
      'The AI remembers your previous sessions and changes its answers',
    ],
    answer: 2,
    explanation: 'Non-zero temperature means the model samples probabilistically, so outputs can vary between runs.',
  },
];

const TEST_DURATION_SECONDS = 120;

function getPercentile(score: number) {
  if (score >= 90) return { percentile: 'Top 5%', tier: 'Temple Strategist', color: 'text-yellow-400', message: 'Your AI instincts are elite. You think like a senior prompt engineer.' };
  if (score >= 70) return { percentile: 'Top 20%', tier: 'Adept Engineer', color: 'text-royal-gold-300', message: 'Strong foundation — the Academy will sharpen your edge.' };
  if (score >= 50) return { percentile: 'Top 40%', tier: 'Emerging Builder', color: 'text-nile-teal-300', message: 'You\'re ahead of most. A few modules will unlock consistency.' };
  if (score >= 30) return { percentile: 'Top 65%', tier: 'Apprentice', color: 'text-desert-sand-300', message: 'Solid start. Module 1 will quickly raise your baseline.' };
  return { percentile: 'Top 85%', tier: 'Newcomer', color: 'text-desert-sand-400', message: 'Perfect time to start — the Academy is built for exactly this.' };
}

function getCategoryScore(answers: Record<string, number>, category: QuestionCategory) {
  const categoryQs = QUESTIONS.filter(q => q.category === category);
  const correct = categoryQs.filter(q => answers[q.id] === q.answer).length;
  return { correct, total: categoryQs.length, percent: Math.round((correct / categoryQs.length) * 100) };
}

export function PromptIQTestModal({ open, onOpenChange, onStartLearning }: PromptIQTestModalProps) {
  const completePromptIQTest = useAcademyStore((state) => state.completePromptIQTest);

  const [index, setIndex] = useState(0);
  const [timer, setTimer] = useState(TEST_DURATION_SECONDS);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setTimer(TEST_DURATION_SECONDS);
    setAnswers({});
    setSubmitted(false);
    setSelectedOption(null);
    setShowFeedback(false);
    submittedRef.current = false;
  }, [open]);

  useEffect(() => {
    if (!open || submitted) return;

    const interval = window.setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          finalizeTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, submitted]);

  const score = useMemo(() => {
    const correct = QUESTIONS.filter(q => answers[q.id] === q.answer).length;
    return Math.round((correct / QUESTIONS.length) * 100);
  }, [answers]);

  const completion = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);
  const current = QUESTIONS[index];
  const percentileData = getPercentile(score);

  const finalizeTest = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    const correct = QUESTIONS.filter(q => answers[q.id] === q.answer).length;
    completePromptIQTest(Math.round((correct / QUESTIONS.length) * 100));
  }, [answers, completePromptIQTest]);

  const handleSelect = (optionIndex: number) => {
    if (submitted || showFeedback) return;

    setSelectedOption(optionIndex);
    setShowFeedback(true);
    setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }));

    const isLast = index >= QUESTIONS.length - 1;
    const delay = 800;

    window.setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);

      if (isLast) {
        finalizeTest();
      } else {
        setIndex((prev) => prev + 1);
      }
    }, delay);
  };

  const peScore = getCategoryScore(answers, 'prompt-engineering');
  const aiScore = getCategoryScore(answers, 'ai-knowledge');

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-royal-gold-500/40 bg-obsidian-900 text-desert-sand-100 p-0">
        <div className="relative overflow-hidden rounded-lg">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.06]" aria-hidden>
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 8L112 60L60 112L8 60Z' fill='none' stroke='%23C5A55A' stroke-width='1.2'/%3E%3C/svg%3E\")",
                backgroundSize: '120px 120px',
              }}
            />
          </div>

          <div className="relative p-6 md:p-8">
            {!submitted ? (
              <>
                <DialogHeader className="space-y-3 text-left">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-royal-gold-500/50 bg-royal-gold-900/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-royal-gold-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Prompt IQ Test
                  </div>
                  <DialogTitle className="text-2xl font-bold text-royal-gold-200 md:text-3xl">
                    How well do you know AI?
                  </DialogTitle>
                  <DialogDescription className="text-desert-sand-200">
                    10 questions across prompt engineering and AI fundamentals. {TEST_DURATION_SECONDS / 60} minutes on the clock.
                  </DialogDescription>
                </DialogHeader>

                {/* Timer + Progress Bar */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                      timer <= 20
                        ? 'border-red-500/50 bg-red-950/30 text-red-300'
                        : 'border-royal-gold-500/30 bg-obsidian-900/70 text-desert-sand-100'
                    )}>
                      <Clock3 className={cn('h-4 w-4', timer <= 20 ? 'text-red-400 animate-pulse' : 'text-royal-gold-300')} />
                      <span className="font-mono font-semibold">{formatTime(timer)}</span>
                    </div>

                    {/* Category badge */}
                    <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-royal-gold-500/20 bg-obsidian-900/50 px-2.5 py-1.5 text-xs text-desert-sand-300">
                      {current.category === 'ai-knowledge' ? (
                        <Brain className="h-3.5 w-3.5 text-nile-teal-400" />
                      ) : (
                        <Zap className="h-3.5 w-3.5 text-royal-gold-400" />
                      )}
                      {CATEGORY_LABELS[current.category].label}
                    </div>
                  </div>

                  <div className="text-sm font-medium text-desert-sand-200">
                    {index + 1} / {QUESTIONS.length}
                  </div>
                </div>

                <div className="mt-3">
                  <Progress value={completion} className="h-2 bg-obsidian-800" />
                </div>

                {/* Question Card */}
                <div className="mt-6 rounded-xl border border-royal-gold-500/30 bg-obsidian-900/70 p-5">
                  <h3 className="text-lg font-semibold text-royal-gold-100 md:text-xl leading-relaxed">
                    {current.question}
                  </h3>

                  <div className="mt-5 space-y-3">
                    {current.options.map((option, optionIndex) => {
                      const isSelected = selectedOption === optionIndex;
                      const isCorrect = optionIndex === current.answer;
                      const showAsCorrect = showFeedback && isCorrect;
                      const showAsWrong = showFeedback && isSelected && !isCorrect;

                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={showFeedback}
                          onClick={() => handleSelect(optionIndex)}
                          className={cn(
                            'w-full rounded-lg border px-4 py-3.5 text-left transition-all duration-200',
                            showAsCorrect && 'border-emerald-500/70 bg-emerald-950/30 text-emerald-200',
                            showAsWrong && 'border-red-500/70 bg-red-950/30 text-red-200',
                            !showFeedback && !isSelected && 'border-desert-sand-600/30 bg-black/40 text-desert-sand-100 hover:border-royal-gold-400/70 hover:bg-royal-gold-900/20',
                            showFeedback && !showAsCorrect && !showAsWrong && 'border-desert-sand-600/20 bg-black/25 text-desert-sand-400 opacity-60',
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span className={cn(
                              'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                              showAsCorrect && 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300',
                              showAsWrong && 'border-red-400/60 bg-red-500/20 text-red-300',
                              !showFeedback && 'border-royal-gold-500/40 text-royal-gold-200',
                              showFeedback && !showAsCorrect && !showAsWrong && 'border-desert-sand-600/20 text-desert-sand-500',
                            )}>
                              {showAsCorrect ? <CheckCircle2 className="h-4 w-4" /> :
                               showAsWrong ? <XCircle className="h-4 w-4" /> :
                               String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span className="text-sm leading-relaxed">{option}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Inline explanation after selecting */}
                  {showFeedback && (
                    <div className={cn(
                      'mt-4 rounded-lg px-4 py-3 text-sm',
                      selectedOption === current.answer
                        ? 'border border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                        : 'border border-red-500/30 bg-red-950/20 text-red-200'
                    )}>
                      {current.explanation}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-desert-sand-400">Trust your instinct — move fast.</p>
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="text-desert-sand-400 hover:text-desert-sand-100"
                  >
                    Skip for now
                  </Button>
                </div>
              </>
            ) : (
              /* ─── Results Screen ─── */
              <>
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl font-bold text-royal-gold-200 md:text-3xl">
                    Your Prompt IQ Score
                  </DialogTitle>
                  <DialogDescription className="text-desert-sand-200">
                    Here&apos;s where you stand — and where the Academy can take you.
                  </DialogDescription>
                </DialogHeader>

                {/* Score + Tier */}
                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-royal-gold-500/40 bg-obsidian-900/70 p-6 text-center">
                    <div className={cn('text-6xl font-bold', percentileData.color)}>{score}</div>
                    <div className="mt-1 text-sm uppercase tracking-widest text-desert-sand-400">out of 100</div>
                    <p className="mt-3 text-sm text-desert-sand-200">{percentileData.percentile} of learners</p>
                  </div>

                  <div className="rounded-xl border border-nile-teal-500/30 bg-nile-teal-900/20 p-6">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-nile-teal-400" />
                      <span className="text-sm font-semibold uppercase tracking-wider text-nile-teal-300">{percentileData.tier}</span>
                    </div>
                    <p className="mt-3 text-desert-sand-100">{percentileData.message}</p>
                    <p className="mt-4 text-sm text-desert-sand-300">
                      Target: reach <span className="font-semibold text-royal-gold-300">70+</span> after Module 1.
                    </p>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border border-royal-gold-500/20 bg-obsidian-900/50 px-4 py-3">
                    <Zap className="h-5 w-5 shrink-0 text-royal-gold-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-desert-sand-100">Prompt Engineering</div>
                      <div className="text-xs text-desert-sand-400">{peScore.correct}/{peScore.total} correct</div>
                    </div>
                    <span className={cn('text-lg font-bold', peScore.percent >= 60 ? 'text-emerald-400' : 'text-desert-sand-300')}>
                      {peScore.percent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-nile-teal-500/20 bg-obsidian-900/50 px-4 py-3">
                    <Brain className="h-5 w-5 shrink-0 text-nile-teal-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-desert-sand-100">AI Knowledge</div>
                      <div className="text-xs text-desert-sand-400">{aiScore.correct}/{aiScore.total} correct</div>
                    </div>
                    <span className={cn('text-lg font-bold', aiScore.percent >= 60 ? 'text-emerald-400' : 'text-desert-sand-300')}>
                      {aiScore.percent}%
                    </span>
                  </div>
                </div>

                {/* Per-question breakdown */}
                <div className="mt-6 rounded-lg border border-royal-gold-500/20 bg-royal-gold-900/10 p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-widest text-royal-gold-200">
                    Question Breakdown
                  </h4>
                  <ul className="mt-3 space-y-2">
                    {QUESTIONS.map((q) => {
                      const correct = answers[q.id] === q.answer;
                      const answered = q.id in answers;
                      return (
                        <li key={q.id} className="flex items-start gap-2 text-sm">
                          {correct ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                          ) : (
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                          )}
                          <span className={cn(correct ? 'text-desert-sand-200' : 'text-desert-sand-300')}>
                            {!answered ? 'Unanswered — ' : ''}{q.explanation}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Actions */}
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button
                    className="bg-gradient-to-r from-royal-gold-500 to-royal-gold-600 px-6 text-obsidian-900 hover:from-royal-gold-400 hover:to-royal-gold-500"
                    onClick={() => {
                      onOpenChange(false);
                      onStartLearning?.();
                    }}
                  >
                    Start Learning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-royal-gold-500/30 text-desert-sand-200 hover:bg-royal-gold-900/20"
                    onClick={() => {
                      setIndex(0);
                      setTimer(TEST_DURATION_SECONDS);
                      setAnswers({});
                      setSubmitted(false);
                      setSelectedOption(null);
                      setShowFeedback(false);
                      submittedRef.current = false;
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retake
                  </Button>
                  <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-desert-sand-400">
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
