'use client';

/**
 * F2 (trimmed in Sprint 09) — the prompt preview: form badge, reading time, TL;DR and the
 * structure strip, understandable in a 3-second glance. Tapping the title opens the
 * reader in place (`ReaderRegion`) — no navigation, no fetch: the text travels with the
 * item. Metadata-only items stay link cards. The per-prompt page remains for search
 * engines ("View as page" in the reader).
 */
import Link from 'next/link';
import { useEffect, useId, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, BookOpen, ChevronDown, ExternalLink, Flame, ListOrdered, Variable } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/user';
import { trackFeed, trackImpression } from '@/lib/feed/analytics';
import { getPrompt } from '@/lib/feed/api';
import { feedKeys } from '@/lib/feed/hooks';
import {
  formLabel,
  isReadable,
  isSota,
  isStructuredForm,
  isTopTrending,
  promptPath,
  readingTimeLabel,
  type FeedItem,
} from '@/lib/feed/types';
import { PromptActions } from './PromptActions';
import { ReaderRegion } from './ReaderRegion';
import type { CtaIntent } from './SignUpCta';
import type { ReaderSettings } from './useReader';

const MAX_SECTION_CHIPS = 5;

/** Everything a card needs from the column's reader state (R2). Absent → plain card. */
export interface ReaderCardProps {
  open: boolean;
  active: boolean;
  onToggle: () => void;
  onClose: (reason?: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSwipe: (dir: 1 | -1) => void;
  hasPrev: boolean;
  hasNext: boolean;
  onOpenRelated: (slug: string) => void;
  settings: ReaderSettings;
  onSetting: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void;
  focusMode: boolean;
  copyTick: number;
}

interface PromptCardProps {
  item: FeedItem;
  /** Tab or collection the card is shown in, for analytics and `?from=`. */
  from: string;
  position: number;
  onRequireAuth: (intent: NonNullable<CtaIntent>) => void;
  onFork: (item: FeedItem) => void;
  variant?: 'full' | 'compact';
  reader?: ReaderCardProps;
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
          className="max-w-[11rem] truncate rounded-md border border-border/60 bg-foreground/5 px-1.5 py-0.5 text-[11px] text-foreground/75"
          title={title}
        >
          {title}
        </span>
      ))}
      {extra > 0 && <span className="text-[11px] text-foreground/75">+{extra}</span>}
      {variables > 0 && (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#C9A227]/10 px-1.5 py-0.5 text-[11px] font-medium text-[#8a6d12] dark:text-[#e2c25a]">
          <Variable className="h-3 w-3" aria-hidden />
          {variables} {variables === 1 ? 'variable' : 'variables'}
        </span>
      )}
      {steps > 0 && (
        <span className="inline-flex items-center gap-1 rounded-md bg-foreground/5 px-1.5 py-0.5 text-[11px] text-foreground/75">
          <ListOrdered className="h-3 w-3" aria-hidden />
          {steps} steps
        </span>
      )}
    </div>
  );
}

