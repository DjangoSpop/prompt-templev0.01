'use client';

import React, { useMemo, useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import type { BroadcastModelState } from '@/types/broadcast';
import { TempleCard } from '@/components/ui/TempleCard';

interface ShareComparisonProps {
  prompt: string;
  models: BroadcastModelState[];
  winnerName?: string;
}

export const ShareComparison: React.FC<ShareComparisonProps> = ({
  prompt,
  models,
  winnerName,
}) => {
  const [copied, setCopied] = useState(false);

  const successfulModels = useMemo(
    () => models.filter((model) => !model.error && model.content.trim().length > 0),
    [models]
  );

  const shareText = useMemo(() => {
    const lines = [
      'Multi-AI Broadcast Result',
      `Prompt: ${prompt}`,
      winnerName ? `Winner: ${winnerName}` : '',
      ...successfulModels.map(
        (model) =>
          `${model.name} - ${model.scores?.overall?.toFixed(1) ?? 'n/a'} - ${model.latency_ms ?? 'n/a'}ms`
      ),
    ].filter(Boolean);

    return lines.join('\n');
  }, [prompt, successfulModels, winnerName]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    // Stateless share URL — OG metadata is encoded in the params
    const params = new URLSearchParams({
      t: `AI Broadcast: ${winnerName ?? 'Comparison'}`,
      type: 'broadcast',
      d: `Compared ${successfulModels.length} AI models. Winner: ${winnerName ?? 'Pending'}`,
      c: prompt.slice(0, 500),
    });

    return `${window.location.origin}/share?${params.toString()}`;
  }, [prompt, successfulModels, winnerName]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Prompt Temple Broadcast Comparison',
          text: shareText,
          url: shareUrl || window.location.href,
        });
        return;
      } catch {
        // ignored
      }
    }

    await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (successfulModels.length < 2) {
    return null;
  }

  return (
    <TempleCard variant="default" elevation="md" className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Share this comparison</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Export a social-ready summary with winner, scores, and speed.
          </p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#C9A227] to-[#1E3A8A] text-white text-sm font-semibold hover:opacity-95"
        >
          <Share2 className="w-4 h-4" />
          Share Comparison
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Card Preview</div>
        <p className="mt-2 text-sm text-gray-800 dark:text-gray-100 line-clamp-2">{prompt}</p>
        <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
          Winner: <span className="font-semibold">{winnerName ?? 'Pending'}</span>
        </div>
        <ul className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
          {successfulModels.map((model) => (
            <li key={model.provider}>
              {model.name} | score {model.scores?.overall?.toFixed(1) ?? 'n/a'} | {model.latency_ms ?? 'n/a'}ms
            </li>
          ))}
        </ul>
      </div>

      {shareUrl && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-3 py-2">
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{shareUrl}</span>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            }}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      )}
    </TempleCard>
  );
};
