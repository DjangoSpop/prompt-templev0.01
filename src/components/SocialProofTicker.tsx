'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Trophy } from 'lucide-react';

interface TickerStat {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const BASE_STATS = {
  optimizedToday: 47293,
  sharedLastHour: 142,
  avgScore: 9.4,
};

function formatNumber(n: number): string {
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

export function SocialProofTicker() {
  const [stats, setStats] = useState(BASE_STATS);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate live increments
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setStats(prev => ({
        optimizedToday: prev.optimizedToday + Math.floor(Math.random() * 3),
        sharedLastHour: Math.max(100, prev.sharedLastHour + (Math.random() > 0.5 ? 1 : -1)),
        avgScore: parseFloat(
          Math.min(10, Math.max(9.0, prev.avgScore + (Math.random() - 0.5) * 0.02)).toFixed(1)
        ),
      }));
    }, 2800);

    intervalRef.current = setInterval(() => {
      setActiveIndex(i => (i + 1) % 3);
    }, 3500);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const items: TickerStat[] = [
    {
      icon: <Flame className="w-4 h-4" />,
      label: 'prompts optimized today',
      value: formatNumber(stats.optimizedToday),
      color: '#F5C518',
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: 'shared in the last hour',
      value: stats.sharedLastHour,
      color: '#E879F9',
    },
    {
      icon: <Trophy className="w-4 h-4" />,
      label: 'average improvement score',
      value: `${stats.avgScore}/10`,
      color: '#10B981',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-full border border-[rgba(245,197,24,0.2)] bg-[rgba(245,197,24,0.04)] backdrop-blur-sm px-6 py-2.5 flex items-center gap-3 max-w-xl mx-auto">
      {/* Animated glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5C518] to-transparent opacity-60" />

      <div className="flex items-center gap-6 w-full justify-center flex-wrap">
        {items.map((item, i) => (
          <motion.div
            key={i}
            animate={{ opacity: activeIndex === i ? 1 : 0.55, scale: activeIndex === i ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-1.5 text-sm font-medium whitespace-nowrap"
          >
            <span style={{ color: item.color }}>{item.icon}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={String(item.value)}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ color: item.color }}
                className="font-bold tabular-nums"
              >
                {item.value}
              </motion.span>
            </AnimatePresence>
            <span className="text-[#D4B896] text-xs">{item.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#F5C518] to-transparent opacity-30" />
    </div>
  );
}
