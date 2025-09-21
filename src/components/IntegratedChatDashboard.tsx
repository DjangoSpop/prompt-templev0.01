'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  MessageSquare, 
  Zap, 
  Settings, 
  CreditCard,
  Wifi,
  WifiOff,
  Crown,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useSSEChat } from '../lib/services/sse-chat';
import { billingService, UserEntitlements } from '../lib/services/billing';
import SSEChatInterface from './SSEChatInterface';
import CreditsWidget from './CreditsWidget';
import { useChatStore } from '../store/chatStore';

interface IntegratedChatDashboardProps {
  className?: string;
}

export default function IntegratedChatDashboard({ className = '' }: IntegratedChatDashboardProps) {
  const { user, isAuthenticated } = useAuth();
  const { service, isConnected, isConnecting, error } = useSSEChat();
  const [entitlements, setEntitlements] = useState<UserEntitlements | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chat');

  // Chat state
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`).current;
  
  // Chat store
  const { 
    messages, 
    isTyping, 
    connectionStatus, 
    latency,
    addMessage, 
    setTypingIndicator, 
    setConnectionStatus,
    updateLatency,
    updateLastHeartbeat,
    addOptimizationResult,
    addIntentResult,
    showError
  } = useChatStore();

  // Load billing information
  useEffect(() => {
    if (isAuthenticated) {
      loadBillingData();
    }
  }, [isAuthenticated]);

  const loadBillingData = async () => {
    try {
      const entitlementsResponse = await billingService.getEntitlements();
      setEntitlements(entitlementsResponse.data);
      setBillingError(null);
    } catch (error) {
      console.error('Failed to load billing info:', error);
      setBillingError('Failed to load billing information');
    }
  };

  const handleUpgrade = useCallback(async () => {
    try {
      // Get available plans and redirect to checkout
      const plans = await billingService.getPlans();
      const premiumPlan = plans.data.find((plan: { name: string; id: number }) => 
        plan.name.toLowerCase().includes('premium')
      );
      
      if (premiumPlan) {
        const checkout = await billingService.createCheckoutSession(premiumPlan.id);
        window.open(checkout.data.checkout_url, '_blank');
      } else {
        window.open('/billing/upgrade', '_blank');
      }
    } catch (error) {
      console.error('Failed to initiate upgrade:', error);
    }
  }, []);

  const openBillingPortal = useCallback(async () => {
    try {
      const portal = await billingService.createPortalSession();
      window.open(portal.data.portal_url, '_blank');
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  }, []);

  // Auto-scroll to bottom on new messages (placeholder for compatibility)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    
    // Handle slash commands
    if (inputMessage.startsWith('/')) {
      const [command, ...contentParts] = inputMessage.substring(1).split(' ');
      const content = contentParts.join(' ');
      
      if (['intent', 'optimize', 'rewrite', 'summarize', 'code'].includes(command)) {
        sendSlashCommand(command, content);
        
        addMessage({
          id: crypto.randomUUID(),
          content: inputMessage,
          role: 'user',
          timestamp: new Date()
        });
        
        setInputMessage('');
        return;
      }
    }
    
    // Regular message
    const messageId = sendChatMessage(inputMessage.trim());
    
    if (messageId) {
      addMessage({
        id: messageId,
        content: inputMessage.trim(),
        role: 'user',
        timestamp: new Date()
      });
      
      setInputMessage('');
      setTypingIndicator(true);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">Please sign in to access the chat dashboard.</p>
            <Button onClick={() => window.location.href = '/auth/login'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canChat = entitlements?.credits_remaining && entitlements.credits_remaining > 0;
  const isLowCredits = entitlements?.credits_remaining && entitlements.credits_remaining <= 5;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with user info and status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Chat Dashboard
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user?.username || 'User'}!
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
              </Badge>

              {/* Credits Status */}
              {entitlements && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className={`font-semibold ${
                    entitlements.credits_remaining <= 0 ? 'text-red-500' :
                    entitlements.credits_remaining <= 5 ? 'text-yellow-500' : 
                    'text-green-500'
                  }`}>
                    {entitlements.credits_remaining} credits
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts */}
      {billingError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {billingError}
            <Button variant="outline" size="sm" onClick={loadBillingData}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!canChat && (
        <Alert variant="destructive">
          <CreditCard className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            You have no credits remaining. Please upgrade your plan to continue chatting.
            <Button variant="outline" size="sm" onClick={handleUpgrade}>
              <Crown className="h-3 w-3 mr-1" />
              Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLowCredits && canChat && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            You&apos;re running low on credits ({entitlements?.credits_remaining} remaining).
            <Button variant="outline" size="sm" onClick={handleUpgrade}>
              <Crown className="h-3 w-3 mr-1" />
              Get More Credits
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            Connection Error: {error?.message || 'Unknown error'}
            <Button variant="outline" size="sm" onClick={() => service.connect()}>
              Reconnect
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-4">
              <SSEChatInterface 
                enableOptimization={true}
                enableAnalytics={true}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Chat Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Connection Status</h4>
                      <div className="text-sm text-gray-600">
                        Status: {isConnected ? 'Connected' : 'Disconnected'}
                        <br />
                        Latency: {isConnected ? 'Connected' : 'Disconnected'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">AI Features</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={entitlements?.can_access_advanced_ai ? 'text-green-500' : 'text-gray-400'}>
                            ✓ Advanced AI Models
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={entitlements?.can_use_premium_features ? 'text-green-500' : 'text-gray-400'}>
                            ✓ Premium Features
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={entitlements?.can_export_templates ? 'text-green-500' : 'text-gray-400'}>
                            ✓ Template Export
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Actions</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => service.connect()}>
                        <Wifi className="h-4 w-4 mr-2" />
                        Reconnect
                      </Button>
                      <Button variant="outline" onClick={openBillingPortal}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Manage Billing
                      </Button>
                      <Button variant="outline" onClick={loadBillingData}>
                        <Zap className="h-4 w-4 mr-2" />
                        Refresh Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar with Credits and Stats */}
        <div className="space-y-4">
          {/* Credits Widget */}
          {entitlements && (
            <CreditsWidget 
              quotas={{
                daily_used: entitlements.credits_remaining <= 0 ? 100 : 50,
                daily_limit: 100,
                monthly_used: entitlements.credits_remaining <= 0 ? 1000 : 500,
                monthly_limit: 1000,
                reset_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              }}
              compact={false}
            />
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={handleUpgrade} 
                className="w-full" 
                variant={isLowCredits ? "default" : "outline"}
                size="sm"
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade Plan
              </Button>
              
              <Button 
                onClick={() => window.open('/templates', '_blank')} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Browse Templates
              </Button>
              
              <Button 
                onClick={openBillingPortal}
                variant="ghost" 
                size="sm"
                className="w-full"
              >
                <Settings className="h-3 w-3 mr-1" />
                Account Settings
              </Button>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Usage Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Chat Messages</span>
                  <span className="font-medium">
                    {entitlements?.max_chat_sessions_per_day ? 
                      `${Math.max(0, entitlements.max_chat_sessions_per_day - 10)}/${entitlements.max_chat_sessions_per_day}` : 
                      'Unlimited'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Templates Created</span>
                  <span className="font-medium">
                    {entitlements?.max_templates_per_month ? 
                      `0/${entitlements.max_templates_per_month}` : 
                      'Unlimited'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits Used</span>
                  <span className="font-medium text-blue-600">
                    {entitlements?.credits_remaining ? 
                      Math.max(0, 100 - entitlements.credits_remaining) : 
                      0
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Connection Status Indicator */}
      <div className={`connection-status ${connectionStatus}`}>
        {connectionStatus === 'connected' ? (
          <span>🟢 Connected {latency && `(${latency}ms)`}</span>
        ) : connectionStatus === 'connecting' ? (
          <span>🟠 Connecting...</span>
        ) : (
          <span>🔴 Disconnected</span>
        )}
      </div>
      
      {/* Messages Container */}
      <div className="messages-container rounded-lg bg-white dark:bg-gray-800 shadow-md p-4 h-[500px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">👋 Welcome to PromptCraft Live</p>
              <p className="mt-2">Start chatting with the AI assistant</p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`message ${
              message.role === 'user' ? 'user bg-blue-100 dark:bg-blue-900' : 
              message.role === 'system' ? 'system bg-gray-100 dark:bg-gray-700' : 
              'assistant bg-green-50 dark:bg-green-900/20'
            } mb-4 p-4 rounded-lg`}
          >
            <div className="message-content whitespace-pre-wrap">{message.content}</div>
            <div className="message-meta text-xs text-gray-500 mt-2 flex gap-2">
              {typeof message.timestamp === 'string' ? 
                new Date(message.timestamp).toLocaleTimeString() : 
                message.timestamp.toLocaleTimeString()
              }
              {message.processingTime && (
                <span className="processing-time bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  ⚡ {message.processingTime}ms
                </span>
              )}
              {message.optimizationResult && (
                <span className="optimization-badge bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                  🔄 Optimized
                </span>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="message assistant bg-green-50 dark:bg-green-900/20 mb-4 p-4 rounded-lg">
            <div className="typing-indicator flex space-x-1">
              <div className="dot animate-bounce"></div>
              <div className="dot animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="dot animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isConnected ? "Type your message or use /commands..." : "Connecting..."}
            disabled={!isConnected}
            className="w-full p-3 pr-16 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!isConnected || !inputMessage.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        
        {/* Slash commands help */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold">Commands:</span>
          <span className="ml-2">/intent, /optimize, /rewrite, /summarize, /code</span>
        </div>
      </form>
      
      {/* Add additional styling */}
      <style jsx>{`
        .connection-status {
          padding: 0.5rem;
          text-align: center;
          font-size: 0.875rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }
        .connection-status.connected {
          background-color: #d1fae5;
          color: #065f46;
        }
        .connection-status.connecting {
          background-color: #fef3c7;
          color: #92400e;
        }
        .connection-status.disconnected {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        .dot {
          width: 8px;
          height: 8px;
          background-color: #9ca3af;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
