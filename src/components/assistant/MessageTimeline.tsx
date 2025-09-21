'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/assistant';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageTimelineProps {
  messages: Message[];
  threadId: string;
  isComposing?: boolean;
  className?: string;
}

export function MessageTimeline({
  messages,
  threadId,
  isComposing = false,
  className,
}: MessageTimelineProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [messages.length, threadId]);

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    let currentGroup: Message[] = [];

    messages.forEach(message => {
      const messageDate = new Date(message.created_at).toDateString();

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  }, [messages]);

  const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  if (messages.length === 0 && !isComposing) {
    return (
      <div className={cn(
        'flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400',
        className
      )}>
        <div className="text-center">
          <div className="text-sm">Start the conversation</div>
          <div className="text-xs mt-1 opacity-75">
            Send a message to begin chatting with the assistant
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollAreaRef}
      className={cn(
        'flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600',
        className
      )}
    >
      <div className="p-4 space-y-6">
        {groupedMessages.map(({ date, messages: groupMessages }, groupIndex) => (
          <div key={date} className="space-y-4">
            {/* Date Separator */}
            <div className="flex items-center justify-center">
              <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-500 dark:text-gray-400 border">
                {formatDateGroup(date)}
              </div>
            </div>

            {/* Messages in this date group */}
            <div className="space-y-4">
              {groupMessages.map((message, messageIndex) => {
                const isLastMessage =
                  groupIndex === groupedMessages.length - 1 &&
                  messageIndex === groupMessages.length - 1;

                return (
                  <div
                    key={message.id}
                    ref={isLastMessage ? lastMessageRef : undefined}
                  >
                    <MessageBubble message={message} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isComposing && (
          <div ref={lastMessageRef}>
            <TypingIndicator />
          </div>
        )}
      </div>
    </div>
  );
}