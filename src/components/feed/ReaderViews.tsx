'use client';

/**
 * R4 — Outline · Variables · Steps inside the reader (ported from the Sprint 08 prompt
 * page, which keeps its own copies for the SEO route). Reads `item.views` from the feed
 * payload; `availableReaderViews` is just `read` when `views` is null.
 */
import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { loadVariableValues, saveVariableValues } from '@/lib/feed/pending';
import { renderFilled } from '@/lib/feed/render';
import type { FeedItem, OutlineSection } from '@/lib/feed/types';
import { PromptText, type LegendMode } from './PromptText';

export const READER_VIEWS = ['read', 'outline', 'variables', 'steps'] as const;
export type ReaderView = (typeof READER_VIEWS)[number];
export const READER_VIEW_LABELS: Record<ReaderView, string> = { read: 'Read', outline: 'Outline', variables: 'Variables', steps: 'Steps' };

/** Views offered for this item, `read` first. Only `read` when the backend sent no views. */
export function availableReaderViews(item: Pick<FeedItem, 'views' | 'form'>): ReaderView[] {
  const out: ReaderView[] = ['read'];
  const v = item.views;
  if (!v) return out;
  if (v.outline.length > 0) out.push('outline');
  if (v.variables.length > 0) out.push('variables');
  if (item.form === 'chain' && v.steps.length > 0) out.push('steps');
  return out;
}

interface OutlineViewProps {
  sections: OutlineSection[];
  rtl: boolean;
  onCopySection: (s: OutlineSection) => void;
  /** Section title clicked → switch to Read and scroll to that heading. */
  onJump: (index: number, title: string) => void;
}

export function OutlineView({ sections, rtl, onCopySection, onJump }: OutlineViewProps) {
  return (
    <div className="space-y-2" data-testid="reader-outline">
      {sections.map((s, i) => (
        <details key={i} open className="group rounded-lg border border-border/60">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-medium [&::-webkit-details-marker]:hidden">
            <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-muted-foreground group-open:rotate-0 motion-safe:transition-transform" aria-hidden />
            <button
              type="button"
              dir={rtl ? 'rtl' : 'auto'}
              className="flex-1 text-start hover:underline"
              onClick={(e) => {
                e.preventDefault();
                onJump(i, s.title);
              }}
            >
              {s.title || `Section ${i + 1}`}
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.preventDefault();
                onCopySection(s);
              }}
            >
              <Copy className="mr-1 h-3 w-3" aria-hidden /> Copy section
            </Button>
          </summary>
          {s.body && (
            <pre dir={rtl ? 'rtl' : undefined} className="whitespace-pre-wrap border-t border-border/60 px-3 py-2 font-body text-sm leading-relaxed">
              {s.body}
            </pre>
          )}
        </details>
      ))}
    </div>
  );
}

interface VariablesViewProps {
  item: FeedItem;
  rtl: boolean;
  mode: LegendMode;
  idPrefix: string;
  /** Variable to focus when the view opens from a chip tap. */
  focusName?: string | null;
  /** Live filled text (and the variables still empty) for the sticky "Copy filled". */
  onFilled: (text: string, missing: string[]) => void;
}

export function VariablesView({ item, rtl, mode, idPrefix, focusName, onFilled }: VariablesViewProps) {
  const variables = item.views?.variables ?? [];
  const names = useMemo(() => variables.map((v) => v.name), [variables]);
  const [values, setValues] = useState<Record<string, string>>(() => loadVariableValues(item.slug));

  useEffect(() => setValues(loadVariableValues(item.slug)), [item.slug]);
  useEffect(() => {
    if (!focusName) return;
    const i = names.indexOf(focusName);
    if (i >= 0) document.getElementById(`${idPrefix}-var-${i}`)?.focus();
  }, [focusName, names, idPrefix]);

  const update = (name: string, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      saveVariableValues(item.slug, next);
      return next;
    });
  };

  const rendered = useMemo(() => renderFilled(item.text ?? '', names, values), [item.text, names, values]);
  const missingKey = rendered.missing.join('\u0000');
  useEffect(() => onFilled(rendered.text, rendered.missing), [rendered.text, missingKey, onFilled]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]" data-testid="reader-variables">
      <form className="space-y-3" onSubmit={(e) => e.preventDefault()} aria-label="Fill the variables">
        {variables.map((v, i) => (
          <div key={v.name} className="space-y-1">
            <Label htmlFor={`${idPrefix}-var-${i}`} className="font-mono text-xs">
              {v.name}
            </Label>
            <Input
              id={`${idPrefix}-var-${i}`}
              value={values[v.name] ?? ''}
              placeholder={v.placeholder ?? v.default ?? ''}
              onChange={(e) => update(v.name, e.target.value)}
              aria-describedby={v.hint ? `${idPrefix}-var-${i}-hint` : undefined}
              dir="auto"
            />
            {v.hint && (
              <p id={`${idPrefix}-var-${i}-hint`} className="truncate text-[11px] text-muted-foreground" title={v.hint}>
                {v.hint}
              </p>
            )}
          </div>
        ))}
        {rendered.missing.length > 0 && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Still empty: {rendered.missing.join(', ')}
          </p>
        )}
      </form>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
        <div className="rounded-lg border border-border/60 bg-foreground/5 p-3" aria-live="polite">
          <PromptText text={rendered.text} structure={{ sections: item.structure.sections }} rtl={rtl} mode={mode} idPrefix={`${idPrefix}-preview`} immediate />
        </div>
      </div>
    </div>
  );
}

export function StepsView({ item, rtl }: { item: FeedItem; rtl: boolean }) {
  const steps = item.views?.steps ?? [];
  return (
    <ol className="space-y-2" dir={rtl ? 'rtl' : undefined} data-testid="reader-steps">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 rounded-lg border border-border/60 p-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C9A227]/15 text-xs font-semibold tabular-nums">
            {s.index ?? i + 1}
          </span>
          <span className="text-sm leading-relaxed">
            {s.title ? <strong>{s.title}: </strong> : null}
            {s.body}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function ViewSwitch({ views, value, onChange }: { views: ReaderView[]; value: ReaderView; onChange: (v: ReaderView) => void }) {
  if (views.length < 2) return null;
  return (
    <div role="tablist" aria-label="View" className="inline-flex rounded-lg bg-foreground/5 p-1">
      {views.map((v) => (
        <button
          key={v}
          role="tab"
          type="button"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:text-sm',
            value === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {READER_VIEW_LABELS[v]}
        </button>
      ))}
    </div>
  );
}

export function CopiedIcon({ copied, className }: { copied: boolean; className?: string }) {
  return copied ? <Check className={cn(className, 'text-green-600')} aria-hidden /> : <Copy className={className} aria-hidden />;
}
