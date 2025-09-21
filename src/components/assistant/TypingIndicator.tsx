'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { BotIcon } from 'lucide-react';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex justify-start', className)}>
      <div className="max-w-[80%]">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BotIcon className="h-3 w-3 text-gray-500 dark:text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Assistant is thinking...
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}