'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Send, Zap, Wifi, WifiOff, Clock, Eye, Code, RotateCcw, FileText, Crown } from 'lucide-react';
import { useSSEChat } from '@/lib/services/sse-chat';
import EgyptianLoading from '@/components/EgyptianLoading';

// Pharaonic UI Components
const SunDisk = ({ className = "", size = 20 }: { className?: string; size?: number }) => (
  <div 
    className={`inline-flex items-center justify-center rounded-full bg-sun text-white ${className}`}
    style={{ width: size, height: size }}
  >
    <div className="text-xs">☀</div>
  </div>
);

const ConnectionStatus = ({ isConnected, latency }: { isConnected: boolean; latency?: number | null }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-cartouche bg-sand-50 border border-stone-200">
    {isConnected ? (
      <Wifi className="h-4 w-4 text-nile" />
    ) : (
      <WifiOff className="h-4 w-4 text-red-500" />
    )}
    <span className="text-sm font-ui text-stone-700">
      {isConnected ? 'Connected to Prompt Teme' : 'Disconnected'}
    </span>
    {latency && (
      <span className="px-2 py-1 bg-sun/10 text-sun font-mono text-xs rounded-full">
        {latency}ms
      </span>
    )}
  </div>
);

// Slash commands with pharaonic styling
const SLASH_COMMANDS = [
  { command: 'intent', icon: Eye, description: 'Analyze intent', color: 'text-nile' },
  { command: 'optimize', icon: Zap, description: 'Optimize prompt', color: 'text-sun' },
  { command: 'rewrite', icon: RotateCcw, description: 'Rewrite content', color: 'text-stone-600' },
  { command: 'summarize', icon: FileText, description: 'Summarize text', color: 'text-umber-700' },
  { command: 'code', icon: Code, description: 'Code assistance', color: 'text-basalt-900' }
];

interface TemplateOpportunity {
  title: string;
  description: string;
  category: string;
  confidence: number;
}

interface OptimizationResult {
  original_prompt: string;
  optimized_prompt: string;
  improvements: string[];
  confidence: number;
  processing_time_ms: number;
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  // Compatibility with SSE service message shape
  type?: 'user' | 'assistant' | 'system';
  timestamp: Date | string;
  metadata?: { processingTime?: number };
  optimization?: OptimizationResult;
  optimizationData?: { originalPrompt: string; optimizedPrompt: string; improvements: string[]; score: number };
  processingTime?: number;
  templateSuggestions?: string[];
}

// Enhanced token management for better auth handling
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  }
  return null;
};

