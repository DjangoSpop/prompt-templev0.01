'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Thread } from '@/types/assistant';
import { ClockIcon, MessageSquareIcon, HashIcon } from 'lucide-react';

interface ThreadMetadataProps {
  thread?: Thread | null;
  messageCount?: number;
  className?: string;
}

export function ThreadMetadata({ thread, messageCount, className }: ThreadMetadataProps) {
  if (!thread) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else if (diffDays < 7) {
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const lastActivity = thread.last_message_at || thread.updated_at;
  const totalMessages = messageCount ?? thread.message_count ?? 0;

  return (
    <div className={cn('flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400', className)}>
      {/* Message Count */}
      <div className="flex items-center space-x-1">
        <MessageSquareIcon className="h-3 w-3" />
        <span>{totalMessages} messages</span>
      </div>

      {/* Thread ID (shortened) */}
      <div className="flex items-center space-x-1">
        <HashIcon className="h-3 w-3" />
        <span className="font-mono text-xs">
          {thread.id.slice(-8)}
        </span>
      </div>

      {/* Last Activity */}
      <div className="flex items-center space-x-1">
        <ClockIcon className="h-3 w-3" />
        <span>{formatDate(lastActivity)}</span>
      </div>
    </div>
  );
}