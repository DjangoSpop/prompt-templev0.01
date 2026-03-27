import type { Metadata } from 'next';
import BackendShareLanding from './BackendShareLanding';

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://prompt-temple.com').replace(/\/$/, '');
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';

interface ShareData {
  id: string;
  username: string;
  original_prompt: string;
  optimized_prompt: string;
  wow_score: number;
  title: string;
  category: string;
  show_original: boolean;
  view_count: number;
  copy_count: number;
  reshare_count: number;
  share_url: string;
  engagement_score: number;
  created_at: string;
  og_meta?: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
}

async function fetchShare(token: string): Promise<ShareData | null> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${API_BASE}/api/v1/share/${token}/`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function buildFallbackMetadata(token: string): Metadata {
  const shortToken = token.slice(0, 8).toUpperCase();
  const title = `Shared Prompt ${shortToken} — Prompt Temple`;
  const description = 'This prompt share is loading. Open the link to view the full before/after optimization details on PromptTemple.';
  const ogImage = `${SITE_URL}/api/og/share/prompt?prompt=${encodeURIComponent(`Shared Prompt ${shortToken}`)}&score=8`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'PromptTemple',
      url: `${SITE_URL}/s/${token}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@prompttemple',
    },
    robots: { index: true, follow: true },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const share = await fetchShare(token);

  if (!share) {
    return buildFallbackMetadata(token);
  }

  const ogTitle = share.title || `Wow Score ${share.wow_score}/10 — Prompt Temple`;
  const ogDescription = `See how this prompt was transformed to a ${share.wow_score}/10 masterpiece on PromptTemple.`;
  const ogImage = `${SITE_URL}/api/og/share/optimization?beforeScore=2.0&afterScore=${share.wow_score}&improvements=${encodeURIComponent('Clarity|Specificity|Structure')}`;

  return {
    title: `${ogTitle} — Prompt Temple`,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'website',
      siteName: 'PromptTemple',
      url: `${SITE_URL}/s/${token}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
      creator: '@prompttemple',
    },
    robots: { index: true, follow: true },
  };
}

export default async function ShareTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = await fetchShare(token);

  return <BackendShareLanding shareToken={token} initialData={share} />;
}
