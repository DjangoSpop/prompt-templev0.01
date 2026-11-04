'use client';

/**
 * Sprint 08 — React Query hooks for the feed (F1, F5).
 *
 * Keys live under `['feed', …]` and include `authed`, because `viewer` flags and the
 * `for_you` tab differ for signed-in visitors. `useReact` patches every cached copy
 * of a prompt (feed pages, collection pages, prompt detail and its `related`) and
 * rolls back on error.
 */
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/user';
import {
  FeedApiError,
  forkPrompt,
  getCollection,
  getCollections,
  getFeed,
  getFilters,
  getPrompt,
  isAuthRequired,
  reactToPrompt,
  recordCopy,
} from './api';
import { normalizeFilters } from './params';
import { clearPendingReaction, getPendingReaction } from './pending';
import type { CollectionPage, FeedItem, FeedPage, FeedPromptDetail, FeedQuery, ReactionKind } from './types';

export const feedKeys = {
  all: ['feed'] as const,
  list: (query: FeedQuery, authed: boolean) =>
    ['feed', 'list', query.tab, normalizeFilters(query.filters), authed] as const,
  collection: (slug: string, authed: boolean) => ['feed', 'collection', slug, authed] as const,
  collections: () => ['feed', 'collections'] as const,
  prompt: (slug: string, authed: boolean) => ['feed', 'prompt', slug, authed] as const,
  filters: () => ['feed', 'filters'] as const,
};

function useAuthed(): boolean {
  return useAuthStore((s) => s.isAuthenticated);
}

export function useFeed(query: FeedQuery, initialPage?: FeedPage) {
  const authed = useAuthed();
  return useInfiniteQuery({
    queryKey: feedKeys.list(query, authed),
    queryFn: ({ pageParam }) => getFeed(query, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    // Server-rendered first page (anonymous trending) seeds the cache only for anonymous visitors.
    initialData: initialPage && !authed ? { pages: [initialPage], pageParams: [null] } : undefined,
    staleTime: 60_000,
  });
}

export function useCollection(slug: string) {
  const authed = useAuthed();
  return useInfiniteQuery({
    queryKey: feedKeys.collection(slug, authed),
    queryFn: ({ pageParam }) => getCollection(slug, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    staleTime: 5 * 60_000,
  });
}

export function useCollections() {
  return useQuery({ queryKey: feedKeys.collections(), queryFn: () => getCollections(), staleTime: 10 * 60_000 });
}

export function usePrompt(slug: string | null, options: { enabled?: boolean; from?: string } = {}) {
  const authed = useAuthed();
  return useQuery({
    queryKey: feedKeys.prompt(slug ?? '', authed),
    queryFn: () => getPrompt(slug!, { from: options.from }),
    enabled: !!slug && (options.enabled ?? true),
    staleTime: 5 * 60_000,
  });
}

// ---------------------------------------------------------------------------
// Sprint 09 R1 — the reader reads from the feed cache, never from its own query
// ---------------------------------------------------------------------------

/** First copy of `slug` in any cached feed shape (list pages, collections, prompt detail, related). */
export function findCachedItem(client: QueryClient, slug: string): FeedItem | undefined {
  for (const [, data] of client.getQueriesData({ queryKey: feedKeys.all })) {
    if (!data || typeof data !== 'object') continue;
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.pages)) {
      for (const page of d.pages as (FeedPage | CollectionPage)[]) {
        const hit = page?.results?.find((item) => item.slug === slug);
        if (hit) return hit;
      }
    } else if (typeof d.slug === 'string' && Array.isArray(d.related)) {
      const detail = d as unknown as FeedPromptDetail;
      if (detail.slug === slug) return detail;
      const hit = detail.related.find((item) => item.slug === slug);
      if (hit) return hit;
    }
  }
  return undefined;
}

/**
 * Selector over the React Query cache: the item for `slug` wherever it is cached, kept in
 * sync with reactions and the on-open text fill. No request is ever made here.
 */
