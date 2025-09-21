'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Sparkles, 
  Crown, 
  Zap,
  Bot,
  Shield,
  StopCircle,
  Copy,
  Trash2,
  Settings
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useChatTransport } from '@/hooks/useChatTransport';
import { useSSECompletion } from '@/hooks/useSSECompletion';
import { usePromptStore } from '@/store/usePromptStore';
import { useChatStore } from '@/store/chatStore';
import { Composer } from '@/components/prompt/Composer';
import { TransportDebug } from '@/components/chat/TransportDebug';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  templateId?: string;
  variables?: Record<string, string | number | boolean>;
  metadata?: {
    trace_id?: string;
    token_count?: number;
    elapsed_time?: number;
  };
}

export default function EnhancedChatPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { transport, isLoading: transportLoading } = useChatTransport();
  const { 
    text: streamingText, 
    isStreaming, 
    error: sseError, 
    start: startSSE, 
    abort: abortSSE,
    trace_id,
    elapsed_time
  } = useSSECompletion();
  
  const { addToHistory } = usePromptStore();
  const { showError } = useChatStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState('compose');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Handle SSE streaming completion
  const handleSendPrompt = async (
    prompt: string, 
    templateId?: string, 
    variables?: Record<string, string | number | boolean>
  ) => {
    if (!prompt.trim() || isStreaming) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
      templateId,
      variables,
    };

    setMessages(prev => [...prev, userMessage]);

    // Switch to chat tab
    setActiveTab('chat');

    try {
      // Use SSE for streaming completion
      if (transport === 'sse') {
        await startSSE({
          messages: [
            { role: 'user', content: prompt }
          ],
          model: 'deepseek-chat', // Configure as needed
          stream: true,
        });
      } else {
        // Fallback to WebSocket (existing implementation)
        showError('WebSocket transport not yet implemented with new interface');
      }
    } catch (error) {
      console.error('Chat error:', error);
      showError('Failed to send message');
    }
  };

  // Handle streaming completion
  useEffect(() => {
    if (!isStreaming && streamingText && messages.length > 0) {
      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: streamingText,
        timestamp: new Date(),
        metadata: {
          trace_id,
          elapsed_time,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Add to prompt history if it was from a template
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage?.templateId && lastUserMessage?.variables) {
        addToHistory({
          templateId: lastUserMessage.templateId,
          variables: lastUserMessage.variables,
          renderedPrompt: lastUserMessage.content,
          response: streamingText,
        });
      }
    }
  }, [isStreaming, streamingText, messages, trace_id, elapsed_time, addToHistory]);

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 pharaoh-badge rounded-full flex items-center justify-center pyramid-elevation mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading chat interface...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5 flex items-center justify-center">
        <Card className="pharaoh-card max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-display font-bold text-hieroglyph mb-2">
              Authentication Required
            </h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access the Oracle&apos;s Chamber
            </p>
            <Button className="pharaoh-button">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 pharaoh-badge rounded-full flex items-center justify-center pyramid-elevation">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-pharaoh animate-pulse" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-hieroglyph text-glow mb-4">
            The Oracle&apos;s Chamber
          </h1>
          
          {/* Status Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Bot className="h-4 w-4" />
              {transportLoading ? 'Loading...' : `${transport?.toUpperCase()} Ready`}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Zap className="h-4 w-4" />
              {isStreaming ? 'Streaming Active' : 'Idle'}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Shield className="h-4 w-4" />
              Authenticated
            </Badge>
          </div>
        </div>

        {/* Main Interface */}
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Compose Prompt
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat Interface
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-6">
              <Composer
                onSend={handleSendPrompt}
                isLoading={isStreaming}
                layout="horizontal"
              />
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Chat Messages */}
                <div className="xl:col-span-3">
                  <Card className="pharaoh-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-display font-semibold text-hieroglyph">
                          Conversation
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {isStreaming && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={abortSSE}
                              className="flex items-center gap-2"
                            >
                              <StopCircle className="h-4 w-4" />
                              Stop
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearChat}
                            disabled={messages.length === 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Messages */}
                      <div className="min-h-[400px] max-h-[600px] overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
                        {messages.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium mb-2">No messages yet</p>
                            <p className="text-sm">Start by composing a prompt or sending a message</p>
                          </div>
                        ) : (
                          <>
                            {messages.map((message) => (
                              <div
                                key={message.id}
                                className={cn(
                                  "flex gap-3 p-3 rounded-lg",
                                  message.role === 'user' 
                                    ? "bg-pharaoh/10 ml-12" 
                                    : "bg-background mr-12"
                                )}
                              >
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                                      {message.role === 'user' ? 'You' : 'Oracle'}
                                    </Badge>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopyMessage(message.content)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                      <span className="text-xs text-muted-foreground">
                                        {message.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="prose prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                  </div>
                                  {message.metadata && (
                                    <div className="text-xs text-muted-foreground">
                                      {message.metadata.trace_id && (
                                        <span>Trace: {message.metadata.trace_id.slice(0, 8)}...</span>
                                      )}
                                      {message.metadata.elapsed_time && (
                                        <span className="ml-2">
                                          {message.metadata.elapsed_time < 1000 
                                            ? `${message.metadata.elapsed_time}ms` 
                                            : `${(message.metadata.elapsed_time / 1000).toFixed(2)}s`}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            {/* Streaming Response */}
                            {isStreaming && streamingText && (
                              <div className="flex gap-3 p-3 rounded-lg bg-background mr-12">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="secondary">Oracle</Badge>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-xs text-muted-foreground">Streaming...</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="prose prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap">
                                      {streamingText}
                                      <span className="animate-pulse">|</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Error Display */}
                      {sseError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{sseError}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="xl:col-span-1 space-y-4">
                  {/* Transport Debug Panel */}
                  <TransportDebug
                    isStreaming={isStreaming}
                    lastTraceId={trace_id}
                    elapsedTime={elapsed_time}
                  />

                  {/* Quick Actions */}
                  <Card className="pharaoh-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-display font-medium text-hieroglyph">
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setActiveTab('compose')}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        New Prompt
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={handleClearChat}
                        disabled={messages.length === 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        disabled
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Stats */}
                  <Card className="pharaoh-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-display font-medium text-hieroglyph">
                        Session Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Messages</span>
                        <span className="font-medium">{messages.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transport</span>
                        <span className="font-medium uppercase">{transport || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={isStreaming ? 'default' : 'secondary'} className="text-xs">
                          {isStreaming ? 'Active' : 'Ready'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
