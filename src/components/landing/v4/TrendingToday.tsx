'use client';

/** Sprint 11 I5 §3 — six real trending cards from the feed data layer (no reader; tap goes to the feed). */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFeed } from '@/lib/feed/hooks';
import type { FeedQuery } from '@/lib/feed/types';
import { PromptCard } from '@/components/feed/PromptCard';

const QUERY: FeedQuery = { tab: 'trending', filters: {} };

export function TrendingToday() {
  const router = useRouter();
  const feed = useFeed(QUERY);
  const items = (feed.data?.pages?.[0]?.results ?? []).slice(0, 6);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16" aria-labelledby="trending-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="trending-title" className="display-md v2:font-display v2:text-ink v2:border-b v2:border-gilt-line inline-block pb-1 text-2xl font-semibold">
          Trending today
        </h2>
        <Link href="/feed" className="text-sm font-medium v2:text-faience text-primary underline-offset-4 hover:underline">
          Open the feed
        </Link>
      </div>
      {feed.isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" aria-busy="true" aria-label="Loading trending prompts">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      ) : items.length ? (
        <ol className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Trending prompts">
          {items.map((item, i) => (
            <li key={item.id} className="min-w-0">
              <PromptCard
                item={item}
                from="home-trending"
                position={i + 1}
                variant="compact"
                onRequireAuth={() => router.push('/auth/register?from=home')}
                onFork={(it) => router.push(`/feed?p=${encodeURIComponent(it.slug)}`)}
              />
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 text-sm v2:text-ink-muted text-muted-foreground">
          Trending prompts could not be loaded right now. <Link href="/discover" className="underline">Browse the library instead.</Link>
        </p>
      )}
    </section>
  );
}
