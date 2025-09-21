'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  XIcon,
  InfoIcon,
  BarChart3Icon,
  SettingsIcon,
  ExternalLinkIcon,
  ClockIcon,
  CpuIcon,
  DollarSignIcon,
} from 'lucide-react';

interface InspectorDrawerProps {
  onClose: () => void;
  threadId?: string;
  className?: string;
}

export function InspectorDrawer({ onClose, threadId, className }: InspectorDrawerProps) {
  const [activeTab, setActiveTab] = useState<'context' | 'usage' | 'settings'>('context');

  return (
    <div className={cn('h-full flex flex-col bg-white dark:bg-gray-800', className)}>
      {/* Header */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Inspector
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="context" className="flex items-center space-x-2">
                <InfoIcon className="h-4 w-4" />
                <span>Context</span>
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center space-x-2">
                <BarChart3Icon className="h-4 w-4" />
                <span>Usage</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <SettingsIcon className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="context" className="flex-1 px-4 pb-4 mt-4 overflow-hidden">
            <ContextTab />
          </TabsContent>

          <TabsContent value="usage" className="flex-1 px-4 pb-4 mt-4 overflow-hidden">
            <UsageTab threadId={threadId} />
          </TabsContent>

          <TabsContent value="settings" className="flex-1 px-4 pb-4 mt-4 overflow-hidden">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ContextTab() {
  return (
    <div className="h-full overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Active Context</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No context sources currently pinned. Context will appear here when you pin sources from message responses.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium line-clamp-2">
                    Example source {i + 1} from recent conversation
                  </h4>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <ExternalLinkIcon className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  This is a sample context source that would appear in the inspector.
                </p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs">
                    example.com
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <ClockIcon className="h-3 w-3" />
                    <span>2m ago</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsageTab({ threadId }: { threadId?: string }) {
  // Mock usage data - in real app, this would come from API
  const usageData = {
    total_tokens: 1245,
    prompt_tokens: 892,
    completion_tokens: 353,
    total_cost: 0.0234,
    requests: 8,
    average_response_time: 1.2,
  };

  return (
    <div className="h-full overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Current Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {usageData.requests}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Requests
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {usageData.total_tokens.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total Tokens
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Token Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CpuIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Prompt Tokens</span>
              </div>
              <span className="text-sm font-medium">
                {usageData.prompt_tokens.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CpuIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Completion Tokens</span>
              </div>
              <span className="text-sm font-medium">
                {usageData.completion_tokens.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-2">
                <DollarSignIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">Estimated Cost</span>
              </div>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                ${usageData.total_cost.toFixed(4)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Avg Response Time</span>
            </div>
            <span className="text-sm font-medium">
              {usageData.average_response_time}s
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="h-full overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Display Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Show timestamps</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Display message timestamps
                </div>
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Auto-scroll</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Scroll to new messages automatically
                </div>
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Show context sources</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically expand context panels
                </div>
              </div>
              <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Assistant Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Temperature</label>
              <div className="mt-1">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  defaultValue="0.7"
                  className="w-full"
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Controls randomness in responses (0.0 - 2.0)
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Max tokens</label>
              <div className="mt-1">
                <input
                  type="number"
                  min="1"
                  max="4000"
                  defaultValue="1000"
                  className="w-full px-3 py-1 text-sm border rounded-md"
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum tokens per response
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}