import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'AI Prompt Template Library — 5000+ Professional Templates',
  description: 'Browse our collection of 5000+ proven AI prompt templates for marketing, coding, business, content creation, and more. Copy and use instantly.',
  alternates: { canonical: 'https://prompttemple2030.com/templates' },
};

export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
