'use client';

import { ReactNode, useState } from 'react';
import EgyptianSidebar from '@/components/navbar/EgyptianSidebar';

interface ShellLayoutProps {
  children: ReactNode;
}

export default function ShellLayout({ children }: ShellLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 bg-gradient-to-b from-obsidian-950 to-obsidian-900">
      {/* Desktop Sidebar — fixed, offset below navbar */}
      {/* <aside className="hidden md:flex w-64 fixed left-0 top-[var(--navbar-h,7rem)] h-[calc(100vh-var(--navbar-h,7rem))] z-30 bg-gradient-to-b from-obsidian-900 to-obsidian-950 border-r border-royal-gold-500/20 flex-col overflow-hidden"> */}
        {/* <EgyptianSidebar /> */}
      {/* </aside> */}

      {/* Mobile sidebar — conditionally rendered with backdrop */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-[var(--navbar-h,7rem)] h-[calc(100vh-var(--navbar-h,7rem))] w-64 z-40 bg-gradient-to-b from-obsidian-900 to-obsidian-950 border-r border-royal-gold-500/20 md:hidden overflow-y-auto">
            {/* <EgyptianSidebar /> */}
          </aside>
        </>
      )}

      {/* Main Content Area — offset for sidebar on desktop */}
      <main className="flex-1 md:ml-64 min-h-0">
        {children}
      </main>
    </div>
  );
}