'use client';

import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { JobSummary } from '@/lib/types/research';

interface JobCardProps {
  job: JobSummary;
  onClick: () => void;
}

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  queued: {
    label: 'Queued',
    className: 'bg-muted text-muted-foreground',
    icon: Clock,
  },
  running: {
    label: 'Running',
    className: 'bg-royal-gold-50 text-royal-gold-700 dark:bg-royal-gold-900/30 dark:text-royal-gold-400',
    icon: Loader2,
  },
  done: {
    label: 'Done',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: CheckCircle,
  },
  error: {
    label: 'Error',
    className: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: AlertCircle,
  },
};

export function JobCard({ job, onClick }: JobCardProps) {
  const status = statusConfig[job.status] ?? statusConfig.queued;
  const StatusIcon = status.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-pharaoh group w-full rounded-xl p-4 text-left transition-all duration-200 hover:shadow-md hover:shadow-royal-gold-500/5 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            'line-clamp-2 flex-1 text-sm font-medium text-foreground',
            job.query_truncated && 'italic'
          )}
        >
          {job.query}
        </p>
        <Badge
          variant="secondary"
          className={cn('shrink-0 gap-1 text-xs font-medium', status.className)}
        >
          <StatusIcon
            className={cn(
              'h-3 w-3',
              job.status === 'running' && 'animate-spin'
            )}
          />
          {status.label}
        </Badge>
      </div>
      <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
        </span>
        {job.has_answer && (
          <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-3 w-3" />
            Has answer
          </span>
        )}
      </div>
    </button>
  );
}
