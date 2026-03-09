/**
 * Verification Layout
 */

import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Verify Certificate | Prompt Temple Academy',
  description:
    'Verify the authenticity of a Prompt Temple Academy certificate. Enter a verification code to confirm.',
  openGraph: {
    title: 'Verify Certificate - Prompt Temple Academy',
    description: 'Verify the authenticity of a Prompt Temple Academy certificate.',
    type: 'website',
    siteName: 'Prompt Temple Academy',
  },
};

export default function VerifyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
