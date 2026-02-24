'use client';

import { motion } from 'framer-motion';
import { Zap, TrendingUp, Award, Flame } from 'lucide-react';
import { useStreakGamification } from '@/lib/hooks/useStreakGamification';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay?: number;
}

function StatCard({ icon, label, value, sub, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm"
    >
      {/* Glow accent */}
      <div
        className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-2xl"
        style={{ background: color }}
      />
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}22` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-white/50 uppercase tracking-widest">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-white leading-none">{value}</p>
        {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
      </div>
    </motion.div>
  );
}

interface StatsBarProps {
  totalOptimizations?: number;
  avgWowScore?: number;
  creditsRemaining?: number;
}

export function StatsBar({ totalOptimizations, avgWowScore, creditsRemaining }: StatsBarProps) {
  const { streak, xp, level, progress } = useStreakGamification();

  return (
    <div className="w-full space-y-3">
      {/* Level progress bar */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: level.color }}>
          {level.name}
        </span>
        <div className="relative flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: level.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs text-white/40">{xp} XP</span>
      </div>

      {/* Stats grid */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="Total Optimizations"
          value={totalOptimizations ?? 0}
          sub="all time"
          color="#60A5FA"
          delay={0}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg WowScore"
          value={avgWowScore != null ? avgWowScore.toFixed(1) : '—'}
          sub="out of 10"
          color="#F5C518"
          delay={0.05}
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Day Streak"
          value={streak}
          sub={streak === 1 ? '1 day' : `${streak} days`}
          color="#F97316"
          delay={0.1}
        />
        <StatCard
          icon={<Award className="h-5 w-5" />}
          label="Credits Left"
          value={creditsRemaining ?? '∞'}
          sub="this period"
          color="#A78BFA"
          delay={0.15}
        />
      </div>
    </div>
  );
}
