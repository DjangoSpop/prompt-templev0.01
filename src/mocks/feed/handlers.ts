/**
 * MSW handlers for `/api/v2/feed/*` (test-only). Pages of `limit` items over
 * `SIXTY_ITEMS`; the cursor is the next offset. `feedDisabledHandlers` answers 503.
 */
import { http, HttpResponse } from 'msw';
import filters from './fixtures/filters.json';
import { makeDetail, SIXTY_ITEMS, type RawItem } from './factory';

export const FEED_BASE = 'https://api.prompt-temple.com/api/v2/feed';

export interface FeedMockState {
  items: RawItem[];
  reactCalls: { slug: string; kind: string }[];
  copyCalls: string[];
  requests: URL[];
}

export function createFeedMockState(items: RawItem[] = SIXTY_ITEMS): FeedMockState {
  return { items: structuredClone(items), reactCalls: [], copyCalls: [], requests: [] };
}

export function feedHandlers(state: FeedMockState) {
  return [
    http.get(`${FEED_BASE}/filters/`, () => HttpResponse.json(filters)),
    http.post(`${FEED_BASE}/prompts/*/react/`, async ({ request }) => {
      const slug = new URL(request.url).pathname.replace(/^.*\/prompts\//, '').replace(/\/react\/$/, '');
      const { kind } = (await request.json()) as { kind: string };
      if (!request.headers.get('Authorization')) {
        return HttpResponse.json({ detail: 'Authentication credentials were not provided.', code: 'auth_required' }, { status: 401 });
      }
      state.reactCalls.push({ slug, kind });
      const item = state.items.find((i) => i.slug === slug);
      const viewer = item!.viewer as Record<string, boolean>;
      const stats = item!.stats as Record<string, number>;
      const flag = kind === 'like' ? 'liked' : 'saved';
      const stat = kind === 'like' ? 'likes' : 'saves';
      viewer[flag] = !viewer[flag];
      stats[stat] += viewer[flag] ? 1 : -1;
      return HttpResponse.json({ kind, active: viewer[flag], stats });
    }),
    http.post(`${FEED_BASE}/prompts/*/copy/`, ({ request }) => {
      state.copyCalls.push(new URL(request.url).pathname);
      return new HttpResponse(null, { status: 204 });
    }),
    http.get(`${FEED_BASE}/prompts/*`, ({ request }) => {
      const slug = decodeURIComponent(new URL(request.url).pathname.replace(/^.*\/prompts\//, '').replace(/\/$/, ''));
      const item = state.items.find((i) => i.slug === slug);
      if (!item) return HttpResponse.json({ detail: 'Not found.', code: 'not_found' }, { status: 404 });
      return HttpResponse.json(makeDetail(item));
    }),
    http.get(`${FEED_BASE}/`, ({ request }) => {
      const url = new URL(request.url);
      state.requests.push(url);
      const limit = Number(url.searchParams.get('limit') ?? 20);
      const offset = Number(url.searchParams.get('cursor') ?? 0);
      const forms = url.searchParams.get('form')?.split(',');
      const pool = forms ? state.items.filter((i) => forms.includes(i.form)) : state.items;
      const results = pool.slice(offset, offset + limit);
      const next = offset + limit < pool.length ? String(offset + limit) : null;
      const tab = url.searchParams.get('tab');
      const anonymousForYou = tab === 'for_you' && !request.headers.get('Authorization');
      return HttpResponse.json({ results, next_cursor: next, ...(anonymousForYou ? { tab_fallback: 'trending' } : {}) });
    }),
  ];
}

export const feedDisabledHandlers = [
  http.all(`${FEED_BASE}/*`, () =>
    HttpResponse.json({ detail: 'The prompt feed is disabled.', code: 'feed_disabled' }, { status: 503 })
  ),
];
