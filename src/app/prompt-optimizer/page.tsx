'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Download,
  TrendingUp,
  Zap,
  Clock,
  CheckCircle,
  BarChart3,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

import { CostPreviewPill } from '@/components/credits/CostPreviewPill';
import { InsufficientCreditsModal } from '@/components/credits/InsufficientCreditsModal';
import { useOptimizePrompt } from '@/hooks/api/useOptimizer';
import { useCreateSavedPrompt } from '@/hooks/api/useSavedPrompts';
import type { AgentOptimizeResult } from '@/hooks/api/useOptimizer';

// â”€â”€â”€ Mode Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MODES = {
  fast: {
    label: 'Fast',
    description: 'Quick improvements (~2 credits)',
    icon: Zap,
  },
  deep: {
    label: 'Deep',
    description: 'Thorough analysis with citations (~5 credits)',
    icon: BookOpen,
  },
} as const;

type Mode = keyof typeof MODES;

// â”€â”€â”€ Result Display â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function OptimizeResultPanel({
  result,
  original,
  onReset,
}: {
  result: AgentOptimizeResult;
  original: string;
  onReset: () => void;
}) {
  const createPrompt = useCreateSavedPrompt();
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.optimized);
    toast.success('Optimized prompt copied!');
  };

  const handleDownload = () => {
    const blob = new Blob([result.optimized], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-prompt.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    await createPrompt.mutateAsync({
      title: original.slice(0, 60) || 'Optimized Prompt',
      content: result.optimized,
      description: result.diff_summary,
      category: 'General',
      tags: ['optimized', result.mode ?? 'fast'],
      source: 'manual',
      metadata: {
        original_prompt: original,
        quality_score: result.confidence_score,
        custom_fields: {
          run_id: result.run_id,
          credits_consumed: result.credits_consumed ?? result.usage?.credits_consumed,
          from_cache: result.from_cache,
        },
      },
    });
    setSaved(true);
    toast.success('Saved to your prompt library!');
  };

  const creditsConsumed = result.credits_consumed ?? result.usage?.credits_consumed ?? 0;
  const totalTokens = (result.usage?.tokens_in ?? 0) + (result.usage?.tokens_out ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="font-semibold">Optimization complete</span>
          {result.from_cache && (
            <Badge variant="secondary" className="text-xs">
              âš¡ From cache
            </Badge>
          )}
          {result.mode && (
            <Badge variant="outline" className="text-xs capitalize">
              {result.mode} mode
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          New prompt
        </Button>
      </div>

      {/* Side-by-side prompts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Original</h3>
            <Badge variant="outline" className="text-xs">{original.length} chars</Badge>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed min-h-[120px] text-muted-foreground">
            {original}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Optimized</h3>
            <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {result.optimized.length} chars
            </Badge>
          </div>
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 text-sm leading-relaxed min-h-[120px]">
            {result.optimized}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleCopy} variant="outline" size="sm" className="flex items-center gap-2">
          <Copy className="h-3.5 w-3.5" />
          Copy optimized
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-3.5 w-3.5" />
          Download
        </Button>
        <Button
          onClick={handleSave}
          variant="outline"
          size="sm"
          disabled={saved || createPrompt.isPending}
          className="flex items-center gap-2"
        >
          {saved ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Sparkles className="h-3.5 w-3.5" />}
          {saved ? 'Saved!' : 'Save to library'}
        </Button>
      </div>

      {/* Tabs: diff summary, citations, metrics */}
      <Tabs defaultValue="diff">
        <TabsList className="grid grid-cols-3 w-full max-w-sm">
          <TabsTrigger value="diff">Changes</TabsTrigger>
          <TabsTrigger value="citations">Sources</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="diff" className="mt-4">
          {result.diff_summary ? (
            <p className="text-sm text-muted-foreground leading-relaxed rounded-lg border bg-muted/30 p-4">
              {result.diff_summary}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No diff summary available.</p>
          )}
        </TabsContent>

        <TabsContent value="citations" className="mt-4">
          {result.citations && result.citations.length > 0 ? (
            <div className="space-y-2">
              {result.citations.map((citation) => (
                <div
                  key={citation.id}
                  className="flex items-center justify-between rounded-lg border bg-card px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{citation.title}</p>
                    <p className="text-xs text-muted-foreground">{citation.source}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(citation.score * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No template sources used.</p>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border bg-card p-3 text-center">
              <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-bold">
                {((result.processing_time_ms ?? 0) / 1000).toFixed(1)}s
              </div>
              <div className="text-xs text-muted-foreground">Latency</div>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center">
              <BarChart3 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-bold">{totalTokens.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Tokens</div>
            </div>
            <div className="rounded-lg border bg-card p-3 text-center">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-bold text-amber-600">{creditsConsumed}</div>
              <div className="text-xs text-muted-foreground">Credits used</div>
            </div>
            {result.confidence_score != null && (
              <div className="rounded-lg border bg-card p-3 text-center">
                <Sparkles className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-lg font-bold text-green-600">
                  {result.confidence_score.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
            )}
          </div>

          {result.improvements && Object.keys(result.improvements).length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Improvement Dimensions
              </p>
              {Object.entries(result.improvements)
                .filter(([, v]) => v != null)
                .map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 capitalize">{key}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.round((value as number) * 10)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-6 text-right">
                      {(value as number).toFixed(1)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

// â”€â”€â”€ Loading Skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function OptimizingState({ mode }: { mode: Mode }) {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        >
          <Sparkles className="h-4 w-4 text-primary" />
        </motion.div>
        <span>
          Running <strong>{MODES[mode].label}</strong> optimizationâ€¦
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
//  Main Page 

export default function PromptOptimizerPage() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('optimizer-mode') as Mode) ?? 'fast';
    }
    return 'fast';
  });
  const [result, setResult] = useState<AgentOptimizeResult | null>(null);

  const optimizeMutation = useOptimizePrompt();

  const handleModeChange = (m: Mode) => {
    setMode(m);
    if (typeof window !== 'undefined') localStorage.setItem('optimizer-mode', m);
  };

  const handleOptimize = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      toast.error('Please enter a prompt to optimize');
      return;
    }
    if (trimmed.length < 10) {
      toast.error('Prompt is too short  add more context for better results');
      return;
    }
    setResult(null);
    try {
      const id = crypto.randomUUID();
      const data = await optimizeMutation.mutateAsync({
        session_id: id,
        original: trimmed,
        mode,
      });
      setResult(data);
    } catch {
      // error already handled by useOptimizePrompt via handleApiError
    }
  }, [input, mode, optimizeMutation]);

  const handleReset = () => {
    setResult(null);
    setInput('');
    optimizeMutation.reset();
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          Prompt Optimizer
        </h1>
        <p className="text-muted-foreground">
          Transform any prompt into a high-performance instruction using AI-powered analysis and
          18,000+ curated templates.
        </p>
      </div>

      {/* Input card  hidden once we have a result */}
      <AnimatePresence mode="wait">
        {!result && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your prompt</CardTitle>
                <CardDescription>
                  Paste any prompt  vague, broken, or already decent. The AI will improve it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. Write me a marketing email about our new feature"
                  rows={6}
                  className="resize-none text-sm"
                  disabled={optimizeMutation.isPending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleOptimize();
                  }}
                />

                {/* Mode selector */}
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(MODES) as Mode[]).map((m) => {
                    const cfg = MODES[m];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleModeChange(m)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          mode === m
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border bg-background hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {cfg.label}
                        <span className="text-xs opacity-70 hidden sm:inline">
                           {cfg.description}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Submit row */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CostPreviewPill
                    feature={mode === 'deep' ? 'prompt_optimizer_deep' : 'prompt_optimizer_fast'}
                    size="sm"
                  />
                  <Button
                    onClick={handleOptimize}
                    disabled={!input.trim() || optimizeMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {optimizeMutation.isPending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        >
                          <Sparkles className="h-4 w-4" />
                        </motion.div>
                        Optimizing
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Optimize prompt
                      </>
                    )}
                  </Button>
                </div>

                {input.trim() && (
                  <p className="text-xs text-muted-foreground">/Ctrl + Enter to optimize</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      <AnimatePresence>
        {optimizeMutation.isPending && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <OptimizingState mode={mode} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && !optimizeMutation.isPending && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <OptimizeResultPanel result={result} original={input} onReset={handleReset} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade modal driven by credits store */}
      <InsufficientCreditsModal />
    </div>
  );
}