export function useFeedItem(slug: string | null): FeedItem | undefined {
  const client = useQueryClient();
  const subscribe = useCallback((cb: () => void) => client.getQueryCache().subscribe(cb), [client]);
  const read = useCallback(() => (slug ? findCachedItem(client, slug) : undefined), [client, slug]);
  return useSyncExternalStore(subscribe, read, read);
}

/**
 * R1 degrade path: when an open item has no inline text (B7 not deployed, cap set to 0)
 * or its text was cut at FEED_INLINE_TEXT_CAP, fetch the detail once and write `text`,
 * `views` into every cached copy. Cached items with full text never reach the network.
 */
export function useEnsureReaderText(item: FeedItem | undefined, open: boolean) {
  const client = useQueryClient();
  const authed = useAuthed();
  const needed = !!item && open && item.text_available !== false && (item.text === null || item.text_truncated);
  const query = useQuery({
    queryKey: feedKeys.prompt(item?.slug ?? '', authed),
    queryFn: () => getPrompt(item!.slug),
    enabled: needed,
    staleTime: 5 * 60_000,
  });
  useEffect(() => {
    const detail = query.data;
    if (!detail || !needed) return;
    patchEverywhere(client, detail.slug, (cached) =>
      cached.text === detail.text && cached.views === detail.views
        ? cached
        : { ...cached, text: detail.text, text_truncated: false, text_available: detail.text_available, views: detail.views ?? cached.views }
    );
  }, [client, needed, query.data]);
  return { loading: needed && query.isPending, error: needed && query.isError };
}

/** Related prompts for the reader footer — only when the reader asks (after it is open). */
export function useRelated(slug: string, enabled: boolean) {
  const authed = useAuthed();
  return useQuery({
    queryKey: feedKeys.prompt(slug, authed),
    queryFn: () => getPrompt(slug),
    enabled,
    staleTime: 5 * 60_000,
    select: (d) => d.related,
  });
}

export function useFilters() {
  return useQuery({ queryKey: feedKeys.filters(), queryFn: () => getFilters(), staleTime: 10 * 60_000 });
}

/**
 * Feed availability for the nav (§1): `true` when `/filters/` answers, `false` on
 * `feed_disabled`, `undefined` while unknown. Cached for the session.
 */
export function useFeedAvailable(): boolean | undefined {
  const { data, error } = useQuery({
    queryKey: feedKeys.filters(),
    queryFn: () => getFilters(),
    staleTime: Infinity,
    retry: false,
  });
  if (data) return true;
  if (error) return false;
  return undefined;
}

// ---------------------------------------------------------------------------
// Optimistic updates
// ---------------------------------------------------------------------------

type ItemPatch = (item: FeedItem) => FeedItem;

function patchList<T extends FeedItem>(items: T[], slug: string, patch: ItemPatch): T[] {
  let changed = false;
  const next = items.map((item) => {
    if (item.slug !== slug) return item;
    changed = true;
    return patch(item) as T;
  });
  return changed ? next : items;
}

/** Applies `patch` to every item with `slug` inside any cached feed shape. */
function patchCachedData(data: unknown, slug: string, patch: ItemPatch): unknown {
  if (!data || typeof data !== 'object') return data;
  const d = data as Record<string, unknown>;
  if (Array.isArray(d.pages)) {
    const infinite = d as unknown as InfiniteData<FeedPage | CollectionPage>;
    return {
      ...infinite,
      pages: infinite.pages.map((page) => ({ ...page, results: patchList(page.results, slug, patch) })),
    };
  }
  if (typeof d.slug === 'string' && Array.isArray(d.related)) {
    const detail = d as unknown as FeedPromptDetail;
    const self = detail.slug === slug ? (patch(detail) as FeedPromptDetail) : detail;
    return { ...self, related: patchList(detail.related, slug, patch) };
  }
  return data;
}

