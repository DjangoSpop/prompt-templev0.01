'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useAssistant } from '@/hooks/useAssistants';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BotIcon, StarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AssistantBadgeProps {
  assistantId?: string;
  size?: 'sm' | 'md' | 'lg';
  showModel?: boolean;
  showTags?: boolean;
  className?: string;
}

export function AssistantBadge({
  assistantId,
  size = 'md',
  showModel = false,
  showTags = false,
  className,
}: AssistantBadgeProps) {
  const { data: assistant, isLoading } = useAssistant(assistantId || '');

  const sizeClasses = {
    sm: {
      avatar: 'h-6 w-6',
      icon: 'h-3 w-3',
      text: 'text-xs',
      badge: 'text-xs h-4 px-1.5',
    },
    md: {
      avatar: 'h-8 w-8',
      icon: 'h-4 w-4',
      text: 'text-sm',
      badge: 'text-xs h-5 px-2',
    },
    lg: {
      avatar: 'h-10 w-10',
      icon: 'h-5 w-5',
      text: 'text-base',
      badge: 'text-sm h-6 px-2',
    },
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Skeleton className={cn('rounded-full', sizeClasses[size].avatar)} />
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          {showModel && <Skeleton className="h-3 w-16" />}
        </div>
      </div>
    );
  }

  if (!assistant) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Avatar className={sizeClasses[size].avatar}>
          <AvatarFallback className="bg-gray-100 dark:bg-gray-700">
            <BotIcon className={cn('text-gray-400', sizeClasses[size].icon)} />
          </AvatarFallback>
        </Avatar>
        <div>
          <span className={cn('text-gray-500 dark:text-gray-400', sizeClasses[size].text)}>
            Unknown Assistant
          </span>
        </div>
      </div>
    );
  }

  // Generate avatar color based on assistant name
  const avatarColors = [
    'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
    'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400',
  ];

  const colorIndex = assistant.name.charCodeAt(0) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Avatar className={sizeClasses[size].avatar}>
        <AvatarFallback className={avatarColor}>
          <BotIcon className={sizeClasses[size].icon} />
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center space-x-1">
          <span className={cn('font-medium text-gray-900 dark:text-white truncate', sizeClasses[size].text)}>
            {assistant.name}
          </span>
          {assistant.is_default && (
            <StarIcon className={cn('text-yellow-500 flex-shrink-0', sizeClasses[size].icon)} />
          )}
        </div>

        {showModel && (
          <div className={cn('text-gray-500 dark:text-gray-400', sizeClasses[size].text)}>
            {assistant.model}
          </div>
        )}

        {showTags && assistant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {assistant.tags.slice(0, 3).map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className={sizeClasses[size].badge}
              >
                {tag}
              </Badge>
            ))}
            {assistant.tags.length > 3 && (
              <Badge
                variant="outline"
                className={sizeClasses[size].badge}
              >
                +{assistant.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}