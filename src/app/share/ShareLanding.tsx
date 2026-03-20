'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Copy, Check, Sparkles, Zap, ArrowRight, TrendingUp, Users, Star } from 'lucide-react';

interface ShareLandingProps {
  title: string;
  description: string;
  content: string;
  score?: number;
  beforeScore?: number;
  shareType: 'prompt' | 'optimization' | 'template' | 'broadcast';
  category: string;
  improvements: string[];
  originalId?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function AnimatedScore({ value, color }: { value: number; color: string }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(parseFloat((eased * value).toFixed(1)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className={color} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {displayed.toFixed(1)}
    </span>
  );
}

export default function ShareLanding({
  title,
  description,
  content,
  score,
  beforeScore,
  shareType,
  category,
  improvements,
  originalId,
}: ShareLandingProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = content || title;
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
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-emerald-400';
    if (s >= 6) return 'text-yellow-400';
    if (s >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 9) return 'Pharaoh Level';
    if (s >= 8) return 'Expert';
    if (s >= 6) return 'Good';
    if (s >= 4) return 'Needs Work';
    return 'Beginner';
  };

  const getScoreBorderColor = (s: number) => {
    if (s >= 8) return 'border-emerald-400/50 shadow-emerald-400/20';
    if (s >= 6) return 'border-yellow-400/50 shadow-yellow-400/20';
    if (s >= 4) return 'border-orange-400/50 shadow-orange-400/20';
    return 'border-red-400/50 shadow-red-400/20';
  };

  const isOptimization = shareType === 'optimization' && beforeScore !== undefined && score !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E0E10] via-[#1A1A2E] to-[#0E0E10] text-[#E6D5A8]">
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-16">
        {/* Brand */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          <div className="text-4xl mb-3">&#x13080;</div>
          <p className="text-[#C5A55A] text-xs tracking-[0.4em] uppercase font-semibold">
            Prompt Temple
          </p>
        </motion.div>

        {/* Share type badge */}
        <motion.div
          className="flex justify-center mb-8"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase border border-[#C5A55A]/30 bg-[#C5A55A]/5 text-[#C5A55A]">
            {shareType === 'optimization' && <><TrendingUp size={14} /> Optimization Result</>}
            {shareType === 'prompt' && <><Sparkles size={14} /> Shared Prompt</>}
            {shareType === 'template' && <><Zap size={14} /> Template</>}
            {shareType === 'broadcast' && <><Zap size={14} /> AI Comparison</>}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl md:text-4xl font-bold text-center mb-4 leading-tight"
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
        >
          {isOptimization ? (
            <>
              Prompt Optimized:{' '}
              <AnimatedScore value={beforeScore!} color="text-red-400" />
              {' \u2192 '}
              <AnimatedScore value={score!} color="text-emerald-400" />
              <span className="text-[#E6D5A8]/60 text-2xl">/10</span>
            </>
          ) : (
            title
          )}
        </motion.h1>

        {description && (
          <motion.p
            className="text-center text-[#E6D5A8]/60 text-lg mb-8 max-w-xl mx-auto"
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
          >
            {description}
          </motion.p>
        )}

        {/* Score Display — optimization before/after */}
        {isOptimization && (
          <motion.div
            className="flex items-center justify-center gap-6 md:gap-10 mb-10"
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
          >
            {/* Before */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-red-400/50 shadow-lg shadow-red-400/10 flex flex-col items-center justify-center bg-red-400/5">
                <span className="text-3xl md:text-4xl font-bold text-red-400">
                  {beforeScore!.toFixed(1)}
                </span>
                <span className="text-[10px] text-[#E6D5A8]/50 uppercase tracking-wider mt-1">Before</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-3xl text-emerald-400 animate-pulse">&rarr;</div>

            {/* After */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-emerald-400/50 shadow-lg shadow-emerald-400/20 flex flex-col items-center justify-center bg-emerald-400/5">
                <span className="text-3xl md:text-4xl font-bold text-emerald-400">
                  {score!.toFixed(1)}
                </span>
                <span className="text-[10px] text-[#E6D5A8]/50 uppercase tracking-wider mt-1">After</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Score Display — non-optimization */}
        {score !== undefined && !isOptimization && (
          <motion.div
            className="flex justify-center mb-8"
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
          >
            <div
              className={`w-28 h-28 rounded-full border-2 ${getScoreBorderColor(score)} shadow-lg flex flex-col items-center justify-center bg-white/[0.02]`}
            >
              <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score.toFixed(1)}
              </span>
              <span className="text-[10px] text-[#E6D5A8]/50 uppercase tracking-wider">
                {getScoreLabel(score)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Content Preview */}
        {content && (
          <motion.div
            className="relative mb-8"
            initial="hidden"
            animate="visible"
            custom={4}
            variants={fadeUp}
          >
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <p className="text-[#E6D5A8]/90 leading-relaxed italic text-base md:text-lg whitespace-pre-wrap">
                &ldquo;{content.length > 500 ? `${content.slice(0, 500)}...` : content}&rdquo;
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 active:scale-95"
              title="Copy prompt"
            >
              {copied ? (
                <Check size={16} className="text-emerald-400" />
              ) : (
                <Copy size={16} className="text-[#E6D5A8]/60" />
              )}
            </button>
          </motion.div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <motion.div
            className="mb-8"
            initial="hidden"
            animate="visible"
            custom={5}
            variants={fadeUp}
          >
            <h3 className="text-sm text-[#C5A55A] uppercase tracking-wider font-semibold mb-3">
              Improvements Applied
            </h3>
            <div className="flex flex-wrap gap-2">
              {improvements.map((imp, i) => (
                <motion.span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                >
                  {imp}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category */}
        {category && (
          <motion.div
            className="mb-8 text-center"
            initial="hidden"
            animate="visible"
            custom={5}
            variants={fadeUp}
          >
            <span className="px-3 py-1 rounded-full bg-[#C5A55A]/10 border border-[#C5A55A]/20 text-[#C5A55A] text-sm">
              {category}
            </span>
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
          initial="hidden"
          animate="visible"
          custom={6}
          variants={fadeUp}
        >
          {content && (
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#C5A55A]/30 bg-[#C5A55A]/5 text-[#E6D5A8] hover:bg-[#C5A55A]/15 hover:border-[#C5A55A]/50 transition-all font-medium active:scale-[0.98]"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
          )}

          <Link
            href={originalId ? `/playground?prompt=${encodeURIComponent(content || title)}` : '/playground'}
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
          initial="hidden"
          animate="visible"
          custom={7}
          variants={fadeUp}
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

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description: description || 'A prompt shared from PromptTemple',
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
              operatingSystem: 'Web',
            },
          }),
        }}
      />
    </div>
  );
}
