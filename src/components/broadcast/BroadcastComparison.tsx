/**
 * BroadcastComparison Component
 *
 * Displays multiple AI model responses side-by-side for comparison.
 * Includes winner highlighting and comparison summary.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BroadcastResult, ModelResponse } from '@/types/broadcast';
import { ModelCard } from './ModelCard';
import { copyWithConfetti } from '@/lib/utils/confetti';
import {
  Sparkles,
  Zap,
  Trophy,
  Lightbulb,
  Share2,
  RefreshCw,
} from 'lucide-react';

interface BroadcastComparisonProps {
  result: BroadcastResult | null;
  isLoading?: boolean;
  onRetry?: () => void;
  onShare?: () => void;
  className?: string;
}

export const BroadcastComparison: React.FC<BroadcastComparisonProps> = ({
  result,
  isLoading = false,
  onRetry,
  onShare,
  className = '',
}) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 bg-white/50 dark:bg-gray-800/50"
          >
            <div className="flex items-center justify-center h-48">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#C9A227] rounded-full mx-auto animate-pulse" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI Model {i + 1} is responding...
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (!result || result.responses.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-gradient-to-br from-[#1E3A8A] to-[#C9A227] rounded-full mx-auto mb-4 flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Responses Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Submit a prompt to see AI models race side-by-side
        </p>
      </div>
    );
  }

  const handleToggleExpand = (provider: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(provider)) {
        next.delete(provider);
      } else {
        next.add(provider);
      }
      return next;
    });
  };

  const handleCopy = async (content: string, event: React.MouseEvent) => {
    const success = await copyWithConfetti(content, {
      intensity: 'medium',
      x: event.clientX,
      y: event.clientY,
    });

    if (!success) {
      console.error('Failed to copy content');
    }
  };

  const successfulResponses = result.responses.filter((r) => !r.error && r.content);
  const hasMultiple = successfulResponses.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`space-y-6 ${className}`}
    >
      {/* Comparison Summary */}
      <AnimatePresence>
        {result.comparison_summary && hasMultiple && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-[#EBD5A7] to-[#F5C518] dark:from-[#1E3A8A]/30 dark:to-[#1E3A8A]/30 rounded-xl p-6 border border-[#1E3A8A] dark:border-[#1B2B6B]"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-[#1E3A8A] to-[#C9A227] rounded-lg shadow-lg">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#1E3A8A]" />
                  AI Comparison Summary
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {result.comparison_summary}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model Responses Grid */}
      <div
        className={`grid gap-6 ${
          successfulResponses.length === 1
            ? 'grid-cols-1'
            : successfulResponses.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        <AnimatePresence mode="popLayout">
          {result.responses.map((response, index) => (
            <motion.div
              key={response.provider}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <ModelCard
                response={response}
                isWinner={response.provider === result.best_overall}
                isExpanded={expandedCards.has(response.provider)}
                onToggleExpand={() => handleToggleExpand(response.provider)}
                onCopy={handleCopy}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action Bar */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>
                {result.total_latency_ms}ms total latency
              </span>
            </div>
            {result.best_overall && (
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#CBA135]" />
                <span>
                  Best: {result.best_overall}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            {onShare && hasMultiple && (
              <button
                onClick={onShare}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#1E3A8A] to-[#C9A227] hover:from-[#1B2B6B] hover:to-[#CBA135] rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share Comparison
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
