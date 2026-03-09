'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';

interface Props {
  originalIntent: string;
  finalPrompt: string;
  comparison: {
    original_length: number;
    optimized_length: number;
    improvement_ratio: number;
    spec_completeness: number;
    quality_indicators: string[];
  } | null;
}

export function PromptComparison({ originalIntent, finalPrompt, comparison }: Props) {
  const completeness = comparison ? Math.round(comparison.spec_completeness * 100) : 0;
  const improvementRatio = comparison ? comparison.improvement_ratio : 0;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <motion.div
        className="text-center space-y-2"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#C9A227] to-[#1E3A8A] mb-2">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Prompt Crafted Successfully!</h2>
        <p className="text-muted-foreground">AI-enhanced for maximum clarity and effectiveness</p>
      </motion.div>

      {/* Improvement Stats */}
      {comparison && (
        <motion.div
          className="flex items-center justify-center gap-6 p-4 rounded-xl bg-gradient-to-r from-[#C9A227]/10 to-[#1E3A8A]/10 border border-[#C9A227]/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-[#C9A227]">
              {improvementRatio.toFixed(1)}x
            </div>
            <div className="text-xs text-muted-foreground">More detailed</div>
          </div>
          <TrendingUp className="w-6 h-6 text-[#C9A227]" />
          <div className="text-center">
            <div className="text-3xl font-bold text-[#1E3A8A]">{completeness}%</div>
            <div className="text-xs text-muted-foreground">Spec complete</div>
          </div>
        </motion.div>
      )}

      {/* Before */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xs font-medium text-red-400 uppercase tracking-wider">Before</div>
          <div className="text-xs text-muted-foreground">Your Input</div>
        </div>
        <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-sm text-muted-foreground italic">
          "{originalIntent}"
        </div>
      </motion.div>

      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <ArrowRight className="w-6 h-6 text-[#C9A227]" />
      </motion.div>

      {/* After */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xs font-medium text-green-400 uppercase tracking-wider">After</div>
          <div className="text-xs text-muted-foreground">AI-Crafted Prompt</div>
        </div>
        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {finalPrompt}
        </div>
      </motion.div>

      {/* Quality Indicators */}
      {comparison?.quality_indicators && comparison.quality_indicators.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Quality Enhancements
          </div>
          <div className="flex flex-wrap gap-2">
            {comparison.quality_indicators.map((indicator, i) => (
              <motion.span
                key={i}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#C9A227]/10 text-xs text-[#C9A227] border border-[#C9A227]/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
              >
                <CheckCircle className="w-3 h-3" />
                {indicator}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
