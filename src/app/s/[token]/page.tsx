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
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE}/api/v1/share/${token}/`, {
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const share = await fetchShare(token);

  if (!share) {
    return {
      title: 'Shared Prompt — Prompt Temple',
      description: 'View this shared prompt on PromptTemple — the AI prompt optimization platform.',
      openGraph: {
        title: 'Shared Prompt',
        description: 'View this shared prompt on PromptTemple.',
        images: [{ url: `${SITE_URL}/api/og/share`, width: 1200, height: 630 }],
      },
    };
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
