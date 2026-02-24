'use client';

import { ReactNode } from 'react';

interface ShellLayoutProps {
  children: ReactNode;
}

export default function ShellLayout({ children }: ShellLayoutProps) {
  return (
    // Root layout already provides AppLayoutWithSidebar with the sidebar + content offset.
    // This layout just passes children through without adding any extra offset.
    <div className="flex-1 min-h-0">
      {children}
    </div>
  );
}
