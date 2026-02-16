'use client';

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Wifi, 
  WifiOff, 
  BarChart3, 
  Filter
} from 'lucide-react';
import { useNativeStreamingChat } from '@/hooks/useNativeStreamingChat';
import { useConversation } from '@/hooks/useConversation';
import { useChatAnalytics } from '@/hooks/useChatAnalytics';
import { EnhancedStreamingMessage } from '@/components/chat/StreamingMessage';
import { EnhancedChatInput } from '@/components/chat/EnhancedChatInput';
import { WebSocketTester } from '@/components/debug/WebSocketTester';
import EgyptianLoading from '@/components/EgyptianLoading';
import { SunDisk } from '@/components/pharaonic/PyramidGrid';
// ------------------------------------------------------------------
// 1.  Re-usable UI components (stay here, not exported)
// ------------------------------------------------------------------

const ConnectionStatus = ({ 
  isConnected, 
  latency 
}: { 
  isConnected: boolean; 
  latency?: number | null; 
}) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-cartouche bg-sand-50 border border-stone-200">
    {isConnected ? <Wifi className="h-4 w-4 text-nile" /> : <WifiOff className="h-4 w-4 text-red-500" />}
    <span className="text-sm font-ui text-stone-700">
      {isConnected ? 'Connected to Prompt Temple' : 'Disconnected'}
    </span>
    {latency && (
      <span className="px-2 py-1 bg-sun/10 text-sun font-mono text-xs rounded-full">
        {latency}ms
      </span>
    )}
  </div>
);

const ConversationSidebar = ({ 
  conversations, 
  currentConversationId, 
  onSelectConversation, 
  onNewConversation,
  onDeleteConversation,
  onToggleStar,
  searchQuery,
  onSearchChange
}: any) => ( /* props typed as any to keep snippet short */
  <div className="w-80 bg-sand-50/50 border-r-2 border-sand-200 p-4 flex flex-col h-full">
    {/* …entire sidebar JSX from your file… */}
  </div>
);

const AnalyticsPanel = ({ 
  analytics, 
  onExportReport, 
  onClearData 
}: any) => (
  <div className="w-80 bg-sand-50/50 border-l-2 border-sand-200 p-4 flex flex-col h-full">
    {/* …entire analytics JSX from your file… */}
  </div>
);


