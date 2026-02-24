'use client';

import { motion } from 'framer-motion';
import { Crown, Twitter, Linkedin, Link2, Share2, Trophy } from 'lucide-react';
import Link from 'next/link';

export function ViralCTAFooter() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://prompttemple.vercel.app';

  const tweetText = encodeURIComponent(
    `🏛️ Just discovered @PromptTemple — transforms bad AI prompts into Pharaoh-level masterpieces. Try it free → ${APP_URL}\n#PromptEngineering #AI`
  );

  const shareItems = [
    {
      icon: <Twitter className="w-4 h-4" />,
      label: 'Share on X',
      color: '#1DA1F2',
      href: `https://twitter.com/intent/tweet?text=${tweetText}`,
    },
    {
      icon: <Linkedin className="w-4 h-4" />,
      label: 'Share on LinkedIn',
      color: '#0A66C2',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(APP_URL)}`,
    },
    {
      icon: <Link2 className="w-4 h-4" />,
      label: 'Copy link',
      color: '#9CA3AF',
      href: '#copy',
    },
  ];

  function handleClick(href: string, label: string) {
    if (href === '#copy') {
      navigator.clipboard?.writeText(APP_URL);
      return;
    }
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=450');
  }

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Gold radial bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(245,197,24,0.07) 0%, transparent 65%)' }}
      />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Trophy icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'rgba(245,197,24,0.12)',
              border: '1px solid rgba(245,197,24,0.3)',
              boxShadow: '0 0 30px rgba(245,197,24,0.2)',
            }}
          >
            <Trophy className="w-8 h-8 text-[#F5C518]" />
          </div>

          <h2
            className="text-3xl md:text-4xl font-bold text-[#F0E6D3] mb-4"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Share Your Best Optimization.
            <br />
            <span style={{ color: '#F5C518' }}>Win Pharaoh Tier Free. 𓋹</span>
          </h2>
          <p className="text-[#9CA3AF] text-base mb-8 max-w-xl mx-auto">
            Share your highest-scoring optimization on social media with{' '}
            <span className="text-[#F5C518] font-semibold">#PromptTemple</span>. The top scorer every
            week wins a lifetime Pharaoh subscription — worth $588/year.
          </p>

          {/* Share buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            {shareItems.map((item, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleClick(item.href, item.label)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  color: item.color,
                  background: `${item.color}12`,
                  border: `1px solid ${item.color}30`,
                }}
              >
                {item.icon}
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* Final CTA */}
          <Link href="/auth/register">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-black"
              style={{
                background: 'linear-gradient(135deg, #F5C518 0%, #C9A227 100%)',
                boxShadow: '0 8px 30px rgba(245,197,24,0.35)',
              }}
            >
              <Crown className="w-5 h-5" />
              Optimize Now — Free
            </motion.button>
          </Link>

          <p className="mt-4 text-xs text-[#4B5563]">
            𓂀 3 free optimizations daily · No credit card · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
