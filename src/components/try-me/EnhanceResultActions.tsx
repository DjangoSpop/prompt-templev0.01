'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Share2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EnhanceResultActionsProps {
  optimizedText: string;
  originalText: string;
  onCopy: (text: string, key: string) => void;
  copied: boolean;
  latencyMs?: number;
}

export function EnhanceResultActions({
  optimizedText,
  originalText,
  onCopy,
  copied,
  latencyMs,
}: EnhanceResultActionsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  function shareToTwitter() {
    const truncated = originalText.slice(0, 60);
    const text = `Just enhanced my AI prompt on @PromptTemple\n\nBefore: "${truncated}..."\nAfter: A professional-grade prompt with context, structure, and constraints.\n\nTry it free (no signup):`;
    const url = 'https://www.prompt-temple.com';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
    setShowShareMenu(false);
  }

  function shareToLinkedIn() {
    const url = 'https://www.prompt-temple.com';
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    );
    setShowShareMenu(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/10 bg-white/[0.03] px-4 py-2.5"
    >
      {/* Left — metadata */}
      <div className="flex items-center gap-3 text-[11px] text-stone-500">
        {latencyMs != null && (
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Enhanced in {Math.round(latencyMs)}ms
          </span>
        )}
        <span>via Sacred Forge</span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        {/* Share */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-stone-400 transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            <Share2 className="h-3 w-3" />
            Share
          </button>

          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                className="absolute bottom-full right-0 z-30 mb-2 min-w-[140px] overflow-hidden rounded-lg border border-white/10 bg-stone-800 shadow-xl"
              >
                <button
                  onClick={shareToTwitter}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-stone-300 transition-colors hover:bg-white/5"
                >
                  Post on X
                </button>
                <button
                  onClick={shareToLinkedIn}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-stone-300 transition-colors hover:bg-white/5"
                >
                  Share on LinkedIn
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Copy */}
        <button
          onClick={() => onCopy(optimizedText, 'enhanced')}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all duration-200 ${
            copied
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
          }`}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied!' : 'Copy result'}
        </button>

        {/* Soft CTA */}
        <Button
          asChild
          size="sm"
          className="h-auto rounded-lg px-3 py-1.5 text-xs font-bold text-[#0E0F12]"
          style={{ background: 'linear-gradient(135deg, #ffe066, #d4af37)' }}
        >
          <Link href="/auth/register">
            Save & get more
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