export function PromptCard({ item, from, position, onRequireAuth, onFork, variant = 'full', reader }: PromptCardProps) {
  const client = useQueryClient();
  const authed = useAuthStore((s) => s.isAuthenticated);
  const ref = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const bodyId = useId();
  const titleId = `${bodyId}-title`;
  const regionId = `${bodyId}-reader`;
  const href = promptPath(item);
  const rtl = item.language === 'ar';
  const summary = item.tldr || item.preview;
  const metadataOnly = !isReadable(item);
  const open = !!reader?.open;
  const wasOpen = useRef(open);

  useImpression(ref, () => trackImpression(item.id, { tab: from, position, form: item.form }, authed));

  // Esc / ✕ return focus to the toggle that opened the reader (R2.4).
  useEffect(() => {
    if (wasOpen.current && !open) {
      const active = document.activeElement;
      if (!active || active === document.body || ref.current?.contains(active)) toggleRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
  }, [open]);

  /** Copy from a collapsed card: inline text, or (pre-B7 / cut text) the detail once. */
  const getText = (): string | Promise<string> => {
    if (item.text && !item.text_truncated) return item.text;
    return client
      .fetchQuery({ queryKey: feedKeys.prompt(item.slug, authed), queryFn: () => getPrompt(item.slug), staleTime: 5 * 60_000 })
      .then((d) => {
        if (!d.text) throw new Error('No text');
        return d.text;
      });
  };

  const onOpen = () => {
    if (!reader) return;
    if (!reader.open) trackFeed('prompt_opened', { from_tab: from, position, form: item.form });
    reader.onToggle();
  };
  const sourceLabel = item.attribution.source?.replace(/^github:/, '') ?? null;

  return (
    <Card
      ref={ref}
      className={cn('min-w-0 overflow-clip rounded-xl border-border/50 p-4 transition-colors', open ? 'border-[#C9A227]/50' : 'hover:border-[#C9A227]/40')}
      style={open ? undefined : { contentVisibility: 'auto', containIntrinsicSize: 'auto 160px' }}
      data-open={open || undefined}
    >
      <article aria-labelledby={titleId} className="flex flex-col gap-2.5">
        {/* 1. Header row */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-foreground/75">{item.category}</span>
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

        {/* 2. Title — opens the reader in place; a link only where there is no reader */}
        <h3 id={titleId} dir={rtl ? 'rtl' : undefined} className={cn('font-display font-bold leading-snug tracking-tight', variant === 'full' ? 'text-lg' : 'text-base', rtl && 'font-arabic')}>
          {reader && !metadataOnly ? (
            <button
              ref={toggleRef}
              type="button"
              className="text-start hover:text-primary focus-visible:underline"
              aria-expanded={open}
              aria-controls={regionId}
              onClick={onOpen}
            >
              {item.title}
            </button>
          ) : (
            <Link href={`${href}?from=${encodeURIComponent(from)}`} onClick={() => trackFeed('prompt_opened', { from_tab: from, position, form: item.form })} className="hover:text-primary focus-visible:underline">
              {item.title}
            </Link>
          )}
        </h3>

        {/* 3. TL;DR or preview (hidden while reading: the text is right below) */}
        {summary && !open && (
          <p dir={rtl ? 'rtl' : undefined} className={cn('line-clamp-2 text-sm leading-relaxed text-muted-foreground', rtl && 'font-arabic')}>
            {summary}
          </p>
        )}

        {/* 4. Structure strip */}
        {variant === 'full' && <StructureStrip item={item} />}

        {/* 5. Actions: read toggle + compact actions when collapsed; the sticky bar when open */}
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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {reader && variant === 'full' && (
              <button
                type="button"
                className={cn('inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium sm:h-8', open ? 'text-muted-foreground hover:text-foreground' : 'bg-foreground/5 text-foreground hover:bg-foreground/5')}
                aria-expanded={open}
                aria-controls={regionId}
                onClick={onOpen}
              >
                {open ? <ChevronDown className="h-3.5 w-3.5 rotate-180" aria-hidden /> : <BookOpen className="h-3.5 w-3.5" aria-hidden />}
                {open ? 'Close' : 'Read'}
              </button>
            )}
            {!open && (
              <PromptActions item={item} getText={getText} onRequireAuth={onRequireAuth} onFork={() => onFork(item)} className="-ml-2 flex-wrap" />
            )}
          </div>
        )}

        {/* 6. The reader (R2) */}
        {reader && !metadataOnly && (
          <ReaderRegion
            item={item}
            open={open}
            active={reader.active}
            titleId={titleId}
            regionId={regionId}
            hasPrev={reader.hasPrev}
            hasNext={reader.hasNext}
            onClose={reader.onClose}
            onPrev={reader.onPrev}
            onNext={reader.onNext}
            onSwipe={reader.onSwipe}
            onRequireAuth={onRequireAuth}
            onFork={() => onFork(item)}
            onOpenRelated={reader.onOpenRelated}
            settings={reader.settings}
            onSetting={reader.onSetting}
            focusMode={reader.focusMode}
            copyTick={reader.copyTick}
          />
        )}

        {/* 7. Attribution (collapsed cards; the reader footer carries it when open) */}
        {!open && (sourceLabel || item.attribution.license) && (
          <p className="truncate text-[11px] text-muted-foreground">
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
