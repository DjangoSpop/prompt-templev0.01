'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useThread } from '@/hooks/useAssistants';
import { MessageTimeline } from './MessageTimeline';
import { Composer } from './Composer';
import { AssistantBadge } from './AssistantBadge';
import { ThreadMetadata } from './ThreadMetadata';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareIcon } from 'lucide-react';

interface ConversationPaneProps {
  threadId?: string;
  assistantId?: string;
}

export function ConversationPane({ threadId, assistantId }: ConversationPaneProps) {
  const { data: threadData, isLoading, error } = useThread(threadId || '');
  const [isComposing, setIsComposing] = useState(false);

  // Show empty state when no thread is selected
  if (!threadId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <MessageSquareIcon className="h-16 w-16 mb-4 opacity-30" />
        <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
        <p className="text-sm text-center max-w-md">
          Choose an assistant from the sidebar to start a new conversation,
          or select an existing thread to continue chatting.
        </p>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        {/* Header Skeleton */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>

        {/* Messages Skeleton */}
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
              <div className="max-w-xs space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Composer Skeleton */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-500 dark:text-red-400">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Failed to load conversation</h3>
          <p className="text-sm mb-4">
            {error instanceof Error ? error.message : 'An error occurred while loading the thread.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { thread, messages } = threadData || { thread: null, messages: [] };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AssistantBadge assistantId={thread?.assistant_id || assistantId} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {thread?.title || 'New Conversation'}
              </h2>
              <ThreadMetadata thread={thread} messageCount={messages.length} />
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageTimeline
          messages={messages}
          threadId={threadId}
          isComposing={isComposing}
        />
      </div>

      {/* Composer — pb-safe clears iOS home-indicator */}
      <div className="shrink-0 border-t border-gray-200 bg-white pb-safe dark:border-gray-700 dark:bg-gray-800">
        <Composer
          threadId={threadId}
          assistantId={thread?.assistant_id || assistantId}
          onComposingChange={setIsComposing}
        />
      </div>
    </div>
  );
}