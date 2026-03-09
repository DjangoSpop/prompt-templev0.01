'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  suffix?: string;
  trend?: number;
  formatValue?: (n: number) => string;
}

function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    if (target === 0) {
      setCount(0);
      return;
    }
    const startTime = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (target - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return count;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  suffix,
  trend,
  formatValue,
}: StatCardProps) {
  const animatedValue = useAnimatedCounter(value);
  const display = formatValue ? formatValue(animatedValue) : animatedValue.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <Card className="relative overflow-hidden border border-[hsl(var(--royal-gold))]/20 bg-gradient-to-br from-[hsl(var(--desert-sand))]/10 to-transparent backdrop-blur-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--royal-gold))]/10">
              <Icon className="h-5 w-5 text-[hsl(var(--royal-gold))]" />
            </div>
            {trend !== undefined && (
              <div
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                }`}
              >
                {trend >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {display}
            {suffix && <span className="text-base font-normal text-muted-foreground ml-1">{suffix}</span>}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{title}</p>
        </CardContent>
        {/* Decorative gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[hsl(var(--royal-gold))]/40 to-transparent" />
      </Card>
    </motion.div>
  );
}
