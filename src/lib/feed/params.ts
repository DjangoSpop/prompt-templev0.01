/**
 * URL ⇄ state for the feed (`?tab=&form=&length=&category=&model_family=&language=`).
 *
 * Shared by the server page (metadata / first fetch) and the client view, so the
 * same URL always means the same query. Multi-select facets are comma-joined in a
 * single param, matching the backend query contract (§2).
 */
import { FACET_KEYS, FEED_TABS, type FacetKey, type FeedFilterState, type FeedQuery, type FeedTab } from './types';

export type SearchParamsInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | null
  | undefined;

function readParam(sp: SearchParamsInput, key: string): string[] {
  if (!sp) return [];
  if (sp instanceof URLSearchParams) {
    return sp.getAll(key);
  }
  const v = sp[key];
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

function splitValues(values: string[]): string[] {
  const out: string[] = [];
  for (const v of values) {
    for (const part of v.split(',')) {
      const t = part.trim();
      if (t && !out.includes(t)) out.push(t);
    }
  }
  return out;
}

export function parseTab(value: string | null | undefined): FeedTab {
  return (FEED_TABS as readonly string[]).includes(value ?? '') ? (value as FeedTab) : 'trending';
}

export function parseFeedQuery(sp: SearchParamsInput): FeedQuery {
  const tab = parseTab(readParam(sp, 'tab')[0]);
  const filters: FeedFilterState = {};
  for (const key of FACET_KEYS) {
    const values = splitValues(readParam(sp, key));
    if (values.length) filters[key] = values;
  }
  return { tab, filters };
}

/** Builds the query string for a feed URL. `trending` with no filters → "" (bare /feed). */
export function serializeFeedQuery(query: FeedQuery, extra?: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  if (query.tab !== 'trending') sp.set('tab', query.tab);
  for (const key of FACET_KEYS) {
    const values = query.filters[key];
    if (values && values.length) sp.set(key, values.join(','));
  }
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== '') sp.set(k, v);
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/** Query params sent to `GET /api/v2/feed/`. */
export function toApiParams(query: FeedQuery, cursor?: string | null, limit = 20): URLSearchParams {
  const sp = new URLSearchParams();
  sp.set('tab', query.tab);
  for (const key of FACET_KEYS) {
    const values = query.filters[key];
    if (values && values.length) sp.set(key, values.join(','));
  }
  if (cursor) sp.set('cursor', cursor);
  sp.set('limit', String(limit));
  return sp;
}

export function hasActiveFilters(filters: FeedFilterState): boolean {
  return FACET_KEYS.some((k) => (filters[k]?.length ?? 0) > 0);
}

export function countActiveFilters(filters: FeedFilterState): number {
  return FACET_KEYS.reduce((n, k) => n + (filters[k]?.length ?? 0), 0);
}

export function toggleFilterValue(filters: FeedFilterState, key: FacetKey, value: string): FeedFilterState {
  const current = filters[key] ?? [];
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  const out: FeedFilterState = { ...filters };
  if (next.length) out[key] = next;
  else delete out[key];
  return out;
}

/**
 * F6: `/feed` is indexable only when it has no query at all or just `tab=trending`.
 * Everything else (other tabs, any facet) is `noindex, follow`.
 */
export function isIndexableFeedUrl(sp: SearchParamsInput): boolean {
  const query = parseFeedQuery(sp);
  if (hasActiveFilters(query.filters)) return false;
  if (query.tab !== 'trending') return false;
  // any other unknown param (cursor, view…) also de-indexes
  const keys = sp instanceof URLSearchParams ? Array.from(sp.keys()) : Object.keys(sp ?? {});
  return keys.every((k) => k === 'tab');
}

/** Stable key for React Query — sorted facets so `?form=a,b` and `?form=b,a` share a cache entry. */
export function normalizeFilters(filters: FeedFilterState): FeedFilterState {
  const out: FeedFilterState = {};
  for (const key of FACET_KEYS) {
    const values = filters[key];
    if (values && values.length) out[key] = [...values].sort();
  }
  return out;
}
