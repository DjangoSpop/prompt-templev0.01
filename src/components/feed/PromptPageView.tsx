'use client';

/**
 * F3 — the prompt page: read a long prompt as Outline · Full · Variables · Steps, fill
 * its variables and copy the result, react, fork, and see where it came from.
 *
 * The view switcher is hidden when `views` is null (backend `PROMPT_VIEWS_ENABLED`
 * off); the page then shows the full text only.
 */
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, BookOpen, Check, ChevronDown, Copy, ExternalLink, Flame, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { trackFeed } from '@/lib/feed/analytics';
import { copyText } from '@/lib/feed/clipboard';
import { usePendingReactionReplay, usePrompt, useRecordCopy } from '@/lib/feed/hooks';
import { loadVariableValues, saveVariableValues } from '@/lib/feed/pending';
import { renderFilled } from '@/lib/feed/render';
import {
  categorySlug,
  formLabel,
  isSota,
  isStructuredForm,
  isTopTrending,
  readerPath,
  readingTimeLabel,
  type FeedItem,
  type FeedPromptDetail,
  type OutlineSection,
} from '@/lib/feed/types';
import { ForkDialog } from './ForkDialog';
import { PromptActions } from './PromptActions';
import { PromptCard, StructureStrip } from './PromptCard';
import { SignUpCta, type CtaIntent } from './SignUpCta';

export const PROMPT_VIEWS = ['outline', 'full', 'variables', 'steps'] as const;
export type PromptView = (typeof PROMPT_VIEWS)[number];

const VIEW_LABELS: Record<PromptView, string> = { outline: 'Outline', full: 'Full', variables: 'Variables', steps: 'Steps' };

/** Views offered for this prompt, in display order. Empty when the backend sent no views. */
export function availableViews(prompt: Pick<FeedPromptDetail, 'views' | 'form'>): PromptView[] {
  const v = prompt.views;
  if (!v) return [];
  const out: PromptView[] = [];
  if (v.outline.length > 0) out.push('outline');
  out.push('full');
  if (v.variables.length > 0) out.push('variables');
  if (prompt.form === 'chain' && v.steps.length > 0) out.push('steps');
  return out;
}

export function defaultView(prompt: Pick<FeedPromptDetail, 'views' | 'form'>): PromptView {
  const views = availableViews(prompt);
  return isStructuredForm(prompt.form) && views.includes('outline') ? 'outline' : 'full';
}

function useCopy(slug: string) {
  const recordCopy = useRecordCopy();
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, view: string, label = 'Prompt copied') => {
    try {
      await copyText(text);
      recordCopy(slug, view);
      trackFeed('prompt_copied', { view });
      setCopied(view);
      setTimeout(() => setCopied(null), 1500);
      toast.success(label);
    } catch {
      toast.error('Could not copy to the clipboard.');
    }
  };
  return { copy, copied };
}

