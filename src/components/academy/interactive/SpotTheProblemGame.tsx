/**
 * SpotTheProblemGame Interactive Component
 */

'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PromptFlawItem {
  text: string;
  flaw: string;
  explanation: string;
}

interface SpotTheProblemGameProps {
  prompts?: PromptFlawItem[];
  onStateChange?: (state: {
    currentIndex: number;
    score: number;
    completed: boolean;
  }) => void;
}

const FLAW_LABELS: Record<string, string> = {
  vague: 'Vague language',
  'no-context': 'No context',
  'no-format': 'No format specification',
  'too-many': 'Too many requests',
  'no-examples': 'No examples',
};

const DEFAULT_PROMPTS: PromptFlawItem[] = [
  { text: 'Write something for my business.', flaw: 'vague', explanation: 'The AI does not know what to create, for whom, or with what outcome.' },
  { text: 'Analyze this data.', flaw: 'no-context', explanation: 'No context about business goal, audience, or what decisions this should inform.' },
  { text: 'Give advice on meetings.', flaw: 'no-format', explanation: 'Output format is undefined, so result can be hard to use.' },
];

export default function SpotTheProblemGame({ prompts = DEFAULT_PROMPTS, onStateChange }: SpotTheProblemGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedFlaw, setSelectedFlaw] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const current = prompts[currentIndex];
  const availableFlaws = useMemo(() => Object.entries(FLAW_LABELS), []);

  const isCorrect = selectedFlaw != null && selectedFlaw === current?.flaw;

  const handleFlawSelect = (flaw: string) => {
    if (selectedFlaw) return;

    setSelectedFlaw(flaw);
    const nextScore = flaw === current.flaw ? score + 1 : score;
    if (flaw === current.flaw) {
      setScore((prev) => prev + 1);
    }
    onStateChange?.({ currentIndex, score: nextScore, completed: false });
  };

  const handleNext = () => {
    if (currentIndex >= prompts.length - 1) {
      setIsComplete(true);
      onStateChange?.({ currentIndex, score, completed: true });
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedFlaw(null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedFlaw(null);
    setScore(0);
    setIsComplete(false);
    onStateChange?.({ currentIndex: 0, score: 0, completed: false });
  };

  if (isComplete) {
    const percent = Math.round((score / prompts.length) * 100);
    return (
      <Card className="border-royal-gold-500/35 bg-gradient-to-b from-obsidian-900 to-obsidian-950 p-6">
        <h3 className="academy-heading-font text-2xl text-royal-gold-200">Challenge Complete</h3>
        <p className="academy-body-font mt-2 text-desert-sand-100">
          You identified <span className="font-semibold text-royal-gold-200">{score}/{prompts.length}</span> prompt flaws ({percent}%).
        </p>
        <div className="mt-5">
          <Button onClick={handleRestart}>Try Again</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-royal-gold-500/35 bg-gradient-to-b from-obsidian-900 to-obsidian-950 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="academy-heading-font text-xl text-royal-gold-200">Spot the Primary Flaw</h3>
        <p className="academy-body-font text-sm text-desert-sand-200">
          Prompt {currentIndex + 1}/{prompts.length}
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-red-500/30 bg-red-950/20 p-4">
        <p className="academy-code-font text-sm text-desert-sand-100">{current.text}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {availableFlaws.map(([key, label]) => {
          const chosen = selectedFlaw === key;
          const correct = selectedFlaw && key === current.flaw;

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleFlawSelect(key)}
              disabled={selectedFlaw != null}
              className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                chosen && isCorrect
                  ? 'border-nile-teal-400 bg-nile-teal-900/25 text-nile-teal-100'
                  : chosen && !isCorrect
                    ? 'border-red-400 bg-red-900/25 text-red-100'
                    : correct
                      ? 'border-nile-teal-400/80 bg-nile-teal-900/20 text-desert-sand-100'
                      : 'border-desert-sand-600/30 bg-obsidian-950/60 text-desert-sand-100 hover:border-royal-gold-400/60'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {selectedFlaw && (
        <div className="mt-5 rounded-lg border border-royal-gold-500/30 bg-obsidian-950/70 p-4">
          <div className="mb-2 flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-nile-teal-300" />
            ) : (
              <XCircle className="h-5 w-5 text-red-300" />
            )}
            <p className={`academy-heading-font text-sm ${isCorrect ? 'text-nile-teal-200' : 'text-red-200'}`}>
              {isCorrect ? 'Correct' : 'Not quite'}
            </p>
          </div>
          <p className="academy-body-font text-sm text-desert-sand-100">{current.explanation}</p>
          <div className="mt-4">
            <Button onClick={handleNext}>{currentIndex === prompts.length - 1 ? 'See Result' : 'Next Prompt'}</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
