'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, Users, Gift, ChevronRight } from 'lucide-react';

const REFERRAL_REWARDS = [
  { invites: 1, reward: '+30 credits', icon: '🎁' },
  { invites: 3, reward: '1 month Scholar free', icon: '📖' },
  { invites: 7, reward: '1 month High Priest free', icon: '☀️' },
  { invites: 15, reward: 'Lifetime Pharaoh discount', icon: '👑' },
];

interface ReferralModuleProps {
  userId?: string;
  referralCount?: number;
}

export function ReferralModule({ userId, referralCount = 0 }: ReferralModuleProps) {
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    // Derive a stable referral code from userId or fallback to localStorage
    const id = userId || (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null) || 'user';
    const raw = btoa(id).replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase();
    setCode(raw || 'PTMPLE');
  }, [userId]);

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${code}`
    : `https://prompt-temple.com/?ref=${code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  };

  const nextMilestone = REFERRAL_REWARDS.find(r => referralCount < r.invites);
  const progressPct = nextMilestone
    ? Math.min(100, (referralCount / nextMilestone.invites) * 100)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/20">
          <Users className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Invite & Earn</h3>
          <p className="text-xs text-white/40">Invite friends — earn rewards together</p>
        </div>
      </div>

      {/* Referral link */}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 mb-4">
        <span className="flex-1 truncate font-mono text-xs text-white/60">{referralUrl}</span>
        <button
          onClick={handleCopy}
          className="shrink-0 flex items-center gap-1 rounded-lg bg-yellow-400/20 px-3 py-1.5 text-xs font-semibold text-yellow-300 hover:bg-yellow-400/30 transition-colors"
        >
          {copied ? (
            <><CheckCircle className="h-3.5 w-3.5" /> Copied!</>
          ) : (
            <><Copy className="h-3.5 w-3.5" /> Copy</>
          )}
        </button>
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/50">
              {referralCount} / {nextMilestone.invites} invites
            </span>
            <span className="text-xs font-semibold text-yellow-400 flex items-center gap-1">
              <Gift className="h-3.5 w-3.5" />
              {nextMilestone.reward}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Reward tiers */}
      <div className="grid grid-cols-2 gap-2">
        {REFERRAL_REWARDS.map((tier) => {
          const unlocked = referralCount >= tier.invites;
          return (
            <div
              key={tier.invites}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                unlocked
                  ? 'border-yellow-400/30 bg-yellow-400/10 text-yellow-200'
                  : 'border-white/5 bg-white/3 text-white/30'
              }`}
            >
              <span className="text-lg">{tier.icon}</span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold truncate">{tier.reward}</p>
                <p className="text-[10px] text-current/60">{tier.invites} invite{tier.invites > 1 ? 's' : ''}</p>
              </div>
              {unlocked && <CheckCircle className="ml-auto h-3 w-3 shrink-0 text-yellow-400" />}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleCopy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 py-2.5 text-sm font-bold text-black hover:from-yellow-300 hover:to-orange-400 transition-all"
      >
        Share Your Link
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