function OutlineView({ sections, rtl, onCopySection }: { sections: OutlineSection[]; rtl: boolean; onCopySection: (s: OutlineSection) => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)]">
      <nav aria-label="Sections" className="hidden lg:block">
        <ol className="sticky top-20 space-y-1 border-l border-border/60 pl-3 text-sm">
          {sections.map((s, i) => (
            <li key={i}>
              <a href={`#section-${i}`} className="line-clamp-2 text-muted-foreground hover:text-foreground">
                {s.title || `Section ${i + 1}`}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="space-y-2">
        {sections.map((s, i) => (
          <details key={i} id={`section-${i}`} open className="group scroll-mt-20 rounded-lg border border-border/60 v2:rounded-md v2:border-line">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-medium [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-muted-foreground group-open:rotate-0 motion-safe:transition-transform" aria-hidden />
              <span dir={rtl ? 'rtl' : 'auto'} className="flex-1">{s.title || `Section ${i + 1}`}</span>
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
    </div>
  );
}

function VariablesView({ prompt, rtl }: { prompt: FeedPromptDetail; rtl: boolean }) {
  const variables = prompt.views?.variables ?? [];
  const names = useMemo(() => variables.map((v) => v.name), [variables]);
  const [values, setValues] = useState<Record<string, string>>({});
  const { copy, copied } = useCopy(prompt.slug);

  useEffect(() => setValues(loadVariableValues(prompt.slug)), [prompt.slug]);
  const update = (name: string, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      saveVariableValues(prompt.slug, next);
      return next;
    });
  };

  const rendered = useMemo(() => renderFilled(prompt.text ?? '', names, values), [prompt.text, names, values]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <form className="space-y-3" onSubmit={(e) => e.preventDefault()} aria-label="Fill the prompt's variables">
        {variables.map((v, i) => (
          <div key={v.name} className="space-y-1">
            <Label htmlFor={`var-${i}`} className="font-mono text-xs">
              {v.name}
            </Label>
            <Input
              id={`var-${i}`}
              value={values[v.name] ?? ''}
              placeholder={v.placeholder ?? v.default ?? ''}
              onChange={(e) => update(v.name, e.target.value)}
              aria-describedby={v.hint ? `var-${i}-hint` : undefined}
              dir="auto"
            />
            {v.hint && (
              <p id={`var-${i}-hint`} className="truncate text-[11px] text-muted-foreground" title={v.hint}>
                {v.hint}
              </p>
            )}
          </div>
        ))}
        <Button
          type="button"
          className="w-full gap-1.5"
          onClick={() => copy(rendered.text, 'filled', rendered.missing.length ? `Copied — ${rendered.missing.length} still empty` : 'Filled prompt copied')}
        >
          {copied === 'filled' ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          Copy filled prompt
        </Button>
        {rendered.missing.length > 0 && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Still empty: {rendered.missing.join(', ')}
          </p>
        )}
      </form>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
        <pre dir={rtl ? 'rtl' : undefined} className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/30 p-4 font-body text-sm leading-relaxed" aria-live="polite">
          {rendered.text}
        </pre>
      </div>
    </div>
  );
}

function FullView({ prompt, rtl }: { prompt: FeedPromptDetail; rtl: boolean }) {
  const [mono, setMono] = useState(false);
  const { copy, copied } = useCopy(prompt.slug);
  if (!prompt.text) {
    return (
      <p className="rounded-lg border border-border/60 p-4 text-sm text-muted-foreground">
        The full text is only available at the source.{' '}
        {prompt.attribution.url && (
          <a href={prompt.attribution.url} target="_blank" rel="noopener noreferrer nofollow" className="underline">
            Open the original
          </a>
        )}
      </p>
    );
  }
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={mono} onCheckedChange={setMono} aria-label="Monospace" />
          Monospace
        </label>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copy(prompt.text!, 'full')}>
          {copied === 'full' ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          Copy
        </Button>
      </div>
      <pre
        dir={rtl ? 'rtl' : undefined}
        className={cn(
          'whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-muted/30 p-4 text-sm leading-relaxed',
          mono ? 'font-mono' : 'font-body',
          rtl && !mono && 'font-arabic'
        )}
      >
        {prompt.text}
      </pre>
    </div>
  );
}

function StepsView({ prompt, rtl }: { prompt: FeedPromptDetail; rtl: boolean }) {
  const steps = prompt.views?.steps ?? [];
  return (
    <ol className="space-y-2" dir={rtl ? 'rtl' : undefined}>
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3 rounded-lg border border-border/60 p-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C9A227]/15 text-xs font-semibold tabular-nums v2:bg-faience-soft v2:text-faience">
            {s.index ?? i + 1}
          </span>
          <span className="text-sm leading-relaxed">{s.title ? <strong>{s.title}: </strong> : null}{s.body}</span>
        </li>
      ))}
    </ol>
  );
}

interface PromptPageViewProps {
  slug: string;
  initial?: FeedPromptDetail;
}

