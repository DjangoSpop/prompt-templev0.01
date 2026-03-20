'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Copy, Check, Sparkles, ArrowRight, TrendingUp,
  Users, Star, Eye, Share2
} from 'lucide-react';
import { trackShareEvent } from '@/lib/api/sharing';

interface ShareData {
  id: string;
  username: string;
  original_prompt: string;
  optimized_prompt: string;
  wow_score: number;
  title: string;
  category: string;
  show_original: boolean;
  view_count: number;
  copy_count: number;
  reshare_count: number;
  share_url: string;
  engagement_score: number;
  created_at: string;
}

interface BackendShareLandingProps {
  shareToken: string;
  initialData: ShareData | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function ScoreRing({ score, label, color, size = 'lg' }: {
  score: number;
  label: string;
  color: 'red' | 'emerald' | 'gold';
  size?: 'sm' | 'lg';
}) {
  const colors = {
    red: { text: 'text-red-400', border: 'border-red-400/50', bg: 'bg-red-400/5', shadow: 'shadow-red-400/10' },
    emerald: { text: 'text-emerald-400', border: 'border-emerald-400/50', bg: 'bg-emerald-400/5', shadow: 'shadow-emerald-400/20' },
    gold: { text: 'text-yellow-400', border: 'border-yellow-400/50', bg: 'bg-yellow-400/5', shadow: 'shadow-yellow-400/10' },
  };
  const c = colors[color];
  const sz = size === 'lg' ? 'w-28 h-28 md:w-32 md:h-32' : 'w-20 h-20';
  const textSz = size === 'lg' ? 'text-4xl md:text-5xl' : 'text-2xl';

  return (
    <div className={`${sz} rounded-full border-2 ${c.border} ${c.bg} shadow-lg ${c.shadow} flex flex-col items-center justify-center`}>
      <span className={`${textSz} font-bold ${c.text}`}>{score.toFixed(1)}</span>
      <span className="text-[10px] text-[#E6D5A8]/50 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

export default function BackendShareLanding({ shareToken, initialData }: BackendShareLandingProps) {
  const [copied, setCopied] = useState(false);
  const share = initialData;

  // Track view on mount
  useEffect(() => {
    if (shareToken) {
      trackShareEvent(shareToken, 'view');
    }
  }, [shareToken]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    trackShareEvent(shareToken, 'copy');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCTAClick = () => {
    trackShareEvent(shareToken, 'cta_click');
  };

  // Not found state
  if (!share) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0E0E10] via-[#1A1A2E] to-[#0E0E10] text-[#E6D5A8] flex items-center justify-center">
        <motion.div
          className="text-center max-w-md px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-5xl mb-4">&#x13080;</div>
          <h1 className="text-2xl font-bold mb-3">Share Not Found</h1>
          <p className="text-[#E6D5A8]/60 mb-8">
            This shared prompt may have been removed or the link is invalid.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-400 hover:to-teal-400 transition-all"
          >
            <Sparkles size={18} />
            Explore PromptTemple
          </Link>
        </motion.div>
      </div>
    );
  }

  const wowScore = share.wow_score;
  const wowColor = wowScore >= 8 ? 'emerald' : wowScore >= 6 ? 'gold' : 'red';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E0E10] via-[#1A1A2E] to-[#0E0E10] text-[#E6D5A8]">
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-16">
        {/* Brand */}
        <motion.div
          className="text-center mb-10"
          initial="hidden" animate="visible" custom={0} variants={fadeUp}
        >
          <div className="text-4xl mb-3">&#x13080;</div>
          <p className="text-[#C5A55A] text-xs tracking-[0.4em] uppercase font-semibold">
            Prompt Temple
          </p>
        </motion.div>

        {/* Badge + Author */}
        <motion.div
          className="flex flex-col items-center gap-3 mb-8"
          initial="hidden" animate="visible" custom={1} variants={fadeUp}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase border border-[#C5A55A]/30 bg-[#C5A55A]/5 text-[#C5A55A]">
            <TrendingUp size={14} />
            Optimization Result
          </span>
          {share.username && (
            <span className="text-sm text-[#E6D5A8]/40">
              Shared by <span className="text-[#E6D5A8]/60 font-medium">{share.username}</span>
            </span>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-center mb-6 leading-tight"
          initial="hidden" animate="visible" custom={2} variants={fadeUp}
        >
          {share.title || (
            <>
              Wow Score:{' '}
              <span className={wowColor === 'emerald' ? 'text-emerald-400' : wowColor === 'gold' ? 'text-yellow-400' : 'text-red-400'}>
                {wowScore.toFixed(1)}
              </span>
              <span className="text-[#E6D5A8]/60 text-2xl">/10</span>
            </>
          )}
        </motion.h1>

        {/* Score Ring */}
        <motion.div
          className="flex justify-center mb-10"
          initial="hidden" animate="visible" custom={3} variants={fadeUp}
        >
          <ScoreRing score={wowScore} label="Wow Score" color={wowColor} />
        </motion.div>

        {/* Before / After Prompts */}
        {share.show_original && share.original_prompt && (
          <motion.div
            className="space-y-4 mb-8"
            initial="hidden" animate="visible" custom={4} variants={fadeUp}
          >
            {/* Before */}
            <div>
              <h3 className="text-xs text-red-400/70 uppercase tracking-wider font-semibold mb-2">
                Before
              </h3>
              <div className="bg-red-400/5 border border-red-400/10 rounded-xl p-5">
                <p className="text-[#E6D5A8]/60 text-sm leading-relaxed whitespace-pre-wrap">
                  {share.original_prompt.length > 400
                    ? `${share.original_prompt.slice(0, 400)}...`
                    : share.original_prompt}
                </p>
              </div>
            </div>

            {/* After */}
            <div className="relative">
              <h3 className="text-xs text-emerald-400/70 uppercase tracking-wider font-semibold mb-2">
                After
              </h3>
              <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-xl p-5">
                <p className="text-[#E6D5A8]/90 text-sm leading-relaxed whitespace-pre-wrap">
                  {share.optimized_prompt.length > 600
                    ? `${share.optimized_prompt.slice(0, 600)}...`
                    : share.optimized_prompt}
                </p>
              </div>
              <button
                onClick={() => handleCopy(share.optimized_prompt)}
                className="absolute top-8 right-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 active:scale-95"
                title="Copy optimized prompt"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-[#E6D5A8]/60" />}
              </button>
            </div>
          </motion.div>
        )}

        {/* Optimized Only (if show_original is false) */}
        {!share.show_original && share.optimized_prompt && (
          <motion.div
            className="relative mb-8"
            initial="hidden" animate="visible" custom={4} variants={fadeUp}
          >
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <p className="text-[#E6D5A8]/90 leading-relaxed italic text-base md:text-lg whitespace-pre-wrap">
                &ldquo;{share.optimized_prompt.length > 600
                  ? `${share.optimized_prompt.slice(0, 600)}...`
                  : share.optimized_prompt}&rdquo;
              </p>
            </div>
            <button
              onClick={() => handleCopy(share.optimized_prompt)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-[#E6D5A8]/60" />}
            </button>
          </motion.div>
        )}

        {/* Category */}
        {share.category && share.category !== 'other' && (
          <motion.div
            className="mb-8 text-center"
            initial="hidden" animate="visible" custom={5} variants={fadeUp}
          >
            <span className="px-3 py-1 rounded-full bg-[#C5A55A]/10 border border-[#C5A55A]/20 text-[#C5A55A] text-sm capitalize">
              {share.category}
            </span>
          </motion.div>
        )}

        {/* Engagement Stats */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-10 text-sm text-[#E6D5A8]/40"
          initial="hidden" animate="visible" custom={5} variants={fadeUp}
        >
          <span className="flex items-center gap-1.5">
            <Eye size={14} /> {share.view_count.toLocaleString()} views
          </span>
          <span className="flex items-center gap-1.5">
            <Copy size={14} /> {share.copy_count.toLocaleString()} copies
          </span>
          <span className="flex items-center gap-1.5">
            <Share2 size={14} /> {share.reshare_count.toLocaleString()} shares
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
          initial="hidden" animate="visible" custom={6} variants={fadeUp}
        >
          <button
            onClick={() => handleCopy(share.optimized_prompt)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#C5A55A]/30 bg-[#C5A55A]/5 text-[#E6D5A8] hover:bg-[#C5A55A]/15 hover:border-[#C5A55A]/50 transition-all font-medium active:scale-[0.98]"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>

          <Link
            href={`/playground?prompt=${encodeURIComponent(share.optimized_prompt.slice(0, 500))}`}
            onClick={handleCTAClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98]"
          >
            <Sparkles size={18} />
            Try in PromptTemple
          </Link>

          <Link
            href="/discover"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-[#E6D5A8]/70 hover:bg-white/5 hover:border-white/20 transition-all font-medium"
          >
            Explore More
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          className="mt-16 pt-8 border-t border-white/5"
          initial="hidden" animate="visible" custom={7} variants={fadeUp}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[#E6D5A8]/40">
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              47,000+ AI builders
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-[#E6D5A8]/20" />
            <span className="flex items-center gap-1.5">
              <Star size={14} />
              Free to start
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-[#E6D5A8]/20" />
            <span className="flex items-center gap-1.5">
              <TrendingUp size={14} />
              Avg. 1.8 &rarr; 9.4 improvement
            </span>
          </div>
        </motion.div>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: share.title || `Prompt Optimization — Wow Score ${share.wow_score}/10`,
            description: `See how this prompt was transformed to a ${share.wow_score}/10 masterpiece.`,
            publisher: {
              '@type': 'Organization',
              name: 'PromptTemple',
              url: 'https://prompt-temple.com',
            },
            isPartOf: {
              '@type': 'WebApplication',
              name: 'PromptTemple',
              url: 'https://prompt-temple.com',
              applicationCategory: 'ProductivityApplication',
            },
          }),
        }}
      />
    </div>
  );
}
