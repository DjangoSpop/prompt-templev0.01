'use client';

import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useResearchHealth, useResearchStats } from '@/lib/hooks/useResearch';
import { cn } from '@/lib/utils';

const healthKeys = ['database', 'embeddings', 'search', 'synthesis'] as const;

export function ResearchStats() {
  const { data: health } = useResearchHealth();
  const { data: stats } = useResearchStats();

  return (
    <div className="space-y-4">
      {/* Health indicators */}
      {health && (
        <div className="glass-pharaoh flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            System
          </span>
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
            {healthKeys.map((key) => (
              <div key={key} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    health[key]
                      ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                      : 'bg-red-500 shadow-sm shadow-red-500/30'
                  )}
                />
                <span className="text-xs capitalize text-muted-foreground">
                  {key}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={Activity}
            label="Total Jobs"
            value={stats.total_jobs}
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={stats.completed_jobs}
            iconClassName="text-emerald-500"
          />
          <StatCard
            icon={XCircle}
            label="Failed"
            value={stats.failed_jobs}
            iconClassName="text-red-500"
          />
          <StatCard
            icon={Clock}
            label="Avg Time"
            value={
              stats.avg_processing_time_seconds
                ? `${Math.round(stats.avg_processing_time_seconds)}s`
                : '—'
            }
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  iconClassName?: string;
}) {
  return (
    <div className="glass-pharaoh rounded-xl p-4">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4 text-muted-foreground', iconClassName)} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
