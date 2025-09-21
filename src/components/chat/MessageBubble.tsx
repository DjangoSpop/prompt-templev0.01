import { motion } from 'framer-motion';
import { Copy, CornerDownLeft, AlertTriangle, User, Bot } from 'lucide-react';
import { Button } from '../ui/button';
import { TypingDots } from './TypingDots';
import type { ChatMessage } from '../../types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  onCopy?: (content: string) => void;
  onInsertToComposer?: (content: string) => void;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onCopy,
  onInsertToComposer,
  className = ''
}) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = !!message.error;

  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content);
    } else {
      navigator.clipboard.writeText(message.content);
    }
  };

  const handleInsert = () => {
    if (onInsertToComposer) {
      onInsertToComposer(message.content);
    }
  };

  const getBubbleStyles = () => {
    if (isError) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    if (isSystem) {
      return 'bg-gray-50 border-gray-200 text-gray-700';
    }
    if (isUser) {
      return 'bg-blue-500 text-white ml-8';
    }
    return 'bg-white border border-gray-200 mr-8';
  };

  const getIcon = () => {
    if (isError) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (isSystem) return null;
    if (isUser) return <User className="w-4 h-4" />;
    return <Bot className="w-4 h-4 text-blue-500" />;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className={`max-w-[85%] group`}>
        {/* Avatar and name row */}
        {!isUser && (
          <div className="flex items-center space-x-2 mb-1 px-1">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
              {getIcon()}
            </div>
            <span className="text-xs font-medium text-gray-600">
              {isSystem ? 'System' : 'Assistant'}
            </span>
            <span className="text-xs text-gray-400">
              {formatTime(message.ts)}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${getBubbleStyles()}`}>
          {/* Error message */}
          {isError && (
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
          )}

          {/* Message content */}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.error || message.content}
          </div>

          {/* Typing indicator for partial messages */}
          {message.partial && !isError && (
            <div className="mt-2">
              <TypingDots className="opacity-60" />
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
        {!message.partial && !isError && message.content && (
          <div className="flex items-center space-x-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleCopy}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            
            {!isUser && onInsertToComposer && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleInsert}
              >
                <CornerDownLeft className="w-3 h-3 mr-1" />
                Insert
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