export function PromptPageView({ slug, initial }: PromptPageViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? undefined;
  const query = usePrompt(slug, { from });
  const prompt = query.data ?? initial;
  const [cta, setCta] = useState<CtaIntent>(null);
  const [forking, setForking] = useState<FeedItem | null>(null);
  const { copy } = useCopy(slug);
  usePendingReactionReplay();

  const views = prompt ? availableViews(prompt) : [];
  const requested = searchParams.get('view') as PromptView | null;
  const view: PromptView = prompt ? (requested && views.includes(requested) ? requested : defaultView(prompt)) : 'full';

  const switchView = (next: PromptView) => {
    trackFeed('prompt_view_switched', { view: next });
    const sp = new URLSearchParams(searchParams.toString());
    if (prompt && next === defaultView(prompt)) sp.delete('view');
    else sp.set('view', next);
    const qs = sp.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  if (!prompt) {
    if (query.isError) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold">Prompt not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">It may have been removed from the feed.</p>
          <Button asChild className="mt-6">
            <Link href="/feed">Back to the feed</Link>
          </Button>
        </div>
      );
    }
    return <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground" aria-busy="true">Loading prompt…</div>;
  }

  const rtl = prompt.language === 'ar';
  const source = prompt.attribution.source?.replace(/^github:/, '') ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/feed" className="hover:text-foreground">Feed</Link>
        <span aria-hidden>/</span>
        <Link href={`/feed?category=${encodeURIComponent(categorySlug(prompt))}`} className="hover:text-foreground">
          {prompt.category}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <main className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-full border border-border px-2 py-0.5 font-medium">{formLabel(prompt.form)}</span>
            <span className="text-muted-foreground">
              {readingTimeLabel(prompt.reading_time_sec)} · {prompt.word_count.toLocaleString()} words
            </span>
            {isTopTrending(prompt) && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#C9A227]/10 px-2 py-0.5 font-semibold text-[#8a6d12] dark:text-[#e2c25a] v2:rounded-pill v2:bg-faience-soft v2:text-faience v2-dark:text-faience">
                <Flame className="h-3 w-3" aria-hidden />#{prompt.stats.trending_rank} trending
              </span>
            )}
            {isSota(prompt) && (
              <Link href="/feed/c/sota" className="inline-flex items-center gap-0.5 rounded-full bg-[#C9A227] px-2 py-0.5 font-semibold text-black v2:rounded-pill v2:border v2:border-line v2:bg-surface v2:text-ink">
                <BadgeCheck className="h-3 w-3" aria-hidden /> State of the art
              </Link>
            )}
          </div>
          <h1 dir={rtl ? 'rtl' : undefined} className={cn('mt-2 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl', rtl && 'font-arabic')}>
            {prompt.title}
          </h1>
          {prompt.tldr && (
            <p dir={rtl ? 'rtl' : undefined} className="mt-2 text-base leading-relaxed text-muted-foreground">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-foreground">TL;DR</span>
              {prompt.tldr}
            </p>
          )}
          <StructureStrip item={prompt} className="mt-3" />

          {views.length > 1 && (
            <div role="tablist" aria-label="View" className="mt-5 inline-flex rounded-lg bg-muted/60 p-1">
              {views.map((v) => (
                <button
                  key={v}
                  role="tab"
                  type="button"
                  aria-selected={view === v}
                  onClick={() => switchView(v)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    view === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {VIEW_LABELS[v]}
                </button>
              ))}
            </div>
          )}

          <div role={views.length > 1 ? 'tabpanel' : undefined} className="mt-4">
            {view === 'outline' && prompt.views ? (
              <OutlineView
                sections={prompt.views.outline}
                rtl={rtl}
                onCopySection={(s) => copy([s.title, s.body].filter(Boolean).join('\n'), 'outline', 'Section copied')}
              />
            ) : view === 'variables' ? (
              <VariablesView prompt={prompt} rtl={rtl} />
            ) : view === 'steps' ? (
              <StepsView prompt={prompt} rtl={rtl} />
            ) : (
              <FullView prompt={prompt} rtl={rtl} />
            )}
          </div>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          {prompt.text && (
            <Button asChild variant="outline" className="w-full gap-1.5">
              <Link href={readerPath(prompt)}>
                <BookOpen className="h-4 w-4" aria-hidden /> Open in feed
              </Link>
            </Button>
          )}
          {prompt.text && (
            <div className="rounded-xl border border-border/60 p-3 v2:rounded-cartouche v2:border-line">
              <PromptActions
                item={prompt}
                getText={() => prompt.text!}
                onRequireAuth={setCta}
                onFork={() => setForking(prompt)}
                size="md"
                className="flex-wrap"
              />
              <p className="mt-2 px-1 text-xs text-muted-foreground tabular-nums">
                {prompt.stats.copies.toLocaleString()} copies · {prompt.stats.views_7d.toLocaleString()} views this week
              </p>
            </div>
          )}

          {(source || prompt.attribution.license) && (
            <div className="rounded-xl border border-border/60 p-3 text-sm v2:rounded-cartouche v2:border-line">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Scale className="h-3.5 w-3.5" aria-hidden /> Source
              </p>
              {source && <p className="break-words font-medium">{source}</p>}
              {prompt.attribution.author && <p className="text-muted-foreground">by {prompt.attribution.author}</p>}
              {prompt.attribution.license && <p className="text-muted-foreground">License: {prompt.attribution.license}</p>}
              {prompt.attribution.url && (
                <a
                  href={prompt.attribution.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-1 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View original <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              )}
            </div>
          )}

          {prompt.fork_of && (
            <p className="text-sm text-muted-foreground">
              Forked from{' '}
              <Link href={`/prompts/${prompt.fork_of.slug}`} className="underline">
                {prompt.fork_of.title || 'the original'}
              </Link>
            </p>
          )}
        </aside>
      </div>

      {prompt.related.length > 0 && (
        <section className="mt-10" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-3 font-display text-lg font-bold">Related prompts</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prompt.related.slice(0, 6).map((item, i) => (
              <PromptCard
                key={item.id}
                item={item}
                from="related"
                position={i + 1}
                variant="compact"
                onRequireAuth={setCta}
                onFork={setForking}
              />
            ))}
          </div>
        </section>
      )}

      <SignUpCta intent={cta} onClose={() => setCta(null)} />
      <ForkDialog item={forking} onClose={() => setForking(null)} />
    </div>
  );
}
