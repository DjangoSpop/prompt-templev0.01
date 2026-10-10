import { NextResponse } from 'next/server';
import type {
  DiscoverPrompt,
  CuratedShowcaseCard,
  CuratedShowcaseResponse,
} from '@/types/saved-prompts';

// Landing "curated library" showcase. The top curated page is ~500 KB (full prompt
// content on every row), so it is fetched here, cached for an hour and trimmed to 6 cards.
// Not route-level ISR: a failed fetch must not be cached as the route output for an hour.
// The backend response lives in the data cache; successes are also CDN-cached via s-maxage.
export const dynamic = 'force-dynamic';

// Same env var as the typed client; tolerate a trailing slash or /api suffix and
// fall back to production when the value is a relative proxy path.
const ENV_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '').replace(/\/api$/, '');
const API_BASE = /^https?:\/\//.test(ENV_BASE) ? ENV_BASE : 'https://api.prompt-temple.com';

const SHOWCASE_SIZE = 6;
const MAX_PER_CATEGORY = 2;
const TIMEOUT_MS = 8000;

const EMPTY: CuratedShowcaseResponse = { count: null, results: [] };

function toCard(p: DiscoverPrompt): CuratedShowcaseCard {
  return {
    id: String(p.id),
    title: p.title ?? '',
    hook: p.hook || p.description || '',
    category: p.category ?? '',
    category_slug: p.category_slug ?? '',
    editor_quality: typeof p.editor_quality === 'number' ? p.editor_quality : null,
    use_count: p.use_count ?? 0,
    source: p.source?.name
      ? { name: p.source.name, url: p.source.url ?? '', license: p.source.license ?? '' }
      : null,
  };
}

// Featured first, then editor rating; Array.prototype.sort is stable so API order is kept otherwise.
// Then round-robin across categories (first-seen order) so the grid is not all Coding.
function pickShowcase(prompts: DiscoverPrompt[]): CuratedShowcaseCard[] {
  const ranked = prompts
    .filter((p) => p && p.id && p.title)
    .sort(
      (a, b) =>
        Number(!!b.is_featured) - Number(!!a.is_featured) ||
        (b.editor_quality ?? 0) - (a.editor_quality ?? 0)
    );

  const byCategory = new Map<string, DiscoverPrompt[]>();
  for (const p of ranked) {
    const key = p.category || 'Other';
    const bucket = byCategory.get(key);
    if (bucket) bucket.push(p);
    else byCategory.set(key, [p]);
  }

  const picked: CuratedShowcaseCard[] = [];
  for (let round = 0; round < MAX_PER_CATEGORY && picked.length < SHOWCASE_SIZE; round++) {
    for (const bucket of byCategory.values()) {
      if (picked.length >= SHOWCASE_SIZE) break;
      if (bucket[round]) picked.push(toCard(bucket[round]));
    }
  }
  return picked;
}

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `${API_BASE}/api/v2/history/saved-prompts/discover/?curated=true&sort_by=popularity`,
      { signal: controller.signal, next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error(`discover responded ${response.status}`);

    const data = (await response.json()) as { count?: number; results?: DiscoverPrompt[] };
    const results = pickShowcase(Array.isArray(data.results) ? data.results : []);

    return NextResponse.json<CuratedShowcaseResponse>(
      {
        count: typeof data.count === 'number' ? data.count : null,
        results,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    console.warn('[landing/curated] showcase fetch failed:', error);
    return NextResponse.json<CuratedShowcaseResponse>(EMPTY, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
