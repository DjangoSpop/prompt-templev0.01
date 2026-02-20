'use client';

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRunMessage, useCreateThread } from '@/hooks/useAssistants';
import { useAssistant } from './AssistantProvider';
import {
  SendIcon,
  StopCircleIcon,
  PaperclipIcon,
  MicIcon,
  SettingsIcon,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface ComposerProps {
  threadId?: string;
  assistantId?: string;
  onComposingChange?: (isComposing: boolean) => void;
  className?: string;
}

export function Composer({
  threadId,
  assistantId,
  onComposingChange,
  className,
}: ComposerProps) {
  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { sendMessage, isConnected, openChannel } = useAssistant();
  const runMessageMutation = useRunMessage();
  const createThreadMutation = useCreateThread();

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !assistantId) return;

    const messageContent = message.trim();
    setMessage('');
    setIsStreaming(true);
    onComposingChange?.(true); // show TypingIndicator while AI responds

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      let currentThreadId = threadId;

      // Create thread if none exists
      if (!currentThreadId) {
        const newThread = await createThreadMutation.mutateAsync({
          assistantId,
          title: messageContent.slice(0, 50) + (messageContent.length > 50 ? '...' : ''),
        });
        currentThreadId = newThread.id;
      }

      // Try WebSocket first if connected
      if (isConnected(assistantId)) {
        const success = sendMessage(assistantId, {
          message: messageContent,
          thread_id: currentThreadId,
          metadata: {},
        });

        if (!success) {
          throw new Error('Failed to send via WebSocket');
        }
      } else {
        // Fallback to REST API
        await runMessageMutation.mutateAsync({
          assistant_id: assistantId,
          message: messageContent,
          thread_id: currentThreadId,
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setMessage(messageContent);
    } finally {
      setIsStreaming(false);
      onComposingChange?.(false); // hide TypingIndicator when AI response arrives
    }
  };

  const handleStop = () => {
    setIsStreaming(false);
    // TODO: Implement stream cancellation
  };

  const handleAttachment = () => {
    // TODO: Implement file attachment
    console.log('Attachment clicked');
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input
    console.log('Voice input clicked');
  };

  const isLoading = runMessageMutation.isPending || createThreadMutation.isPending || isStreaming;
  const canSend = message.trim().length > 0 && !isLoading && assistantId;

  return (
    <div className={cn('p-4', className)}>
      <div className="relative flex items-end space-x-2">
        {/* Attachments Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleAttachment}
          disabled={isLoading}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
        >
          <PaperclipIcon className="h-4 w-4" />
        </Button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              assistantId
                ? 'Type your message...'
                : 'Select an assistant to start chatting'
            }
            disabled={isLoading || !assistantId}
            className={cn(
              'min-h-[2.5rem] max-h-[200px] resize-none pr-12',
              'border-gray-300 dark:border-gray-600',
              'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            )}
            rows={1}
          />

          {/* Character count (optional) */}
          {message.length > 500 && (
            <div className="absolute bottom-2 right-14 text-xs text-gray-400">
              {message.length}/2000
            </div>
          )}
        </div>

        {/* Voice Input Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleVoiceInput}
          disabled={isLoading}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
        >
          <MicIcon className="h-4 w-4" />
        </Button>

        {/* Send/Stop Button */}
        <Button
          size="sm"
          onClick={isStreaming ? handleStop : handleSend}
          disabled={!canSend && !isStreaming}
          className={cn(
            'flex-shrink-0',
            isStreaming
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600'
          )}
        >
          {isStreaming ? (
            <StopCircleIcon className="h-4 w-4" />
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          {assistantId && (
            <div className={cn(
              'flex items-center space-x-1',
              isConnected(assistantId) ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
            )}>
              <div className={cn(
                'w-2 h-2 rounded-full',
                isConnected(assistantId) ? 'bg-green-500' : 'bg-yellow-500'
              )} />
              <span>
                {isConnected(assistantId) ? 'Real-time' : 'Standard'}
              </span>
            </div>
          )}

          {isLoading && (
            <span className="text-blue-600 dark:text-blue-400">
              Sending...
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span>Enter to send, Shift+Enter for new line</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <SettingsIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}