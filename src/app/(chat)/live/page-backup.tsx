
'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Send, Zap, AlertCircle, Wifi, WifiOff, Clock, Eye, Code, RotateCcw, FileText, Crown } from 'lucide-react';
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';
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
  reasoning: string;
}

interface TemplateSuggestion {
  id: string;
  title: string;
  category: string;
  confidence: number;
}

// Enhanced message interfaces
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  processingTime?: number;
  templateSuggestions?: TemplateSuggestion[];
  optimization?: OptimizationResult;
}

interface OptimizationResult {
  message_id: string;
  original_prompt: string;
  optimized_prompt: string;
  improvements: string[];
  suggestions: string[];
  confidence: number;
  processing_time_ms: number;
}

// Lightweight inline PromptCraft chat wired to the Django WebSocket backend
function PromptCraftChatInline() {
  // Session/user handling
  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    // Use the correct token key that matches the backend auth system
    return (
      localStorage.getItem('access_token') ||
      localStorage.getItem('pc_jwt') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      null
    );
  }, []);

  const getOrCreateUserId = useCallback(() => {
    if (typeof window === 'undefined') return 'guest';
    const key = 'pc_user_id';
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
  const [templateOpportunity, setTemplateOpportunity] = useState<TemplateOpportunity | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // WebSocket connection with the new hook
  const wsConfig = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.prompt-temple.com';
    const token = getToken();
    return {
      url: token
        ? `${base}/ws/chat/${sessionId}/?token=${encodeURIComponent(token)}`
        : `${base}/ws/chat/${sessionId}/`,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 15000,
    };
  }, [sessionId, getToken]);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'connection_ack':
        // acknowledged
        break;

      case 'typing_start':
        setIsAITyping(true);
        setIsThinking(true);
        break;

      case 'typing_stop':
        setIsAITyping(false);
        setIsThinking(false);
        break;

      case 'message':
        setMessages((prev) => [
          ...prev,
          {
            id: data.message_id,
            content: data.content,
            role: data.role === 'assistant' ? 'assistant' : 'assistant',
            timestamp: new Date(data.timestamp || Date.now()),
            processingTime: data.processing_time_ms,
            templateSuggestions: data.template_suggestions || [],
          },
        ]);
        setIsAITyping(false);
        setIsThinking(false);
        if (data.template_suggestions?.length) {
          toast.success(`Template suggestions: ${data.template_suggestions.length}`);
        }
        break;

      case 'optimization_result':
        // Set optimization result for side panel display
        setOptimizationResult(data);
        // Also update the message with optimization info
        setMessages((prev) => {
          const next = [...prev];
          const idx = [...next].reverse().findIndex((m) => m.role === 'assistant');
          if (idx >= 0) {
            const realIdx = next.length - 1 - idx;
            next[realIdx] = {
              ...next[realIdx],
              optimization: data
            };
          }
          return next;
        });
        toast.success(
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-sun" />
            <span>Prompt optimized ({Math.round((data.confidence || 0) * 100)}%)</span>
          </div>
        );
        break;

      case 'intent_result':
        toast(
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-nile" />
            <span>Intent: {data.category} ({Math.round((data.confidence || 0) * 100)}%)</span>
          </div>
        );
        break;

      case 'template_opportunity':
        setTemplateOpportunity(data.suggestion);
        toast((t) => (
          <div className="space-y-2 p-2 bg-sand-50 rounded-cartouche border border-stone-200">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-sun" />
              <span className="font-display font-semibold text-stone-800">Template Opportunity</span>
            </div>
            <div className="text-sm text-stone-600">{data.suggestion?.title}</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  sendMessage({
                    type: 'save_conversation_as_template',
                    title: data.suggestion?.title,
                    category: data.suggestion?.category,
                    include_ai_responses: true,
                    description: data.suggestion?.description,
                  });
                  toast.dismiss(t.id);
                  toast.loading(
                    <div className="flex items-center gap-2">
                      <SunDisk size={16} />
                      <span>Creating template...</span>
                    </div>
                  );
                }}
                className="px-3 py-1 rounded-cartouche bg-sun text-white text-sm font-semibold hover:bg-sun/90 transition-colors"
              >
                Create Template
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1 rounded-cartouche bg-stone-600 text-white text-sm font-semibold hover:bg-stone-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        ));
        break;

      case 'template_created':
        setTemplateOpportunity(null);
        toast.success(
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-sun" />
            <span>Template &quot;{data.template?.title}&quot; created successfully!</span>
          </div>
        );
        break;

      case 'heartbeat':
        // Backend liveness check - no action needed
        break;

      case 'pong':
        // Latency is handled by the hook
        break;

      case 'error':
        toast.error(
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>{data.message || 'An error occurred'}</span>
          </div>
        );
        break;

      default:
        // ignore unknown types
        break;
    }
  }, []);

  const { isConnected, latency, sendMessage } = useWebSocketConnection(wsConfig, handleWebSocketMessage);

  const appendUserMessage = useCallback((id: string, content: string) => {
    setMessages((prev) => [
      ...prev,
      { id, content, role: 'user', timestamp: new Date() },
    ]);
  }, []);

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!isConnected) {
        toast.error('Not connected');
        return;
      }

      // Slash commands support: /intent, /optimize, /rewrite, /summarize, /code
      if (content.startsWith('/')) {
        const [cmd, ...rest] = content.slice(1).split(' ');
        const payload = rest.join(' ').trim();
        sendMessage({
          type: 'slash_command',
          command: cmd as 'intent' | 'optimize' | 'rewrite' | 'summarize' | 'code',
          content: payload,
          timestamp: new Date().toISOString(),
        });
        appendUserMessage(crypto.randomUUID(), content);
        setIsAITyping(true);
        setIsThinking(true);
        return;
      }

      const messageId = crypto.randomUUID();
      const msg = {
        type: 'chat_message',
        message_id: messageId,
        content,
        timestamp: new Date().toISOString(),
      };
      sendMessage(msg);
      appendUserMessage(messageId, content);
      setIsAITyping(true);
      setIsThinking(true);
    },
    [isConnected, sendMessage, appendUserMessage]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = inputMessage.trim();
      if (!text) return;
      handleSendMessage(text);
      setInputMessage('');
    },
    [inputMessage, handleSendMessage]
  );

  const wsBase = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.prompt-temple.com';

  return (
    <div className="flex flex-col h-[650px] bg-pharaoh-gradient border-2 border-sand-200 rounded-cartouche shadow-xl backdrop-blur-sm">
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
              <span>{m.timestamp.toLocaleTimeString()}</span>
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

        {/* Enhanced typing indicator */}
        {isAITyping && (
          <div className="max-w-[75%] rounded-cartouche px-5 py-4 text-sm bg-white border border-sand-200 shadow-sand-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sun animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-sun animate-bounce [animation-delay:.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-sun animate-bounce [animation-delay:.3s]"></span>
              </div>
              <span className="text-stone-700 text-xs font-ui">The oracle is consulting DeepSeek...</span>
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
              className="text-stone-400 hover:text-stone-600"
            >
              ×
            </button>
          </div>
          <div className="text-xs space-y-1 text-stone-600">
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
            disabled={!isConnected}
            className="flex-1 px-4 py-3 rounded-cartouche border border-sand-300 bg-white/90 backdrop-blur-sm outline-none text-sm font-ui focus:border-sun focus:ring-2 focus:ring-sun/20 disabled:bg-stone-100 disabled:text-stone-400 transition-all"
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

  return (
    <div className="flex flex-col h-[650px] bg-pharaoh-gradient border-2 border-sand-200 rounded-cartouche shadow-xl backdrop-blur-sm">
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
              <span>{m.timestamp.toLocaleTimeString()}</span>
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

        {/* Enhanced typing indicator */}
        {isAITyping && (
          <div className="max-w-[75%] rounded-cartouche px-5 py-4 text-sm bg-white border border-sand-200 shadow-sand-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sun animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-sun animate-bounce [animation-delay:.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-sun animate-bounce [animation-delay:.3s]"></span>
              </div>
              <span className="text-stone-700 text-xs font-ui">The oracle is consulting DeepSeek...</span>
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
              className="text-stone-400 hover:text-stone-600"
            >
              ×
            </button>
          </div>
          <div className="text-xs space-y-1 text-stone-600">
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
            disabled={!isConnected}
            className="flex-1 px-4 py-3 rounded-cartouche border border-sand-300 bg-white/90 backdrop-blur-sm outline-none text-sm font-ui focus:border-sun focus:ring-2 focus:ring-sun/20 disabled:bg-stone-100 disabled:text-stone-400 transition-all"
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
          <div className="inline-block mb-6">
            <div className="text-6xl mb-2 filter drop-shadow-lg">🏛️</div>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-yellow-600 mx-auto rounded-full"></div>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-700 via-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
            PromptCraft Temple
          </h1>
          <h2 className="text-2xl font-semibold text-amber-800 mb-4">
            Enhanced AI Oracle Chat
          </h2>
          <p className="text-lg text-amber-700 mb-6 max-w-2xl mx-auto">
            Connect with the ancient wisdom of AI through our sacred WebSocket portal. 
            Experience real-time conversations with DeepSeek integration and automatic template creation.
          </p>
          
          {/* Enhanced feature badges */}
          <div className="flex flex-wrap justify-center gap-3 text-sm mb-6">
            <span className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 px-4 py-2 rounded-full border border-emerald-200 shadow-sm">
              ✅ Sacred WebSocket Connection
            </span>
            <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-4 py-2 rounded-full border border-blue-200 shadow-sm">
              ✅ Temple Credit System
            </span>
            <span className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 px-4 py-2 rounded-full border border-purple-200 shadow-sm">
              ✅ Ancient Template Magic
            </span>
            <span className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 px-4 py-2 rounded-full border border-amber-200 shadow-sm">
              ✅ DeepSeek Oracle Powers
            </span>
          </div>
          
          {/* Connection status display */}
          <div className="glass-effect rounded-xl p-4 inline-block border-2 border-amber-200/50 shadow-lg">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-amber-700 font-semibold">🔗 Temple Gateway:</span>
              <code className="bg-amber-100 text-amber-800 px-2 py-1 rounded font-mono text-xs">
                {process.env.NEXT_PUBLIC_WS_URL || 'wss://api.prompt-temple.com'}
              </code>
            </div>
          </div>
        </div>
        
        {/* Chat interface with enhanced container */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-2xl p-6 border-2 border-amber-200/50 shadow-2xl">
            <PromptCraftChatInline />
          </div>
          
          {/* Instructions panel */}
          <div className="mt-6 glass-effect rounded-xl p-4 border border-amber-200/50">
            <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
              📜 Oracle Commands & Features
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-amber-700">
              <div>
                <h4 className="font-semibold mb-2">🗿 Sacred Commands:</h4>
                <ul className="space-y-1 text-xs">
                  <li><code className="bg-amber-100 px-1 rounded">/intent</code> - Analyze message purpose</li>
                  <li><code className="bg-amber-100 px-1 rounded">/optimize</code> - Enhance your prompt</li>
                  <li><code className="bg-amber-100 px-1 rounded">/rewrite</code> - Transform content</li>
                  <li><code className="bg-amber-100 px-1 rounded">/summarize</code> - Condense information</li>
                  <li><code className="bg-amber-100 px-1 rounded">/code</code> - Programming assistance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">⚡ Temple Powers:</h4>
                <ul className="space-y-1 text-xs">
                  <li>🏛️ Real-time WebSocket connection</li>
                  <li>🔮 Automatic template detection</li>
                  <li>⚡ Processing time tracking</li>
                  <li>💎 Credit usage monitoring</li>
                  <li>📊 Performance analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
