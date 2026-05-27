'use client';

import { Minus, Plus } from 'lucide-react';

export function PromptDiff({
  baseline,
  candidate,
}: {
  baseline: Record<string, string>;
  candidate: Record<string, string>;
}) {
  const types = Array.from(
    new Set([...Object.keys(baseline), ...Object.keys(candidate)])
  );

  if (types.length === 0) {
    return <p className="text-sm text-muted-foreground">No prompt content to diff.</p>;
  }

  return (
    <div className="space-y-4">
      {types.map((type) => {
        const before = baseline[type] ?? '(missing)';
        const after = candidate[type] ?? '(missing)';
        const changed = before !== after;
        return (
          <div key={type} className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold capitalize text-foreground">
              {type}
              {!changed && (
                <span className="text-xs font-normal text-muted-foreground">(unchanged)</span>
              )}
            </h4>
            <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5">
              <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
              <pre className="whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                {before}
              </pre>
            </div>
            <div className="flex gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2.5">
              <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <pre className="whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                {after}
              </pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}
