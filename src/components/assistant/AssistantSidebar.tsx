'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAssistants, useThreads } from '@/hooks/useAssistants';
import { AssistantDirectory } from './AssistantDirectory';
import { ThreadList } from './ThreadList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PanelLeftCloseIcon, BotIcon, MessageSquareIcon, PlusIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AssistantSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AssistantSidebar({ collapsed, onToggleCollapse }: AssistantSidebarProps) {
  const [activeTab, setActiveTab] = useState<'assistants' | 'threads'>('assistants');
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);

  const { data: assistantsData, isLoading: assistantsLoading } = useAssistants();
  const { data: threads, isLoading: threadsLoading } = useThreads(selectedAssistant || undefined);

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="mb-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <PanelLeftCloseIcon className="h-4 w-4" />
        </Button>

        <div className="space-y-2">
          <Button
            variant={activeTab === 'assistants' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('assistants')}
            className="w-10 h-10 p-0"
          >
            <BotIcon className="h-4 w-4" />
          </Button>

          <Button
            variant={activeTab === 'threads' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('threads')}
            className="w-10 h-10 p-0"
          >
            <MessageSquareIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          AI Assistants
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <PanelLeftCloseIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assistants" className="flex items-center space-x-2">
                <BotIcon className="h-4 w-4" />
                <span>Assistants</span>
              </TabsTrigger>
              <TabsTrigger value="threads" className="flex items-center space-x-2">
                <MessageSquareIcon className="h-4 w-4" />
                <span>Threads</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="assistants" className="flex-1 px-4 pb-4 mt-4 overflow-hidden">
            {assistantsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <AssistantDirectory
                assistants={assistantsData?.assistants || []}
                defaultAssistantId={assistantsData?.default_assistant}
                onSelectAssistant={(assistantId) => {
                  setSelectedAssistant(assistantId);
                  setActiveTab('threads');
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="threads" className="flex-1 px-4 pb-4 mt-4 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* New Thread Button */}
              <div className="mb-4">
                <Button className="w-full" size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Conversation
                </Button>
              </div>

              {/* Thread List */}
              <div className="flex-1 overflow-hidden">
                {threadsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <ThreadList
                    threads={threads || []}
                    selectedAssistantId={selectedAssistant}
                    onSelectThread={(threadId) => {
                      // Handle thread selection
                      console.log('Selected thread:', threadId);
                    }}
                  />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}