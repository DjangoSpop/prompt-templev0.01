'use client';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Search,
  Copy,
  Save,
  GitBranch,
  Zap,
  Settings,
  DollarSign,
  Clock,
  ChevronRight,
  Loader2,
  FileText,
  Lightbulb,
  TrendingUp,
  Hash,
  BookOpen,
  Code,
  Briefcase,
  Heart,
  Wand2,
  Eye,
  Plus,
  Minus,
  RotateCcw,
  Star,
  X,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Database,
  Activity,
  BarChart3,
  ExternalLink,
  Pin,
  Trash2,
  Edit3,
  Download,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useOptimizeWithAgent, usePromptOptimization } from '@/hooks/api/useAI';
import { OptimizationResultPanel } from '@/components/optimizer/OptimizationResultPanel';
import { PaywallModal } from '@/components/PaywallModal';
import { usePaywallTrigger } from '@/lib/hooks/usePaywallTrigger';
import { trackOptimization } from '@/lib/analytics/trackEvent';


const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://api.prompt-temple.com';
const apiUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (!path.startsWith('/')) path = `/${path}`;
  return `${API_BASE}${path}`;
};
// ===== TYPES =====
interface OptimizationResult {
  id: string;
  original: string;
  optimized: string;
  improvements: string[];
  suggestions: string[];
  confidence: number;
  processingTime: number;
  model: string;
  cost: number;
  timestamp: Date;
}

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  tags: string[];
  usage_count: number;
  average_rating: number;
  created_at: string;
  is_public: boolean;
  author?: string;
}

interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

interface TemplateOpportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  reasoning: string;
  suggested_tags: string[];
}

interface StreamingChunk {
  content: string;
  isComplete: boolean;
  processingTime?: number;
}

// ===== ZUSTAND STORE =====
interface OptimizationStore {
  // Transport state
  transport: 'sse' | 'ws';
  isConnected: boolean;
  connectionError: string | null;
  
  // UI state
  prompt: string;
  streamingOutput: string;
  isStreaming: boolean;
  searchQuery: string;
  selectedCategory: string;
  modelConfig: ModelConfig;
  
  // Data
  templates: Template[];
  optimizationHistory: OptimizationResult[];
  templateOpportunity: TemplateOpportunity | null;
  suggestions: string[];
  isLoadingTemplates: boolean;
  inlineSuggestions: string[];
  
  // Actions
  setTransport: (transport: 'sse' | 'ws') => void;
  setConnectionStatus: (connected: boolean, error?: string) => void;
  setPrompt: (prompt: string) => void;
  setStreamingOutput: (output: string | ((prev: string) => string)) => void;
  setIsStreaming: (streaming: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setModelConfig: (config: ModelConfig) => void;
  setTemplates: (templates: Template[]) => void;
  addOptimizationResult: (result: OptimizationResult) => void;
  setTemplateOpportunity: (opportunity: TemplateOpportunity | null) => void;
  setSuggestions: (suggestions: string[]) => void;
  setIsLoadingTemplates: (loading: boolean) => void;
  setInlineSuggestions: (suggestions: string[]) => void;
}

const useOptimizationStore = create<OptimizationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      transport: (process.env.NEXT_PUBLIC_CHAT_TRANSPORT as 'sse' | 'ws') || 'sse',
      isConnected: false,
      connectionError: null,
      prompt: '',
      streamingOutput: '',
      isStreaming: false,
      searchQuery: '',
      selectedCategory: 'all',
      modelConfig: {
        model: 'deepseek-chat',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
      },
      templates: [],
      optimizationHistory: [],
      templateOpportunity: null,
      suggestions: [],
      isLoadingTemplates: false,
      inlineSuggestions: [],
      
      // Actions
      setTransport: (transport) => set({ transport }),
      setConnectionStatus: (connected, error) => set({
        isConnected: connected,
        connectionError: error || null
      }),
      setPrompt: (prompt) => set({ prompt }),
      setStreamingOutput: (output: string | ((prev: string) => string)) => set((state) => ({
      streamingOutput: typeof output === 'function' ? (output as (prev: string) => string)(state.streamingOutput) : output
      })),
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setModelConfig: (config) => set({ modelConfig: config }),
      setTemplates: (templates) => set({ templates }),
      addOptimizationResult: (result) => set((state) => ({
        optimizationHistory: [result, ...state.optimizationHistory].slice(0, 10)
      })),
      setTemplateOpportunity: (opportunity) => set({ templateOpportunity: opportunity }),
      setSuggestions: (suggestions) => set({ suggestions }),
      setIsLoadingTemplates: (loading) => set({ isLoadingTemplates: loading }),
      setInlineSuggestions: (suggestions) => set({ inlineSuggestions: suggestions }),
    }),
    {
      name: 'optimization-store',
      partialize: (state) => ({
        prompt: state.prompt,
        modelConfig: state.modelConfig,
        selectedCategory: state.selectedCategory,
        optimizationHistory: state.optimizationHistory.slice(0, 5),
      }),
    }
  )
);

// ===== SSE CLIENT =====
class ChatSSEClient {
  private abortController: AbortController | null = null;
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.prompt-temple.com';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  
  onStreamStart?: (data: any) => void;
  onStreamToken?: (data: StreamingChunk) => void;
  onStreamComplete?: (data: any) => void;
  onError?: (error: any) => void;
  onTemplateOpportunity?: (data: TemplateOpportunity) => void;
  onOptimizationResult?: (data: OptimizationResult) => void;

