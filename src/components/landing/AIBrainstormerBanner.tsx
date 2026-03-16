'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Brain, Sparkles, Download, Zap, Users, Eye } from 'lucide-react';
import { CHROME_STORE_URL } from '@/lib/extension';
import Link from 'next/link';

export function AIBrainstormerBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-20 px-4 overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,197,24,0.15), transparent 70%)' }}
        animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(30,58,138,0.15), transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative rounded-3xl border border-[#F5C518]/20 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(13,13,13,0.95) 0%, rgba(10,10,24,0.95) 50%, rgba(13,13,13,0.95) 100%)' }}
        >
          {/* Shimmer line at top */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #F5C518, transparent)' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <div className="px-6 py-12 sm:px-12 sm:py-16">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-[#F5C518]/30 bg-[#F5C518]/10 text-[#F5C518]">
                <Zap className="w-3.5 h-3.5" />
                Limited Time Offer
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center leading-tight mb-6"
            >
              <span className="text-white">More Than a Prompt Library.</span>
              <br />
              <span className="bg-gradient-to-r from-[#F5C518] via-[#E9C25A] to-[#F5C518] bg-clip-text text-transparent">
                A Multi-Perspective AI Brainstormer.
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Prompt Temple doesn't just store prompts — it <span className="text-white font-medium">brainstorms with you</span>.
              Get multi-perspective intelligence that gathers insights from every angle,
              so you walk away with a prompt that's sharper than anything you'd write alone.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {[
                { icon: Brain, label: 'AI Brainstormer' },
                { icon: Users, label: 'Multi-Perspective' },
                { icon: Eye, label: 'Insightful Gathering' },
                { icon: Sparkles, label: 'Smart Templates' },
              ].map(({ icon: Icon, label }, i) => (
                <motion.span
                  key={label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.55 + i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-300"
                >
                  <Icon className="w-4 h-4 text-[#F5C518]" />
                  {label}
                </motion.span>
              ))}
            </motion.div>

            {/* Credit offer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl border border-[#F5C518]/20 bg-[#F5C518]/5">
                <motion.span
                  className="text-4xl sm:text-5xl font-black bg-gradient-to-b from-[#F5C518] to-[#C9A227] bg-clip-text text-transparent"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  500
                </motion.span>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm sm:text-base">Free Credits</p>
                  <p className="text-gray-400 text-xs sm:text-sm">on sign-up to fuel your AI services</p>
                </div>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/auth/register"
                className="group relative px-8 py-3.5 rounded-xl font-semibold text-sm text-black overflow-hidden transition-shadow hover:shadow-[0_0_30px_rgba(245,197,24,0.3)]"
                style={{ background: 'linear-gradient(135deg, #F5C518, #E9C25A)' }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Sign Up &amp; Claim 500 Credits
                </span>
              </Link>

              <a
                href={CHROME_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm border border-white/20 text-white hover:border-[#F5C518]/50 hover:bg-white/5 transition-all"
              >
                <Download className="w-4 h-4 text-[#F5C518] group-hover:animate-bounce" />
                Download Extension
              </a>
            </motion.div>

            {/* Fine print */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-center text-gray-500 text-xs mt-6"
            >
              No credit card required. Extension available for Chrome.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
