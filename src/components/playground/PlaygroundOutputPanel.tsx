'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Download,
  Save,
  CheckCircle2,
  Loader2,
  Sparkles,
  GitCompareArrows,
  BookOpen,
  MessageSquare,
  Database,
  Wand2,
  Lightbulb,
  BrainCircuit,
  Cpu,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/typed-client';
import type { OptimizeStreamResult } from '@/lib/api/ai';

type ServiceMode = 'optimize' | 'chat' | 'rag' | 'generate' | 'suggestions' | 'askme' | 'agent';

interface PlaygroundOutputPanelProps {
  mode: ServiceMode;
  isStreaming: boolean;
  output: string;
  result?: OptimizeStreamResult | null;
  originalPrompt?: string;
  suggestions?: string[];
  ragContext?: { chunks?: Array<{ content?: string; text?: string; source?: string; score?: number }> };
  className?: string;
  onInsertSuggestion?: (text: string) => void;
}

const SERVICE_ICON: Record<ServiceMode, React.ComponentType<{ className?: string }>> = {
  optimize: Wand2,
  chat: MessageSquare,
  rag: Database,
  generate: Sparkles,
  suggestions: Lightbulb,
  askme: BrainCircuit,
  agent: Cpu,
};

const SERVICE_LABEL: Record<ServiceMode, string> = {
  optimize: 'Optimized Prompt',
  chat: 'AI Response',
  rag: 'RAG Answer',
  generate: 'Generated Output',
  suggestions: 'Suggestions',
  askme: 'AskMe Result',
  agent: 'Deep Optimized Prompt',
};

export function PlaygroundOutputPanel({
  mode,
  isStreaming,
  output,
  result,
  originalPrompt,
  suggestions,
  ragContext,
  className,
  onInsertSuggestion,
}: PlaygroundOutputPanelProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = useCallback(() => {
    const text = output || suggestions?.join('\n') || '';
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output, suggestions]);

  const handleSave = useCallback(async () => {
    const content = output || suggestions?.join('\n') || '';
    if (!content || saving || saved) return;
    setSaving(true);
    try {
      await apiClient.createSavedPrompt({
        title: originalPrompt
          ? `${SERVICE_LABEL[mode]}: ${originalPrompt.slice(0, 55)}${originalPrompt.length > 55 ? '…' : ''}`
          : `Playground ${SERVICE_LABEL[mode]} (${new Date().toLocaleDateString()})`,
        content,
        description: mode === 'optimize' && result?.diff_summary ? result.diff_summary : `From AI Playground — ${SERVICE_LABEL[mode]}`,
        category: mode,
        tags: ['playground', mode, 'ai-generated'],
        source: 'playground',
        metadata: {
          mode,
          original_prompt: originalPrompt,
          ...(result ? { wow_score: result.improvements?.overall_score, run_id: result.run_id } : {}),
        },
      });
      setSaved(true);
      toast.success('Saved to Prompt Library!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [output, suggestions, mode, originalPrompt, result, saving, saved]);

  const handleDownload = useCallback(() => {
    const text = output || suggestions?.join('\n') || '';
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playground-${mode}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, suggestions, mode]);

  const isEmpty = !isStreaming && !output && (!suggestions || suggestions.length === 0);
  const Icon = SERVICE_ICON[mode];

  // Compute wow score for optimize mode
  let wowScore: number | null = null;
  if (mode === 'optimize' && result) {
    const imp = result.improvements;
    if (imp?.overall_score !== undefined) wowScore = Math.min(10, imp.overall_score);
    else {
      const scores = [imp?.clarity_score, imp?.specificity_score, imp?.effectiveness_score]
        .filter((s): s is number => s !== undefined);
      if (scores.length) wowScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    }
  }

  return (
    <div className={cn('flex flex-col h-full bg-bg-secondary rounded-xl border border-border overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-primary/40">
        <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <Icon className="w-4 h-4 text-brand" />
          {SERVICE_LABEL[mode]}
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-brand animate-pulse ml-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating…
            </span>
          )}
        </div>

        {!isEmpty && (
          <div className="flex items-center gap-1">
            {wowScore !== null && (
              <div className={cn(
                'px-2 py-0.5 rounded-full text-xs font-bold',
                wowScore >= 8 ? 'bg-green-500/20 text-green-400' :
                wowScore >= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              )}>
                ✦ {wowScore.toFixed(1)} / 10
              </div>
            )}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
              title="Copy"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                saved
                  ? 'bg-green-500/20 text-green-400 cursor-default'
                  : 'bg-brand/10 text-brand hover:bg-brand/20'
              )}
            >
              {saving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <AnimatePresence mode="wait">
          {isEmpty && !isStreaming ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <Icon className="w-10 h-10 text-text-muted/30 mb-3" />
              <p className="text-text-muted text-sm">Output will appear here once you run the service.</p>
            </motion.div>
          ) : (

            <motion.div
              key="content"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Suggestions mode */}
              {mode === 'suggestions' && suggestions && suggestions.length > 0 && (
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary border border-border hover:border-brand/40 transition-colors group"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand/10 text-brand text-xs flex items-center justify-center font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-text-primary flex-1 leading-relaxed">{s}</p>
                      {onInsertSuggestion && (
                        <button
                          onClick={() => onInsertSuggestion(s)}
                          className="opacity-0 group-hover:opacity-100 text-xs text-brand hover:underline transition-opacity flex-shrink-0"
                        >
                          Use
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* RAG context chunks */}
              {mode === 'rag' && ragContext?.chunks && ragContext.chunks.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Retrieved Context
                  </p>
                  {ragContext.chunks.slice(0, 3).map((chunk, i) => {
                    const chunkText = chunk.content || chunk.text || '';
                    return (
                      <div key={i} className="p-2.5 rounded-lg bg-brand/5 border border-brand/20 text-xs text-text-secondary leading-relaxed">
                        {chunkText.slice(0, 200)}{chunkText.length > 200 ? '…' : ''}
                        {chunk.score !== undefined && (
                          <span className="ml-2 text-brand/60">({(chunk.score * 100).toFixed(0)}% match)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Optimize diff summary */}
              {mode === 'optimize' && result?.diff_summary && !isStreaming && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-sm text-green-300">
                  <GitCompareArrows className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{result.diff_summary}</span>
                </div>
              )}

              {/* Main text output */}
              {(output || isStreaming) && (
                <div className="relative">
                  <pre className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed font-sans break-words">
                    {output}
                    {isStreaming && (
                      <span className="inline-block w-0.5 h-4 bg-brand animate-pulse ml-0.5 align-middle" />
                    )}
                  </pre>
                </div>
              )}

              {/* Optimize improvement tags */}
              {mode === 'optimize' && result?.suggestions && result.suggestions.length > 0 && !isStreaming && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">Suggestions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.suggestions.slice(0, 5).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
