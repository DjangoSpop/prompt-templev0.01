'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Bot,
  Copy,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useDirectionAwareContent } from '@/lib/hooks/useDirectionAwareContent';

// Import the store
import { OptimSession, OptimMessage } from '@/store/optimizerSessionsStore';

// Import ChatComposer
import ChatComposer from '@/components/optimization/ChatComposer';

interface ChatThreadProps {
  session: OptimSession | null;
  isConnected: boolean;
  dir?: 'ltr' | 'rtl';
  searchQuery?: string;
}

interface MessageBubbleProps {
  message: OptimMessage;
  isUser: boolean;
  onCopy: (content: string) => void;
  dir?: 'ltr' | 'rtl';
  isHighlighted?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser, onCopy, isHighlighted }) => {
  const [copied, setCopied] = useState(false);
  const { dir } = useDirectionAwareContent(message.content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy(message.content);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  const getStatusIcon = () => {
    if (message.role === 'system') {
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
    return isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (message.role === 'system') {
      return 'bg-gray-500';
    }
    return isUser ? 'bg-blue-500' : 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${isHighlighted ? 'bg-yellow-50/50' : ''}`}
      dir={dir}
    >
      <div 
        className={`flex items-start space-x-3 max-w-4xl ${
          isUser ? 'flex-row-reverse space-x-reverse' : ''
        } ${dir === 'rtl' ? 'space-x-reverse' : ''}`}
        dir={dir}
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor()} text-white`}
        >
          {getStatusIcon()}
        </motion.div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <div
            className={`relative inline-block px-4 py-3 rounded-lg ${
              isUser
                ? 'bg-blue-500 text-white'
                : message.role === 'system'
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
            }`}
          >
            {/* Message content */}
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>

            {/* Meta information */}
            {message.meta && (
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                  {message.meta.variant && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      Variant {message.meta.variant}
                    </span>
                  )}
                  {message.meta.tokens && (
                    <span>{message.meta.tokens} tokens</span>
                  )}
                  {message.meta.latencyMs && (
                    <span>{message.meta.latencyMs}ms</span>
                  )}
                </div>
              </div>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={`absolute top-2 ${isUser ? 'left-2' : 'right-2'} p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                isUser ? 'hover:bg-blue-600' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Copy message"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>

          {/* Timestamp */}
          <div className={`text-xs text-slate-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Start Optimizing
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Send a message to begin optimizing your prompts. Try something like:
        </p>
        <div className="text-left bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <p className="text-sm text-slate-700 dark:text-slate-300 italic">
            &quot;Make this prompt more specific and add guardrails for safety&quot;
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const ChatThread: React.FC<ChatThreadProps> = ({ session, isConnected, dir = 'ltr', searchQuery = '' }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessage, setCopiedMessage] = useState<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isMessageHighlighted = (content: string) => {
    if (!searchQuery) return false;
    return content.toLowerCase().includes(searchQuery.toLowerCase());
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleCopy = (content: string) => {
    setCopiedMessage(content);
    setTimeout(() => setCopiedMessage(''), 2000);
  };

  if (!session) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Chat Optimizer
          </h2>
        </div>

        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {session.title}
            </h2>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-slate-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {session.messages.length} messages
              </span>
            </div>
          </div>

          {/* Connection status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Sparkles className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {session.messages.length === 0 ? (
            <EmptyState />
          ) : (
            session.messages.map((message) => (
              <div key={message.id} className="group" dir={dir}>
                <MessageBubble
                  message={message}
                  isUser={message.role === 'user'}
                  onCopy={handleCopy}
                  dir={dir}
                  isHighlighted={isMessageHighlighted(message.content)}
                />
              </div>
            ))
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Composer */}
      {session && (
        <ChatComposer
          sessionId={session.id}
          disabled={!isConnected}
        />
      )}

      {/* Copy notification */}
      <AnimatePresence>
        {copiedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-20 right-4 bg-green-500 text-white px-3 py-2 rounded-lg text-sm"
          >
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatThread;
