'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, ChevronRight } from 'lucide-react';
import type { PendingProposal } from '../lib/types';
import { deltaColorClass, formatDelta } from '../lib/format';
import { cn } from '@/lib/utils';
import { ProposalDetailModal } from './ProposalDetailModal';

export function PendingProposalCard({ pending }: { pending: PendingProposal[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ClipboardCheck className="h-4 w-4 text-accent" />
            Pending Proposals
          </CardTitle>
          {pending.length > 0 && <Badge variant="warning">{pending.length}</Badge>}
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proposals awaiting your review.</p>
          ) : (
            <ul className="space-y-3">
              {pending.map((p) => (
                <li
                  key={p.id}
                  className="rounded-lg border border-border bg-secondary/30 p-3"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className={cn('font-mono text-sm font-bold', deltaColorClass(p.score_delta))}>
                      Δ {formatDelta(p.score_delta)}
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-accent"
                      onClick={() => setOpenId(p.id)}
                      aria-label={`View proposal ${p.id}`}
                    >
                      View detail
                      <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {p.rationale_preview}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ProposalDetailModal id={openId} onClose={() => setOpenId(null)} />
    </>
  );
}
