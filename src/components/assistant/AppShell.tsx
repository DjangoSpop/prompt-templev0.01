'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { AssistantSidebar } from './AssistantSidebar';
import { ConversationPane } from './ConversationPane';
import { InspectorDrawer } from './InspectorDrawer';
import { Button } from '@/components/ui/button';
import { PanelLeftIcon, PanelRightIcon } from 'lucide-react';

interface AppShellProps {
  children?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={cn(
          'relative border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-80'
        )}
      >
        <AssistantSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            {sidebarCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <PanelLeftIcon className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Assistant
            </h1>
          </div>

          <div className="flex items-center space-x-2">
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
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Conversation Pane */}
          <div className="flex-1 flex flex-col">
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
  );
}