'use client';

/**
 * F1 — the feed: tabs (Trending · New · Top · For you), URL-synced filters, infinite
 * scroll, skeletons, empty states and the `/discover` fallback when the backend
 * answers `503 feed_disabled`. Also renders a collection (`/feed/c/[collection]`).
 */
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Flame, Lock, Sparkles, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BRAND_V2 } from '@/lib/brand';
import { useAuthStore } from '@/store/user';
import { trackFeed } from '@/lib/feed/analytics';
import { isFeedDisabled } from '@/lib/feed/api';
import { useCollection, useFeed, useFeedItem, usePendingReactionReplay, usePrompt } from '@/lib/feed/hooks';
import { hasActiveFilters, parseFeedQuery, serializeFeedQuery, toggleFilterValue } from '@/lib/feed/params';
import type { CollectionSummary, FacetKey, FeedItem, FeedPage, FeedQuery, FeedTab } from '@/lib/feed/types';
import { FeedColumn } from './FeedColumn';
import { ActiveFilterChips, FiltersButton, FiltersSidebar } from './FeedFilters';
import { ForkDialog } from './ForkDialog';
import { SignUpCta, type CtaIntent } from './SignUpCta';

const DiscoverFallback = dynamic(() => import('@/app/discover/page'), {
  ssr: false,
  loading: () => <div className="p-6 text-sm text-muted-foreground">Loading the library…</div>,
});

const TABS: { id: FeedTab; label: string; icon: typeof Flame }[] = [
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'new', label: 'New', icon: Clock },
  { id: 'top', label: 'Top', icon: Trophy },
  { id: 'for_you', label: 'For you', icon: Sparkles },
];

const EMPTY_COPY: Record<FeedTab, string> = BRAND_V2
  ? {
      trending: 'Nothing is trending yet. Be the first to like a prompt.',
      new: 'No new prompts yet. Check back soon.',
      top: 'No top prompts yet. Be the first to like a prompt.',
      for_you: 'Save or like three prompts and this tab fills up.',
    }
  : {
      trending: 'Nothing is trending yet — be the first to like a prompt.',
      new: 'No new prompts yet. Check back soon.',
      top: 'No top prompts yet — be the first to like a prompt.',
      for_you: 'Save or like three prompts and this tab will fill up.',
    };
const FILTERED_EMPTY = BRAND_V2 ? 'No prompts match. Clear a filter.' : 'No prompts match; clear a filter.';

export function FeedDisabledNotice() {
  return (
    <div className="flex flex-col">
      <div className="mx-4 mt-4 rounded-lg border border-[#C9A227]/40 bg-[#C9A227]/10 px-4 py-3 text-sm v2:rounded-md v2:border-l-2 v2:border-lapis v2:border-y-0 v2:border-r-0 v2:bg-lapis-soft v2:text-ink" role="status">
        <strong className="font-semibold v2:text-lapis">Feed coming soon.</strong> Browse the library instead. Every prompt is below.
      </div>
      <DiscoverFallback />
    </div>
  );
}

/**
 * R1 deep links: `?p=<slug>`. When the slug is not in the loaded pages, use any cached copy
 * (a related item, a prompt page) or fetch the detail once and pin it as the first card.
 */
function usePinned(slug: string | null, items: FeedItem[], loading: boolean) {
  const inList = !!slug && items.some((i) => i.slug === slug);
  const cached = useFeedItem(slug && !inList ? slug : null);
  const needFetch = !!slug && !loading && !inList && !cached;
  const detail = usePrompt(slug, { enabled: needFetch, from: 'deeplink' });
  const pinned = slug && !inList ? (cached ?? detail.data ?? null) : null;
  return { pinned, pinnedLoading: needFetch && detail.isPending };
}

function useOverlays() {
  const [cta, setCta] = useState<CtaIntent>(null);
  const [forking, setForking] = useState<FeedItem | null>(null);
  const overlays = (
    <>
      <SignUpCta intent={cta} onClose={() => setCta(null)} />
      <ForkDialog item={forking} onClose={() => setForking(null)} />
    </>
  );
  return { overlays, requireAuth: setCta, fork: setForking };
}

interface FeedViewProps {
  initialPage?: FeedPage;
}

