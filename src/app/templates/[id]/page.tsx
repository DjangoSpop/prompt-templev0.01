import type { Metadata } from 'next';
import TemplateDetailView from '@/components/TemplateDetailView';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';
const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://prompttemple2030.com').replace(/\/$/, '');

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE}/api/v2/templates/${id}/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('not found');
    const t = await res.json();

    const title = t.title || 'Prompt Template';
    const description = t.description || `A ${t.category?.name ?? ''} prompt template on PromptTemple.`;
    const fieldCount = t.fields?.length ?? t.variable_count ?? 0;
    const category = t.category?.name ?? (typeof t.category === 'string' ? t.category : 'Template');
    const ogImage = `${SITE_URL}/api/og/share/template?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}&fields=${fieldCount}`;

    return {
      title: `${title} — Prompt Temple`,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'PromptTemple',
        url: `${SITE_URL}/templates/${id}`,
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: 'Prompt Template — PromptTemple',
      description: 'Explore and use this prompt template on PromptTemple.',
      openGraph: {
        title: 'Prompt Template — PromptTemple',
        description: 'Explore and use this prompt template on PromptTemple.',
        type: 'website',
        siteName: 'PromptTemple',
        images: [{ url: `${SITE_URL}/api/og/share`, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Prompt Template — PromptTemple',
      },
    };
  }
}

export default async function TemplateDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id || id === 'undefined') return null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://prompttemple2030.com' },
      { '@type': 'ListItem', position: 2, name: 'Templates', item: 'https://prompttemple2030.com/templates' },
      { '@type': 'ListItem', position: 3, name: 'Template', item: `https://prompttemple2030.com/templates/${id}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <TemplateDetailView templateId={id} />
    </>
  );
}
