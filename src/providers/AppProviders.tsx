/**
 * Root Application Providers
 * Wires up all the infrastructure components
 */

'use client';

import React, { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          expand={false}
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            className: 'toast-custom',
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
