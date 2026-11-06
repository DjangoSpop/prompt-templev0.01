'use client';

/**
 * R2.1 — the feed column: the list of cards (Sprint 08 `FeedList`), now with the inline
 * reader state (`useReader`), the earlier next-page prefetch (1.5 screens, R1), a pinned
 * deep-link card, "continue reading" past the last cached item, and scroll anchoring so
 * the card header never moves on open.
 */
import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReaderOpenMethod } from '@/lib/feed/analytics';
import { isReadable, type FeedItem } from '@/lib/feed/types';
import { PromptCard, PromptCardSkeleton, type ReaderCardProps } from './PromptCard';
import type { CtaIntent } from './SignUpCta';
import { useReader } from './useReader';

export const PREFETCH_SCREENS = 1.5;

function useInfiniteSentinel(onVisible: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onVisible);
  cb.current = onVisible;
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || typeof IntersectionObserver === 'undefined') return;
    const margin = Math.round(PREFETCH_SCREENS * (typeof window !== 'undefined' ? window.innerHeight || 800 : 800));
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && cb.current(), { rootMargin: `${margin}px 0px` });
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);
  return ref;
}

/** Scroll so the card header sits under the navbar, only when it is above the fold or below it. */
export function anchorCard(el: HTMLElement | null, reduced: boolean) {
  if (!el || typeof window === 'undefined') return;
  const top = el.getBoundingClientRect().top;
  const sticky = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--reader-sticky-top')) || 4.5;
  const offset = sticky * 16 + 8;
  if (top >= offset && top <= window.innerHeight - 160) return;
  window.scrollBy({ top: top - offset, behavior: reduced ? 'auto' : 'smooth' });
}

export interface FeedColumnProps {
  items: FeedItem[];
  from: string;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  emptyText: string;
  onRequireAuth: (intent: NonNullable<CtaIntent>) => void;
  onFork: (item: FeedItem) => void;
  /** Deep-link item that is not in the loaded pages (R1): shown first, opened on mount. */
  pinned?: FeedItem | null;
  pinnedLoading?: boolean;
  /** `?p=` from the URL — opened once it is in the column. */
  initialOpenSlug?: string | null;
  /** Tab + filters key; a change closes every reader (F4). */
  resetKey: string;
  /** A related prompt outside the column was chosen (FeedView navigates to `?p=`). */
  onOpenExternal: (slug: string) => void;
}

