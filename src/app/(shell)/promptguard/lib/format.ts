/** Small presentational helpers shared across PromptGuard components. */

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'unknown';
  const diffMs = Date.now() - t;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Tailwind text-color class for a 0-5 score, paired with text for a11y. */
export function scoreColorClass(score: number | null | undefined): string {
  if (score == null) return 'text-muted-foreground';
  if (score >= 4) return 'text-emerald-500';
  if (score >= 3) return 'text-accent';
  return 'text-destructive';
}

/** Tailwind text-color class for a score delta. */
export function deltaColorClass(delta: number | null | undefined): string {
  const d = delta ?? 0;
  if (d > 0) return 'text-emerald-500';
  if (d < 0) return 'text-destructive';
  return 'text-muted-foreground';
}

export function formatDelta(delta: number | null | undefined): string {
  const d = delta ?? 0;
  return `${d > 0 ? '+' : ''}${d.toFixed(2)}`;
}
