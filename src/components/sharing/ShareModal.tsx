'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Twitter, Linkedin, Link2, Check, Gift, Sparkles } from 'lucide-react';
import { createShare } from '@/lib/api/sharing';
import {
  generateShareCard,
  generateShareUrl,
  openTwitterShare,
  openLinkedInShare,
  copyToClipboard,
} from '@/lib/sharing/generateShareCard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPrompt: string;
  optimizedPrompt: string;
  wowScore: number;
  beforeScore?: number;
  afterScore?: number;
  improvements?: string[];
  category?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  originalPrompt,
  optimizedPrompt,
  wowScore,
  beforeScore = 2.5,
  afterScore,
  improvements = [],
  category = 'other',
}: ShareModalProps) {
  const [title, setTitle] = useState('');
  const [showOriginal, setShowOriginal] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{
    share_url: string;
    share_token: string;
    credits_awarded: number;
    new_achievements: Array<{ achievement_type: string; credits_awarded: number }>;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const score = afterScore ?? wowScore;

  const handleCreateShare = async () => {
    setIsSharing(true);
    setError('');
    try {
      const result = await createShare({
        original_prompt: originalPrompt,
        optimized_prompt: optimizedPrompt,
        wow_score: wowScore,
        title: title || undefined,
        category,
        show_original: showOriginal,
      });
      setShareResult(result);
    } catch {
      // Fall back to stateless share
      const card = generateShareCard({
        id: '',
        beforePrompt: originalPrompt,
        afterPrompt: optimizedPrompt,
        beforeScore,
        afterScore: score,
        improvements,
      });
      setShareResult({
        share_url: card.shareUrl,
        share_token: '',
        credits_awarded: 0,
        new_achievements: [],
      });
    } finally {
      setIsSharing(false);
    }
  };

  const getShareUrl = () => {
    if (shareResult?.share_url) return shareResult.share_url;
    return generateShareUrl({
      title: title || `Prompt Optimized: ${beforeScore} → ${score}/10`,
      type: 'optimization',
      score,
      beforeScore,
      content: optimizedPrompt.slice(0, 300),
      improvements,
    });
  };

  const handleTwitter = () => {
    const url = getShareUrl();
    const text = [
      `Just transformed my prompt from ${beforeScore.toFixed(1)} → ${score.toFixed(1)}/10`,
      `PromptTemple is insane`,
      `Try it free → ${url}`,
      '#PromptEngineering #AI',
    ].join('\n');
    openTwitterShare(text);
  };

  const handleLinkedIn = () => {
    const url = getShareUrl();
    const text = `I went from a ${beforeScore}/10 prompt to a ${score}/10 masterpiece in seconds using PromptTemple.`;
    openLinkedInShare(url, text);
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = wowScore >= 8 ? 'text-emerald-400' : wowScore >= 6 ? 'text-yellow-400' : 'text-orange-400';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div
              className="bg-[#1A1A2E] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Sparkles size={20} className="text-[#C5A55A]" />
                  <h2 className="text-lg font-semibold text-[#E6D5A8]">Share Your Result</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={18} className="text-[#E6D5A8]/60" />
                </button>
              </div>

              {/* Score Preview */}
              <div className="p-5">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{beforeScore.toFixed(1)}</div>
                    <div className="text-[10px] text-[#E6D5A8]/40 uppercase">Before</div>
                  </div>
                  <div className="text-xl text-emerald-400">&rarr;</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{score.toFixed(1)}</div>
                    <div className="text-[10px] text-[#E6D5A8]/40 uppercase">After</div>
                  </div>
                  <div className="ml-4 px-3 py-1 rounded-full bg-[#C5A55A]/10 border border-[#C5A55A]/30">
                    <span className={`text-sm font-bold ${scoreColor}`}>{wowScore.toFixed(1)}</span>
                    <span className="text-[10px] text-[#E6D5A8]/40 ml-1">wow</span>
                  </div>
                </div>

                {/* Credit Reward Banner */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#C5A55A]/5 border border-[#C5A55A]/20 mb-5">
                  <Gift size={16} className="text-[#C5A55A]" />
                  <span className="text-sm text-[#C5A55A]">
                    Earn <strong>+50 credits</strong> for sharing
                  </span>
                </div>

                {/* Title Input */}
                {!shareResult && (
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="text-xs text-[#E6D5A8]/50 uppercase tracking-wider block mb-1.5">
                        Title (optional)
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="My awesome optimization..."
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#E6D5A8] text-sm placeholder:text-[#E6D5A8]/30 focus:outline-none focus:border-[#C5A55A]/50"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-[#E6D5A8]/70 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOriginal}
                        onChange={(e) => setShowOriginal(e.target.checked)}
                        className="rounded border-white/20"
                      />
                      Show before/after comparison
                    </label>
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-400 mb-4">{error}</div>
                )}

                {/* Share Buttons */}
                {!shareResult ? (
                  <button
                    onClick={handleCreateShare}
                    disabled={isSharing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isSharing ? 'Creating share link...' : 'Generate Share Link'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    {/* Achievements */}
                    {shareResult.new_achievements?.length > 0 && (
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                        <span className="text-purple-400 text-sm font-medium">
                          Achievement Unlocked: {shareResult.new_achievements[0].achievement_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}

                    {shareResult.credits_awarded > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <span className="text-emerald-400 text-sm font-medium">
                          +{shareResult.credits_awarded} credits earned!
                        </span>
                      </div>
                    )}

                    {/* Platform buttons */}
                    <button
                      onClick={handleTwitter}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <Twitter size={18} className="text-sky-400" />
                      <span className="text-sm text-[#E6D5A8]">Share on X / Twitter</span>
                    </button>

                    <button
                      onClick={handleLinkedIn}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <Linkedin size={18} className="text-blue-400" />
                      <span className="text-sm text-[#E6D5A8]">Share on LinkedIn</span>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      {copied ? (
                        <Check size={18} className="text-emerald-400" />
                      ) : (
                        <Link2 size={18} className="text-[#C5A55A]" />
                      )}
                      <span className="text-sm text-[#E6D5A8]">
                        {copied ? 'Copied!' : 'Copy Link'}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-white/5 text-center">
                <p className="text-[10px] text-[#E6D5A8]/30">
                  Share to inspire others
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
