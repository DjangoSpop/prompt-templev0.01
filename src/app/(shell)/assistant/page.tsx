'use client';

import React, { useState } from 'react';
import { AssistantProvider } from '@/components/assistant/AssistantProvider';
import { ConversationPane } from '@/components/assistant/ConversationPane';
import { AssistantSidebar } from '@/components/assistant/AssistantSidebar';
import { InspectorDrawer } from '@/components/assistant/InspectorDrawer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Button } from '@/components/ui/button';
import { PanelRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function AssistantPage() {
  const [inspectorOpen, setInspectorOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AssistantProvider>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          {/* Assistant Sidebar */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <AssistantSidebar collapsed={false} onToggleCollapse={() => {}} />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Assistant
              </h1>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInspectorOpen(!inspectorOpen)}
                className={cn(
                  'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                  inspectorOpen && 'bg-gray-100 dark:bg-gray-700'
                )}
              >
                <PanelRightIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex">
              {/* Conversation Pane */}
              <div className="flex-1">
                <ConversationPane />
              </div>

              {/* Inspector Drawer */}
              {inspectorOpen && (
                <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <InspectorDrawer onClose={() => setInspectorOpen(false)} />
                </div>
              )}
            </div>
          </div>
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
      </AssistantProvider>
    </QueryClientProvider>
  );
}