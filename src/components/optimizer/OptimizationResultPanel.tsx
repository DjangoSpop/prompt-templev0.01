'use client';

import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Share2, BookmarkPlus, Sparkles, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { WowScoreGauge } from './WowScoreGauge';
import { ImprovementTags, parseImprovements, SAMPLE_IMPROVEMENT_TAGS, type ImprovementTag } from './ImprovementTags';
import { ViralShareButton } from '@/components/ViralShareButton';
import { apiClient } from '@/lib/api/typed-client';
import type { OptimizeStreamResult } from '@/lib/api/ai';

interface OptimizationResultPanelProps {
  result: OptimizeStreamResult | null;
  originalPrompt: string;
  isStreaming: boolean;
  onCopy?: () => void;
  onSave?: () => void;
  className?: string;
}

function computeWowScore(result: OptimizeStreamResult): number {
  const imp = result.improvements;
  if (!imp) return 7.0;
  if (imp.overall_score !== undefined) return Math.min(10, imp.overall_score);
  const scores = [
    imp.clarity_score,
    imp.specificity_score,
    imp.effectiveness_score,
  ].filter((s): s is number => s !== undefined);
  if (!scores.length) return 7.0;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.min(10, Math.round(avg * 10) / 10);
}

export function OptimizationResultPanel({
  result,
  originalPrompt,
  isStreaming,
  onCopy,
  onSave,
  className = '',
}: OptimizationResultPanelProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    if (!result?.optimized || saving || saved) return;
    setSaving(true);
    try {
      await apiClient.createSavedPrompt({
        title: originalPrompt
          ? `Optimized: ${originalPrompt.slice(0, 60)}${originalPrompt.length > 60 ? '…' : ''}`
          : `Optimized prompt (${new Date().toLocaleDateString()})`,
        content: result.optimized,
        description: result.diff_summary ?? result.suggestions?.[0] ?? 'AI-optimized prompt',
        category: 'optimization',
        tags: ['optimized', 'ai-generated'],
        source: 'optimizer',
        metadata: {
          wow_score: computeWowScore(result),
          run_id: result.run_id,
          original_prompt: originalPrompt,
          improvements: result.improvements,
        },
      });
      setSaved(true);
      toast.success('Saved to your Prompt Library!');
      onSave?.();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save — please try again');
    } finally {
      setSaving(false);
    }
  }, [result, originalPrompt, saving, saved, onSave]);
  const wowScore = useMemo<number>(() => {
    if (!result) return 0;
    return computeWowScore(result);
  }, [result]);

  const improvementTags = useMemo<ImprovementTag[]>(() => {
    if (!result) return [];
    const raw = result.suggestions ?? [];
    return raw.length > 0 ? parseImprovements(raw) : SAMPLE_IMPROVEMENT_TAGS.slice(0, 4);
  }, [result]);

  const shareData = result && originalPrompt ? {
    id: result.run_id || 'opt-' + Date.now(),
    beforePrompt: originalPrompt,
    afterPrompt: result.optimized || '',
    beforeScore: 2.0,
    afterScore: wowScore,
    improvements: result.suggestions || improvementTags.map(t => t.label),
  } : null;

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      {/* Wow Score + Label */}
      {(result || isStreaming) && (
        <div className="flex flex-col items-center py-4">
          {result ? (
            <WowScoreGauge score={wowScore} size={200} />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-full border-4 border-[rgba(245,197,24,0.2)] flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-10 h-10 text-[#F5C518] opacity-60" />
                </motion.div>
              </div>
              <p className="text-sm text-[#9CA3AF]">Calculating score…</p>
            </div>
          )}
        </div>
      )}

      {/* Improvement Tags */}
      {result && improvementTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#6B7280] uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" />
            Applied Improvements
          </p>
          <ImprovementTags tags={improvementTags} />
        </div>
      )}

      {/* Action bar */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 pt-2 border-t border-[rgba(245,197,24,0.08)]"
        >
          {onCopy && (
            <button
              onClick={onCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || saved || !result?.optimized}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed
              text-[#9CA3AF] hover:text-white hover:bg-white/5"
          >
            {saving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</>
            ) : saved ? (
              <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Saved!</span></>
            ) : (
              <><BookmarkPlus className="w-3.5 h-3.5" />Save</>
            )}
          </button>
          {shareData && (
            <div className="ml-auto">
              <ViralShareButton optimization={shareData} variant="button" />
            </div>
          )}
        </motion.div>
      )}

      {/* Citations if available */}
      {result?.citations && result.citations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#6B7280] uppercase tracking-widest font-semibold">Sources</p>
          <div className="space-y-1.5">
            {result.citations.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs text-[#9CA3AF] px-2.5 py-1.5 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]"
              >
                <span className="text-[#F5C518] font-mono">[{i + 1}]</span>
                <span>{c.title}</span>
                <span className="ml-auto text-[#4B5563]">{Math.round(c.score * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !isStreaming && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="text-4xl mb-3 opacity-30">𓏲</div>
          <p className="text-sm text-[#6B7280]" style={{ fontFamily: 'Cinzel, serif' }}>
            Your scroll awaits.
          </p>
          <p className="text-xs text-[#4B5563] mt-1">Begin your first optimization.</p>
        </div>
      )}
    </div>
  );
}
