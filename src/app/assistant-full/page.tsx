'use client';

import React from 'react';
import { AppShell } from '@/components/assistant/AppShell';
import { AssistantProvider } from '@/components/assistant/AssistantProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 seconds
    },
  },
});

export default function AssistantFullPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AssistantProvider>
        <div className="h-screen w-full">
          <AppShell />
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </AssistantProvider>
    </QueryClientProvider>
  );
}