  async sendMessage(
    messages: Array<{ role: string; content: string }>,
    options: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      session_id?: string;
      optimization_type?: string;
    } = {}
  ): Promise<void> {
    this.disconnect();
    this.abortController = new AbortController();
    const token = this.getValidToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      // Accept both SSE and JSON so backend can choose the best response
      'Accept': 'text/event-stream, application/json',
      // Prevent intermediary caching for streaming endpoints
      'Cache-Control': 'no-cache',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Diagnostic logs to mirror the working client console output
    console.log('🔑 SSE using centralized auth token:', token ? { token: token.slice?.(0, 12) + '...' } : null);
    console.log('📋 Request payload:', {
      messages,
      model: options.model || 'deepseek-chat',
      stream: true,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2048,
    });
    console.log('🌐 Request URL:', `${this.baseUrl}/api/v2/chat/completions/`);
    console.log('🔐 Request headers:', headers);

    try {
  let response = await fetch(`${this.baseUrl}/api/v2/chat/completions/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages,
          model: options.model || 'deepseek-chat',
          stream: true,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2048,
          session_id: options.session_id,
          optimization_type: options.optimization_type,
        }),
        signal: this.abortController.signal,
      });

      // If the server rejects the Accept header with 406, retry with a looser Accept
      if (response.status === 406) {
        console.warn('Server returned 406 for Accept header; retrying with */*');
  // Try a looser Accept to let the server respond with its default
  headers['Accept'] = '*/*';
        response = await fetch(`${this.baseUrl}/api/v2/chat/completions/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages,
            model: options.model || 'deepseek-chat',
            stream: true,
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 2048,
            session_id: options.session_id,
            optimization_type: options.optimization_type,
          }),
          signal: this.abortController.signal,
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      const decoder = new TextDecoder();
      let buffer = '';
      let isStreamStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          this.handleSSELine(line, isStreamStarted);
          if (!isStreamStarted && line.includes('stream_start')) {
            isStreamStarted = true;
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        this.onError?.(error);
      }
    }
  }

  private handleSSELine(line: string, isStreamStarted: boolean) {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('event: ')) {
      const eventType = trimmed.slice(7);
      if (eventType === 'template_opportunity') {
        // Handle template opportunity event
      }
      return;
    }

    if (trimmed.startsWith('data: ')) {
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      
      try {
        const parsed = JSON.parse(data);
        
        if (parsed.stream_start && !isStreamStarted) {
          this.onStreamStart?.(parsed);
        } else if (parsed.stream_complete) {
          this.onStreamComplete?.(parsed);
        } else if (parsed.error) {
          this.onError?.(parsed);
        } else if (parsed.template_opportunity) {
          this.onTemplateOpportunity?.(parsed);
        } else if (parsed.optimization_result) {
          this.onOptimizationResult?.(parsed);
        } else if (parsed.choices?.[0]?.delta?.content) {
          this.onStreamToken?.({
            content: parsed.choices[0].delta.content,
            isComplete: false,
          });
        }
      } catch (e) {
        console.warn('Failed to parse SSE data:', data);
      }
    }
  }

  disconnect() {
    this.abortController?.abort();
    this.abortController = null;
  }

  private getValidToken(): string | null {
    // Robust token resolution: check common storage locations and keys
    const candidates = [
      localStorage.getItem('access_token'),
      sessionStorage.getItem('access_token'),
      localStorage.getItem('auth_token'),
      sessionStorage.getItem('auth_token'),
      localStorage.getItem('token'),
      sessionStorage.getItem('token'),
      localStorage.getItem('next-auth.session-token'),
      sessionStorage.getItem('next-auth.session-token')
    ];

    for (const c of candidates) {
      if (!c) continue;
      const t = String(c).trim();
      if (!t || t === 'undefined' || t === 'null') continue;
      return t;
    }

    // Try cookies as a last resort
    try {
      const cookieMatch = document.cookie.match(/(?:^|; )(?:(?:access_token|auth_token|token)=)([^;]+)/);
      if (cookieMatch && cookieMatch[1]) {
        const t = decodeURIComponent(cookieMatch[1]).trim();
        if (t && t !== 'undefined' && t !== 'null') return t;
      }
    } catch (e) {
      // ignore
    }

    return null;
  }
}

// ===== WEB SOCKET CLIENT =====
class PromptCraftWebSocket {
  private socket: WebSocket | null = null;
  private messageQueue: any[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  onMessage?: (data: any) => void;
  onOptimizationResult?: (data: OptimizationResult) => void;
  onTemplateOpportunity?: (data: TemplateOpportunity) => void;
  onError?: (error: any) => void;
  onConnectionChange?: (connected: boolean) => void;

  connect(sessionId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const token = this.getValidToken();
      const wsUrl = token
        ? `wss://api.prompt-temple.com/ws/chat/${sessionId}/?token=${token}`
        : `wss://api.prompt-temple.com/ws/chat/${sessionId}/`;

      try {
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
          console.log('🔌 WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.processQueue();
          this.onConnectionChange?.(true);
          resolve(true);
        };
        
        this.socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        };
        
        this.socket.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.onError?.(error);
          this.onConnectionChange?.(false);
          reject(error);
        };
        
        this.socket.onclose = (event) => {
          console.log('🔌 WebSocket closed:', event.code, event.reason);
          this.isConnected = false;
          this.onConnectionChange?.(false);
          
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect(sessionId);
          }
        };

