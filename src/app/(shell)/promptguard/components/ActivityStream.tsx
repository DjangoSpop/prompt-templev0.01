'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, CheckCircle2, ExternalLink, FileClock } from 'lucide-react';
import type { IncidentSummary, PendingProposal } from '../lib/types';
import { formatClock, formatDelta } from '../lib/format';
import { phoenixTraceUrl } from '@/lib/api/promptguard';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Severity = 'info' | 'warn' | 'success' | 'danger';

type ActivityItem = {
  key: string;
  timestamp: string;
  message: string;
  detail?: string;
  severity: Severity;
  // Story 4.2.5 — Phoenix Cloud deep-link when the item carries a trace ID.
  traceUrl?: string;
};

function buildActivityFeed(
  incidents: IncidentSummary[],
  pending: PendingProposal[]
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const inc of incidents) {
    const severity: Severity =
      inc.status === 'resolved'
        ? 'success'
        : inc.status === 'open'
          ? 'danger'
          : 'warn';
    // The agent may stash the diagnosis trace id in the incident's diagnosis
    // blob; surface it as a Phoenix deep-link when present.
    const traceId = inc.diagnosis?.trace_id;
    items.push({
      key: `inc-${inc.id}`,
      timestamp: inc.created_at,
      message: `Incident ${inc.id.slice(-4)} — ${inc.status}`,
      severity,
      traceUrl: typeof traceId === 'string' ? phoenixTraceUrl(traceId) : undefined,
    });
  }

  for (const p of pending) {
    items.push({
      key: `prop-${p.id}`,
      timestamp: p.created_at,
      message: 'Proposal awaiting approval',
      detail: `Δ ${formatDelta(p.score_delta)}`,
      severity: 'warn',
    });
  }

  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

const SEVERITY_META: Record<
  Severity,
  { icon: ReactNode; dot: string; badge: 'success' | 'warning' | 'destructive' | 'secondary' }
> = {
  success: { icon: <CheckCircle2 className="h-4 w-4" />, dot: 'bg-emerald-500', badge: 'success' },
  warn: { icon: <FileClock className="h-4 w-4" />, dot: 'bg-accent', badge: 'warning' },
  danger: { icon: <AlertTriangle className="h-4 w-4" />, dot: 'bg-destructive', badge: 'destructive' },
  info: { icon: <Activity className="h-4 w-4" />, dot: 'bg-muted-foreground', badge: 'secondary' },
};

export function ActivityStream({
  incidents,
  pending,
}: {
  incidents: IncidentSummary[];
  pending: PendingProposal[];
}) {
  const feed = buildActivityFeed(incidents, pending);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-accent" />
          Agent Activity
        </CardTitle>
        <Badge variant="secondary">{feed.length}</Badge>
      </CardHeader>
      <CardContent>
        {feed.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No recent activity. Trigger an incident to watch the agent loop respond live.
          </p>
        ) : (
          <ul className="space-y-1">
            {feed.map((item) => {
              const meta = SEVERITY_META[item.severity];
              return (
                <li
                  key={item.key}
                  className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-secondary/50"
                >
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {formatClock(item.timestamp)}
                  </span>
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.dot)} aria-hidden />
                  <span className="text-accent">{meta.icon}</span>
                  {item.traceUrl ? (
                    <a
                      href={item.traceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center gap-1 text-sm text-accent hover:underline"
                    >
                      {item.message}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="flex-1 text-sm text-foreground">{item.message}</span>
                  )}
                  {item.detail && (
                    <Badge variant={meta.badge} className="font-mono">
                      {item.detail}
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
