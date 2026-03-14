/**
 * ModelCard Component
 *
 * Displays a single AI model's response with scoring and metrics.
 * Designed for side-by-side comparison in the broadcast feature.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ModelResponse, ModelScores } from '@/types/broadcast';
import { AVAILABLE_PROVIDERS } from '@/types/broadcast';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ModelCardProps {
  response: ModelResponse;
  isWinner?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onCopy?: (content: string, event: React.MouseEvent) => Promise<void>;
  className?: string;
}

const ScoreBadge: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className="flex flex-col items-center">
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
    <span
      className="text-lg font-bold"
      style={{ color }}
    >
      {value}
    </span>
  </div>
);

export const ModelCard: React.FC<ModelCardProps> = ({
  response,
  isWinner = false,
  isExpanded = true,
  onToggleExpand,
  onCopy,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const provider = AVAILABLE_PROVIDERS.find((p) => p.id === response.provider);
  const isLoading = !response.content && !response.error;

  const handleCopy = async (event: React.MouseEvent) => {
    if (onCopy && response.content) {
      await onCopy(response.content, event);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 bg-white/50 dark:bg-gray-800/50 ${className}`}
      >
        <div className="flex items-center justify-center h-48">
          <div className="text-center space-y-3">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white"
              style={{ backgroundColor: provider?.color || '#666' }}
            >
              {provider?.icon || '🤖'}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {provider?.name || response.provider} is thinking...
            </p>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (response.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-6 ${className}`}
      >
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
              {provider?.name || response.provider}
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">{response.error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const scores = response.scores;
  const scoreColor = scores ? getScoreColor(scores.overall) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-xl border-2 transition-all ${
        isWinner
          ? 'border-[#0E7490] dark:border-[#0E7490] bg-[#EBD5A7]/50 dark:bg-[#0E7490]/20 shadow-lg shadow-[#0E7490]/10'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      } ${className}`}
    >
      {/* Winner Badge */}
      {isWinner && (
        <div className="absolute -top-3 left-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-r from-[#CBA135] to-[#F5C518] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
          >
            🏆 Best Overall
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg"
              style={{
                backgroundColor: provider?.color || '#666',
                color: 'white',
              }}
            >
              {provider?.icon || '🤖'}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {provider?.name || response.provider}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {response.model}
              </p>
            </div>
          </div>

          {/* Overall Score */}
          {scores && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: scoreColor }}
              >
                <span className="text-xl font-bold text-white">
                  {scores.overall.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall</p>
            </motion.div>
          )}
        </div>

        {/* Score Breakdown */}
        {scores && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 grid grid-cols-4 gap-2"
          >
            <ScoreBadge
              label="Complete"
              value={scores.completeness}
              color={getScoreColor(scores.completeness)}
            />
            <ScoreBadge
              label="Clear"
              value={scores.clarity}
              color={getScoreColor(scores.clarity)}
            />
            <ScoreBadge
              label="Accurate"
              value={scores.accuracy}
              color={getScoreColor(scores.accuracy)}
            />
            <ScoreBadge
              label="Creative"
              value={scores.creativity}
              color={getScoreColor(scores.creativity)}
            />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="prose dark:prose-invert max-w-none text-sm"
                >
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {response.content}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                    {response.content}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expand/Collapse Button */}
            {response.content.length > 200 && onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="mt-3 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show more
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Metrics */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{response.latency_ms}ms</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{response.tokens_out} tokens</span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

function getScoreColor(score: number): string {
  if (score >= 8) return '#0E7490'; // Nile teal
  if (score >= 6) return '#CBA135'; // Royal gold
  if (score >= 4) return '#F5C518'; // Gold primary
  return '#E74C3C'; // Error red
}
