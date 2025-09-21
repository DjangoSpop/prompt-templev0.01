'use client';

import { ReactNode } from 'react';
import { TempleNavbar } from '@/components/TempleNavbar';
import { ClientOnly } from '@/components/ClientOnly';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <ClientOnly fallback={<div className="h-16 bg-secondary/95 backdrop-blur-lg border-b border-primary/20"></div>}>
        <TempleNavbar />
      </ClientOnly>
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

export function AppShellSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-16 bg-secondary/95 backdrop-blur-lg border-b border-primary/20 animate-pulse"></div>
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container mx-auto max-w-7xl">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-64 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