export function FeedColumn(props: FeedColumnProps) {
  const { items, from, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage, pinned, pinnedLoading, initialOpenSlug, resetKey, onOpenExternal } = props;
  const reduced = !!useReducedMotion();
  const all = pinned ? [pinned, ...items.filter((i) => i.slug !== pinned.slug)] : items;
  const readable = all.filter(isReadable).map((i) => i.slug);
  const readableRef = useRef(readable);
  readableRef.current = readable;

  // Past the last cached item: fetch the next page, then open its first readable item.
  const pendingNext = useRef<{ method: ReaderOpenMethod; after: string } | null>(null);
  const onEnd = useCallback(
    (dir: 1 | -1, method: ReaderOpenMethod) => {
      if (dir !== 1 || !hasNextPage) return;
      pendingNext.current = { method, after: readableRef.current[readableRef.current.length - 1] };
      if (!isFetchingNextPage) fetchNextPage();
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const reader = useReader(readable, { resetKey, initialSlug: initialOpenSlug, onEnd });
  const { move, open } = reader;

  useEffect(() => {
    const pending = pendingNext.current;
    if (!pending) return;
    const i = readable.indexOf(pending.after);
    if (i >= 0 && i < readable.length - 1) {
      pendingNext.current = null;
      move(1, pending.method, pending.after);
    }
  }, [readable, move]);

  const sentinel = useInfiniteSentinel(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, hasNextPage);

  // Header anchoring: never move a visible header; bring an off-screen one under the navbar.
  const cards = useRef(new Map<string, HTMLElement>());
  const register = useCallback((slug: string, el: HTMLElement | null) => {
    if (el) cards.current.set(slug, el);
    else cards.current.delete(slug);
  }, []);
  useEffect(() => {
    if (!reader.active) return;
    const el = cards.current.get(reader.active) ?? null;
    const raf = requestAnimationFrame(() => anchorCard(el, reduced));
    return () => cancelAnimationFrame(raf);
  }, [reader.active, reduced]);

  const openRelated = useCallback(
    (slug: string) => {
      if (readableRef.current.includes(slug)) open(slug, 'tap');
      else onOpenExternal(slug);
    },
    [open, onOpenExternal]
  );

  if (isLoading || (pinnedLoading && !items.length)) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading prompts">
        {Array.from({ length: 6 }, (_, i) => (
          <PromptCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (isError && !all.length) {
    return (
      <div className="rounded-xl border border-border/60 p-8 text-center v2:rounded-cartouche v2:border-line" role="alert">
        <p className="font-medium">We could not load prompts.</p>
        <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={props.refetch} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Retry
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/discover">Browse the library instead</Link>
          </Button>
        </div>
      </div>
    );
  }
  if (!all.length) {
    return <p className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground v2:rounded-cartouche v2:border-line v2:text-ink-muted">{props.emptyText}</p>;
  }

  return (
    <div>
      <ol className="space-y-3" aria-label="Prompts">
        {all.map((item, i) => {
          const idx = readable.indexOf(item.slug);
          const isPinned = pinned?.slug === item.slug;
          const readerProps: ReaderCardProps | undefined =
            idx === -1
              ? undefined
              : {
                  open: reader.isOpen(item.slug),
                  active: reader.active === item.slug,
                  onToggle: () => reader.toggle(item.slug, 'tap'),
                  onClose: (reason) => reader.close(item.slug, reason),
                  onPrev: () => reader.move(-1, 'arrow', item.slug),
                  onNext: () => {
                    if (!reader.move(1, 'arrow', item.slug)) onEnd(1, 'arrow');
                  },
                  onSwipe: (dir) => {
                    if (!reader.move(dir, 'swipe', item.slug) && dir === 1) onEnd(1, 'swipe');
                  },
                  hasPrev: idx > 0,
                  hasNext: idx < readable.length - 1 || hasNextPage,
                  onOpenRelated: openRelated,
                  settings: reader.settings,
                  onSetting: reader.setSetting,
                  focusMode: reader.focusMode && reader.active === item.slug,
                  copyTick: reader.copyTick,
                };
          return (
            <li key={item.id} ref={(el) => register(item.slug, el)} data-pinned={isPinned || undefined}>
              <PromptCard item={item} from={isPinned ? 'deeplink' : from} position={i + 1} onRequireAuth={props.onRequireAuth} onFork={props.onFork} reader={readerProps} />
            </li>
          );
        })}
      </ol>
      <div ref={sentinel} className="h-px" aria-hidden />
      {pendingNext.current && isFetchingNextPage && (
        <p className="mt-2 text-center text-xs text-muted-foreground" aria-live="polite" aria-busy="true">
          Loading the next prompt…
        </p>
      )}
      {(hasNextPage || isFetchingNextPage) && (
        <div className="mt-4 flex justify-center">
          {isFetchingNextPage ? (
            <div className="w-full space-y-3" aria-busy="true" aria-label="Loading more prompts">
              <PromptCardSkeleton />
              <PromptCardSkeleton />
            </div>
          ) : (
            <Button variant="outline" onClick={fetchNextPage}>
              Load more
            </Button>
          )}
        </div>
      )}
      {isError && all.length > 0 && (
        <p className="mt-3 text-center text-xs text-muted-foreground" role="alert">
          Could not load more. <button className="underline" onClick={fetchNextPage}>Try again</button>
        </p>
      )}
    </div>
  );
}
