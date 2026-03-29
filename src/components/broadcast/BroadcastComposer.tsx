/**
 * BroadcastComposer Component
 *
 * Input component for creating broadcast prompts with provider selection,
 * fixed cost confirmation, and plan/credit visibility.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BroadcastRequest, ProviderId } from '@/types/broadcast';
import { AVAILABLE_PROVIDERS, BROADCAST_COST } from '@/types/broadcast';
import {
  Send,
  Zap,
  ChevronDown,
  ChevronUp,
  Crown,
  ShieldAlert,
} from 'lucide-react';
import { TempleCard } from '@/components/ui/TempleCard';

const PROVIDER_ICON_BG_CLASS: Record<ProviderId, string> = {
  deepseek: 'bg-[#FF6B35]',
  openrouter_qwen: 'bg-[#4F46E5]',
  openrouter_deepseek_r1: 'bg-[#0891B2]',
  anthropic_haiku: 'bg-[#D97706]',
};

interface BroadcastComposerProps {
  onSubmit: (request: BroadcastRequest) => void;
  isLoading?: boolean;
  disabled?: boolean;
  planCode?: string;
  creditsAvailable?: number;
  canBroadcast?: boolean;
  className?: string;
}

export const BroadcastComposer: React.FC<BroadcastComposerProps> = ({
  onSubmit,
  isLoading = false,
  disabled = false,
  planCode = 'FREE',
  creditsAvailable = 0,
  canBroadcast = false,
  className = '',
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<ProviderId[]>([
    'deepseek',
    'openrouter_qwen',
    'openrouter_deepseek_r1',
  ]);
  const [showProviders, setShowProviders] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && !isLoading) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleProviderToggle = (providerId: ProviderId) => {
    setSelectedProviders((prev) => {
      if (prev.includes(providerId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((p) => p !== providerId);
      } else {
        return [...prev, providerId];
      }
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || selectedProviders.length === 0 || isLoading) return;

    onSubmit({
      prompt: prompt.trim(),
      providers: selectedProviders,
      score: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const totalCredits = BROADCAST_COST;
  const isPremium = planCode === 'PRO' || planCode === 'POWER';

  return (
    <TempleCard variant="pharaoh" elevation="lg" className={className}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Multi-AI Broadcast Racing
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Prompt once. Watch models race. Compare quality and speed.
            </p>
          </div>

          {/* Credits Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#EBD5A7] to-[#F5C518] dark:from-[#1E3A8A]/50 dark:to-[#0E7490]/40 rounded-lg flex-shrink-0"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1E3A8A]" />
            <span className="text-sm font-semibold text-[#1E3A8A] dark:text-[#EBD5A7]">
              {totalCredits} credits
            </span>
          </motion.div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Plan</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{planCode}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Credits Available</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{creditsAvailable}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {isPremium ? 'Pro Access' : 'Upgrade Required'}
            </p>
          </div>
        </div>
      </div>

      {/* Provider Selection */}
      <AnimatePresence>
        {showProviders && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Select AI Models ({selectedProviders.length} selected)
              </h3>
              <button
                onClick={() => setShowProviders(false)}
                aria-label="Collapse provider selection"
                title="Collapse provider selection"
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_PROVIDERS.map((provider) => {
                const isSelected = selectedProviders.includes(provider.id);
                return (
                  <motion.button
                    key={provider.id}
                    onClick={() => handleProviderToggle(provider.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[#1E3A8A] bg-[#EBD5A7] dark:bg-[#1E3A8A]/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } cursor-pointer`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg text-white ${PROVIDER_ICON_BG_CLASS[provider.id]}`}
                      >
                        {provider.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight break-words">
                          {provider.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed break-words">
                          {provider.description}
                        </p>
                        {provider.requiresKey && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                            API key may be required
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            ✓
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Provider Toggle */}
      {!showProviders && (
        <button
          onClick={() => setShowProviders(true)}
          aria-label="Show provider selection"
          className="w-full px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
          Show AI Model Selection ({selectedProviders.length} selected)
        </button>
      )}

      {/* Prompt Input */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your prompt here... Try: 'Write a product description for a smartwatch' or 'Explain quantum computing in simple terms'"
              disabled={disabled || isLoading}
              rows={4}
              className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl resize-none sm:resize-y min-h-[100px] sm:min-h-[130px] lg:min-h-[160px] focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="absolute bottom-3 right-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {prompt.length} chars
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-[#1E3A8A]/20 dark:border-[#EBD5A7]/30 bg-[#F5C518]/10 dark:bg-[#1E3A8A]/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Cost Confirmation</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  This broadcast costs {BROADCAST_COST} credits total, not per model.
                </p>
              </div>
              <span className="text-sm font-bold text-[#1E3A8A] dark:text-[#EBD5A7]">-{BROADCAST_COST}</span>
            </div>
          </div>

          {!isPremium && (
            <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-start gap-3">
              <Crown className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Broadcast is Pro-only</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Upgrade to Pro or Power to unlock multi-model racing.
                </p>
              </div>
            </div>
          )}

          {isPremium && creditsAvailable < BROADCAST_COST && (
            <div className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 mt-0.5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">Insufficient credits</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                  You need {BROADCAST_COST} credits to start a broadcast.
                </p>
              </div>
            </div>
          )}

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2">
            {[
              'Write a blog post about AI',
              'Explain a complex concept',
              'Generate creative ideas',
              'Write code documentation',
            ].map((quickPrompt) => (
              <button
                key={quickPrompt}
                type="button"
                onClick={() => setPrompt(quickPrompt)}
                disabled={disabled || isLoading}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {quickPrompt}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
            <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
              Press ⌘/Ctrl + Enter to submit
            </p>

            <button
              type="submit"
              disabled={
                !prompt.trim() ||
                selectedProviders.length === 0 ||
                isLoading ||
                disabled ||
                !canBroadcast
              }
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#1E3A8A] to-[#C9A227] hover:from-[#1B2B6B] hover:to-[#CBA135] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:from-gray-400 disabled:to-gray-400"
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Start Race ({selectedProviders.length} models)
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </TempleCard>
  );
};
