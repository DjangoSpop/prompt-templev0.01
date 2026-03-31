/**
 * PromptCraft Academy - Layout
 *
 * Wraps all academy pages with optional sidebar navigation
 */

import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Prompt Engineering Academy — Learn AI Prompt Techniques',
  description: 'Master prompt engineering with guided courses. Learn Chain of Thought, Few-Shot, Role Prompting, and advanced techniques. Earn certificates.',
  alternates: { canonical: 'https://prompt-temple.com/academy' },
};

interface AcademyLayoutProps {
  children: ReactNode;
}

export default function AcademyLayout({ children }: AcademyLayoutProps) {
  // Note: Sidebar is conditionally rendered only on module pages, not on the landing page
  // The landing page handles its own layout
  return (
    <div className="min-h-screen" style={{ background: '#0E0F12' }}>
      {children}
    </div>
  );
}
