'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Twitter, Linkedin, Link2, Check, X, Download, Image } from 'lucide-react';
import {
  generateShareCard,
  openTwitterShare,
  openLinkedInShare,
  copyToClipboard,
  type ShareableOptimization,
} from '@/lib/sharing/generateShareCard';

interface ViralShareButtonProps {
  optimization: ShareableOptimization;
  variant?: 'button' | 'icon';
  className?: string;
}

export function ViralShareButton({ optimization, variant = 'button', className = '' }: ViralShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const card = generateShareCard(optimization);

  async function handleCopy() {
    const ok = await copyToClipboard(card.shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
        style={{
          background: 'rgba(245,197,24,0.1)',
          color: '#F5C518',
          border: '1px solid rgba(245,197,24,0.3)',
        }}
      >
        <Share2 className="w-4 h-4" />
        {variant === 'button' && <span>Share</span>}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl overflow-hidden"
              style={{
                background: '#0D0D0D',
                border: '1px solid rgba(245,197,24,0.2)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(245,197,24,0.08)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(245,197,24,0.1)]">
                <div>
                  <p className="text-sm font-semibold text-[#F0E6D3]">Share Your Masterpiece</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Score: {optimization.afterScore}/10 · Pharaoh Level
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="text-[#6B7280] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Share options */}
              <div className="p-3 space-y-2">
                <button
                  onClick={() => { openTwitterShare(card.tweetText); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[rgba(29,161,242,0.1)] text-[#1DA1F2]"
                >
                  <Twitter className="w-4 h-4" />
                  Share on X (Twitter)
                </button>

                <button
                  onClick={() => { openLinkedInShare(card.shareUrl, card.linkedinText); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[rgba(10,102,194,0.1)] text-[#0A66C2]"
                >
                  <Linkedin className="w-4 h-4" />
                  Share on LinkedIn
                </button>

                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[rgba(245,197,24,0.08)] text-[#F5C518]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Copy share link
                    </>
                  )}
                </button>

                <a
                  href={card.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[rgba(255,255,255,0.05)] text-[#9CA3AF]"
                  onClick={() => setOpen(false)}
                >
                  <Image className="w-4 h-4" />
                  Preview share card
                </a>
              </div>

              {/* Footer hint */}
              <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.06)]">
                <p className="text-xs text-[#4B5563] text-center">
                  ✦ Share to inspire others · Win Pharaoh tier free
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
