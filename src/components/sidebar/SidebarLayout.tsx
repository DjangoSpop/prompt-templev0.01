'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AppSidebar, SidebarToggle } from './AppSidebar';
import { useSidebarStore } from '@/store/sidebarStore';
import { cn } from '@/lib/utils';

interface SidebarLayoutProps {
  children: ReactNode;
  /**
   * Whether to show the sidebar
   * @default true
   */
  showSidebar?: boolean;
  /**
   * Optional class name for the main content area
   */
  contentClassName?: string;
}

/**
 * SidebarLayout - A layout wrapper that adds the sidebar to pages
 * 
 * Use this layout to wrap pages that should have the sidebar.
 * It handles responsive behavior automatically.
 * 
 * @example
 * ```tsx
 * export default function DashboardPage() {
 *   return (
 *     <SidebarLayout>
 *       <YourContent />
 *     </SidebarLayout>
 *   );
 * }
 * ```
 */
export function SidebarLayout({
  children,
  showSidebar = true,
  contentClassName,
}: SidebarLayoutProps) {
  const { isCollapsed, isOpen } = useSidebarStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate margin based on sidebar state
  const sidebarWidth = isCollapsed ? 72 : 260;

  if (!isMounted) {
    // Server render / initial client render - avoid layout shift
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-papyrus/5 to-background/80">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    );
  }

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-papyrus/5 to-background/80">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-papyrus/5 to-background/80">
      {/* Sidebar */}
      <AppSidebar />

      {/* Mobile sidebar toggle - shows on small screens */}
      <div className="fixed top-4 left-4 z-[60] lg:hidden">
        <SidebarToggle />
      </div>

      {/* Main Content Area */}
      <main
        className={cn(
          'transition-all duration-300 ease-in-out',
          // Add left margin on desktop to account for sidebar
          'lg:ml-[var(--sidebar-width)]',
          contentClassName
        )}
        style={{
          '--sidebar-width': `${sidebarWidth}px`,
        } as React.CSSProperties}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * SidebarLayoutFull - Full-width content with sidebar
 * 
 * Same as SidebarLayout but without max-width constraint on content.
 * Good for pages that need full width like dashboards or editors.
 */
export function SidebarLayoutFull({
  children,
  showSidebar = true,
  contentClassName,
}: SidebarLayoutProps) {
  const { isCollapsed, isOpen } = useSidebarStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sidebarWidth = isCollapsed ? 72 : 260;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-papyrus/5 to-background/80">
        {children}
      </div>
    );
  }

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-papyrus/5 to-background/80">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-papyrus/5 to-background/80">
      {/* Sidebar */}
      <AppSidebar />

      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-[60] lg:hidden">
        <SidebarToggle />
      </div>

      {/* Main Content Area - Full width */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300 ease-in-out',
          'lg:ml-[var(--sidebar-width)]',
          contentClassName
        )}
        style={{
          '--sidebar-width': `${sidebarWidth}px`,
        } as React.CSSProperties}
      >
        {children}
      </main>
    </div>
  );
}

export default SidebarLayout;
