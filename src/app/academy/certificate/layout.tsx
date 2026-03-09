/**
 * Certificate Layout
 *
 * Provides metadata for SEO and social sharing.
 */

import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Certificate | Prompt Temple Academy',
  description:
    'View and verify a Prompt Engineering Mastery certificate from Prompt Temple Academy. Earn your own by completing our free 6-module course.',
  openGraph: {
    title: 'Prompt Temple Academy - Certificate of Completion',
    description:
      'A verified certificate from Prompt Temple Academy. Start your prompt engineering journey today.',
    type: 'website',
    siteName: 'Prompt Temple Academy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prompt Temple Academy Certificate',
    description: 'Verified certificate of completion for Prompt Engineering Mastery.',
  },
};

export default function CertificateLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
