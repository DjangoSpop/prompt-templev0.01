'use client';

import type { StreamStatus } from '@/lib/hooks/useEvalStream';

const LABELS: Record<StreamStatus, string> = {
  idle: 'Idle',
  connecting: 'Connecting…',
  streaming: 'Live',
  done: 'Complete',
  failed: 'Failed',
};

/** Small Pharaonic status pill for the Eval Theater header. */
export function RunStatusBadge({ status }: { status: StreamStatus }) {
  const live = status === 'streaming' || status === 'connecting';
  return (
    <span className={`pg-status-badge pg-status-${status}`}>
      {live && <span className="pg-status-dot" aria-hidden />}
      {LABELS[status]}
    </span>
  );
}
