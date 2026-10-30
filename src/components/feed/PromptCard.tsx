'use client';

/**
 * F2 — long-form prompt card. A 600-word system prompt should be understandable in a
 * 3-second glance on a phone: form badge, reading time, TL;DR and the structure strip
 * (section chips, variable and step counts). Cut counts before the strip.
 */
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, ChevronDown, ExternalLink, Flame, ListOrdered, Variable } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/user';
import { trackFeed, trackImpression } from '@/lib/feed/analytics';
import { getPrompt } from '@/lib/feed/api';
import { compactText } from '@/lib/feed/clipboard';
import { feedKeys, usePrompt } from '@/lib/feed/hooks';
import {
  formLabel,
  isSota,
  isStructuredForm,
  isTopTrending,
  promptPath,
  readingTimeLabel,
  type FeedItem,
} from '@/lib/feed/types';
import { PromptActions } from './PromptActions';
import type { CtaIntent } from './SignUpCta';

const MAX_SECTION_CHIPS = 5;

interface PromptCardProps {
  item: FeedItem;
  /** Tab or collection the card is shown in, for analytics and `?from=`. */
  from: string;
  position: number;
  onRequireAuth: (intent: NonNullable<CtaIntent>) => void;
  onFork: (item: FeedItem) => void;
  variant?: 'full' | 'compact';
}

function useImpression(ref: React.RefObject<HTMLElement | null>, onSeenCallback: () => void) {
  const fired = useRef(false);
  const onSeenRef = useRef(onSeenCallback);
  onSeenRef.current = onSeenCallback;
  useEffect(() => {
    const onSeen = () => onSeenRef.current();
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (fired.current) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          timer = setTimeout(() => {
            fired.current = true;
            onSeen();
            observer.disconnect();
          }, 1000);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0, 0.5] }
    );
    observer.observe(el);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [ref]);
}

export function StructureStrip({ item, className }: { item: FeedItem; className?: string }) {
  if (!isStructuredForm(item.form)) return null;
  const sections = item.structure.sections;
  const variables = item.structure.variables.length;
  const steps = item.structure.steps;
  if (!sections.length && !variables && !steps) return null;
  const extra = sections.length - MAX_SECTION_CHIPS;
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)} aria-label="Prompt structure">
      {sections.slice(0, MAX_SECTION_CHIPS).map((title, i) => (
        <span
          key={`${title}-${i}`}
          className="max-w-[11rem] truncate rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px] text-muted-foreground"
          title={title}
        >
          {title}
        </span>
      ))}
      {extra > 0 && <span className="text-[11px] text-muted-foreground">+{extra}</span>}
      {variables > 0 && (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#C9A227]/10 px-1.5 py-0.5 text-[11px] font-medium text-[#8a6d12] dark:text-[#e2c25a]">
          <Variable className="h-3 w-3" aria-hidden />
          {variables} {variables === 1 ? 'variable' : 'variables'}
        </span>
      )}
      {steps > 0 && (
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
          <ListOrdered className="h-3 w-3" aria-hidden />
          {steps} steps
        </span>
      )}
    </div>
  );
}

