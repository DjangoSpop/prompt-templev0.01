/**
 * PromptCraft Academy - Layout
 *
 * Wraps all academy pages with optional sidebar navigation
 */

import { ReactNode } from 'react';

interface AcademyLayoutProps {
  children: ReactNode;
}

export default function AcademyLayout({ children }: AcademyLayoutProps) {
  // Note: Sidebar is conditionally rendered only on module pages, not on the landing page
  // The landing page handles its own layout
  return (
    <div className="min-h-screen bg-obsidian-950">
      {children}
    </div>
  );
}
