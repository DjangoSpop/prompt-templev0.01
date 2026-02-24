'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AppSidebar, SidebarToggle } from './AppSidebar';
import { useSidebarStore } from '@/store/sidebarStore';
import { ClientOnly } from '@/components/ClientOnly';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/layout/BottomNav';
import { FloatingActionButton } from '@/components/layout/FloatingActionButton';

interface AppLayoutWithSidebarProps {
  children: ReactNode;
}

/**
 * AppLayoutWithSidebar - Alternative layout using sidebar instead of navbar
 * 
 * This layout provides:
 * - Full-height sidebar navigation
 * - Maximum screen utilization (no navbar taking vertical space)
 * - Collapsible sidebar for more content space
 * - Responsive design with mobile drawer
 */
export function AppLayoutWithSidebar({ children }: AppLayoutWithSidebarProps) {
  const { isCollapsed } = useSidebarStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate margin based on sidebar state
  const sidebarWidth = isCollapsed ? 72 : 260;

  return (
    <div className="flex min-h-screen min-h-dvh overflow-x-hidden bg-gradient-to-br from-background via-papyrus/5 to-background/80">
      {/* Sidebar - Client only to avoid hydration issues */}
      <ClientOnly fallback={<div className="hidden lg:block w-[260px] shrink-0" />}>
        <AppSidebar />
      </ClientOnly>

      {/* Mobile sidebar toggle — hidden at md+ (tablet has persistent compact sidebar) */}
      <ClientOnly>
        <div className="fixed top-4 left-4 z-[60] md:hidden">
          <SidebarToggle className="bg-obsidian-900/90 backdrop-blur-sm shadow-lg" />
        </div>
      </ClientOnly>

      {/* Main Content Area */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 ease-in-out',
          // Tablet (md): always offset by 72px compact sidebar
          // Desktop (lg+): offset by the current sidebar width (72 or 260)
          'md:ml-[72px]',
          isMounted ? 'lg:ml-[var(--sidebar-width)]' : 'lg:ml-[260px]'
        )}
        style={{
          '--sidebar-width': `${sidebarWidth}px`,
        } as React.CSSProperties}
      >
        {/* Content wrapper with padding */}
        <div className="min-h-screen">
          <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-6">
            <div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-br from-secondary/30 via-papyrus/20 to-secondary/30 backdrop-blur-xl border-2 border-gold-accent/20 shadow-2xl overflow-hidden">
              <div className="p-4 md:p-6 lg:p-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom navigation — hidden on lg+ */}
      <BottomNav />
      {/* Floating Action Button — mobile only */}
      <FloatingActionButton />
    </div>
  );
}

/**
 * AppLayoutWithSidebarFull - Full-width content version
 * 
 * Same as AppLayoutWithSidebar but without the card wrapper.
 * Good for pages that need edge-to-edge content.
 */
export function AppLayoutWithSidebarFull({ children }: AppLayoutWithSidebarProps) {
  const { isCollapsed } = useSidebarStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sidebarWidth = isCollapsed ? 72 : 260;

  return (
    <div className="flex min-h-screen min-h-dvh overflow-x-hidden bg-gradient-to-br from-background via-papyrus/5 to-background/80">
      {/* Sidebar */}
      <ClientOnly fallback={<div className="hidden lg:block w-[260px] shrink-0" />}>
        <AppSidebar />
      </ClientOnly>

      {/* Mobile sidebar toggle — hidden at md+ */}
      <ClientOnly>
        <div className="fixed top-4 left-4 z-[60] md:hidden">
          <SidebarToggle className="bg-obsidian-900/90 backdrop-blur-sm shadow-lg" />
        </div>
      </ClientOnly>

      {/* Main Content Area - Full width */}
      <main
        className={cn(
          'flex-1 min-h-screen transition-all duration-300 ease-in-out',
          'md:ml-[72px]',
          isMounted ? 'lg:ml-[var(--sidebar-width)]' : 'lg:ml-[260px]'
        )}
        style={{
          '--sidebar-width': `${sidebarWidth}px`,
        } as React.CSSProperties}
      >
        {children}
      </main>

      {/* Mobile bottom navigation — hidden on lg+ */}
      <BottomNav />
      {/* Floating Action Button — mobile only */}
      <FloatingActionButton />
    </div>
  );
}

// Export both named and default for flexibility
export { AppLayoutWithSidebar as default };