        // Connection timeout
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(sessionId: string) {
    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      this.connect(sessionId).catch(console.error);
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'connection_ack':
        console.log('✅ Connection acknowledged');
        break;
      case 'message':
        this.onMessage?.(message);
        break;
      case 'optimization_result':
        this.onOptimizationResult?.(message);
        break;
      case 'template_opportunity':
        this.onTemplateOpportunity?.(message);
        break;
      case 'template_created':
        toast.success(message.message || 'Template created successfully!');
        break;
      case 'error':
        this.onError?.(message);
        break;
      case 'pong':
        // Handle ping/pong for latency measurement
        break;
    }
  }

  send(message: any): boolean {
    if (!this.isConnected) {
      this.messageQueue.push(message);
      return false;
    }
    
    this.socket?.send(JSON.stringify(message));
    return true;
  }

  private processQueue() {
    while (this.messageQueue.length > 0) {
      this.send(this.messageQueue.shift());
    }
  }

  disconnect() {
    this.socket?.close(1000, 'Client disconnect');
    this.socket = null;
    this.isConnected = false;
    this.onConnectionChange?.(false);
  }

  private getValidToken(): string | null {
    const token = localStorage.getItem('access_token') ||
                  sessionStorage.getItem('access_token');
    if (!token || token === 'undefined' || token === 'null') return null;
    return token;
  }
}

// ===== COMPONENTS =====

