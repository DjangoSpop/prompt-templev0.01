import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PromptRedirect from './PromptRedirect';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://prompt-temple.com').replace(/\/$/, '');

async function fetchPublicPrompt(id: string) {
  try {
    const res = await fetch(`${API_BASE}/api/v2/history/saved-prompts/${id}/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const prompt = await fetchPublicPrompt(id);

  if (!prompt) {
    // Fallback: still provide decent OG metadata even when backend is unreachable.
    // This ensures crawlers get something useful instead of a blank card.
    const ogImage = `${SITE_URL}/api/og/share`;
    return {
      title: 'Community Prompt — Prompt Temple',
      description: 'Discover and use community prompts on PromptTemple — the AI prompt optimization platform.',
      openGraph: {
        title: 'Community Prompt — Prompt Temple',
        description: 'Discover and use community prompts on PromptTemple — the AI prompt optimization platform.',
        type: 'website',
        siteName: 'PromptTemple',
        url: `${SITE_URL}/p/${id}`,
        images: [{ url: ogImage, width: 1200, height: 630, alt: 'PromptTemple' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Community Prompt — Prompt Temple',
        description: 'Discover and use community prompts on PromptTemple.',
        images: [ogImage],
        creator: '@prompttemple',
      },
    };
  }

  const title = prompt.title || 'Community Prompt';
  const description = prompt.description || prompt.content?.slice(0, 160) || 'A community prompt on PromptTemple.';
  const score = prompt.metadata?.quality_score || 8;
  const ogImage = `${SITE_URL}/api/og/share/prompt?prompt=${encodeURIComponent(title)}&score=${score}`;

  return {
    title: `${title} — Prompt Temple`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'PromptTemple',
      url: `${SITE_URL}/p/${id}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@prompttemple',
    },
  };
}

export default async function PublicPromptPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prompt = await fetchPublicPrompt(id);

  // If prompt not found server-side (may need auth), redirect to discover
  if (!prompt) {
    redirect(`/discover?prompt=${id}`);
  }

  return <PromptRedirect promptId={id} />;
}
