import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PromptPageView } from '@/components/feed/PromptPageView';
import { categorySlug } from '@/lib/feed/types';
import { fetchPromptForPage, SITE_URL } from '@/lib/feed/server';

/**
 * F3 — prompt page. Feed slugs are `<category>/<subcategory|prompt>/<title>-<id8>`,
 * hence the catch-all. `?view=` / `?from=` variants are canonical to the bare URL.
 */
type Params = Promise<{ slug: string[] }>;

function joinSlug(parts: string[]): string {
  return parts.map((p) => decodeURIComponent(p)).join('/');
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const slug = joinSlug((await params).slug);
  const res = await fetchPromptForPage(slug);
  if (!res.ok) return { title: 'Prompt — Prompt Temple', robots: { index: false, follow: true } };
  const p = res.data;
  const description = (p.tldr || p.preview || `A ${p.category} prompt on Prompt Temple.`).slice(0, 300);
  const url = `${SITE_URL}/prompts/${p.slug}`;
  return {
    title: `${p.title} — Prompt Temple`,
    description,
    alternates: { canonical: url },
    openGraph: { title: p.title, description, url, siteName: 'PromptTemple', type: 'article' },
    twitter: { card: 'summary', title: p.title, description },
  };
}

export default async function PromptPage({ params }: { params: Params }) {
  const slug = joinSlug((await params).slug);
  const res = await fetchPromptForPage(slug);
  if (!res.ok && res.status === 404) notFound();
  const prompt = res.ok ? res.data : undefined;

  const jsonLd = prompt && {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        name: prompt.title,
        description: prompt.tldr || prompt.preview,
        url: `${SITE_URL}/prompts/${prompt.slug}`,
        inLanguage: prompt.language,
        genre: prompt.category,
        dateCreated: prompt.created_at || undefined,
        dateModified: prompt.updated_at || undefined,
        license: prompt.attribution.license || undefined,
        author: prompt.attribution.author ? { '@type': 'Person', name: prompt.attribution.author } : undefined,
        isBasedOn: prompt.attribution.url || undefined,
        wordCount: prompt.word_count,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Feed', item: `${SITE_URL}/feed` },
          { '@type': 'ListItem', position: 2, name: prompt.category, item: `${SITE_URL}/feed?category=${categorySlug(prompt)}` },
          { '@type': 'ListItem', position: 3, name: prompt.title, item: `${SITE_URL}/prompts/${prompt.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // `<` escaped so prompt text can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground">Loading prompt…</div>}>
        <PromptPageView slug={slug} initial={prompt} />
      </Suspense>
    </>
  );
}
