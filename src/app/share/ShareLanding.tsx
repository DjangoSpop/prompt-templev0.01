'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Sparkles, Zap, ArrowRight, TrendingUp } from 'lucide-react';

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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E0E10] via-[#1A1A2E] to-[#0E0E10] text-[#E6D5A8]">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-12">
        {/* Brand */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-3">𓂀</div>
          <p className="text-[#C5A55A] text-xs tracking-[0.4em] uppercase font-semibold">
            Prompt Temple
          </p>
        </div>

        {/* Share type badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase border border-[#C5A55A]/30 bg-[#C5A55A]/5 text-[#C5A55A]">
            {shareType === 'optimization' && <><TrendingUp size={14} /> Optimization Result</>}
            {shareType === 'prompt' && <><Sparkles size={14} /> Shared Prompt</>}
            {shareType === 'template' && <><Zap size={14} /> Template</>}
            {shareType === 'broadcast' && <><Zap size={14} /> AI Comparison</>}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 leading-tight">
          {shareType === 'optimization' && beforeScore !== undefined && score !== undefined ? (
            <>
              Prompt Optimized:{' '}
              <span className="text-red-400">{beforeScore.toFixed(1)}</span>
              {' → '}
              <span className="text-emerald-400">{score.toFixed(1)}</span>
              <span className="text-[#E6D5A8]/60 text-2xl">/10</span>
            </>
          ) : (
            title
          )}
        </h1>

        {description && (
          <p className="text-center text-[#E6D5A8]/60 text-lg mb-8 max-w-xl mx-auto">
            {description}
          </p>
        )}

        {/* Score Display */}
        {score !== undefined && shareType !== 'optimization' && (
          <div className="flex justify-center mb-8">
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
          </div>
        )}

        {/* Content Preview */}
        {content && (
          <div className="relative mb-8">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 md:p-8">
              <p className="text-[#E6D5A8]/90 leading-relaxed italic text-base md:text-lg whitespace-pre-wrap">
                &ldquo;{content.length > 500 ? `${content.slice(0, 500)}...` : content}&rdquo;
              </p>
            </div>
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              title="Copy prompt"
            >
              {copied ? (
                <Check size={16} className="text-emerald-400" />
              ) : (
                <Copy size={16} className="text-[#E6D5A8]/60" />
              )}
            </button>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm text-[#C5A55A] uppercase tracking-wider font-semibold mb-3">
              Improvements Applied
            </h3>
            <div className="flex flex-wrap gap-2">
              {improvements.map((imp, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-sm"
                >
                  {imp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        {category && (
          <div className="mb-8 text-center">
            <span className="px-3 py-1 rounded-full bg-[#C5A55A]/10 border border-[#C5A55A]/20 text-[#C5A55A] text-sm">
              {category}
            </span>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          {content && (
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#C5A55A]/30 bg-[#C5A55A]/5 text-[#E6D5A8] hover:bg-[#C5A55A]/10 transition-colors font-medium"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
          )}

          <Link
            href={originalId ? `/playground?prompt=${encodeURIComponent(content || title)}` : '/playground'}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Sparkles size={18} />
            Try in PromptTemple
          </Link>

          <Link
            href="/discover"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-[#E6D5A8]/70 hover:bg-white/5 transition-colors font-medium"
          >
            Explore More
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-[#E6D5A8]/40">
            <span>47,000+ users</span>
            <span className="w-1 h-1 rounded-full bg-[#E6D5A8]/20" />
            <span>Free to start</span>
            <span className="w-1 h-1 rounded-full bg-[#E6D5A8]/20" />
            <span>Avg. 1.8 → 9.4 improvement</span>
          </div>
        </div>
      </div>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description: description || `A prompt shared from PromptTemple`,
            publisher: {
              '@type': 'Organization',
              name: 'PromptTemple',
              url: 'https://prompt-temple.com',
            },
          }),
        }}
      />
    </div>
  );
}
