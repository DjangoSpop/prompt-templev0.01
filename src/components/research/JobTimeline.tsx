'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Search,
  Download,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SSEEvent } from '@/lib/types/research';

interface JobTimelineProps {
  stage: string;
  progress: number;
  events: SSEEvent[];
}

const STAGES = [
  { key: 'planning', label: 'Planning', icon: Brain },
  { key: 'searching', label: 'Searching', icon: Search },
  { key: 'fetching', label: 'Fetching', icon: Download },
  { key: 'chunking', label: 'Analyzing', icon: BarChart3 },
  { key: 'synthesizing', label: 'Synthesizing', icon: FileText },
] as const;

const STAGE_ALIASES: Record<string, string> = {
  synthesis: 'synthesizing',
  retrieving: 'chunking',
  clustering: 'fetching',
};

function resolveStage(stage: string): string {
  return STAGE_ALIASES[stage] || stage;
}

export function JobTimeline({ stage, progress, events }: JobTimelineProps) {
  const [showEvents, setShowEvents] = useState(false);
  const resolved = resolveStage(stage);
  const activeIndex = STAGES.findIndex((s) => s.key === resolved);

  return (
    <div className="glass-pharaoh space-y-5 rounded-xl p-5 sm:p-6">
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const isCompleted = activeIndex > i;
          const isActive = activeIndex === i;

          return (
            <div key={s.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={isActive ? { scale: [1, 1.12, 1] } : {}}
                  transition={isActive ? { repeat: Infinity, duration: 1.5 } : {}}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted &&
                      'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20',
                    isActive &&
                      'border-royal-gold-500 bg-royal-gold-50 text-royal-gold-600 shadow-sm shadow-royal-gold-500/20 dark:bg-royal-gold-900/30 dark:text-royal-gold-400',
                    !isCompleted &&
                      !isActive &&
                      'border-border bg-muted/50 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </motion.div>
                <span
                  className={cn(
                    'text-[11px] font-medium sm:text-xs',
                    isActive && 'text-royal-gold-600 dark:text-royal-gold-400',
                    isCompleted && 'text-emerald-600 dark:text-emerald-400',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={cn(
                    'mx-1.5 h-0.5 flex-1 rounded-full transition-colors sm:mx-2',
                    isCompleted
                      ? 'bg-emerald-500'
                      : 'bg-border'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-royal-gold-400 to-royal-gold-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <span className="min-w-[3ch] text-right text-sm font-semibold text-foreground">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Event log toggle */}
      {events.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowEvents(!showEvents)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {showEvents ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {events.length} events
          </button>
          {showEvents && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-2 max-h-40 overflow-y-auto rounded-lg border bg-muted/30 p-3 font-mono text-xs"
            >
              {events.map((ev, i) => (
                <div key={i} className="py-0.5 text-muted-foreground">
                  <span className="font-semibold text-royal-gold-600 dark:text-royal-gold-400">
                    {ev.event}
                  </span>{' '}
                  {JSON.stringify(ev.data).slice(0, 100)}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