function patchEverywhere(client: QueryClient, slug: string, patch: ItemPatch) {
  client.setQueriesData({ queryKey: feedKeys.all }, (data: unknown) => patchCachedData(data, slug, patch));
}

const STAT_FOR: Record<ReactionKind, 'likes' | 'saves'> = { like: 'likes', save: 'saves' };
const VIEWER_FOR: Record<ReactionKind, 'liked' | 'saved'> = { like: 'liked', save: 'saved' };

export function toggleReaction(item: FeedItem, kind: ReactionKind, active?: boolean): FeedItem {
  const flag = VIEWER_FOR[kind];
  const stat = STAT_FOR[kind];
  const next = active ?? !item.viewer[flag];
  if (next === item.viewer[flag]) return item;
  return {
    ...item,
    viewer: { ...item.viewer, [flag]: next },
    stats: { ...item.stats, [stat]: Math.max(0, item.stats[stat] + (next ? 1 : -1)) },
  };
}

interface ReactVars {
  slug: string;
  kind: ReactionKind;
}

/**
 * Like / Save toggle. Optimistic across every cache; the server's `{active, stats}`
 * then wins. Anonymous callers should open the sign-up CTA instead (F5); if the
 * token has expired the server's `auth_required` rolls the change back.
 */
export function useReact() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, kind }: ReactVars) => reactToPrompt(slug, kind),
    onMutate: async ({ slug, kind }: ReactVars) => {
      await client.cancelQueries({ queryKey: feedKeys.all });
      const snapshot = client.getQueriesData({ queryKey: feedKeys.all });
      patchEverywhere(client, slug, (item) => toggleReaction(item, kind));
      return { snapshot };
    },
    onError: (error, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => client.setQueryData(key, data));
      toast.error(isAuthRequired(error) ? 'Please sign in again to react.' : 'Could not save your reaction. Try again.');
    },
    onSuccess: (res, { slug, kind }) => {
      patchEverywhere(client, slug, (item) => ({
        ...toggleReaction(item, kind, res.active),
        stats: { ...item.stats, ...res.stats },
      }));
    },
  });
}

export function useFork() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, title }: { slug: string; title?: string }) => forkPrompt(slug, title),
    onSuccess: (_res, { slug }) => {
      patchEverywhere(client, slug, (item) =>
        item.viewer.forked
          ? item
          : { ...item, viewer: { ...item.viewer, forked: true }, stats: { ...item.stats, forks: item.stats.forks + 1 } }
      );
    },
  });
}

/** Records a copy and bumps the cached count (best-effort, never throws). */
export function useRecordCopy() {
  const client = useQueryClient();
  return (slug: string, view?: string) => {
    patchEverywhere(client, slug, (item) => ({ ...item, stats: { ...item.stats, copies: item.stats.copies + 1 } }));
    void recordCopy(slug, view);
  };
}

/**
 * F5: after sign-up / sign-in, replay the reaction an anonymous visitor asked for
 * (stored by the CTA), once. Sets the reaction active rather than toggling, so a
 * prompt that was already liked stays liked.
 */
export function usePendingReactionReplay() {
  const authed = useAuthed();
  const client = useQueryClient();
  const done = useRef(false);

  useEffect(() => {
    if (!authed || done.current) return;
    const pending = getPendingReaction();
    if (!pending) return;
    done.current = true;
    clearPendingReaction();
    (async () => {
      try {
        let res = await reactToPrompt(pending.slug, pending.kind);
        if (!res.active) res = await reactToPrompt(pending.slug, pending.kind); // it was already on
        patchEverywhere(client, pending.slug, (item) => ({
          ...toggleReaction(item, pending.kind, res.active),
          stats: { ...item.stats, ...res.stats },
        }));
        toast.success(pending.kind === 'like' ? 'Liked — thanks!' : 'Saved to your library.');
      } catch (error) {
        if (!(error instanceof FeedApiError) || error.code !== 'not_found') {
          toast.error('We could not apply your reaction. Please try again.');
        }
      }
    })();
  }, [authed, client]);
}
