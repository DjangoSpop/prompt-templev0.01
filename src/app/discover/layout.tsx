import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discover Prompts — Browse Community Templates | PromptTemple',
  description:
    'Browse thousands of public AI prompts shared by the PromptTemple community. Filter by category, search by keyword, and copy any prompt directly to your personal library.',
  keywords: [
    'AI prompts',
    'prompt library',
    'community prompts',
    'public templates',
    'ChatGPT prompts',
    'prompt engineering',
    'AI writing templates',
    'free AI prompts',
  ],
  openGraph: {
    title: 'Discover Community Prompts | PromptTemple',
    description:
      'Browse thousands of public AI prompts. Filter by category, search by keyword, and copy to your library instantly.',
    type: 'website',
    siteName: 'PromptTemple',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Community Prompts | PromptTemple',
    description:
      'Browse and copy community AI prompts to your personal library. Filter, search, and iterate.',
  },
  alternates: {
    canonical: '/discover',
  },
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
