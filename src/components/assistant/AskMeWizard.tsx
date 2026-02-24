'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAskMeWizard } from '@/hooks/useAskMe';
import {
  Sparkles,
  Send,
  Copy,
  RotateCcw,
  CheckCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QABubble({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="space-y-2">
      {/* AI question */}
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-xs">
          𓂀
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-stone-800 max-w-prose">
          {question}
        </div>
      </div>
      {/* User answer */}
      <div className="flex gap-3 justify-end">
        <div className="bg-stone-800 text-white rounded-lg px-4 py-2 text-sm max-w-prose">
          {answer}
        </div>
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-xs">
          👤
        </div>
      </div>
    </div>
  );
}

function CurrentQuestion({
  question,
  onSubmit,
  canFinalize,
  onFinalize,
  isLoading,
}: {
  question: string;
  onSubmit: (answer: string) => void;
  canFinalize: boolean;
  onFinalize: () => void;
  isLoading: boolean;
}) {
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    setAnswer('');
  }, [question]);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmit(answer.trim());
    setAnswer('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      {/* Current AI question */}
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-xs">
          𓂀
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-stone-800 max-w-prose">
          {question}
        </div>
      </div>

      {/* Answer textarea */}
      <div className="flex gap-2 pl-10">
        <textarea
          ref={inputRef}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Your answer… (Enter to submit)"
          disabled={isLoading}
          rows={2}
          className="flex-1 p-3 text-sm border border-stone-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:bg-stone-100"
        />
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!answer.trim() || isLoading}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
          {canFinalize && (
            <Button
              size="sm"
              variant="outline"
              onClick={onFinalize}
              disabled={isLoading}
              title="Finalize now with current answers"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {canFinalize && (
        <p className="pl-10 text-xs text-stone-500">
          Press{' '}
          <button
            type="button"
            onClick={onFinalize}
            disabled={isLoading}
            className="text-amber-600 hover:underline font-medium"
          >
            Finalize
          </button>{' '}
          to build your prompt with the information gathered so far.
        </p>
      )}
    </div>
  );
}

function FinalResult({ prompt, refinements, summary, onReset }: {
  prompt: string;
  refinements?: string[];
  summary?: string;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-700">
        <CheckCircle className="h-5 w-5" />
        <span className="font-semibold text-sm">Your prompt is ready!</span>
      </div>

      {summary && (
        <p className="text-xs text-stone-600 italic">{summary}</p>
      )}

      {/* Final prompt display */}
      <div className="relative group">
        <pre className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-stone-800 whitespace-pre-wrap font-sans leading-relaxed min-h-[80px]">
          {prompt}
        </pre>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className={cn(
            'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity',
            'text-stone-500 hover:text-stone-800'
          )}
        >
          {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {/* Copy button always visible */}
      <div className="flex gap-2">
        <Button
          onClick={handleCopy}
          className={cn(
            'flex-1',
            copied
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          )}
        >
          {copied ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Prompt
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onReset} className="border-stone-300">
          <RotateCcw className="h-4 w-4 mr-2" />
          Start Over
        </Button>
      </div>

      {/* Refinements */}
      {refinements && refinements.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-stone-600 mb-2">What was improved:</p>
          <ul className="space-y-1">
            {refinements.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-stone-600">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AskMeWizard({ className }: { className?: string }) {
  const { state, start, answer, finalize, reset } = useAskMeWizard();
  const [initialRequest, setInitialRequest] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever new content arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [state.history.length, state.phase]);

  const handleStart = () => {
    if (!initialRequest.trim()) return;
    start(initialRequest.trim());
  };

  const isLoading = state.phase === 'starting' || state.phase === 'finalizing';

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Guided Prompt Builder
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Answer a few questions and let the AI craft the perfect prompt for you.
        </p>
      </div>

      {/* Initial Request Input */}
      {state.phase === 'idle' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-stone-700">
            What would you like to create?
          </label>
          <textarea
            value={initialRequest}
            onChange={e => setInitialRequest(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleStart();
            }}
            placeholder="e.g. A professional email declining a client request, a Python function that parses JSON, marketing copy for a new SaaS product…"
            rows={3}
            className="w-full p-4 border border-stone-300 rounded-lg resize-none text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          <Button
            onClick={handleStart}
            disabled={!initialRequest.trim()}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Start Guided Build
          </Button>
          <p className="text-xs text-stone-400 text-center">Ctrl+Enter to start</p>
        </div>
      )}

      {/* Loading state between phases */}
      {isLoading && state.history.length === 0 && (
        <div className="flex items-center gap-3 text-stone-500 text-sm py-4">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          {state.phase === 'finalizing' ? 'Crafting your prompt…' : 'Preparing questions…'}
        </div>
      )}

      {/* Q&A conversation */}
      {(state.phase === 'questioning' || state.phase === 'finalizing' || state.phase === 'complete') && (
        <div className="space-y-4">
          {/* History */}
          {state.history.map((pair, i) => (
            <QABubble key={i} question={pair.question} answer={pair.answer} />
          ))}

          {/* Current question */}
          {state.phase === 'questioning' && state.currentQuestion && (
            <CurrentQuestion
              question={state.currentQuestion}
              onSubmit={answer}
              canFinalize={state.questionsAnswered >= 1}
              onFinalize={finalize}
              isLoading={isLoading}
            />
          )}

          {/* Finalizing indicator */}
          {state.phase === 'finalizing' && (
            <div className="flex items-center gap-3 text-stone-500 text-sm py-2 pl-10">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              Composing your final prompt…
            </div>
          )}

          {/* Final result */}
          {state.phase === 'complete' && state.result && (
            <FinalResult
              prompt={state.result.final_prompt}
              refinements={state.result.refinements}
              summary={state.result.summary}
              onReset={reset}
            />
          )}
        </div>
      )}

      {/* Error state */}
      {state.phase === 'error' && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{state.error}</span>
          </div>
          <Button variant="outline" onClick={reset} size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
