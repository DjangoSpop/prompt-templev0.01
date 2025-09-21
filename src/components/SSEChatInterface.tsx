'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  Bot, 
  User, 
  Sparkles, 
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useSSEChat, ChatMessage, PromptOptimizationResult } from '@/lib/services/sse-chat';
import EgyptianLoading from '@/components/EgyptianLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SSEChatInterfaceProps {
  onPromptOptimized?: (result: PromptOptimizationResult) => void;
  onTemplateSelected?: (templateId: string) => void;
  className?: string;
  enableTemplateSearch?: boolean;
  enableOptimization?: boolean;
  enableAnalytics?: boolean;
}

interface ChatSettings {
  autoOptimize: boolean;
  showTypingIndicator: boolean;
  enableSuggestions: boolean;
  preferredModel: string;
  maxTokens: number;
}

const MessageBubble: React.FC<{
  message: ChatMessage;
  isStreaming?: boolean;
  onCopy: (content: string) => void;
  onFeedback: (messageId: string, positive: boolean) => void;
  onRetry?: (messageId: string) => void;
}> = ({ message, isStreaming = false, onCopy, onFeedback, onRetry }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  const [showActions, setShowActions] = useState(false);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400 animate-spin" />;
      case 'processing':
        return <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex items-start space-x-3 max-w-4xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : isSystem 
              ? 'bg-gray-500 text-white'
              : 'bg-green-500 text-white'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : isSystem ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </motion.div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <div
            className={`relative inline-block px-4 py-3 rounded-lg max-w-full ${
              isUser
                ? 'bg-blue-500 text-white'
                : isSystem
                ? 'bg-gray-100 text-gray-800 border'
                : 'bg-white text-gray-800 border shadow-sm'
            }`}
          >
            {/* Message Text */}
            <div className="whitespace-pre-wrap break-words">
              {message.content}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="ml-1 text-current"
                >
                  ▋
                </motion.span>
              )}
            </div>

            {/* Metadata */}
            {message.metadata && (
              <div className={`mt-2 text-xs ${isUser ? 'text-blue-200' : 'text-gray-500'} space-y-1`}>
                {message.metadata.model && (
                  <div>Model: {message.metadata.model}</div>
                )}
                {message.metadata.processingTime && (
                  <div>⚡ {message.metadata.processingTime}ms</div>
                )}
                {message.metadata.tokens && (
                  <div>📊 ~{message.metadata.tokens} tokens</div>
                )}
              </div>
            )}

            {/* Status Indicator */}
            <div className={`flex items-center justify-between mt-2 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`text-xs ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <AnimatePresence>
            {showActions && !isUser && message.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-2 mt-2"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopy(message.content)}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onFeedback(message.id, true)}
                  className="h-6 px-2 text-xs"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Good
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onFeedback(message.id, false)}
                  className="h-6 px-2 text-xs"
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  Bad
                </Button>
                {onRetry && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRetry(message.id)}
                    className="h-6 px-2 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const ConnectionStatusIndicator: React.FC<{
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
}> = ({ isConnected, isConnecting, error }) => {
  const getStatus = () => {
    if (error) return { icon: WifiOff, color: 'text-red-500', text: 'Connection Error' };
    if (isConnecting) return { icon: Wifi, color: 'text-yellow-500 animate-pulse', text: 'Connecting...' };
    if (isConnected) return { icon: Wifi, color: 'text-green-500', text: 'Connected (SSE)' };
    return { icon: WifiOff, color: 'text-gray-400', text: 'Disconnected' };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 text-xs">
            <Icon className={`w-4 h-4 ${status.color}`} />
            <span className={status.color}>{status.text}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            {error ? (
              <div className="text-red-400">
                Error: {error.message}
              </div>
            ) : (
              <div className="text-gray-300">
                Using HTTP Server-Sent Events (SSE) for real-time chat
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const SSEChatInterface: React.FC<SSEChatInterfaceProps> = ({
  onPromptOptimized,
  onTemplateSelected: _onTemplateSelected,
  className = '',
  enableTemplateSearch: _enableTemplateSearch = true,
  enableOptimization = true,
  enableAnalytics = true
}) => {
  // SSE Chat Service
  const { service, isConnected, isConnecting, error } = useSSEChat({
    enableOptimization,
    enableAnalytics,
  });

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<ChatMessage | null>(null);
  const [settings] = useState<ChatSettings>({
    autoOptimize: false,
    showTypingIndicator: true,
    enableSuggestions: true,
    preferredModel: 'deepseek-chat', // Updated to use DeepSeek as primary model
    maxTokens: 4096,
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage, scrollToBottom]);

  // Event handlers for SSE service
  useEffect(() => {
    const handleMessageResponse = (...args: unknown[]) => {
      const message = args[0] as ChatMessage;
      console.log('📨 Received message response:', message);
      setMessages(prev => [...prev, message]);
      setIsStreaming(false);
      setCurrentStreamingMessage(null);
      
      // Handle optimization results
      if (message.optimizationData && onPromptOptimized) {
        onPromptOptimized(message.optimizationData);
      }
    };

    const handleMessageUpdate = (...args: unknown[]) => {
      const data = args[0] as { messageId: string; content: string; traceId?: string };
      console.log('📝 Message update:', data);
      setCurrentStreamingMessage(prev => prev ? {
        ...prev,
        content: data.content,
      } : null);
    };

    const handleOptimizationResult = (...args: unknown[]) => {
      const result = args[0] as PromptOptimizationResult;
      console.log('🎯 Optimization result:', result);
      if (onPromptOptimized) {
        onPromptOptimized(result);
      }
    };

    // Subscribe to events and capture possible unsubscribe functions
    const unsubscribeFns: Array<() => void> = [];

    const tryOn = (eventName: string, handler: (...a: unknown[]) => void) => {
      try {
        const ret = (service as any).on?.(eventName, handler);
        if (typeof ret === 'function') {
          unsubscribeFns.push(ret);
        }
      } catch (e) {
        // ignore subscription errors here
      }
    };

    tryOn('messageResponse', handleMessageResponse);
    tryOn('messageUpdate', handleMessageUpdate);
    tryOn('optimizationResult', handleOptimizationResult);

    // If service.on didn't return unsubscribers, attempt to register normally (some implementations don't return a function)
    if (unsubscribeFns.length === 0) {
      try {
        (service as any).on?.('messageResponse', handleMessageResponse);
        (service as any).on?.('messageUpdate', handleMessageUpdate);
        (service as any).on?.('optimizationResult', handleOptimizationResult);
      } catch (e) {
        // ignore
      }
    }

    return () => {
      // Prefer returned unsubscribe functions if available
      if (unsubscribeFns.length) {
        unsubscribeFns.forEach(fn => {
          try { fn(); } catch (_) {}
        });
        return;
      }

      // Otherwise try common removal APIs
      if (typeof (service as any).off === 'function') {
        try {
          (service as any).off('messageResponse', handleMessageResponse);
          (service as any).off('messageUpdate', handleMessageUpdate);
          (service as any).off('optimizationResult', handleOptimizationResult);
        } catch (_) {}
      } else if (typeof (service as any).removeListener === 'function') {
        try {
          (service as any).removeListener('messageResponse', handleMessageResponse);
          (service as any).removeListener('messageUpdate', handleMessageUpdate);
          (service as any).removeListener('optimizationResult', handleOptimizationResult);
        } catch (_) {}
      } else if (typeof (service as any).unsubscribe === 'function') {
        try { (service as any).unsubscribe(); } catch (_) {}
      }
    };
  }, [service, onPromptOptimized]);

  // Send message
  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isStreaming || !isConnected) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: trimmedInput,
      timestamp: new Date(),
      status: 'completed',
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Create placeholder for assistant response
    const assistantMessage: ChatMessage = {
      id: `assistant_${Date.now()}`,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'processing',
      metadata: {
        model: settings.preferredModel,
      }
    };
    setCurrentStreamingMessage(assistantMessage);

    try {
      // Send message to SSE service
      await service.sendMessage(trimmedInput, messages);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsStreaming(false);
      setCurrentStreamingMessage(null);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date(),
        status: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle input keypress
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Copy message content
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    // Could add toast notification here
  };

  // Handle message feedback
  const handleFeedback = (messageId: string, positive: boolean) => {
    console.log(`Feedback for ${messageId}: ${positive ? 'positive' : 'negative'}`);
    // Could implement feedback API call here
  };

  // Handle message retry
  const handleRetry = (messageId: string) => {
    console.log(`Retry message: ${messageId}`);
    // Could implement retry logic here
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header */}
      <Card className="rounded-b-none border-b-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <span>Chat Interface</span>
              <Badge variant="secondary" className="text-xs">
                SSE Streaming
              </Badge>
            </CardTitle>
            <ConnectionStatusIndicator 
              isConnected={isConnected}
              isConnecting={isConnecting}
              error={error}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Bot className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Welcome to SSE Chat!
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Start a conversation using our new HTTP Server-Sent Events streaming. 
                Experience faster, more reliable real-time chat.
              </p>
            </motion.div>
          )}

          {/* Message List */}
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={handleCopy}
                onFeedback={handleFeedback}
                onRetry={handleRetry}
              />
            ))}
          </AnimatePresence>

          {/* Streaming Message */}
          {currentStreamingMessage && (
            <MessageBubble
              message={currentStreamingMessage}
              isStreaming={true}
              onCopy={handleCopy}
              onFeedback={handleFeedback}
            />
          )}

          {/* Loading Indicator */}
          {isStreaming && !currentStreamingMessage?.content && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border rounded-lg px-4 py-3">
                  <EgyptianLoading isLoading={true} size="small" message="AI thinking..." />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {/* Input Area */}
      <Card className="rounded-t-none border-t-0">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isStreaming ? "AI is responding..." : "Type your message..."}
                disabled={isStreaming || !isConnected}
                className="pr-12"
              />
              {input && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setInput('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  ×
                </Button>
              )}
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming || !isConnected}
              size="sm"
              className="px-3"
            >
              {isStreaming ? (
                <EgyptianLoading isLoading={true} size="small" message="Sending..." />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Status Text */}
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
            <span>
              {isStreaming ? 'AI is typing...' : `${messages.length} message${messages.length !== 1 ? 's' : ''}`}
            </span>
            <span>Model: {settings.preferredModel}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SSEChatInterface;