export function NextGenChatInterface() {
  // User ID and session management
  const getOrCreateUserId = useCallback(() => {
    if (typeof window === 'undefined') return 'server_user';
    
    const key = 'promptcraft_user_id';
    let uid = localStorage.getItem(key);
    if (!uid) {
      uid = `user_${crypto.randomUUID()}`;
      localStorage.setItem(key, uid);
    }
    return uid;
  }, []);

  // Get or create auth token
  const getOrCreateAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return 'default_token';
    
    // Try to get existing token
    let token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
    
    if (!token) {
      // Generate a simple auth token for development
      token = `dev_token_${crypto.randomUUID()}`;
      localStorage.setItem('auth_token', token);
      console.log('🔑 Generated development auth token:', token);
    }
    
    return token;
  }, []);

  const userId = useMemo(() => getOrCreateUserId(), [getOrCreateUserId]);
  const authToken = useMemo(() => getOrCreateAuthToken(), [getOrCreateAuthToken]);
  const sessionId = useMemo(() => `session_${userId}_${Date.now()}`, [userId]);

  // UI State
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted to avoid SSR/client hydration mismatches for time-based UI
    setIsMounted(true);
  }, []);

  // Initialize hooks
  const streamingChat = useNativeStreamingChat({
    userId,
    sessionId,
    autoSave: true,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'wss://api.prompt-temple.com',
  });

  const conversation = useConversation({
    autoSave: true,
    maxConversations: 100,
  });

  const analytics = useChatAnalytics({
    enableRealTimeTracking: true,
    maxDataPoints: 10000,
  });

  // Keep a stable ref to analytics to avoid effect dependency churn
  const analyticsRef = useRef(analytics);
  useEffect(() => {
    analyticsRef.current = analytics;
  }, [analytics]);

  // Keep a stable ref to conversation for use in effects
  const conversationRef = useRef(conversation);
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  // Track which message IDs have been recorded to avoid loops during streaming updates
  const trackedMessageIdsRef = useRef<Set<string>>(new Set());

  // Start analytics session
  useEffect(() => {
    // Use ref to avoid capturing stale or changing analytics function identities
  analyticsRef.current.startSession(sessionId, 'deepseek');
    return () => {
      analyticsRef.current.endSession();
    };
  }, [sessionId]);

  // Track messages for analytics
  useEffect(() => {
    if (streamingChat.messages.length === 0) return;
    const latestMessage = streamingChat.messages[streamingChat.messages.length - 1];

    // Don't track partial streaming chunks; wait until the message finishes
  if (latestMessage.isStreaming) return;

    // Deduplicate by message ID to prevent infinite loops on re-renders
    if (trackedMessageIdsRef.current.has(latestMessage.id)) return;
    trackedMessageIdsRef.current.add(latestMessage.id);

    // Use refs to avoid re-running due to changing object identities
    analyticsRef.current.trackMessage(latestMessage, sessionId);

    const conv = conversationRef.current;
    if (conv.currentConversationId) {
      conv.addMessage(conv.currentConversationId, latestMessage);
      // Auto-generate title for first message in a conversation
      if (streamingChat.messages.length === 1) {
        conv.autoGenerateTitle(conv.currentConversationId);
      }
    }
  }, [streamingChat.messages, sessionId]);

  // Enhanced message sending with analytics
  const handleSendMessage = useCallback((
    content: string, 
    options?: { type?: 'chat' | 'slash_command'; command?: string }
  ) => {
    // Create new conversation if none exists
    if (!conversation.currentConversationId) {
      conversation.createConversation();
    }

    // Track slash commands
    if (options?.type === 'slash_command' && options.command) {
      analytics.trackSlashCommand(options.command);
    }

    // Send message - convert old options to new format
    const sendOptions = {
      optimize: options?.type !== 'slash_command',
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 2000,
      context: [],
    };
    return streamingChat.sendMessage(content, sendOptions);
  }, [conversation, analytics, streamingChat]);

  // Conversation management
  const handleNewConversation = useCallback(() => {
    const newId = conversation.createConversation();
    streamingChat.clearMessages();
    return newId;
  }, [conversation, streamingChat]);

  const handleSelectConversation = useCallback((id: string) => {
    const conv = conversation.getConversation(id);
    if (conv) {
      conversation.setCurrentConversationId(id);
      // Load messages into streaming chat
      // Note: This would need to be implemented in useStreamingChat
      // streamingChat.loadConversation(conv.messages);
    }
  }, [conversation]);

  const handleExportReport = useCallback(() => {
    const report = analytics.generateReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-analytics-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Analytics report exported');
  }, [analytics]);

  return (
    <div className="flex h-screen bg-pharaoh-gradient">
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bg-white border-2 border-amber-200 text-amber-900 shadow-lg',
          duration: 4000,
        }}
      />
        <SunDisk    className="absolute top-4 left-4 opacity-20" size={48} />
      {/* Conversation Sidebar */}
      {showSidebar && (
        <ConversationSidebar
          conversations={conversation.conversations}
          currentConversationId={conversation.currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={conversation.deleteConversation}
          onToggleStar={conversation.toggleStar}
          searchQuery={conversation.searchQuery}
          onSearchChange={conversation.setSearchQuery}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b-2 border-sand-200 bg-sand-50/80 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
                aria-label={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
                className="p-2 hover:bg-sand-200 rounded-cartouche transition-colors"
              >
                <Filter className="h-4 w-4 text-stone-600" aria-hidden="true" />
                <span className="sr-only">
                  {showSidebar ? 'Hide sidebar' : 'Show sidebar'}
                </span>
              </button>
              <ConnectionStatus isConnected={streamingChat.isConnected} latency={streamingChat.latency} />
              
              {/* Debug WebSocket Link */}
              {process.env.NODE_ENV === 'development' && (
                <a
                  href="/test/websocket"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Debug WebSocket
                </a>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-xs text-stone-700 text-center">
                <div className="flex items-center gap-2 font-ui">
                  <SunDisk size={12} />
                  <span>Session:</span>
                  <span className="font-mono bg-sand-200 px-2 py-1 rounded text-stone-800">
                    {isMounted ? sessionId.slice(-8) : '────────'}
                  </span>
                </div>
              </div>
              
<button
  onClick={() => setShowAnalytics((s) => !s)}
  title={showAnalytics ? 'Hide analytics panel' : 'Show analytics panel'}
    aria-label={showAnalytics ? 'Hide analytics panel' : 'Show analytics panel'}
  className={`p-2 rounded-cartouche transition-colors ${
    showAnalytics ? 'bg-sun/20 text-sun' : 'hover:bg-sand-200 text-stone-600'
  }`}
>
  <BarChart3 className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">
    {showAnalytics ? 'Hide analytics panel' : 'Show analytics panel'}
  </span>
</button>
            </div>
          </div>
          
          {/* Error Display */}
          {streamingChat.error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-cartouche">
              <div className="flex items-center gap-2 text-red-700">
                <span className="text-sm font-semibold">Connection Error:</span>
                <span className="text-sm">{streamingChat.error}</span>
                <button
                  onClick={() => streamingChat.reconnect?.()}
                  className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-xs"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-transparent to-sand-50/30">
          {/* WebSocket Tester - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <WebSocketTester
              onSendMessage={handleSendMessage}
              isConnected={streamingChat.isConnected}
              isLoading={streamingChat.isTyping}
            />
          )}
          
          {streamingChat.messages.length === 0 && (
            <div className="text-center py-8 text-stone-700">
              <div className="text-6xl mb-4 animate-hieroglyph">𓊪𓂋𓅱𓏠𓊪𓏏</div>
              <div className="text-xl font-display font-bold mb-2 text-stone-800">Prompt Temple</div>
              <div className="text-sm text-stone-600 font-ui">Made in Egypt • Crafted with the precision of Karnak</div>
              <div className="mt-4 text-xs text-stone-500">Start your conversation with our AI oracle powered by DeepSeek...</div>
              
              {/* Connection Status Debug */}
              {!streamingChat.isConnected && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-cartouche max-w-md mx-auto">
                  <div className="text-sm font-semibold text-amber-800 mb-2">Connection Status</div>
                  <div className="text-xs text-amber-700 space-y-1">
                    <div>WebSocket: {streamingChat.isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
                    <div>Backend: {process.env.NEXT_PUBLIC_WS_URL || 'wss://api.prompt-temple.com'}</div>
                    <div>Session: {sessionId}</div>
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-2">
                        <a href="/test/websocket" target="_blank" className="text-blue-600 hover:underline">
                          Open WebSocket Test →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {streamingChat.messages.map((message) => (
            <EnhancedStreamingMessage
              key={message.id}
              message={message}
              isStreaming={message.isStreaming}
              showMetadata={true}
              enableMarkdown={true}
            />
          ))}

          {/* Egyptian Loading for thinking */}
          {streamingChat.isTyping && (
            <div className="max-w-[90%] mx-auto mb-4">
              <EgyptianLoading 
                isLoading={streamingChat.isTyping} 
                message="The oracle consults the ancient scrolls of knowledge"
                size="small"
                overlay={false}
              />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-sand-200 p-4 bg-sand-50/30">
          <EnhancedChatInput
            onSend={handleSendMessage}
            isLoading={streamingChat.isTyping}
            isConnected={streamingChat.isConnected}
            maxLength={4000}
            disabled={false}
            showSlashCommands={true}
            enableVoiceInput={false}
            enableFileUpload={false}
          />
        </div>
      </div>

      {/* Analytics Sidebar */}
      {showAnalytics && (
        <AnalyticsPanel
          analytics={analytics.analytics}
          onExportReport={handleExportReport}
          onClearData={analytics.clearAnalytics}
        />
      )}
    </div>
  );
}
// ------------------------------------------------------------------
// 3.  OPTIONAL: if you want to reuse the component elsewhere you can
//     also export it as default here, but page.tsx will use the named
//     export so the route file stays ultra-minimal.
// ------------------------------------------------------------------
// export default NextGenChatInterface;