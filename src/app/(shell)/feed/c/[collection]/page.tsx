import type { Metadata } from 'next';
import { CollectionView } from '@/components/feed/FeedView';
import { fetchCollectionForPage, SITE_URL } from '@/lib/feed/server';

type Params = Promise<{ collection: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { collection } = await params;
  const res = await fetchCollectionForPage(collection);
  const title = res.ok && res.data.collection.title ? res.data.collection.title : 'Prompt collection';
  const description =
    (res.ok && res.data.collection.description) ||
    "Top-ranked, licensed, structured prompts from the world's public libraries.";
  const url = `${SITE_URL}/feed/c/${encodeURIComponent(collection)}`;
  return {
    title: `${title} — Prompt Temple`,
    description,
    alternates: { canonical: url },
    robots: res.ok ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, siteName: 'PromptTemple', type: 'website' },
  };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { collection } = await params;
  const res = await fetchCollectionForPage(collection);
  return <CollectionView slug={collection} initial={res.ok ? res.data.collection : null} />;
}
