import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FeedView } from '@/components/feed/FeedView';
import { PromptCardSkeleton } from '@/components/feed/PromptCard';
import { isIndexableFeedUrl } from '@/lib/feed/params';
import { fetchFirstTrendingPage, SITE_URL } from '@/lib/feed/server';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const TITLE = 'Prompt feed — trending AI prompts | Prompt Temple';
const DESCRIPTION =
  'Trending, new and top AI prompts: system prompts, multi-step chains and templates with variables, ranked by what people copy, like and save.';

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/feed` },
    // F6: tab / filter variants are `noindex, follow`; bare /feed and ?tab=trending are indexable.
    robots: isIndexableFeedUrl(sp) ? undefined : { index: false, follow: true },
    openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/feed`, siteName: 'PromptTemple', type: 'website' },
  };
}

function FeedSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 px-4 py-6 sm:px-6" aria-busy="true" aria-label="Loading prompts">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="h-9 w-80 rounded-lg bg-muted/60" />
      {Array.from({ length: 4 }, (_, i) => (
        <PromptCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function FeedPage() {
  // First page of anonymous trending is server-rendered (revalidated every 60 s); the
  // client takes over for other tabs, filters, paging and reactions.
  const first = await fetchFirstTrendingPage();
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedView initialPage={first.ok ? first.data : undefined} />
    </Suspense>
  );
}
