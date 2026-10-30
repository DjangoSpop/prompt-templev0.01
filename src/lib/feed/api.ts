/**
 * Sprint 08 — thin functions over `/api/v2/feed/*` (F1).
 *
 * Same base URL and Bearer token source as `src/lib/api/typed-client.ts` (its
 * `request()` is private, so the header logic is repeated in `feedRequest`). Every
 * response is parsed with the zod schemas in `./types`; errors become `FeedApiError`
 * carrying the backend `code` (`feed_disabled`, `auth_required`, `rate_limited`,
 * `not_found`, `invalid`).
 */
import type { z } from 'zod';
import { useAuthStore } from '@/store/user';
import { toApiParams } from './params';
import {
  apiErrorBodySchema,
  collectionPageSchema,
  collectionsListSchema,
  feedFiltersSchema,
  feedPageSchema,
  feedPromptDetailSchema,
  forkResponseSchema,
  reactResponseSchema,
  type CollectionPage,
  type CollectionSummary,
  type FeedFilters,
  type FeedPage,
  type FeedPromptDetail,
  type FeedQuery,
  type ForkResponse,
  type ReactionKind,
  type ReactResponse,
} from './types';

export const FEED_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';

export class FeedApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'FeedApiError';
    this.status = status;
    this.code = code;
  }
}

export function isFeedDisabled(error: unknown): boolean {
  return error instanceof FeedApiError && error.code === 'feed_disabled';
}

export function isAuthRequired(error: unknown): boolean {
  return error instanceof FeedApiError && (error.code === 'auth_required' || error.status === 401);
}

function authToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const token = useAuthStore.getState().accessToken;
  if (token) return token;
  try {
    return localStorage.getItem('access_token') ?? undefined;
  } catch {
    return undefined;
  }
}

/** Encode each slug segment; feed slugs contain `/` and the backend route is `<path:slug>`. */
export function encodeSlug(slug: string): string {
  return slug.split('/').map(encodeURIComponent).join('/');
}

interface FeedRequestInit extends RequestInit {
  /** Next.js fetch cache options for server components (F6: first page revalidates every 60 s). */
  next?: { revalidate?: number | false; tags?: string[] };
  /** Skip the Authorization header (server-side anonymous fetches). */
  anonymous?: boolean;
}

export async function feedRequest<T>(path: string, schema: z.ZodType<T, z.ZodTypeDef, unknown> | null, init: FeedRequestInit = {}): Promise<T> {
  const { anonymous, headers, ...rest } = init;
  const token = anonymous ? undefined : authToken();
  const response = await fetch(`${FEED_API_BASE}/api/v2/feed/${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let body: { detail?: string; code?: string } = {};
    try {
      body = apiErrorBodySchema.parse(await response.json());
    } catch {
      /* non-JSON error page */
    }
    const code = body.code ?? (response.status === 401 ? 'auth_required' : response.status === 404 ? 'not_found' : 'error');
    throw new FeedApiError(response.status, code, body.detail ?? `Feed request failed (${response.status})`);
  }

  if (response.status === 204 || !schema) return undefined as T;
  return schema.parse(await response.json());
}

const json = (body: unknown) => JSON.stringify(body ?? {});

export function getFeed(query: FeedQuery, cursor?: string | null, init?: FeedRequestInit): Promise<FeedPage> {
  return feedRequest(`?${toApiParams(query, cursor).toString()}`, feedPageSchema, init);
}

export function getPrompt(slug: string, init?: FeedRequestInit & { from?: string }): Promise<FeedPromptDetail> {
  const { from, ...rest } = init ?? {};
  const qs = from ? `?from=${encodeURIComponent(from)}` : '';
  return feedRequest(`prompts/${encodeSlug(slug)}/${qs}`, feedPromptDetailSchema, rest);
}

export function reactToPrompt(slug: string, kind: ReactionKind): Promise<ReactResponse> {
  return feedRequest(`prompts/${encodeSlug(slug)}/react/`, reactResponseSchema, { method: 'POST', body: json({ kind }) });
}

/** Best-effort copy counter; anonymous allowed, 30/min. Never throws. */
export async function recordCopy(slug: string, view?: string): Promise<void> {
  try {
    await feedRequest(`prompts/${encodeSlug(slug)}/copy/`, null, { method: 'POST', body: json(view ? { view } : {}) });
  } catch {
    /* rate_limited or offline: the copy already happened client-side (F5) */
  }
}

export function forkPrompt(slug: string, title?: string): Promise<ForkResponse> {
  return feedRequest(`prompts/${encodeSlug(slug)}/fork/`, forkResponseSchema, {
    method: 'POST',
    body: json(title ? { title } : {}),
  });
}

export function getCollections(init?: FeedRequestInit): Promise<CollectionSummary[]> {
  return feedRequest('collections/', collectionsListSchema, init);
}

export function getCollection(slug: string, cursor?: string | null, init?: FeedRequestInit): Promise<CollectionPage> {
  const qs = new URLSearchParams({ limit: '20' });
  if (cursor) qs.set('cursor', cursor);
  return feedRequest(`collections/${encodeURIComponent(slug)}/?${qs.toString()}`, collectionPageSchema, init);
}

export function getFilters(init?: FeedRequestInit): Promise<FeedFilters> {
  return feedRequest('filters/', feedFiltersSchema, init);
}
