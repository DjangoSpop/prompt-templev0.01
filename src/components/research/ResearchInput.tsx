'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Loader2, Sparkles, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { RESEARCH_CREDIT_COST } from '@/lib/hooks/useResearch';

interface ResearchInputProps {
  onSubmit: (query: string, topK?: number) => void;
  isLoading: boolean;
  creditsAvailable?: number;
}

export function ResearchInput({ onSubmit, isLoading, creditsAvailable }: ResearchInputProps) {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(6);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const canAfford = creditsAvailable == null || creditsAvailable >= RESEARCH_CREDIT_COST;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed, topK);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div
        className={cn(
          'glass-pharaoh relative overflow-hidden rounded-xl transition-shadow duration-300',
          isFocused && 'shadow-lg shadow-royal-gold-500/10 ring-1 ring-royal-gold-500/30'
        )}
      >
        {/* Subtle gold gradient top accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-royal-gold-500/40 to-transparent" />

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask a research question..."
          rows={3}
          maxLength={2000}
          className="w-full resize-none bg-transparent px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />

        <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'text-xs tabular-nums',
                query.length > 1800
                  ? 'font-medium text-red-500'
                  : 'text-muted-foreground'
              )}
            >
              {query.length}/2,000
            </span>
            <span className="hidden text-xs text-muted-foreground/50 sm:inline">
              Ctrl+Enter to submit
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Credit cost badge */}
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                canAfford
                  ? 'bg-royal-gold-50 text-royal-gold-700 dark:bg-royal-gold-900/20 dark:text-royal-gold-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              )}
            >
              <Coins className="h-3 w-3" />
              {RESEARCH_CREDIT_COST} credits
            </div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                disabled={!query.trim() || isLoading || !canAfford}
                size="sm"
                className="gap-2 bg-lapis-blue-500 font-medium text-white shadow-sm hover:bg-lapis-blue-600 disabled:bg-muted disabled:text-muted-foreground"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Research
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Insufficient credits warning */}
      {!canAfford && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
          <Coins className="h-3.5 w-3.5 shrink-0" />
          <span>
            Not enough credits. You need {RESEARCH_CREDIT_COST} credits but have{' '}
            {creditsAvailable ?? 0}. Upgrade your plan to continue.
          </span>
        </div>
      )}

      {/* Advanced section */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Sparkles className="h-3 w-3" />
        {showAdvanced ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        Advanced Options
      </button>

      {showAdvanced && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="glass-pharaoh rounded-xl p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Top-K Results
              </label>
              <p className="text-xs text-muted-foreground">
                Number of source documents to retrieve
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[topK]}
                onValueChange={([v]) => setTopK(v)}
                min={1}
                max={10}
                step={1}
                className="w-32 sm:w-48"
              />
              <span className="min-w-[2ch] text-right text-sm font-semibold text-foreground">
                {topK}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </form>
  );
}
