'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Gift, ArrowRight } from 'lucide-react';

interface ReferralLandingProps {
  code: string;
  referrerName: string | null;
  welcomeBonus: number;
}

export default function ReferralLanding({ code, referrerName, welcomeBonus }: ReferralLandingProps) {
  const [stored, setStored] = useState(false);

  useEffect(() => {
    // Store referral code in localStorage
    try {
      localStorage.setItem('pt_referral_code', code);
    } catch {
      // localStorage unavailable
    }

    // Store in cookie (30 days)
    document.cookie = `pt_ref=${code}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
    setStored(true);
  }, [code]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0E0E10] via-[#1A1A2E] to-[#0E0E10] text-[#E6D5A8] flex items-center justify-center">
      <motion.div
        className="max-w-md w-full mx-4 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Brand */}
        <div className="text-5xl mb-4">&#x13080;</div>
        <p className="text-[#C5A55A] text-xs tracking-[0.4em] uppercase font-semibold mb-8">
          Prompt Temple
        </p>

        {/* Welcome Message */}
        <motion.div
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 mb-8 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {referrerName ? (
            <h1 className="text-2xl font-bold mb-3">
              <span className="text-[#E6D5A8]/60 font-normal text-lg block mb-1">You&apos;ve been invited by</span>
              {referrerName}
            </h1>
          ) : (
            <h1 className="text-2xl font-bold mb-3">
              You&apos;ve Been Invited!
            </h1>
          )}

          <p className="text-[#E6D5A8]/60 mb-6">
            Join the AI prompt optimization platform used by 47,000+ builders.
          </p>

          {/* Bonus Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A]/30 mb-6">
            <Gift size={18} className="text-[#C5A55A]" />
            <span className="text-[#C5A55A] font-semibold">
              +{welcomeBonus} Free Credits
            </span>
          </div>

          <p className="text-[#E6D5A8]/40 text-sm">
            Sign up to claim your welcome bonus
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href={`/signup?ref=${code}`}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Sparkles size={18} />
            Get Started Free
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-[#E6D5A8]/60 hover:bg-white/5 transition-colors font-medium"
          >
            Learn More
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-10 flex items-center justify-center gap-4 text-xs text-[#E6D5A8]/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span>No credit card required</span>
          <span className="w-1 h-1 rounded-full bg-[#E6D5A8]/15" />
          <span>Free tier available</span>
          <span className="w-1 h-1 rounded-full bg-[#E6D5A8]/15" />
          <span>Cancel anytime</span>
        </motion.div>

        {stored && (
          <div className="sr-only" aria-live="polite">
            Referral code stored
          </div>
        )}
      </motion.div>
    </div>
  );
}
