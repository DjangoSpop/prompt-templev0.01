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
  Search
} from 'lucide-react';
import type { 
  components
} from '@/types/api';
import { useWebSocketChat, ChatMessage, PromptOptimizationResult } from '@/lib/services/websocket-chat';
import EgyptianLoading from '@/components/EgyptianLoading';

type TemplateList = components['schemas']['TemplateList'];
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedChatInterfaceProps {
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
  onCopy: (content: string) => void;
  onFeedback: (messageId: string, positive: boolean) => void;
  onRetry?: (messageId: string) => void;
}> = ({ message, onCopy, onFeedback, onRetry }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  const [showOptimization, setShowOptimization] = useState(false);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
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
            className={`relative inline-block px-4 py-3 rounded-lg ${
              isUser
                ? 'bg-blue-500 text-white'
                : isSystem
                ? 'bg-gray-100 text-gray-800 border'
                : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
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
                {message.status === 'processing' && (
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

            {/* Metadata */}
            {message.metadata && (
              <div className="mt-2 text-xs opacity-70 flex items-center space-x-2">
                <span>{formatTime(message.timestamp)}</span>
                {message.metadata.processingTime && (
                  <span>• {message.metadata.processingTime}ms</span>
                )}
                {message.metadata.tokens && (
                  <span>• {message.metadata.tokens} tokens</span>
                )}
                {message.metadata.model && (
                  <span>• {message.metadata.model}</span>
                )}
              </div>
            )}

            {/* Optimization Data */}
            {message.optimizationData && (
              <div className="mt-3 pt-3 border-t border-opacity-20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOptimization(!showOptimization)}
                  className="text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Optimization Available
                </Button>
                
                <AnimatePresence>
                  {showOptimization && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="text-sm">
                        <div className="font-medium mb-2">
                          Optimization Score: {message.optimizationData.score}/100
                        </div>
                        <div className="mb-2">
                          <strong>Optimized:</strong>
                          <div className="mt-1 p-2 bg-white rounded border text-xs">
                            {message.optimizationData.optimizedPrompt}
                          </div>
                        </div>
                        {message.optimizationData.improvements.length > 0 && (
                          <div className="mb-2">
                            <strong>Improvements:</strong>
                            <ul className="list-disc list-inside text-xs mt-1">
                              {message.optimizationData.improvements.map((improvement: string, idx: number) => (
                                <li key={idx}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`flex items-center mt-2 space-x-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(message.content)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy message</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!isUser && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFeedback(message.id, true)}
                        className="h-6 w-6 p-0"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Good response</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFeedback(message.id, false)}
                        className="h-6 w-6 p-0"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Poor response</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {onRetry && message.status === 'error' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRetry(message.id)}
                          className="h-6 w-6 p-0"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Retry</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            )}
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
    exit={{ opacity: 0, y: -10 }}
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
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  onPromptOptimized,
  onTemplateSelected,
  className = '',
  enableTemplateSearch = true,
  enableOptimization = true,
  enableAnalytics = true,
}) => {
  const { service, isConnected, isConnecting, error } = useWebSocketChat({
    enableOptimization,
    enableAnalytics,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    autoOptimize: true,
    showTypingIndicator: true,
    enableSuggestions: true,
    preferredModel: 'gpt-4',
    maxTokens: 2048,
  });
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<TemplateList[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // WebSocket event handlers
  useEffect(() => {
    if (!service) return;

    const handleMessageResponse = (data: unknown) => {
      const response = data as ChatMessage;
      setMessages(prev => prev.map(msg => 
        msg.id === response.id ? { ...msg, ...response, status: 'completed' } : msg
      ));
      setIsTyping(false);
      setIsThinking(false);
    };

    const handleOptimizationResult = (data: unknown) => {
      const result = data as { messageId: string; optimization: PromptOptimizationResult };
      setMessages(prev => prev.map(msg =>
        msg.id === result.messageId 
          ? { ...msg, optimizationData: result.optimization }
          : msg
      ));
      onPromptOptimized?.(result.optimization);
    };

    const handleTyping = () => {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    };

    service.on('messageResponse', handleMessageResponse);
    service.on('optimizationResult', handleOptimizationResult);
    service.on('typing', handleTyping);

    return () => {
      service.off('messageResponse', handleMessageResponse);
      service.off('optimizationResult', handleOptimizationResult);
      service.off('typing', handleTyping);
    };
  }, [service, onPromptOptimized]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !isConnected) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      const messageId = await service.sendMessage(inputValue.trim(), {
        optimize: settings.autoOptimize,
      });

      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id 
          ? { ...msg, id: messageId, status: 'completed' }
          : msg
      ));

      // Show typing indicator if enabled
      if (settings.showTypingIndicator) {
        setIsTyping(true);
        setIsThinking(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id 
          ? { ...msg, status: 'error' }
          : msg
      ));
      setIsTyping(false);
      setIsThinking(false);
    }
  }, [inputValue, isConnected, service, settings]);

  // Handle template search
  const handleTemplateSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await apiClient.getTemplates({
        search: searchQuery,
        is_public: true,
      });
      setTemplates(response.results || []);
    } catch (error) {
      console.error('Template search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Copy to clipboard
  const handleCopy = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  // Handle feedback
  const handleFeedback = useCallback((messageId: string, positive: boolean) => {
    // Could implement feedback tracking here
    console.log(`Feedback for ${messageId}: ${positive ? 'positive' : 'negative'}`);
  }, []);

  // Handle retry
  const handleRetry = useCallback(async (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    setMessages(prev => prev.map(msg =>
      msg.id === messageId 
        ? { ...msg, status: 'sending' }
        : msg
    ));

    try {
      await service.sendMessage(message.content, {
        optimize: settings.autoOptimize,
      });
    } catch (error) {
      console.error('Retry failed:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === messageId 
          ? { ...msg, status: 'error' }
          : msg
      ));
    }
  }, [messages, service, settings]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">PromptCraft Chat</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              {enableTemplateSearch && <TabsTrigger value="templates">Templates</TabsTrigger>}
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 flex">
        <Tabs value={activeTab} className="flex-1 flex flex-col">
          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col m-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">Connection Error: {error}</span>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onCopy={handleCopy}
                  onFeedback={handleFeedback}
                  onRetry={handleRetry}
                />
              ))}

              <AnimatePresence>
                {isThinking && settings.showTypingIndicator && (
                  <div className="mb-4">
                    <EgyptianLoading 
                      isLoading={isThinking} 
                      message="Processing wisdom"
                      size="small"
                      overlay={false}
                    />
                  </div>
                )}
                {isTyping && !isThinking && settings.showTypingIndicator && <TypingIndicator />}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-white px-6 py-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message or prompt..."
                    className="resize-none"
                    rows={3}
                    disabled={!isConnected}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || !isConnected}
                    className="h-12 w-12"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  {settings.autoOptimize && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Auto-optimization enabled</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          {enableTemplateSearch && (
            <TabsContent value="templates" className="flex-1 flex flex-col m-0">
              <div className="p-6">
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search templates..."
                      onKeyPress={(e) => e.key === 'Enter' && handleTemplateSearch()}
                    />
                  </div>
                  <Button onClick={handleTemplateSearch} disabled={isSearching}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                <div className="grid gap-4">
                  {templates.map((template: TemplateList) => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-3">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{template.category?.name}</Badge>
                            <span className="text-sm text-gray-500">
                              {template.field_count} fields
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => onTemplateSelected?.(template.id)}
                          >
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings" className="flex-1 p-6 m-0">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chat Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Auto-optimize prompts</label>
                    <Switch
                      checked={settings.autoOptimize}
                      onCheckedChange={(checked: boolean) =>
                        setSettings(prev => ({ ...prev, autoOptimize: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show typing indicator</label>
                    <Switch
                      checked={settings.showTypingIndicator}
                      onCheckedChange={(checked: boolean) =>
                        setSettings(prev => ({ ...prev, showTypingIndicator: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Enable suggestions</label>
                    <Switch
                      checked={settings.enableSuggestions}
                      onCheckedChange={(checked: boolean) =>
                        setSettings(prev => ({ ...prev, enableSuggestions: checked }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Preferred Model</label>
                    <Select
                      value={settings.preferredModel}
                      onValueChange={(value) =>
                        setSettings(prev => ({ ...prev, preferredModel: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3">Claude 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Max Tokens: {settings.maxTokens}
                    </label>
                    <input
                      type="range"
                      min="256"
                      max="4096"
                      step="256"
                      value={settings.maxTokens}
                      onChange={(e) =>
                        setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))
                      }
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