export function PromptCard({ item, from, position, onRequireAuth, onFork, variant = 'full' }: PromptCardProps) {
  const client = useQueryClient();
  const authed = useAuthStore((s) => s.isAuthenticated);
  const [expanded, setExpanded] = useState(false);
  const detail = usePrompt(item.slug, { enabled: expanded });
  const ref = useRef<HTMLDivElement>(null);
  const bodyId = useId();
  const href = promptPath(item);
  const rtl = item.language === 'ar';
  const summary = item.tldr || item.preview;
  const metadataOnly = item.text_available === false;

  useImpression(ref, () => trackImpression(item.id, { tab: from, position, form: item.form }, authed));

  const fetchText = async () => {
    const data = await client.fetchQuery({
      queryKey: feedKeys.prompt(item.slug, authed),
      queryFn: () => getPrompt(item.slug),
      staleTime: 5 * 60_000,
    });
    if (!data.text) throw new Error('No text');
    return data.text;
  };
  const prefetch = () =>
    void client.prefetchQuery({ queryKey: feedKeys.prompt(item.slug, authed), queryFn: () => getPrompt(item.slug), staleTime: 5 * 60_000 });

  const opened = () => trackFeed('prompt_opened', { from_tab: from, position, form: item.form });
  const expandedText = detail.data?.views?.compact ?? (detail.data?.text ? compactText(detail.data.text) : null);
  const sourceLabel = item.attribution.source?.replace(/^github:/, '') ?? null;

  return (
    <Card
      ref={ref}
      className="min-w-0 overflow-hidden rounded-xl border-border/50 p-4 transition-colors hover:border-[#C9A227]/40"
      onPointerEnter={prefetch}
      onFocusCapture={prefetch}
    >
      <article aria-labelledby={`${bodyId}-title`} className="flex flex-col gap-2.5">
        {/* 1. Header row */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{item.category}</span>
          <span className="rounded-full border border-border px-2 py-0.5 font-medium">{formLabel(item.form)}</span>
          <span className="text-muted-foreground">{readingTimeLabel(item.reading_time_sec)}</span>
          {isTopTrending(item) && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[#C9A227]/10 px-2 py-0.5 font-semibold text-[#8a6d12] dark:text-[#e2c25a]">
              <Flame className="h-3 w-3" aria-hidden />#{item.stats.trending_rank}
              <span className="sr-only"> trending</span>
            </span>
          )}
          {isSota(item) && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[#C9A227] px-2 py-0.5 font-semibold text-black">
              <BadgeCheck className="h-3 w-3" aria-hidden />
              SOTA
            </span>
          )}
        </div>

        {/* 2. Title */}
        <h3 id={`${bodyId}-title`} dir={rtl ? 'rtl' : undefined} className={cn('font-display font-bold leading-snug tracking-tight', variant === 'full' ? 'text-lg' : 'text-base', rtl && 'font-arabic')}>
          <Link href={`${href}?from=${encodeURIComponent(from)}`} onClick={opened} className="hover:text-primary focus-visible:underline">
            {item.title}
          </Link>
        </h3>

        {/* 3. TL;DR or preview */}
        {summary && (
          <p dir={rtl ? 'rtl' : undefined} className={cn('line-clamp-2 text-sm leading-relaxed text-muted-foreground', rtl && 'font-arabic')}>
            {summary}
          </p>
        )}

        {/* 4. Structure strip */}
        {variant === 'full' && <StructureStrip item={item} />}

        {/* Expand in place */}
        {variant === 'full' && !metadataOnly && (
          <>
            <button
              type="button"
              className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              aria-expanded={expanded}
              aria-controls={`${bodyId}-body`}
              onClick={() => setExpanded((v) => !v)}
            >
              <ChevronDown className={cn('h-3.5 w-3.5 motion-safe:transition-transform', expanded && 'rotate-180')} aria-hidden />
              {expanded ? 'Show less' : 'Show more'}
            </button>
            <div id={`${bodyId}-body`} hidden={!expanded}>
              {expanded &&
                (expandedText ? (
                  <pre dir={rtl ? 'rtl' : undefined} className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-3 font-body text-xs leading-relaxed">
                    {expandedText}
                  </pre>
                ) : detail.isError ? (
                  <p className="text-xs text-muted-foreground">Could not load the prompt. <Link href={href} className="underline">Open it</Link>.</p>
                ) : (
                  <div className="space-y-2" aria-busy="true" aria-label="Loading prompt">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
            </div>
          </>
        )}

        {/* 5. Actions */}
        {metadataOnly ? (
          item.attribution.url && (
            <a
              href={item.attribution.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Preview on {sourceLabel ?? 'source'} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          )
        ) : (
          <PromptActions
            item={item}
            getText={fetchText}
            onRequireAuth={onRequireAuth}
            onFork={() => onFork(item)}
            className="-ml-2 flex-wrap"
          />
        )}

        {/* 6. Attribution */}
        {(sourceLabel || item.attribution.license) && (
          <p className="truncate text-[11px] text-muted-foreground/80">
            {sourceLabel && (
              <>
                From{' '}
                {item.attribution.url ? (
                  <a href={item.attribution.url} target="_blank" rel="noopener noreferrer nofollow" className="underline-offset-2 hover:underline">
                    {sourceLabel}
                  </a>
                ) : (
                  sourceLabel
                )}
              </>
            )}
            {sourceLabel && item.attribution.license && ' · '}
            {item.attribution.license}
          </p>
        )}
      </article>
    </Card>
  );
}

export function PromptCardSkeleton() {
  return (
    <Card className="rounded-xl border-border/50 p-4" aria-hidden>
      <div className="flex gap-1.5">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-2 h-3.5 w-full" />
      <Skeleton className="mt-1.5 h-3.5 w-5/6" />
      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-8 w-16" />
      </div>
    </Card>
  );
}
