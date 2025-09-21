'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Textarea } from '../components/ui/textarea';
import { 
  Send, 
  Loader2, 
  WifiOff, 
  Wifi, 
  CreditCard, 
  Sparkles, 
  MessageSquare,
  FileText,
  Save,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useWebSocketChat, ChatMessage } from '../lib/services/websocket-chat';
import { billingService, UserEntitlements } from '../lib/services/billing';

interface TemplateOpportunity {
  suggested_title: string;
  suggested_description: string;
  confidence_score: number;
  key_variables: string[];
}

export default function EnhancedWebSocketChat() {
  const { service, isConnected, isConnecting, error } = useWebSocketChat();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [entitlements, setEntitlements] = useState<UserEntitlements | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number>(0);
  const [templateOpportunity, setTemplateOpportunity] = useState<TemplateOpportunity | null>(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [billingError, setBillingError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load billing information
  useEffect(() => {
    const loadBillingInfo = async () => {
      try {
        const entitlementsResponse = await billingService.getEntitlements();
        setEntitlements(entitlementsResponse.data);
        setCreditsRemaining(entitlementsResponse.data.credits_remaining);
      } catch (error) {
        console.error('Failed to load billing info:', error);
        setBillingError('Failed to load billing information');
      }
    };

    loadBillingInfo();
  }, []);

  // Listen for credit updates
  useEffect(() => {
    const handleCreditUpdate = (event: CustomEvent) => {
      setCreditsRemaining(event.detail.credits_remaining);
    };

    window.addEventListener('creditsUpdated', handleCreditUpdate as EventListener);
    return () => {
      window.removeEventListener('creditsUpdated', handleCreditUpdate as EventListener);
    };
  }, []);

  // WebSocket event handlers
  useEffect(() => {
    if (!service) return;

    const handleMessageResponse = (data: unknown) => {
      const responseData = data as {
        id?: string;
        content?: string;
        message?: string;
        timestamp?: string;
        metadata?: {
          cost?: number;
          model?: string;
          tokens_used?: number;
        };
      };

      const newMessage: ChatMessage = {
        id: responseData.id || `ai_${Date.now()}`,
        type: 'assistant',
        content: responseData.content || responseData.message || '',
        timestamp: new Date(responseData.timestamp || Date.now()),
        metadata: responseData.metadata,
        status: 'completed'
      };

      setMessages(prev => [...prev, newMessage]);
      setIsSending(false);
    };

    const handleTemplateOpportunity = (data: unknown) => {
      setTemplateOpportunity(data as TemplateOpportunity);
    };

    const handleCreditUpdate = (data: unknown) => {
      const creditData = data as { credits_remaining?: number };
      if (creditData.credits_remaining !== undefined) {
        setCreditsRemaining(creditData.credits_remaining);
      }
    };

    const handleBillingError = (data: unknown) => {
      const errorData = data as { message?: string };
      setBillingError(errorData.message || 'Billing error occurred');
      setIsSending(false);
    };

    const handleError = (data: unknown) => {
      console.error('WebSocket error:', data);
      const errorMessage = typeof data === 'string' 
        ? data 
        : (data as { message?: string })?.message || 'An error occurred';
      
      if (errorMessage.includes('credit') || errorMessage.includes('billing')) {
        setBillingError(errorMessage);
      }
      
      setIsSending(false);
    };

    service.on('messageResponse', handleMessageResponse);
    service.on('templateOpportunity', handleTemplateOpportunity);
    service.on('creditUpdate', handleCreditUpdate);
    service.on('billingError', handleBillingError);
    service.on('error', handleError);

    return () => {
      service.off('messageResponse', handleMessageResponse);
      service.off('templateOpportunity', handleTemplateOpportunity);
      service.off('creditUpdate', handleCreditUpdate);
      service.off('billingError', handleBillingError);
      service.off('error', handleError);
    };
  }, [service]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicators
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);

    if (service && isConnected) {
      if (!isTyping) {
        service.startTyping();
        setIsTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        service.stopTyping();
        setIsTyping(false);
      }, 1000);
    }
  }, [service, isConnected, isTyping]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isSending || !isConnected) return;

    // Check credits before sending
    if (creditsRemaining <= 0) {
      setBillingError('Insufficient credits. Please upgrade your plan to continue chatting.');
      return;
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      status: 'completed'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);
    setBillingError(null);

    try {
      await service.sendMessage(userMessage.content);
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        service.stopTyping();
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsSending(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      if (errorMessage.includes('credit') || errorMessage.includes('billing')) {
        setBillingError(errorMessage);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const saveAsTemplate = async () => {
    if (!templateTitle.trim() || !templateDescription.trim()) return;

    try {
      await service.saveConversationAsTemplate(
        templateTitle.trim(),
        templateDescription.trim(),
        messages
      );
      
      setShowSaveTemplate(false);
      setTemplateTitle('');
      setTemplateDescription('');
      setTemplateOpportunity(null);
      
      // Show success message
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save template';
      setBillingError(errorMessage);
    }
  };

  const analyzeForTemplate = async () => {
    if (messages.length < 2) return;

    try {
      await service.analyzeForTemplate(messages);
    } catch (error) {
      console.error('Failed to analyze conversation:', error);
    }
  };

  const getCreditColor = () => {
    if (creditsRemaining <= 0) return 'text-red-500';
    if (creditsRemaining <= 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Header with connection status and credits */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Chat Assistant
            </CardTitle>
            
            <div className="flex items-center gap-4">
              {/* Credits Display */}
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className={`font-semibold ${getCreditColor()}`}>
                  {creditsRemaining} credits
                </span>
              </div>

              {/* Connection Status */}
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Billing Error Alert */}
      {billingError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {billingError}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/billing', '_blank')}
            >
              Upgrade Plan
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Template Opportunity */}
      {templateOpportunity && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Template Opportunity Detected!</strong>
              <br />
              Suggested: &quot;{templateOpportunity.suggested_title}&quot; 
              (Confidence: {Math.round(templateOpportunity.confidence_score * 100)}%)
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setTemplateTitle(templateOpportunity.suggested_title);
                setTemplateDescription(templateOpportunity.suggested_description);
                setShowSaveTemplate(true);
              }}
            >
              <FileText className="h-3 w-3 mr-1" />
              Create Template
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Save Template Modal */}
      {showSaveTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Save Conversation as Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Template Title</label>
              <Input
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="Enter template title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe what this template does..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveAsTemplate} disabled={!templateTitle.trim() || !templateDescription.trim()}>
                <Save className="h-4 w-4 mr-1" />
                Save Template
              </Button>
              <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Area */}
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="space-y-4 h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with the AI assistant!</p>
                <p className="text-sm mt-2">Each message costs 1 credit.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.metadata?.cost && (
                      <div className="text-xs mt-2 opacity-70">
                        Cost: {message.metadata.cost} credits
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                creditsRemaining <= 0 
                  ? "Insufficient credits - upgrade to continue" 
                  : "Type your message..."
              }
              disabled={!isConnected || isSending || creditsRemaining <= 0}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || !isConnected || isSending || creditsRemaining <= 0}
              size="icon"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            
            {messages.length >= 2 && (
              <Button
                onClick={analyzeForTemplate}
                variant="outline"
                size="icon"
                title="Analyze for template opportunities"
              >
                <Zap className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {isTyping && (
            <p className="text-xs text-gray-500 mt-2">AI is typing...</p>
          )}
        </CardContent>
      </Card>

      {/* Connection Error */}
      {error && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Connection Error: {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => service.reconnect()}
            >
              Reconnect
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