// Prompt Editor Component
const PromptEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onOptimize: () => void;
  onDeepOptimize?: () => void;
  isDeepOptimizing?: boolean;
  isStreaming: boolean;
  modelConfig: ModelConfig;
  onModelConfigChange: (config: ModelConfig) => void;
}> = ({ value, onChange, onOptimize, onDeepOptimize, isDeepOptimizing, isStreaming, modelConfig, onModelConfigChange }) => {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [showVariables, setShowVariables] = useState(false);
  
  const estimatedCost = useMemo(() => {
    const inputTokens = value.length / 4;
    const outputTokens = modelConfig.maxTokens;
    const costPerMillion = 0.5; // DeepSeek pricing
    return ((inputTokens + outputTokens) / 1_000_000) * costPerMillion;
  }, [value, modelConfig.maxTokens]);

  const estimatedLatency = useMemo(() => {
    return Math.max(100, Math.min(2000, value.length * 0.5 + modelConfig.maxTokens * 0.2));
  }, [value, modelConfig.maxTokens]);

  const insertVariable = useCallback((varName: string) => {
    const variableText = `{{${varName}}}`;
    onChange(value + variableText);
  }, [value, onChange]);

  return (
    <div className="flex h-full flex-col">
      {/* Header with Model Config */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Prompt Editor</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <DollarSign className="h-4 w-4" />
              <span>${estimatedCost.toFixed(4)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Clock className="h-4 w-4" />
              <span>~{estimatedLatency}ms</span>
            </div>
          </div>
        </div>
        
        {/* Model Configuration */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Model</label>
              <select
                value={modelConfig.model}
                onChange={(e) => onModelConfigChange({ ...modelConfig, model: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3">Claude 3</option>
                <option value="glm-4-32b">GLM-4-32B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Temperature: {modelConfig.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={modelConfig.temperature}
                onChange={(e) => onModelConfigChange({ ...modelConfig, temperature: parseFloat(e.target.value) })}
                className="mt-1 w-full"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Max Tokens</label>
              <input
                type="number"
                value={modelConfig.maxTokens}
                onChange={(e) => onModelConfigChange({ ...modelConfig, maxTokens: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                min="1"
                max="4096"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Top P: {modelConfig.topP}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={modelConfig.topP}
                onChange={(e) => onModelConfigChange({ ...modelConfig, topP: parseFloat(e.target.value) })}
                className="mt-1 w-full"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Variables Panel */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <button
          onClick={() => setShowVariables(!showVariables)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          {showVariables ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          Variables
        </button>
        <AnimatePresence>
          {showVariables && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 space-y-2"
            >
              <div className="flex flex-wrap gap-2">
                {Object.keys(variables).map((varName) => (
                  <button
                    key={varName}
                    onClick={() => insertVariable(varName)}
                    className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    {varName}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const varName = window.prompt('Variable name:');
                    if (varName) {
                      setVariables(prev => ({ ...prev, [varName]: '' }));
                    }
                  }}
                  className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 px-3 py-1 text-xs text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500"
                >
                  + Add Variable
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Editor */}
      <div className="flex-1 p-4">
        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Input Prompt</label>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{value.length} characters</span>
              <span>•</span>
              <span>{value.split(' ').length} words</span>
            </div>
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your prompt here... Be specific about what you want to achieve. Use {{variable}} syntax for dynamic content."
            className="flex-1 min-h-[150px] lg:min-h-0 resize-none rounded-lg border border-slate-200 dark:border-slate-600 p-4 font-mono text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          
          {/* Inline Suggestions */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Quick optimizations:</p>
            <div className="flex flex-wrap gap-1.5">
              {([
                { label: 'Clarity & Conciseness', icon: Zap, color: 'blue' },
                { label: 'Persuasive & Action', icon: TrendingUp, color: 'violet' },
                { label: 'Constraints & Examples', icon: Code, color: 'orange' },
                { label: 'Clear Structure', icon: Hash, color: 'green' },
                { label: 'Technical Accuracy', icon: Database, color: 'rose' },
              ] as const).map(({ label, icon: Icon, color }, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(`${value}\n\n${label}`)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all hover:-translate-y-0.5",
                    color === 'blue'   && "border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800/60 dark:text-blue-300 dark:hover:bg-blue-900/20",
                    color === 'violet' && "border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800/60 dark:text-violet-300 dark:hover:bg-violet-900/20",
                    color === 'orange' && "border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800/60 dark:text-orange-300 dark:hover:bg-orange-900/20",
                    color === 'green'  && "border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800/60 dark:text-green-300 dark:hover:bg-green-900/20",
                    color === 'rose'   && "border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800/60 dark:text-rose-300 dark:hover:bg-rose-900/20",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Primary: Run Optimize */}
            <button
              onClick={onOptimize}
              disabled={isStreaming || !value.trim()}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200",
                isStreaming || !value.trim()
                  ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700/60 dark:text-slate-500"
                  : "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/25 hover:-translate-y-0.5 hover:from-blue-700 hover:to-violet-700 hover:shadow-lg hover:shadow-blue-500/35 active:translate-y-0"
              )}
            >
              {isStreaming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Optimizing...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Run Optimize</span>
                </>
              )}
            </button>

            {/* Secondary: Agent Optimize */}
            {onDeepOptimize && (
              <button
                onClick={onDeepOptimize}
                disabled={isDeepOptimizing || isStreaming || !value.trim()}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                  isDeepOptimizing || isStreaming || !value.trim()
                    ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700/60 dark:text-slate-500"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-500/35 active:translate-y-0"
                )}
                title="RAG-backed AI agent for deep analysis and optimization"
              >
                {isDeepOptimizing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Agent</span>
                    <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide">RAG</span>
                  </>
                )}
              </button>
            )}

            {/* Clear */}
            <button
              onClick={() => onChange('')}
              disabled={!value.trim()}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200",
                !value.trim()
                  ? "cursor-not-allowed border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600"
                  : "border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-red-800 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              )}
              title="Clear prompt"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Streaming Output Pane Component
const StreamingPane: React.FC<{
  output: string;
  isStreaming: boolean;
  onCopy: () => void;
  onSave: () => void;
  onFork: () => void;
}> = ({ output, isStreaming, onCopy, onSave, onFork }) => {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeout = useRef<number | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output || '');
      setCopied(true);
      onCopy();
      if (copyTimeout.current) window.clearTimeout(copyTimeout.current);
      copyTimeout.current = window.setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      toast.error('Failed to copy');
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeout.current) window.clearTimeout(copyTimeout.current);
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white px-4 py-3 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Optimized Output</h2>
            {isStreaming && (
              <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {/* Formatted / Raw pill toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setShowRaw(false)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                  !showRaw
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                )}
              >
                <Eye className="h-3 w-3" />
                Formatted
              </button>
              <button
                type="button"
                onClick={() => setShowRaw(true)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                  showRaw
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                )}
              >
                <Code className="h-3 w-3" />
                Raw
              </button>
            </div>

            {output && (
              <>
                {/* Copy */}
                <button
                  onClick={handleCopy}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                    copied
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-800 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                  )}
                >
                  {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>

                {/* Save */}
                <button
                  onClick={onSave}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-violet-800 dark:hover:bg-violet-900/20 dark:hover:text-violet-300"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </button>

                {/* Fork */}
                <button
                  onClick={onFork}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-purple-800 dark:hover:bg-purple-900/20 dark:hover:text-purple-300"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  Fork
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Output */}
      <div className="flex-1 p-4">
        <div className={cn(
          "h-full rounded-lg border p-4",
          isStreaming ? "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
        )}>
          {output ? (
            <div className={cn(
              "h-full overflow-auto",
              showRaw ? "whitespace-pre-wrap break-words font-mono text-sm text-slate-800 dark:text-slate-200" : "prose prose-sm max-w-none dark:prose-invert prose-pre:overflow-x-auto prose-pre:max-w-full"
            )}>
              {showRaw ? output : (
                <div dangerouslySetInnerHTML={{
                  __html: output
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-100 dark:bg-slate-700 p-2 rounded text-xs max-w-full overflow-x-auto"><code>$1</code></pre>')
                    .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">$1</code>')
                }} />
              )}
              {isStreaming && <span className="animate-pulse text-blue-600 dark:text-blue-400">▊</span>}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
              <div className="text-center">
                <Wand2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Ready to optimize</p>
                <p className="text-sm">Enter a prompt and click &quot;Run Optimize&quot;</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Suggestions Panel Component
const SuggestionsPanel: React.FC<{
  suggestions: string[];
  onApplySuggestion: (suggestion: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  templates: Template[];
  isLoadingTemplates: boolean;
  onSearchTemplates: () => void;
}> = ({
  suggestions,
  onApplySuggestion,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  templates,
  isLoadingTemplates,
  onSearchTemplates,
}) => {
  const categories = [
    { id: 'all', label: 'All Categories', icon: Hash },
    { id: 'creative', label: 'Creative Writing', icon: BookOpen },
    { id: 'technical', label: 'Technical', icon: Code },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'personal', label: 'Personal', icon: Heart },
  ];
  
  const topTags = [
    'optimization', 'prompt-engineering', 'ai', 'productivity', 'creativity'
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchTemplates()}
              placeholder="Search templates and suggestions..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 py-2 pl-10 pr-4 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={onSearchTemplates}
            disabled={isLoadingTemplates}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoadingTemplates ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </div>
        
        {/* Top Tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {topTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onSearchChange(tag)}
              className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              #{tag}
            </button>
          ))}
        </div>
        
        {/* Category Filter */}
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                selectedCategory === cat.id
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              )}
            >
              <cat.icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-6">
          {/* Inline Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">AI Suggestions</h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => onApplySuggestion(suggestion)}
                    className="flex w-full items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Template Results */}
          {templates.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Template Library</h3>
              <div className="space-y-2">
                {templates.slice(0, 5).map((template) => (
                  <div
                    key={template.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-white">{template.title}</h4>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{template.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {template.usage_count} uses
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {template.average_rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => onApplySuggestion(template.content)}
                        className="ml-3 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {templates.length === 0 && !isLoadingTemplates && (
            <div className="flex h-32 items-center justify-center text-slate-400 dark:text-slate-500">
              <div className="text-center">
                <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No templates found</p>
                <p className="text-xs">Try adjusting your search or category</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Template Create Modal Component
const TemplateCreateModal: React.FC<{
  opportunity: TemplateOpportunity | null;
  optimizedContent: string;
  onClose: () => void;
  onCreate: (template: Partial<Template>) => void;
}> = ({ opportunity, optimizedContent, onClose, onCreate }) => {
  const [title, setTitle] = useState(opportunity?.title || '');
  const [description, setDescription] = useState(opportunity?.description || '');
  const [category, setCategory] = useState(opportunity?.category || 'optimization');
  const [tags, setTags] = useState<string[]>(opportunity?.suggested_tags || []);
  const [isPublic, setIsPublic] = useState(false);
  
  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Please enter a template title');
      return;
    }
    
    onCreate({
      title: title.trim(),
      description: description.trim(),
      category,
      content: optimizedContent,
      tags,
      is_public: isPublic,
    });
    onClose();
  };
  
  if (!opportunity) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-lg bg-white dark:bg-slate-800 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create Template</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Template title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                rows={3}
                placeholder="Brief description..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="optimization">Optimization</option>
                <option value="creative">Creative Writing</option>
                <option value="technical">Technical</option>
                <option value="business">Business</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
              <input
                type="text"
                value={tags.join(', ')}
                onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="optimization, ai, prompt (comma-separated)"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm text-slate-700 dark:text-slate-300">
                Make this template public
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Template
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Component
export default function OptimizationPlayground() {
  const store = useOptimizationStore();
  const searchParams = useSearchParams();
  // Legacy clients kept for backward-compat UI references; streaming is now
  // handled by aiService via usePromptOptimization
  const wsClient = useRef<PromptCraftWebSocket | null>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'output' | 'library'>('write');
  const { checkAndTrigger, triggerOnHighScore } = usePaywallTrigger();

  // Pre-fill prompt from URL query params (e.g. coming from Template Library)
  useEffect(() => {
    const content = searchParams?.get('content');
    if (content && !store.prompt) {
      try {
        store.setPrompt(decodeURIComponent(content));
      } catch {
        store.setPrompt(content);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // aiService-powered SSE streaming hook
  const {
    optimize: streamOptimize,
    cancel: cancelStream,
    isStreaming: hookIsStreaming,
    output: hookOutput,
    result: hookResult,
  } = usePromptOptimization();

  // Sync hook output → store so the existing StreamingPane renders correctly
  useEffect(() => {
    if (hookOutput) store.setStreamingOutput(hookOutput);
  }, [hookOutput]);

  // Sync hook result metadata → store (suggestions, template opportunity, history)
  useEffect(() => {
    if (!hookResult) return;
    if (hookResult.suggestions?.length) store.setSuggestions(hookResult.suggestions);
    if (hookResult.template_opportunity) {
      store.setTemplateOpportunity(hookResult.template_opportunity as any);
      toast.info('💡 Template opportunity detected!');
    }
    // Track analytics + trigger paywall on high scores
    if (hookResult.optimized) {
      const overallScore = hookResult.improvements?.overall_score ?? 0;
      const improvementCount = hookResult.suggestions?.length ?? 0;
      trackOptimization(overallScore / 10, improvementCount);
      triggerOnHighScore(overallScore / 10);
    }
    // Cast to page-local OptimizationResult shape for history
    if (hookResult.optimized) {
      store.addOptimizationResult({
        id: hookResult.run_id || `result_${Date.now()}`,
        original: '',
        optimized: hookResult.optimized,
        improvements: hookResult.improvements ? Object.values(hookResult.improvements).filter(Boolean).map(String) : [],
        suggestions: hookResult.suggestions || [],
        confidence: hookResult.improvements?.overall_score ? hookResult.improvements.overall_score / 100 : 0,
        processingTime: hookResult.processing_time_ms || 0,
        model: store.modelConfig.model,
        cost: 0,
        timestamp: new Date(),
      } as any);
    }
  }, [hookResult]);

  // Sync streaming state → store
  useEffect(() => {
    store.setIsStreaming(hookIsStreaming);
    if (!hookIsStreaming) store.setConnectionStatus(true);
  }, [hookIsStreaming]);

  // Auto-switch to output tab on mobile when optimization starts
  useEffect(() => {
    if (store.isStreaming) setActiveTab('output');
  }, [store.isStreaming]);

  // Initialize transport — always SSE via aiService; WS kept as opt-in fallback
  useEffect(() => {
    const transportMode = (process.env.NEXT_PUBLIC_CHAT_TRANSPORT as 'sse' | 'ws') || 'sse';
    store.setTransport(transportMode);

    if (transportMode === 'ws') {
      // Legacy WebSocket path (kept for environments that still need it)
      wsClient.current = new PromptCraftWebSocket();
      const sessionId = `optimize_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      wsClient.current.connect(sessionId).then(() => {
        store.setConnectionStatus(true);
      }).catch((error) => {
        store.setConnectionStatus(false, error.message);
      });

      wsClient.current.onOptimizationResult = (result) => {
        store.addOptimizationResult(result);
        store.setStreamingOutput(result.optimized);
        store.setSuggestions(result.suggestions || []);
      };

      wsClient.current.onTemplateOpportunity = (data) => {
        store.setTemplateOpportunity(data);
      };

      wsClient.current.onConnectionChange = (connected) => {
        store.setConnectionStatus(connected);
      };

      wsClient.current.onError = (error) => {
        toast.error(error.message || 'WebSocket error');
      };
    } else {
      // SSE via aiService — always connected, no persistent socket needed
      store.setConnectionStatus(true);
    }

    return () => {
      cancelStream();
      wsClient.current?.disconnect();
    };
  }, []);

  // Generate inline suggestions based on prompt
  useEffect(() => {
    if (store.prompt.length > 10) {
      const suggestions = [];
      
      if (store.prompt.toLowerCase().includes('email')) {
        suggestions.push('Optimize for professional tone and clarity');
      }
      
      if (store.prompt.toLowerCase().includes('creative')) {
        suggestions.push('Add more vivid imagery and descriptive language');
      }
      
      if (store.prompt.toLowerCase().includes('technical')) {
        suggestions.push('Include specific technical details and terminology');
      }
      
      if (suggestions.length > 0) {
        store.setInlineSuggestions(suggestions);
      } else {
        store.setInlineSuggestions([
          'Optimize for clarity and conciseness',
          'Make it more persuasive and action-oriented',
          'Add specific constraints and examples'
        ]);
      }
    } else {
      store.setInlineSuggestions([]);
    }
  }, [store.prompt]);

  // Search templates
  const searchTemplates = useCallback(async () => {
    store.setIsLoadingTemplates(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const params = new URLSearchParams();
      if (store.searchQuery) params.append('search', store.searchQuery);
      if (store.selectedCategory !== 'all') params.append('category', store.selectedCategory);
      
       const response = await fetch(apiUrl(`/api/v2/templates/?${params}`), { headers });
      const data = await response.json();
      store.setTemplates(data.results || []);
    } catch (error) {
      console.error('Failed to search templates:', error);
      toast.error('Failed to load templates');
    } finally {
      store.setIsLoadingTemplates(false);
    }
  }, [store]);

  // Search prompts (backend /search/prompts/) - keeps SSE/WS untouched
  const searchPrompts = useCallback(async (query?: string) => {
    // Use explicit query parameter if provided, otherwise use store.searchQuery
  const q = ((query ?? store.searchQuery) || '').trim();
    if (!q) {
      return;
    }

    // Build candidates for resilient fetch
  const path = '/api/v2/templates/search_prompts/';
  const candidates: string[] = [apiUrl(path)];
    const sanitize = (s: string) => {
      let out = s.replace(/\S+@\S+\.\S+/g, '');
      out = out.replace(/\b\d{6,}\b/g, '');
      return out.trim();
    };

    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token && token !== 'undefined') headers['Authorization'] = `Bearer ${token}`;

    let resp: Response | null = null;
    for (const base of candidates) {
      try {
        resp = await fetch(base, {
          method: 'GET',
          headers,
          body: JSON.stringify({
            query: sanitize(q),
            category: store.selectedCategory !== 'all' ? store.selectedCategory : undefined,
            max_results: 20,
            session_id: `optimize_${Date.now()}`,
          }),
        });
      } catch (err) {
        console.warn('prompt search fetch failed for', base, err);
        resp = null;
      }
      if (resp && resp.ok) break;
    }

    if (!resp || !resp.ok) {
      console.warn('searchPrompts: no successful response');
      return;
    }

    try {
      const data = await resp.json();
      // Backend shape expected per provided code: { results: [ { id, title, content, category, tags, usage_count, average_rating, ... } ], ... }
      const results = Array.isArray(data?.results) ? data.results as unknown[] : [];

      // Map to Template shape used by the UI, with safe casts from unknown
      const mapped: Template[] = results.map((r: unknown) => {
        const item = r as Record<string, unknown>;
        const promptObj = item.prompt as Record<string, unknown> | undefined;
        return {
          id: String(item.id ?? promptObj?.id ?? item.prompt_id ?? ''),
          title: String(item.title ?? promptObj?.title ?? (item.content ? String(item.content).slice(0, 60) : 'Prompt')),
          description: String(item.description ?? promptObj?.description ?? ''),
          category: String(item.category ?? promptObj?.category ?? ''),
          content: String(item.content ?? promptObj?.content ?? ''),
          tags: Array.isArray(item.tags) ? (item.tags as string[]) : (Array.isArray(promptObj?.tags) ? (promptObj!.tags as string[]) : []),
          usage_count: Number(item.usage_count ?? promptObj?.usage_count ?? 0),
          average_rating: Number(item.average_rating ?? promptObj?.average_rating ?? 0),
          created_at: String(item.created_at ?? ''),
          is_public: Boolean(item.is_public ?? false),
        } as Template;
      });

      if (mapped.length > 0) {
        store.setTemplates(mapped);
        // Also set suggestions: use titles first, then short content
        const suggs = mapped.slice(0, 8).map(t => t.title || t.content).filter(Boolean) as string[];
        store.setSuggestions(suggs);
      }
    } catch (err) {
      console.error('searchPrompts parse error', err);
    }
  }, [store]);

  // Fetch search suggestions from API endpoint and populate store.suggestions
  // Use selectors to avoid recreating callbacks when unrelated parts of the store change
  const setSuggestions = useOptimizationStore(state => state.setSuggestions);
  const searchQuery = useOptimizationStore(state => state.searchQuery);

  const fetchSearchSuggestions = useCallback(async (query?: string) => {
    try {
  const token = localStorage.getItem('access_token');
  const headers: HeadersInit = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  // Optionally avoid sending auth with suggestions to protect user privacy
  const anon = process?.env?.NEXT_PUBLIC_SUGGESTIONS_ANON === '1';
  if (!anon && token && token !== 'undefined') headers['Authorization'] = `Bearer ${token}`;

      // Try multiple candidate endpoints in order so dev setups (backend on :8000) work
      const path = '/api/v2/templates/search_suggestions/';
 const candidates: string[] = [apiUrl(path)];
      // relative to current origin (works if your Next server proxies API)

      // Sanitize query to avoid sending obvious personal identifiers (emails, long digit sequences)
      const sanitize = (q?: string) => {
        if (!q) return q;
        // remove emails
        let out = q.replace(/\S+@\S+\.\S+/g, '');
        // remove long digit sequences (phones, ssn-like)
        out = out.replace(/\b\d{6,}\b/g, '');
        return out.trim();
      };

      // If query present, append as ?q= to each candidate when trying
      const tryFetch = async (urlStr: string) => {
        const cleanQ = sanitize(query);
        const finalUrl = cleanQ && cleanQ.length > 0 ? `${urlStr}?q=${encodeURIComponent(cleanQ)}` : urlStr;
        try {
          const r = await fetch(finalUrl, { headers });
          return r;
        } catch (err) {
          console.warn('fetch error for', finalUrl, err);
          return null;
        }
      };

      let resp: Response | null = null;
      for (const c of candidates) {
        resp = await tryFetch(c);
        if (resp && resp.ok) break;
        // keep trying on non-ok or network error
      }

      if (!resp || !resp.ok) {
        console.warn('search_suggestions returned', resp?.status);
        return;
      }

      const data = await resp.json();

      // Backend returns shape: { popular_tags: string[], popular_categories: {name, slug, count}[] }
      const tags: string[] = Array.isArray(data?.popular_tags) ? data.popular_tags.filter(Boolean).map(String) : [];
  const categories: string[] = Array.isArray(data?.popular_categories) ? data.popular_categories.map((c: unknown) => String((c as Record<string, unknown>)?.name)).filter(Boolean) : [];

      // Build suggestion list: tags first, then categories (deduped)
      const combined = [...tags, ...categories].map(s => s.trim()).filter(s => s.length > 1 && s !== '[' && s !== ']');
      const deduped = Array.from(new Set(combined));

      if (deduped.length > 0) {
        setSuggestions(deduped);
      }
    } catch (err) {
      // swallow network errors but log for diagnostics
      console.error('fetchSearchSuggestions error', err);
    }
  }, [setSuggestions]);

  // Call suggestions on mount and when search query changes (debounced 300ms)
  useEffect(() => {
    // initial fetch
    fetchSearchSuggestions();

    const handle = setTimeout(() => {
      if (searchQuery && searchQuery.length > 2) {
        fetchSearchSuggestions(searchQuery);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [fetchSearchSuggestions, searchQuery]);

  // Run optimization — SSE via aiService (default), legacy WS as fallback
  const runOptimization = useCallback(async () => {
    if (!store.prompt.trim()) {
      toast.error('Please enter a prompt to optimize');
      return;
    }

    // Check free-tier limit; shows upgrade modal and returns false if capped
    const canProceed = checkAndTrigger();
    if (!canProceed) return;

    if (store.transport === 'ws' && wsClient.current) {
      // Legacy WebSocket path
      wsClient.current.send({
        type: 'optimize_prompt',
        prompt: store.prompt,
        context: { mode: 'enhancement' },
        optimization_type: 'enhancement',
      });
    } else {
      // Default: SSE via aiService.optimizePromptStream()
      store.setStreamingOutput('');
      await streamOptimize({
        original: store.prompt,
        model: store.modelConfig.model,
        temperature: store.modelConfig.temperature,
        max_tokens: store.modelConfig.maxTokens,
        session_id: `optimize_${Date.now()}`,
        mode: 'fast',
      });
    }
  }, [store, streamOptimize, wsClient]);

  // Agent-based deep optimization (RAG + DeepSeek pipeline)
  const agentOptimizeMutation = useOptimizeWithAgent();

  const runDeepOptimize = useCallback(async () => {
    if (!store.prompt.trim()) {
      toast.error('Please enter a prompt to optimize');
      return;
    }
    const result = await agentOptimizeMutation.mutateAsync({
      session_id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      original: store.prompt,
      mode: 'fast',
      context: { model: store.modelConfig.model },
      budget: { tokens_in: 2000, tokens_out: 800, max_credits: 5 },
    });

    if (result.optimized) {
      store.setStreamingOutput(result.optimized);

      // Surface diff summary as a suggestion if available
      if (result.diff_summary) {
        store.setSuggestions([result.diff_summary]);
      }

      const citationCount = result.citations?.length ?? 0;
      const timeMs = result.processing_time_ms ?? 0;
      toast.success(
        citationCount > 0
          ? `Agent optimized using ${citationCount} RAG citation${citationCount > 1 ? 's' : ''} (${timeMs}ms)`
          : `Agent optimization complete (${timeMs}ms)`
      );
    } else {
      toast.warning('Agent returned no optimized content');
    }
  }, [store, agentOptimizeMutation]);

  // Save as template
  const saveAsTemplate = useCallback(async () => {
    if (!store.streamingOutput) {
      toast.error('No optimized content to save');
      return;
    }
    
    if (wsClient.current) {
      wsClient.current.send({
        type: 'save_conversation_as_template',
        title: `Optimized: ${store.prompt.slice(0, 50)}...`,
        category: 'Optimization',
        include_ai_responses: true,
        description: 'AI-optimized prompt template',
      });
      toast.success('Template saved!');
    } else {
      // Direct API call for SSE mode
      try {
        const token = localStorage.getItem('access_token');
         const response = await fetch(apiUrl('/api/v2/templates/'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify({
            title: `Optimized: ${store.prompt.slice(0, 50)}...`,
            description: 'AI-optimized prompt template',
            template_content: store.streamingOutput,
            category: 1, // Default category ID
            is_public: false,
          }),
        });
        
        if (response.ok) {
          toast.success('Template saved successfully!');
          searchTemplates(); // Refresh templates
        }
      } catch {
        toast.error('Failed to save template');
      }
    }
  }, [store.streamingOutput, store.prompt, searchTemplates]);

  // Fork version
  const forkVersion = useCallback(() => {
    const forkedContent = `${store.streamingOutput}\n\n[Forked variant]:\n`;
    store.setPrompt(forkedContent);
    store.setStreamingOutput('');
    toast.info('Created fork - edit and re-optimize');
  }, [store]);

  // Apply suggestion
  const applySuggestion = useCallback((suggestion: string) => {
    store.setPrompt(suggestion);
    runOptimization();
  }, [store, runOptimization]);

  // Create template from modal
  const createTemplate = useCallback(async (template: Partial<Template>) => {
    try {
      const token = localStorage.getItem('access_token');
     const response = await fetch(apiUrl('/api/v2/templates/'),{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          title: template.title,
          description: template.description,
          template_content: template.content,
          category: template.category,
          tags: template.tags,
          is_public: template.is_public,
        }),
      });
      
      if (response.ok) {
        toast.success('Template created successfully!');
        searchTemplates(); // Refresh templates
      }
    } catch {
      toast.error('Failed to create template');
    }
  }, [searchTemplates]);

  return (
    <>
      {/* ── Mobile Tab Bar (hidden on lg+) ── */}
      <div
        className="flex border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:hidden"
        role="tablist"
        aria-label="Optimizer panels"
      >
        {([
          { id: 'write'   as const, label: 'Write',   icon: Edit3    },
          { id: 'output'  as const, label: 'Output',  icon: Wand2    },
          { id: 'library' as const, label: 'Library', icon: BookOpen },
        ]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id ? true : false}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors',
              activeTab === id
                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {id === 'output' && store.isStreaming && (
              <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>

      {/* ── Main Layout ── */}
      <div className="temple-background flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 lg:h-screen lg:flex-row lg:overflow-hidden">
        {/* Left Panel - Prompt Editor */}
        <div
          className={cn(
            'flex w-full flex-col border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
            'lg:flex lg:w-1/2 lg:border-b-0 lg:border-r',
            activeTab === 'write' ? 'flex border-b' : 'hidden'
          )}
        >
          <PromptEditor
            value={store.prompt}
            onChange={store.setPrompt}
            onOptimize={runOptimization}
            onDeepOptimize={runDeepOptimize}
            isDeepOptimizing={agentOptimizeMutation.isPending}
            isStreaming={store.isStreaming}
            modelConfig={store.modelConfig}
            onModelConfigChange={store.setModelConfig}
          />
        </div>

        {/* Right Panel - Output & Suggestions */}
        <div
          className={cn(
            'w-full flex-1 flex-col bg-slate-50 dark:bg-slate-900',
            'lg:flex lg:w-1/2',
            activeTab !== 'write' ? 'flex' : 'hidden lg:flex'
          )}
        >
          {/* Connection Status */}
          <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm',
                  store.transport === 'sse'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : store.isConnected
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                )}>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
                  {store.transport === 'sse'
                    ? 'SSE Active'
                    : store.isConnected
                      ? 'WebSocket Connected'
                      : 'WebSocket Disconnected'}
                </div>
                {store.connectionError && (
                  <span className="text-xs text-red-600 dark:text-red-400">{store.connectionError}</span>
                )}
              </div>
            </div>
          </div>

          {/* Output and Suggestions */}
          <div className="flex flex-1 flex-col overflow-hidden xl:flex-row">
            {/* Output Pane */}
            <div
              className={cn(
                'border-b border-slate-200 dark:border-slate-700 xl:border-b-0 xl:border-r',
                activeTab === 'library'
                  ? 'hidden xl:flex xl:flex-col xl:flex-1'
                  : 'flex flex-col flex-1'
              )}
            >
              <StreamingPane
                output={store.streamingOutput}
                isStreaming={store.isStreaming}
                onCopy={() => { toast.success('Copied to clipboard'); }}
                onSave={saveAsTemplate}
                onFork={forkVersion}
              />
              {/* WowScore + improvements panel — visible when streaming completes */}
              {hookResult && (
                <div className="border-t border-slate-200 dark:border-slate-700">
                  <OptimizationResultPanel
                    result={hookResult as any}
                    originalPrompt={store.prompt}
                    isStreaming={store.isStreaming}
                    onCopy={() => { navigator.clipboard.writeText(store.streamingOutput); toast.success('Copied!'); }}
                    onSave={saveAsTemplate}
                  />
                </div>
              )}
            </div>

            {/* Suggestions Pane */}
            <div
              className={cn(
                'border-t border-slate-200 dark:border-slate-700 xl:border-t-0 xl:border-l',
                activeTab === 'output'
                  ? 'hidden xl:block xl:w-80'
                  : 'flex flex-col flex-1 xl:flex-none xl:w-80'
              )}
            >
              <SuggestionsPanel
                suggestions={[...store.suggestions, ...store.inlineSuggestions]}
                onApplySuggestion={applySuggestion}
                searchQuery={store.searchQuery}
                onSearchChange={store.setSearchQuery}
                selectedCategory={store.selectedCategory}
                onCategoryChange={store.setSelectedCategory}
                templates={store.templates}
                isLoadingTemplates={store.isLoadingTemplates}
                onSearchTemplates={() => { searchTemplates(); searchPrompts(); }}
              />
            </div>
          </div>
        </div>

        {/* Template Create Modal */}
        <TemplateCreateModal
          opportunity={store.templateOpportunity}
          optimizedContent={store.streamingOutput}
          onClose={() => store.setTemplateOpportunity(null)}
          onCreate={createTemplate}
        />
      </div>

      {/* Global paywall upgrade modal */}
      <PaywallModal />

      {/* ── Mobile sticky Run button (Write tab only) ── */}
      {activeTab === 'write' && (
        <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95 lg:hidden">
          <button
            type="button"
            onClick={runOptimization}
            disabled={store.isStreaming || !store.prompt.trim()}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200',
              store.isStreaming || !store.prompt.trim()
                ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700/60 dark:text-slate-500'
                : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-violet-700'
            )}
          >
            {store.isStreaming
              ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Optimizing…</span></>
              : <><Zap className="h-4 w-4" /><span>Run Optimize</span></>
            }
          </button>
        </div>
      )}
    </>
  );
}