function EnhancedChatInterface() {
  // User ID management for WebSocket sessions
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

  const userId = useMemo(() => getOrCreateUserId(), [getOrCreateUserId]);
  const sessionId = useMemo(() => `session_${userId}_${Date.now()}`, [userId]);

  // State
  const [isAITyping, setIsAITyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<ChatMessage | null>(null);

  // --- Client-side caching (localStorage) ---
  const CACHE_KEY = 'chat_live_cache_v1';
  const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

  const loadCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      if (parsed.timestamp && Date.now() - parsed.timestamp > CACHE_TTL_MS) {
        // expired
        localStorage.removeItem(CACHE_KEY);
        return;
      }
      if (Array.isArray(parsed.messages)) {
        // Restore timestamps to Date objects
        const restored = parsed.messages.map((m: any) => ({
          ...m,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
        setMessages(restored);
      }
      if (parsed.optimizationResult) {
        setOptimizationResult(parsed.optimizationResult as OptimizationResult);
      }
      console.log('🗄️ Chat cache restored', { key: CACHE_KEY });
    } catch (e) {
      console.warn('Failed to load chat cache', e);
    }
  }, []);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (e) {
      /* ignore */
    }
    setMessages([]);
    setOptimizationResult(null);
    console.log('🗑️ Chat cache cleared');
  }, []);

  // Persist messages + optimizationResult to localStorage when they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload = {
        timestamp: Date.now(),
  messages: messages.map((m) => ({ ...m, timestamp: typeof m.timestamp === 'string' ? m.timestamp : m.timestamp.toISOString() })),
        optimizationResult,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore storage errors (quota, private mode)
    }
  }, [messages, optimizationResult]);


  // SSE Chat Service
  const { service, isConnected, isConnecting, error } = useSSEChat({
    enableOptimization: true,
    enableAnalytics: true,
  });

  // Restore cache on mount
  useEffect(() => {
    loadCache();
  }, [loadCache]);

  // Latency tracking for compatibility
  const [latency, setLatency] = useState<number | null>(null);

  // SSE Event handlers
  useEffect(() => {
    const handleMessageResponse = (...args: unknown[]) => {
      const message = args[0] as ChatMessage;
      console.log('📨 SSE: Received message response:', message);
      
      setMessages(prev => [...prev, {
        id: message.id,
        content: message.content,
        role: message.type === 'user' ? 'user' : 'assistant',
        timestamp: message.timestamp,
        processingTime: message.metadata?.processingTime,
        templateSuggestions: [],
      }]);
      
      setIsAITyping(false);
      setIsThinking(false);
      setCurrentStreamingMessage(null);
      
      // Handle optimization results
      if (message.optimizationData) {
        setOptimizationResult({
          original_prompt: message.optimizationData.originalPrompt,
          optimized_prompt: message.optimizationData.optimizedPrompt,
          improvements: message.optimizationData.improvements,
          confidence: message.optimizationData.score / 100,
          processing_time_ms: message.metadata?.processingTime || 0,
        });
        toast.success('Prompt optimization completed!');
      }
    };

    const handleMessageUpdate = (...args: unknown[]) => {
      const data = args[0] as { messageId: string; content: string; traceId?: string };
      console.log('📝 SSE: Message update:', data);
      
      setCurrentStreamingMessage(prev => prev ? {
        ...prev,
        content: data.content,
      } : {
        id: data.messageId,
        content: data.content,
        role: 'assistant',
        timestamp: new Date(),
      });
    };

    const handleConnected = () => {
      console.log('✅ SSE: Connected');
      toast.success('Connected to AI chat');
    };

    const handleDisconnected = () => {
      console.log('❌ SSE: Disconnected');
      setIsAITyping(false);
      setIsThinking(false);
    };

    const handleError = (...args: unknown[]) => {
      const err = args[0] instanceof Error ? args[0] : new Error('Unknown error');
      console.error('❌ SSE: Error:', err);
      toast.error(`Connection error: ${err.message}`);
      setIsAITyping(false);
      setIsThinking(false);
    };

    // Subscribe to SSE events
    service.on('messageResponse', handleMessageResponse);
    service.on('messageUpdate', handleMessageUpdate);
    service.on('connected', handleConnected);
    service.on('disconnected', handleDisconnected);
    service.on('error', handleError);

    return () => {
      service.off('messageResponse', handleMessageResponse);
      service.off('messageUpdate', handleMessageUpdate);
      service.off('connected', handleConnected);
      service.off('disconnected', handleDisconnected);
      service.off('error', handleError);
    };
  }, [service]);

  // Simulate latency tracking for UI compatibility
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setLatency(Math.floor(Math.random() * 50) + 30); // 30-80ms simulated latency
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setLatency(null);
    }
  }, [isConnected]);

  // Message sending function using SSE
  const appendUserMessage = useCallback(
    (id: string, content: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id,
          content,
          role: 'user' as const,
          timestamp: new Date(),
          templateSuggestions: [],
        },
      ]);
    },
    []
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !isConnected) {
        return;
      }

      // Add user message immediately
      const messageId = crypto.randomUUID();
      appendUserMessage(messageId, content);
      setIsAITyping(true);
      setIsThinking(true);

      try {
        // Send via SSE service - map to expected shape
        const sseMessages = messages.map((m) => ({
          id: m.id,
          role: m.role,
          type: (m.type as 'user' | 'assistant' | 'system') || (m.role === 'user' ? 'user' : 'assistant'),
          content: m.content,
          timestamp: typeof m.timestamp === 'string' ? m.timestamp : m.timestamp.toISOString(),
          metadata: m.metadata,
        }));

        // Ensure sseMessages have required minimal shape
        const payloadMessages = sseMessages.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          type: m.type as 'user' | 'assistant' | 'system',
          content: m.content,
          timestamp: m.timestamp,
        }));

        await service.sendMessage(content, payloadMessages as any);
      } catch (error) {
        console.error('Failed to send message:', error);
        setIsAITyping(false);
        setIsThinking(false);
        toast.error('Failed to send message');
      }
    },
    [isConnected, service, appendUserMessage, messages]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSendMessage(inputMessage);
      setInputMessage('');
    },
    [inputMessage, handleSendMessage]
  );

  const wsBase = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.prompt-temple.com';

  return (
    <div className="flex flex-col h-[min(650px,75dvh)] bg-pharaoh-gradient border-2 border-sand-200 rounded-cartouche shadow-xl backdrop-blur-sm">
      {/* Enhanced connection status with pharaonic theme */}
      <div className="px-4 py-3 border-b border-sand-200 bg-sand-50/80 rounded-t-cartouche">
        <ConnectionStatus isConnected={isConnected} latency={latency} />
      </div>

      {/* Session info with pharaonic styling */}
      <div className="px-4 py-2 text-xs text-stone-700 text-center bg-sand-100/50 border-b border-sand-200">
        <div className="flex items-center justify-center gap-2 font-ui">
          <SunDisk size={12} />
          <span>Session:</span>
          <span className="font-mono bg-sand-200 px-2 py-1 rounded text-stone-800">{sessionId.slice(-8)}</span>
          <span>•</span>
                <span className="text-stone-600">{wsBase}/ws/chat/...</span>
                <button
                  type="button"
                  onClick={clearCache}
                  title="Clear chat cache"
                  className="ml-3 text-xs px-2 py-1 bg-white/60 border border-sand-200 rounded-full hover:bg-white"
                >
                  Clear cache
                </button>
        </div>
      </div>

      {/* Enhanced messages area with pharaonic scrollbar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-sand-50/30">
        {messages.length === 0 && (
          <div className="text-center py-8 text-stone-700">
            <div className="text-6xl mb-4 animate-hieroglyph">𓊪𓂋𓅱𓏠𓊪𓏏</div>
            <div className="text-xl font-display font-bold mb-2 text-stone-800">Prompt Teme</div>
            <div className="text-sm text-stone-600 font-ui">Made in Egypt • Crafted with the precision of Karnak</div>
            <div className="mt-4 text-xs text-stone-500">Start your conversation with our AI oracle powered by DeepSeek...</div>
          </div>
        )}
        
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] rounded-cartouche px-5 py-4 text-sm shadow-sm transition-all hover:shadow-md ${
              m.role === 'user'
                ? 'bg-sun-gradient text-white self-end ml-auto border border-sun/20 shadow-sun/20'
                : 'bg-white border border-sand-200 text-stone-800 shadow-sand-200'
            }`}
          >
            <div className="whitespace-pre-wrap leading-relaxed font-ui">{m.content}</div>

            {/* Optimization result display */}
            {m.optimization && (
              <div className="mt-3 p-3 bg-sand-50 border border-sand-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 mb-2">
                  <Zap className="h-3 w-3 text-sun" />
                  <span>Optimization Result ({Math.round(m.optimization.confidence * 100)}%)</span>
                </div>
                <div className="text-xs text-stone-600 space-y-1">
                  <div><strong>Original:</strong> {m.optimization.original_prompt}</div>
                  <div><strong>Optimized:</strong> {m.optimization.optimized_prompt}</div>
                  {m.optimization.improvements.length > 0 && (
                    <div><strong>Improvements:</strong> {m.optimization.improvements.join(', ')}</div>
                  )}
                </div>
              </div>
            )}

            <div className={`mt-2 text-xs flex items-center gap-2 ${
              m.role === 'user' ? 'text-white/80' : 'text-stone-500'
            }`}>
              <Clock className="h-3 w-3" />
              <span>{typeof m.timestamp === 'string' ? new Date(m.timestamp).toLocaleTimeString() : m.timestamp.toLocaleTimeString()}</span>
              {m.processingTime && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  m.role === 'user'
                    ? 'bg-white/20 text-white'
                    : 'bg-nile/10 text-nile'
                }`}>
                  ⚡ {m.processingTime}ms
                </span>
              )}
              {m.templateSuggestions && m.templateSuggestions.length > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  m.role === 'user'
                    ? 'bg-white/20 text-white'
                    : 'bg-sun/10 text-sun'
                }`}>
                  <Crown className="h-3 w-3 inline mr-1" />
                  {m.templateSuggestions.length} suggestions
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Live streaming bubble — shows SSE tokens as they arrive */}
        {currentStreamingMessage && (
          <div className="max-w-[75%] rounded-cartouche px-5 py-4 text-sm bg-white border border-sand-200 shadow-sand-200 opacity-90">
            <div className="whitespace-pre-wrap leading-relaxed font-ui">
              {currentStreamingMessage.content}
              <span className="inline-block w-1 h-4 ml-1 bg-sun animate-pulse align-middle" />
            </div>
          </div>
        )}

        {/* Egyptian Loading Animation for Deep Thinking */}
        {isThinking && (
          <div className="max-w-[85%] mx-auto mb-4">
            <EgyptianLoading 
              isLoading={isThinking} 
              message="Crafting wisdom"
              size="small"
              overlay={false}
            />
          </div>
        )}

        {/* Simple typing indicator for quick responses */}
        {isAITyping && !isThinking && (
          <div className="max-w-[75%] rounded-cartouche px-5 py-4 text-sm bg-white border border-sand-200 shadow-sand-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sun animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-sun animate-bounce [animation-delay:.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-sun animate-bounce [animation-delay:.3s]"></span>
              </div>
              <span className="text-stone-700 text-xs font-ui">The oracle is responding...</span>
              <SunDisk size={14} className="animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Optimization results side panel */}
      {optimizationResult && (
        <div className="border-t border-sand-200 p-4 bg-sand-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-sun" />
              <span className="text-sm font-semibold text-stone-800">Latest Optimization</span>
            </div>
            <button 
              onClick={() => setOptimizationResult(null)}
              className="text-stone-500 hover:text-stone-700"
            >
              ✕
            </button>
          </div>
          <div className="text-xs text-stone-600 space-y-1">
            <div><strong>Confidence:</strong> {Math.round(optimizationResult.confidence * 100)}%</div>
            <div><strong>Processing:</strong> {optimizationResult.processing_time_ms}ms</div>
            <div><strong>Improvements:</strong> {optimizationResult.improvements.join(', ')}</div>
          </div>
        </div>
      )}

      {/* Enhanced input form with pharaonic styling */}
      <form onSubmit={handleSubmit} className="border-t border-sand-200 p-4 bg-sand-50/30 rounded-b-cartouche">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask the oracle... (or use /intent, /optimize, /rewrite, /summarize, /code)"
            className="flex-1 px-4 py-3 rounded-cartouche border border-sand-300 bg-white/90 backdrop-blur-sm outline-none text-sm font-ui focus:border-sun focus:ring-2 focus:ring-sun/20 transition-all"
          />
          <button
            type="submit"
            disabled={!isConnected || !inputMessage.trim()}
            className="px-6 py-3 rounded-cartouche bg-sun-gradient text-white text-sm font-semibold hover:shadow-lg disabled:bg-stone-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span>Send</span>
            </div>
          </button>
        </div>
        
        {/* Command hints with pharaonic styling */}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {SLASH_COMMANDS.map(({ command, icon: Icon, color }) => (
            <button
              key={command}
              type="button"
              onClick={() => setInputMessage(`/${command} `)}
              className="px-2 py-1 text-xs bg-white/60 hover:bg-white/80 border border-sand-200 rounded-full transition-colors"
            >
              <Icon className={`h-3 w-3 inline mr-1 ${color}`} />
              /{command}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}

export default function IntegratedTestPage() {
  return (
    <div className="min-h-screen temple-background">
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'bg-white border-2 border-amber-200 text-amber-900 shadow-lg',
          duration: 4000,
        }}
      />
      <div className="container mx-auto py-8 px-4">
        {/* Enhanced header with Egyptian temple theme */}
        <div className="mb-8 text-center">
          <div className="text-8xl mb-4 animate-hieroglyph">𓊪𓂋𓅱𓏠𓊪𓏏 𓄿𓇋</div>
          <h1 className="text-4xl font-display font-bold text-stone-800 mb-2">
            Prompt Teme - Live Chat
          </h1>
          <p className="text-lg text-stone-600 font-ui">
            Experience the wisdom of the ancients through modern AI
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <SunDisk size={16} />
              <span>Powered by DeepSeek</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Crown className="h-4 w-4 text-sun" />
              <span>Made in Egypt</span>
            </div>
          </div>
        </div>

        {/* Main interface */}
        <div className="max-w-6xl mx-auto">
          <EnhancedChatInterface />
        </div>

        {/* Footer with pharaonic elements */}
        <div className="mt-8 text-center text-stone-500 text-sm">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span>𓋹 Ancient Wisdom</span>
            <span>𓊪 Modern Technology</span>
            <span>𓃭 Limitless Possibilities</span>
          </div>
          <div>Built with the precision of ancient Egyptian architects</div>
        </div>
      </div>
    </div>
  );
}
