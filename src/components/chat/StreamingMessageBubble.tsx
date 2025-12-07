'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CornerDownLeft, AlertTriangle, User, Bot, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import type { ChatMessage } from '../../types/chat';

// Enhanced loading states
import { SkeletonLoader } from './SkeletonLoader';
import { EgyptianLoadingAnimation } from './EgyptianLoadingAnimation';

interface StreamingMessageBubbleProps {
  message: ChatMessage;
  onCopy?: (content: string) => void;
  onInsertToComposer?: (content: string) => void;
  className?: string;
  isStreaming?: boolean;
  streamingContent?: string;
  showEgyptianLoader?: boolean; // For deep thinking states
}

export const StreamingMessageBubble: React.FC<StreamingMessageBubbleProps> = ({
  message,
  onCopy,
  onInsertToComposer,
  className = '',
  isStreaming = false,
  streamingContent = '',
  showEgyptianLoader = false
}) => {
  const [displayContent, setDisplayContent] = useState(message.content);
  const [showCursor, setShowCursor] = useState(false);

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = !!message.error;
  const isAssistant = message.role === 'assistant';

  // Handle progressive content updates
  useEffect(() => {
    if (isStreaming && streamingContent) {
      setDisplayContent(streamingContent);
      setShowCursor(true);
    } else {
      setDisplayContent(message.content);
      setShowCursor(false);
    }
  }, [isStreaming, streamingContent, message.content]);

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor) return;

    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530); // Slightly offset from typical 500ms for more natural feel

    return () => clearInterval(interval);
  }, [showCursor, isStreaming]);

  const handleCopy = () => {
    const contentToCopy = displayContent || message.content;
    if (onCopy) {
      onCopy(contentToCopy);
    } else {
      navigator.clipboard.writeText(contentToCopy);
    }
  };

  const handleInsert = () => {
    const contentToInsert = displayContent || message.content;
    if (onInsertToComposer) {
      onInsertToComposer(contentToInsert);
    }
  };

  const getBubbleStyles = () => {
    if (isError) {
      return 'bg-red-50 border-red-200 text-red-800 border';
    }
    if (isSystem) {
      return 'bg-gray-50 border-gray-200 text-gray-700 border';
    }
    if (isUser) {
      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-8 shadow-md';
    }
    return 'bg-white border border-gray-200 mr-8 shadow-sm hover:shadow-md transition-shadow';
  };

  const getIcon = () => {
    if (isError) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (isSystem) return null;
    if (isUser) return <User className="w-4 h-4" />;
    if (isStreaming) return <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />;
    return <Bot className="w-4 h-4 text-blue-500" />;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shouldShowActions = !isStreaming && !isError && (displayContent || message.content) && !message.partial;

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className={`max-w-[85%] group`}>
        {/* Avatar and name row for non-user messages */}
        {!isUser && (
          <div className="flex items-center space-x-2 mb-1 px-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
              {getIcon()}
            </div>
            <span className="text-xs font-medium text-gray-600">
              {isSystem ? 'System' : 'Assistant'}
            </span>
            <span className="text-xs text-gray-400">
              {formatTime(message.ts)}
            </span>
            {isStreaming && (
              <span className="text-xs text-blue-500 animate-pulse font-medium">
                thinking...
              </span>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className={`rounded-2xl px-4 py-3 ${getBubbleStyles()}`}>
          {/* Error message */}
          {isError && (
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
          )}

          {/* Loading state for assistant messages */}
          {isAssistant && isStreaming && !displayContent && (
            <div className="space-y-3">
              {showEgyptianLoader ? (
                <EgyptianLoadingAnimation />
              ) : (
                <SkeletonLoader />
              )}
            </div>
          )}

          {/* Message content */}
          {(displayContent || message.content) && (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {displayContent || message.error || message.content}
              {/* Typing cursor for streaming messages */}
              <AnimatePresence>
                {isStreaming && showCursor && (
                  <motion.span
                    className="inline-block w-0.5 h-4 bg-current ml-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  />
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User message timestamp */}
          {isUser && (
            <div className="text-xs text-blue-200 mt-1 text-right">
              {formatTime(message.ts)}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {shouldShowActions && (
          <motion.div
            className="flex items-center space-x-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 0, y: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs hover:bg-gray-100"
              onClick={handleCopy}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>

            {!isUser && onInsertToComposer && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs hover:bg-gray-100"
                onClick={handleInsert}
              >
                <CornerDownLeft className="w-3 h-3 mr-1" />
                Insert
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};