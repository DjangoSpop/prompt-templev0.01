/**
 * Server-side, anonymous feed fetches for server components (F6): first feed page,
 * prompt page metadata and collection headers. No auth store, so nothing client-only
 * is pulled into the server bundle. Returns `null` instead of throwing; the client
 * view then fetches (and handles `feed_disabled`) on its own.
 */
import type { z } from 'zod';
import { parseFeedQuery, toApiParams } from './params';
import {
  collectionPageSchema,
  feedPageSchema,
  feedPromptDetailSchema,
  type CollectionPage,
  type FeedPage,
  type FeedPromptDetail,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://prompt-temple.com').replace(/\/$/, '');

export type ServerResult<T> = { ok: true; data: T; status: number } | { ok: false; data?: undefined; status: number };

async function get<T>(path: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>, revalidate: number): Promise<ServerResult<T>> {
  try {
    const res = await fetch(`${API_BASE}/api/v2/feed/${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate },
    });
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true, data: schema.parse(await res.json()), status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

const encodeSlug = (slug: string) => slug.split('/').map(encodeURIComponent).join('/');

/** Anonymous trending, first page — revalidated every 60 s. */
export function fetchFirstTrendingPage(): Promise<ServerResult<FeedPage>> {
  return get(`?${toApiParams(parseFeedQuery(null)).toString()}`, feedPageSchema, 60);
}

export function fetchPromptForPage(slug: string): Promise<ServerResult<FeedPromptDetail>> {
  return get(`prompts/${encodeSlug(slug)}/`, feedPromptDetailSchema, 300);
}

export function fetchCollectionForPage(slug: string): Promise<ServerResult<CollectionPage>> {
  return get(`collections/${encodeURIComponent(slug)}/?limit=20`, collectionPageSchema, 300);
}
