'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Clock } from 'lucide-react';
import type { ActiveVersion } from '../lib/types';
import { formatRelative } from '../lib/format';

export function ActiveVersionCard({ active }: { active: ActiveVersion | null }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Active Version
        </CardTitle>
        <GitBranch className="h-4 w-4 text-accent" />
      </CardHeader>
      <CardContent>
        {!active ? (
          <p className="text-sm text-muted-foreground">No active version found.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">v{active.version}</span>
              <span className="truncate text-sm text-muted-foreground" title={active.label}>
                {active.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Activated <span className="font-medium text-foreground">{formatRelative(active.activated_at)}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {active.prompt_keys.map((k) => (
                <Badge key={k} variant="secondary" className="capitalize">
                  {k}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
