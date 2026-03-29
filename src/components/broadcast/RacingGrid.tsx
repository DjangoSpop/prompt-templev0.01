'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Clock3, Gauge, AlertTriangle } from 'lucide-react';
import type { BroadcastModelState } from '@/types/broadcast';

interface RacingGridProps {
  models: BroadcastModelState[];
  isStreaming?: boolean;
}

const HIEROGLYPHS = ['𓂀', '𓇯', '𓊵', '𓏏'];

const PROVIDER_ICON_BG_CLASS: Record<string, string> = {
  deepseek: 'bg-[#FF6B35]',
  openrouter_qwen: 'bg-[#4F46E5]',
  openrouter_deepseek_r1: 'bg-[#0891B2]',
  anthropic_haiku: 'bg-[#D97706]',
};

function getRelativeSpeedWidth(model: BroadcastModelState, fastestLatency: number, slowestLatency: number) {
  if (typeof model.latency_ms !== 'number' || fastestLatency <= 0 || slowestLatency <= 0) {
    return 24;
  }

  if (slowestLatency === fastestLatency) {
    return 100;
  }

  const normalized = (slowestLatency - model.latency_ms) / (slowestLatency - fastestLatency);
  return Math.round(35 + normalized * 65);
}

function EgyptianLoading() {
  return (
    <div className="flex items-center gap-2 text-[#1E3A8A] dark:text-[#EBD5A7]">
      {HIEROGLYPHS.map((glyph, index) => (
        <motion.span
          key={glyph + index}
          className="text-lg"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.14, ease: 'easeInOut' }}
        >
          {glyph}
        </motion.span>
      ))}
    </div>
  );
}

export const RacingGrid: React.FC<RacingGridProps> = ({ models, isStreaming = false }) => {
  if (models.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-6 sm:p-8 lg:p-10 text-center bg-white/70 dark:bg-gray-900/30">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Ready to race</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Submit a prompt to stream responses from multiple models in parallel.
        </p>
      </div>
    );
  }

  const latencies = models
    .map((model) => model.latency_ms)
    .filter((latency): latency is number => typeof latency === 'number' && latency > 0);

  const fastest = latencies.length ? Math.min(...latencies) : 0;
  const slowest = latencies.length ? Math.max(...latencies) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {models.map((model, index) => {
          const speedWidth = getRelativeSpeedWidth(model, fastest, slowest);

          return (
            <motion.section
              key={model.provider}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.09 }}
              className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
            >
              <div className="h-1.5 bg-gray-100 dark:bg-gray-800">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#1E3A8A] via-[#0E7490] to-[#C9A227]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${speedWidth}%` }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                />
              </div>

              <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm sm:text-base text-white ${PROVIDER_ICON_BG_CLASS[model.provider] ?? 'bg-[#1E3A8A]'}`}
                    >
                      {model.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{model.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{model.model}</p>
                    </div>
                  </div>

                  {model.isWinner && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.12, 1], opacity: 1 }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="text-amber-500"
                    >
                      <Crown className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>

                <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                  <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Clock3 className="w-3 h-3" />
                    {typeof model.latency_ms === 'number' ? `${model.latency_ms} ms` : 'waiting'}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    {typeof model.tokens_out === 'number' ? `${model.tokens_out} tokens` : 'streaming'}
                  </span>
                  {model.scores?.overall != null && (
                    <span className="px-2 py-1 rounded-md bg-[#EBD5A7]/60 dark:bg-[#1E3A8A]/40 text-[#1E3A8A] dark:text-[#EBD5A7] font-semibold">
                      Score {model.scores.overall.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 sm:p-4 min-h-[120px] sm:min-h-[180px] lg:min-h-[220px]">
                {model.status === 'waiting' && (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                    <EgyptianLoading />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting response...</p>
                  </div>
                )}

                {model.status === 'error' && (
                  <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-3 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <span>{model.error || 'Model failed to respond.'}</span>
                  </div>
                )}

                {(model.status === 'streaming' || model.status === 'complete') && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {model.content || '...'}
                    </p>
                    {isStreaming && model.status === 'streaming' && (
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                        className="h-1.5 rounded-full bg-gradient-to-r from-[#0E7490] to-[#C9A227]"
                      />
                    )}
                  </div>
                )}
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
};