export function FeedView({ initialPage }: FeedViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const authed = useAuthStore((s) => s.isAuthenticated);
  const query = useMemo(() => parseFeedQuery(searchParams), [searchParams]);
  const feed = useFeed(query, query.tab === 'trending' && !hasActiveFilters(query.filters) ? initialPage : undefined);
  const { overlays, requireAuth, fork } = useOverlays();
  usePendingReactionReplay();
  const items = feed.data?.pages.flatMap((p) => p.results) ?? [];
  const deepLink = searchParams.get('p');
  const { pinned, pinnedLoading } = usePinned(deepLink, items, feed.isLoading);

  useEffect(() => {
    trackFeed('feed_viewed', { tab: query.tab, filtered: hasActiveFilters(query.filters) });
  }, [query.tab, query.filters]);

  const navigate = useCallback(
    (next: FeedQuery, extra?: Record<string, string | undefined>) =>
      router.replace(`${pathname}${serializeFeedQuery(next, extra)}`, { scroll: false }),
    [router, pathname]
  );
  const openExternal = useCallback((slug: string) => navigate(query, { p: slug }), [navigate, query]);
  const onToggle = (key: FacetKey, value: string) => {
    const filters = toggleFilterValue(query.filters, key, value);
    if ((filters[key]?.length ?? 0) > (query.filters[key]?.length ?? 0)) trackFeed('feed_filter_applied', { facet: key });
    navigate({ ...query, filters });
  };
  const onClear = () => navigate({ ...query, filters: {} });
  const selectTab = (tab: FeedTab) => {
    if (tab === 'for_you' && !authed) requireAuth({ kind: 'for_you' });
    navigate({ ...query, tab });
  };

  if (isFeedDisabled(feed.error)) return <FeedDisabledNotice />;

  const fallback = feed.data?.pages[0]?.tab_fallback;
  const filterProps = { value: query.filters, onToggle, onClear };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-4">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Prompt feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The best openly licensed prompts, ranked by what people copy, like and save.{' '}
          <Link href="/feed/c/sota" className="font-medium text-[#8a6d12] hover:underline dark:text-[#e2c25a] v2:text-faience v2-dark:text-faience">
            State of the art →
          </Link>
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label="Feed" className="flex gap-1 overflow-x-auto rounded-lg bg-foreground/5 p-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = query.tab === id;
            return (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => selectTab(id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {label}
                {id === 'for_you' && !authed && <Lock className="h-3 w-3" aria-label="Sign in required" />}
              </button>
            );
          })}
        </div>
        <FiltersButton {...filterProps} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section role="tabpanel" aria-label={TABS.find((t) => t.id === query.tab)?.label} className="min-w-0 space-y-3">
          <ActiveFilterChips {...filterProps} />
          {query.tab === 'for_you' && fallback === 'trending' && (
            <p className="text-sm text-muted-foreground">
              {authed ? 'Like or save three prompts and this tab will be picked for you. Showing trending for now.' : (
                <>
                  <button type="button" className="font-medium text-foreground underline" onClick={() => requireAuth({ kind: 'for_you' })}>
                    Sign in
                  </button>{' '}
                  to get prompts picked for you. Showing trending for now.
                </>
              )}
            </p>
          )}
          <FeedColumn
            items={items}
            from={query.tab}
            isLoading={feed.isLoading}
            isError={feed.isError}
            error={feed.error}
            hasNextPage={!!feed.hasNextPage}
            isFetchingNextPage={feed.isFetchingNextPage}
            fetchNextPage={() => void feed.fetchNextPage()}
            refetch={() => void feed.refetch()}
            emptyText={hasActiveFilters(query.filters) ? FILTERED_EMPTY : EMPTY_COPY[query.tab]}
            onRequireAuth={requireAuth}
            onFork={fork}
            pinned={pinned}
            pinnedLoading={pinnedLoading}
            initialOpenSlug={deepLink}
            resetKey={serializeFeedQuery(query)}
            onOpenExternal={openExternal}
          />
        </section>
        <FiltersSidebar {...filterProps} />
      </div>
      {overlays}
    </div>
  );
}

const SOTA_EXPLAINER =
  "Top-ranked, licensed, structured prompts from the world's public libraries, refreshed weekly.";

export function CollectionView({ slug, initial }: { slug: string; initial?: CollectionSummary | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collection = useCollection(slug);
  const { overlays, requireAuth, fork } = useOverlays();
  usePendingReactionReplay();
  const items = collection.data?.pages.flatMap((p) => p.results) ?? [];
  const deepLink = searchParams.get('p');
  const { pinned, pinnedLoading } = usePinned(deepLink, items, collection.isLoading);
  const openExternal = useCallback(
    (s: string) => router.replace(`/feed/c/${encodeURIComponent(slug)}?p=${encodeURIComponent(s)}`, { scroll: false }),
    [router, slug]
  );

  useEffect(() => {
    trackFeed('feed_viewed', { tab: `collection:${slug}` });
  }, [slug]);

  if (isFeedDisabled(collection.error)) return <FeedDisabledNotice />;

  const header = collection.data?.pages[0]?.collection ?? initial ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <nav className="mb-3 text-sm">
        <Link href="/feed" className="text-muted-foreground hover:text-foreground">
          ← Prompt feed
        </Link>
      </nav>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{header?.title || 'Collection'}</h1>
        {(header?.description || slug === 'sota') && (
          <p className="mt-1 text-sm text-muted-foreground">{slug === 'sota' ? SOTA_EXPLAINER : header?.description}</p>
        )}
        {!!header?.count && <p className="mt-1 text-xs text-muted-foreground">{header.count.toLocaleString()} prompts</p>}
      </header>
      <FeedColumn
        items={items}
        from={`collection:${slug}`}
        isLoading={collection.isLoading}
        isError={collection.isError}
        error={collection.error}
        hasNextPage={!!collection.hasNextPage}
        isFetchingNextPage={collection.isFetchingNextPage}
        fetchNextPage={() => void collection.fetchNextPage()}
        refetch={() => void collection.refetch()}
        emptyText="This collection is empty for now."
        onRequireAuth={requireAuth}
        onFork={fork}
        pinned={pinned}
        pinnedLoading={pinnedLoading}
        initialOpenSlug={deepLink}
        resetKey={`collection:${slug}`}
        onOpenExternal={openExternal}
      />
      {overlays}
    </div>
  );
}
