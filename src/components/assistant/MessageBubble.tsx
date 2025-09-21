'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/assistant';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  UserIcon,
  BotIcon,
  CopyIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PinIcon,
  ClockIcon
} from 'lucide-react';
import { ContextPanel } from './ContextPanel';

interface MessageBubbleProps {
  message: Message;
  className?: string;
}

export function MessageBubble({ message, className }: MessageBubbleProps) {
  const [contextExpanded, setContextExpanded] = useState(false);
  const [toolOutputExpanded, setToolOutputExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const hasContext = message.metadata?.context && message.metadata.context.length > 0;
  const hasToolCalls = message.metadata?.tool_calls && message.metadata.tool_calls.length > 0;
  const hasUsage = message.metadata?.usage;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start', className)}>
      <div className={cn('max-w-[80%] space-y-2', isUser ? 'items-end' : 'items-start')}>
        {/* Message Bubble */}
        <div className={cn(
          'group relative',
          isUser ? 'flex justify-end' : 'flex justify-start'
        )}>
          <Card className={cn(
            'transition-all duration-200',
            isUser
              ? 'bg-blue-600 text-white border-blue-600'
              : isSystem
                ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
            'hover:shadow-md'
          )}>
            <CardContent className="p-4">
              {/* Role Icon and Timestamp */}
              <div className={cn(
                'flex items-center space-x-2 mb-2',
                isUser ? 'justify-end' : 'justify-start'
              )}>
                <div className={cn(
                  'flex items-center space-x-1 text-xs',
                  isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                )}>
                  {!isUser && (
                    <>
                      {isSystem ? (
                        <ClockIcon className="h-3 w-3" />
                      ) : (
                        <BotIcon className="h-3 w-3" />
                      )}
                      <span className="capitalize">{message.role}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{formatTime(message.created_at)}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className={cn(
                'prose prose-sm max-w-none',
                isUser
                  ? 'prose-invert text-white'
                  : 'prose-gray dark:prose-invert'
              )}>
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              </div>

              {/* Usage Information */}
              {hasUsage && !isUser && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {message.metadata!.usage!.prompt_tokens} / {message.metadata!.usage!.completion_tokens} tokens
                    </span>
                    {message.metadata!.usage!.cost && (
                      <span>${message.metadata!.usage!.cost.toFixed(4)}</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Copy Button */}
          <div className={cn(
            'absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity',
            isUser ? '-left-8' : '-right-8'
          )}>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <CopyIcon className="h-3 w-3" />
            </Button>
          </div>

          {/* Copied Feedback */}
          {copied && (
            <div className={cn(
              'absolute top-2 text-xs text-green-600 dark:text-green-400',
              isUser ? '-left-16' : '-right-16'
            )}>
              Copied!
            </div>
          )}
        </div>

        {/* Context Panel */}
        {hasContext && (
          <Collapsible open={contextExpanded} onOpenChange={setContextExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                <ExternalLinkIcon className="h-3 w-3 mr-1" />
                {message.metadata!.context!.length} sources
                {contextExpanded ? (
                  <ChevronUpIcon className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDownIcon className="h-3 w-3 ml-1" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2">
                <ContextPanel
                  context={message.metadata!.context!}
                  onPinToContext={(item) => {
                    console.log('Pin to context:', item);
                  }}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Tool Calls */}
        {hasToolCalls && (
          <Collapsible open={toolOutputExpanded} onOpenChange={setToolOutputExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                <BotIcon className="h-3 w-3 mr-1" />
                Tool outputs
                {toolOutputExpanded ? (
                  <ChevronUpIcon className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDownIcon className="h-3 w-3 ml-1" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2">
                {message.metadata!.tool_calls!.map((toolCall, index) => (
                  <Card key={index} className="bg-gray-50 dark:bg-gray-900">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {toolCall.function.name}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(toolCall, null, 2));
                          }}
                        >
                          <CopyIcon className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                        {JSON.stringify(toolCall.result || toolCall.function.arguments, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}