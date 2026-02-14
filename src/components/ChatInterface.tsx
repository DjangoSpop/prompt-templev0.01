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
  Zap,
  Copy,
  ThumbsUp,
  ThumbsDown,
  BookmarkPlus
} from 'lucide-react';
import { useSavedPromptsStore } from '@/store/saved-prompts';
import { wsService, PromptOptimizationResponse } from '@/lib/services/websocket';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  optimized?: PromptOptimizationResponse;
  processingTime?: number;
  status?: 'sending' | 'sent' | 'optimizing' | 'completed' | 'error';
}

interface ChatInterfaceProps {
  onPromptOptimized: (optimized: PromptOptimizationResponse) => void;
  className?: string;
}

const MessageBubble: React.FC<{
  message: Message;
  onCopy: (content: string) => void;
  onFeedback: (messageId: string, positive: boolean) => void;
}> = ({ message, onCopy, onFeedback }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
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
            className={`relative inline-block px-4 py-3 rounded-lg ${
              isUser
                ? 'bg-blue-500 text-white'
                : isSystem
                ? 'bg-gray-100 text-gray-800'
                : 'bg-white border border-gray-200 text-gray-800'
            }`}
          >
            {/* Status Indicator */}
            {message.status && (
              <div className={`absolute -top-2 ${isUser ? 'right-2' : 'left-2'}`}>
                {message.status === 'sending' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Clock className="w-3 h-3 text-gray-400" />
                  </motion.div>
                )}
                {message.status === 'optimizing' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <Sparkles className="w-3 h-3 text-blue-500" />
                  </motion.div>
                )}
                {message.status === 'completed' && (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                )}
                {message.status === 'error' && (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
              </div>
            )}

            {/* Message Text */}
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>

            {/* Optimized Response */}
            {message.optimized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.3 }}
                className="mt-4 pt-3 border-t border-opacity-20"
              >
                <div className="text-sm font-medium mb-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Optimized Version
                  {message.processingTime && message.processingTime < 50 && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      {message.processingTime}ms
                    </span>
                  )}
                </div>
                <div className="bg-white bg-opacity-10 rounded p-3 text-sm">
                  {message.optimized.optimizedPrompt}
                </div>
                
                {/* Alternatives */}
                {message.optimized.alternatives.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium mb-2">Alternatives:</div>
                    <div className="space-y-1">
                      {message.optimized.alternatives.slice(0, 2).map((alt, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="bg-white bg-opacity-10 rounded p-2 text-xs cursor-pointer hover:bg-opacity-20 transition-colors"
                          onClick={() => onCopy(alt)}
                        >
                          {alt}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {message.optimized.suggestions.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium mb-2">Suggestions:</div>
                    <div className="flex flex-wrap gap-1">
                      {message.optimized.suggestions.slice(0, 3).map((suggestion, index) => (
                        <span
                          key={index}
                          className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full"
                        >
                          {suggestion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Timestamp and Actions */}
            <div className={`mt-2 flex items-center justify-between text-xs opacity-70`}>
              <span>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              {!isUser && !isSystem && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onCopy(message.optimized?.optimizedPrompt || message.content)}
                    className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                    title="Copy message"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onFeedback(message.id, true)}
                    className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                    title="Good response"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onFeedback(message.id, false)}
                    className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                    title="Poor response"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      const store = useSavedPromptsStore.getState();
                      store.openSaveModal({
                        mode: 'save-from-chat',
                        initialContent: message.optimized?.optimizedPrompt || message.content,
                        initialTitle: `Chat: ${(message.optimized?.optimizedPrompt || message.content).slice(0, 50)}...`,
                      });
                    }}
                    className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                    title="Save to Prompt Library"
                  >
                    <BookmarkPlus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex justify-start mb-4"
  >
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5] 
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              className="w-2 h-2 bg-gray-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onPromptOptimized, 
  className = "" 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'system',
      content: 'Welcome! I\'m your AI prompt optimizer. Send me your prompts and I\'ll help you refine them for better results. Type your intent and I\'ll optimize it in real-time!',
      timestamp: new Date(),
      status: 'completed'
    }
  ]);
  const [input, setInput] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(`chat_${Date.now()}`);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check WebSocket connection
  useEffect(() => {
    const checkConnection = () => {
      setConnectionStatus(wsService.getConnectionStatus());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for typing indicators from other users
  useEffect(() => {
    wsService.onTypingIndicator((data) => {
      if (data.userId !== sessionId.current) {
        setShowTyping(data.isTyping);
      }
    });
  }, []);

  // Handle message sending and optimization
  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsOptimizing(true);

    try {
      // Update message status
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'optimizing' as const }
          : msg
      ));

      const startTime = Date.now();
      
      // Optimize the prompt
      const optimized = await wsService.optimizePrompt({
        userIntent: userMessage.content,
        sessionId: sessionId.current,
        context: { messageId: userMessage.id }
      });

      const processingTime = Date.now() - startTime;

      // Create bot response
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        type: 'bot',
        content: `Here's your optimized prompt with ${Math.round(optimized.confidence * 100)}% confidence:`,
        timestamp: new Date(),
        optimized,
        processingTime,
        status: 'completed'
      };

      // Update user message status and add bot response
      setMessages(prev => [
        ...prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'completed' as const }
            : msg
        ),
        botMessage
      ]);

      // Callback for parent component
      onPromptOptimized(optimized);

    } catch (error) {
      console.error('Optimization failed:', error);
      
      // Update message status to error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'error' as const }
          : msg
      ));

      // Add error message
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: `Sorry, I couldn't optimize your prompt. ${connectionStatus ? 'Please try again.' : 'Connection issue - please check your network.'}`,
        timestamp: new Date(),
        status: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsOptimizing(false);
    }
  }, [input, connectionStatus, onPromptOptimized]);

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle copy to clipboard
  const handleCopy = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, []);

  // Handle feedback
  const handleFeedback = useCallback((messageId: string, positive: boolean) => {
    // Send feedback to backend
    console.log(`Feedback for ${messageId}: ${positive ? 'positive' : 'negative'}`);
    // You could implement actual feedback submission here
  }, []);

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800">
              Prompt Optimizer Chat
            </h2>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {connectionStatus ? 'Connected' : 'Reconnecting...'}
            </span>
            {connectionStatus && (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Real-time
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onCopy={handleCopy}
              onFeedback={handleFeedback}
            />
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {(showTyping || isOptimizing) && <TypingIndicator />}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your prompt to optimize..."
              disabled={isOptimizing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!input.trim() || isOptimizing}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            {isOptimizing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isOptimizing ? 'Optimizing...' : 'Send'}</span>
          </motion.button>
        </div>
        
        {/* Quick Tips */}
        <div className="mt-2 text-xs text-gray-500">
          <span>💡 Tip: Be specific about your intent for better optimization results</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
