/**
 * Multi-AI Broadcast Page
 *
 * Main page for the broadcast feature - sends prompts to multiple AI models
 * simultaneously and compares results side-by-side.
 */

'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BroadcastComposer,
  RacingGrid,
  ScoringPanel,
  ShareComparison,
} from '@/components/broadcast';
import type { BroadcastRequest } from '@/types/broadcast';
import { InsufficientCreditsModal } from '@/components/credits/InsufficientCreditsModal';
import { useBroadcast } from '@/hooks/useBroadcast';

export default function BroadcastPage() {
  const {
    isLoading,
    result,
    modelStates,
    error,
    planCode,
    creditsAvailable,
    canBroadcast,
    startBroadcast,
    reset,
  } = useBroadcast();

  const handleSubmit = useCallback(async (request: BroadcastRequest) => {
    await startBroadcast(request);
  }, [startBroadcast]);

  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  const winner = modelStates.find((model) => model.isWinner);

  const handleBestOfAll = useCallback(() => {
    const bestContent = winner?.content?.trim() || result?.comparison_summary?.trim() || '';
    if (!bestContent) {
      return;
    }

    navigator.clipboard
      .writeText(bestContent)
      .then(() => {
        // no-op
      })
      .catch(() => {
        // no-op
      });
  }, [result?.comparison_summary, winner?.content]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBD5A7] via-[#F5C518] to-[#EBD5A7] dark:from-gray-900 dark:via-[#1E3A8A]/20 dark:to-[#1B2B6B]/20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-6 lg:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Multi-AI Broadcast
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Send one prompt to multiple AI models simultaneously and compare their
            responses side-by-side to find the best result.
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Input */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-4">
              <BroadcastComposer
                onSubmit={handleSubmit}
                isLoading={isLoading}
                disabled={isLoading}
                planCode={planCode}
                creditsAvailable={creditsAvailable}
                canBroadcast={canBroadcast}
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-3">
            {/* Error State */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4 sm:mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-6"
                >
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                    Broadcast Failed
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4 sm:space-y-6">
              <RacingGrid models={modelStates} isStreaming={isLoading} />

              <ScoringPanel
                models={modelStates}
                comparisonSummary={result?.comparison_summary}
                winnerName={winner?.name}
                onBestOfAll={handleBestOfAll}
              />

              {result?.prompt && (
                <ShareComparison
                  prompt={result.prompt}
                  models={modelStates}
                  winnerName={winner?.name}
                />
              )}

              {(result || error) && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Reset Broadcast
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal />
    </div>
  );
}
