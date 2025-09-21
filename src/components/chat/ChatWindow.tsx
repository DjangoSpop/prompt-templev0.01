import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { LatencyBadge } from './LatencyBadge';
import type { ChatMessage, LatencyMetrics, WebSocketStatus } from '../../types/chat';

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  wsStatus: WebSocketStatus;
  latency: LatencyMetrics;
  onMessageCopy?: (content: string) => void;
  onMessageInsert?: (content: string) => void;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isStreaming,
  wsStatus,
  latency,
  onMessageCopy,
  onMessageInsert,
  className = ''
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto' 
    });
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Scroll to bottom when streaming starts/updates
  useEffect(() => {
    if (isStreaming) {
      scrollToBottom();
    }
  }, [isStreaming, messages, scrollToBottom]);

  const handleMessageCopy = useCallback((content: string) => {
    if (onMessageCopy) {
      onMessageCopy(content);
    } else {
      navigator.clipboard.writeText(content);
      // Could add a toast notification here
    }
  }, [onMessageCopy]);

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header with connection status */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
          {messages.length > 0 && (
            <span className="text-sm text-gray-500">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <LatencyBadge 
          latency={latency} 
          wsStatus={wsStatus}
          className="ml-auto"
        />
      </div>

      {/* Messages container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg 
                className="w-8 h-8 text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-500 max-w-md">
              Send a message below to begin chatting. You can use slash commands like /summarize, /code, or /rewrite for specialized assistance.
            </p>
          </motion.div>
        ) : (
          // Messages list
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={handleMessageCopy}
                onInsertToComposer={onMessageInsert}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Streaming indicator overlay */}
      <AnimatePresence>
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-white rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
              <span>AI is typing...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
