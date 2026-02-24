'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  glow: string;
  unlocked: boolean;
  requirement: string;
}

const BADGES: Badge[] = [
  {
    id: 'apprentice',
    name: 'Apprentice Scribe',
    description: 'Your first optimization',
    emoji: '📜',
    color: '#9CA3AF',
    glow: 'rgba(156,163,175,0.4)',
    unlocked: true,
    requirement: '1 optimization',
  },
  {
    id: 'scribe',
    name: 'Scribe of Heliopolis',
    description: '10 total optimizations',
    emoji: '🖊️',
    color: '#60A5FA',
    glow: 'rgba(96,165,250,0.4)',
    unlocked: false,
    requirement: '10 optimizations',
  },
  {
    id: 'vizier',
    name: 'Trusted Vizier',
    description: '5-day streak',
    emoji: '⚖️',
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.4)',
    unlocked: false,
    requirement: '5-day streak',
  },
  {
    id: 'highpriest',
    name: 'High Priest of Ra',
    description: 'Avg WowScore ≥ 8',
    emoji: '☀️',
    color: '#F5C518',
    glow: 'rgba(245,197,24,0.4)',
    unlocked: false,
    requirement: 'Avg score ≥ 8.0',
  },
  {
    id: 'grandvizier',
    name: 'Grand Vizier',
    description: '100 optimizations',
    emoji: '🏛️',
    color: '#F97316',
    glow: 'rgba(249,115,22,0.4)',
    unlocked: false,
    requirement: '100 optimizations',
  },
  {
    id: 'pharaoh',
    name: 'Living Pharaoh',
    description: '30-day streak + 500 optimizations',
    emoji: '👑',
    color: '#F5C518',
    glow: 'rgba(245,197,24,0.6)',
    unlocked: false,
    requirement: '30-day streak + 500 opts',
  },
];

interface AchievementBadgesProps {
  unlockedIds?: string[];
  compact?: boolean;
}

export function AchievementBadges({ unlockedIds = ['apprentice'], compact = false }: AchievementBadgesProps) {
  const badges = BADGES.map(b => ({ ...b, unlocked: unlockedIds.includes(b.id) }));

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/50">
        Achievements
      </h3>
      <div className={cn('grid gap-3', compact ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6')}>
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className={cn(
              'group relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-300',
              badge.unlocked
                ? 'border-white/20 bg-white/8 cursor-default'
                : 'border-white/5 bg-white/3 opacity-40 grayscale cursor-not-allowed'
            )}
            style={badge.unlocked ? { boxShadow: `0 0 24px ${badge.glow}` } : {}}
            title={badge.unlocked ? badge.description : `Locked — ${badge.requirement}`}
          >
            <span className="text-3xl">{badge.emoji}</span>
            <div>
              <p
                className="text-[11px] font-bold leading-tight"
                style={{ color: badge.unlocked ? badge.color : '#6B7280' }}
              >
                {badge.name}
              </p>
              {!compact && (
                <p className="mt-0.5 text-[10px] text-white/30">
                  {badge.unlocked ? badge.description : badge.requirement}
                </p>
              )}
            </div>
            {badge.unlocked && (
              <motion.div
                className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${badge.color}22, transparent)` }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
