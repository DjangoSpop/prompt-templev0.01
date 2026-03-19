import type { Metadata } from 'next';
import ShareLanding from './ShareLanding';

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://prompt-temple.com').replace(/\/$/, '');

/**
 * Share page — stateless, self-contained share URLs.
 *
 * All share data is encoded in the URL search params so crawlers
 * and users can access content without any backend dependency.
 *
 * Query params:
 *   t  = title (required)
 *   d  = description
 *   s  = score (e.g. "8.5")
 *   bs = before score (for optimization results)
 *   c  = content preview (truncated prompt text)
 *   type = prompt | optimization | template | broadcast
 *   cat = category
 *   imp = improvements (pipe-separated)
 *   id = original resource ID (for deep-linking into app)
 */

interface ShareSearchParams {
  t?: string;
  d?: string;
  s?: string;
  bs?: string;
  c?: string;
  type?: string;
  cat?: string;
  imp?: string;
  id?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ShareSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;

  const title = params.t || 'Shared Prompt';
  const description = params.d || params.c?.slice(0, 160) || 'A prompt shared from PromptTemple — the AI prompt optimization platform.';
  const score = params.s ? parseFloat(params.s) : undefined;
  const beforeScore = params.bs ? parseFloat(params.bs) : undefined;
  const shareType = params.type || 'prompt';
  const category = params.cat || '';
  const improvements = params.imp?.split('|').filter(Boolean) || [];

  // Build OG image URL based on share type
  let ogImage: string;
  if (shareType === 'optimization' && beforeScore !== undefined && score !== undefined) {
    ogImage = `${SITE_URL}/api/og/share/optimization?beforeScore=${beforeScore}&afterScore=${score}&improvements=${encodeURIComponent(improvements.join('|'))}`;
  } else if (shareType === 'template' && category) {
    ogImage = `${SITE_URL}/api/og/share/template?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}&fields=0`;
  } else {
    ogImage = `${SITE_URL}/api/og/share/prompt?prompt=${encodeURIComponent(title)}&score=${score || 8}`;
  }

  const fullTitle = shareType === 'optimization'
    ? `Prompt Optimized: ${beforeScore} → ${score}/10`
    : title;

  const pageUrl = `${SITE_URL}/share?t=${encodeURIComponent(title)}${params.type ? `&type=${params.type}` : ''}`;

  return {
    title: `${fullTitle} — Prompt Temple`,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type: 'website',
      siteName: 'PromptTemple',
      url: pageUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@prompttemple',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<ShareSearchParams>;
}) {
  const params = await searchParams;

  return (
    <ShareLanding
      title={params.t || 'Shared Prompt'}
      description={params.d || ''}
      content={params.c || ''}
      score={params.s ? parseFloat(params.s) : undefined}
      beforeScore={params.bs ? parseFloat(params.bs) : undefined}
      shareType={(params.type as 'prompt' | 'optimization' | 'template' | 'broadcast') || 'prompt'}
      category={params.cat || ''}
      improvements={params.imp?.split('|').filter(Boolean) || []}
      originalId={params.id}
    />
  );
}
