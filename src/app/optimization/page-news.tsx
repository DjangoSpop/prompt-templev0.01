'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Copy,
  Save,
  GitBranch,
  Zap,
  AlertCircle,
  Settings,
  DollarSign,
  Clock,
  ChevronRight,
  Loader2,
  Check,
  X,
  FileText,
  Lightbulb,
  TrendingUp,
  Hash,
  BookOpen,
  Code,
  Briefcase,
  Heart,
  Target,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Transport & client classes
class ChatSSEClient {
  private abortController: AbortController | null = null;
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  onStreamStart?: (data: any) => void;
  onStreamToken?: (data: any) => void;
  onStreamComplete?: (data: any) => void;
  onError?: (error: any) => void;
  onTemplateOpportunity?: (data: any) => void;

  async sendMessage(
    messages: Array<{ role: string; content: string }>,
    options: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
      session_id?: string;
    } = {}
  ): Promise<void> {
    this.disconnect();
    this.abortController = new AbortController();

    const token = this.getValidToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${this.baseUrl}/api/v2/chat/completions/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages,
          model: options.model || 'deepseek-chat',
          stream: true,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2048,
          session_id: options.session_id,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          this.handleSSELine(line);
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        this.onError?.(error);
      }
    }
  }

  private handleSSELine(line: string) {
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
        
        if (parsed.stream_start) {
          this.onStreamStart?.(parsed);
        } else if (parsed.stream_complete) {
          this.onStreamComplete?.(parsed);
        } else if (parsed.error) {
          this.onError?.(parsed);
        } else if (parsed.template_opportunity) {
          this.onTemplateOpportunity?.(parsed);
        } else if (parsed.choices?.[0]?.delta?.content) {
          this.onStreamToken?.(parsed.choices[0].delta);
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
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
      return null;
    }
    return token;
  }
}

// WebSocket fallback
class PromptCraftWebSocket {
  private socket: WebSocket | null = null;
  private messageQueue: any[] = [];
  private isConnected = false;
  
  onMessage?: (data: any) => void;
  onOptimizationResult?: (data: any) => void;
  onTemplateOpportunity?: (data: any) => void;
  onError?: (error: any) => void;

  connect(sessionId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const token = this.getValidToken();
      const wsUrl = token 
        ? `ws://localhost:8000/ws/chat/${sessionId}/?token=${token}`
        : `ws://localhost:8000/ws/chat/${sessionId}/`;

      try {
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
          this.isConnected = true;
          this.processQueue();
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        };

        this.socket.onerror = (error) => {
          this.onError?.(error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'message':
        this.onMessage?.(message);
        break;
      case 'optimization_result':
        this.onOptimizationResult?.(message);
        break;
      case 'template_opportunity':
        this.onTemplateOpportunity?.(message);
        break;
      case 'error':
        this.onError?.(message);
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
    this.socket?.close();
    this.socket = null;
    this.isConnected = false;
  }

  private getValidToken(): string | null {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token || token === 'undefined' || token === 'null') return null;
    return token;
  }
}

// Types
interface OptimizationResult {
  original: string;
  optimized: string;
  improvements: string[];
  suggestions: string[];
  confidence: number;
  processingTime: number;
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
}

interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

// Main component
export default function OptimizePlayground() {
  // Transport state
  const [transport, setTransport] = useState<'sse' | 'ws'>('sse');
  const sseClient = useRef<ChatSSEClient | null>(null);
  const wsClient = useRef<PromptCraftWebSocket | null>(null);
  
  // UI state
  const [prompt, setPrompt] = useState('');
  const [streamingOutput, setStreamingOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2048,
  });
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationResult[]>([]);
  const [templateOpportunity, setTemplateOpportunity] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Calculate cost & latency
  const estimatedCost = useMemo(() => {
    const inputTokens = prompt.length / 4; // rough estimate
    const outputTokens = modelConfig.maxTokens;
    const costPerMillion = 0.5; // DeepSeek pricing
    return ((inputTokens + outputTokens) / 1_000_000) * costPerMillion;
  }, [prompt, modelConfig.maxTokens]);

  const estimatedLatency = useMemo(() => {
    return Math.max(100, Math.min(2000, prompt.length * 0.5 + modelConfig.maxTokens * 0.2));
  }, [prompt, modelConfig.maxTokens]);

  // Initialize transport
  useEffect(() => {
    const transportMode = process.env.NEXT_PUBLIC_CHAT_TRANSPORT || 'sse';
    setTransport(transportMode as 'sse' | 'ws');

    if (transportMode === 'sse') {
      sseClient.current = new ChatSSEClient();
      
      sseClient.current.onStreamStart = (data) => {
        console.log('Stream started:', data);
        setIsStreaming(true);
        setStreamingOutput('');
      };

      sseClient.current.onStreamToken = (delta) => {
        if (delta.content) {
          setStreamingOutput(prev => prev + delta.content);
        }
      };

      sseClient.current.onStreamComplete = (data) => {
        console.log('Stream complete:', data);
        setIsStreaming(false);
      };

      sseClient.current.onTemplateOpportunity = (data) => {
        setTemplateOpportunity(data);
        toast.info('Template opportunity detected!');
      };

      sseClient.current.onError = (error) => {
        console.error('SSE error:', error);
        toast.error(error.message || 'Connection error');
        setIsStreaming(false);
      };
    } else {
      wsClient.current = new PromptCraftWebSocket();
      const sessionId = `optimize_${Date.now()}`;
      
      wsClient.current.connect(sessionId).catch(console.error);
      
      wsClient.current.onOptimizationResult = (result) => {
        setOptimizationHistory(prev => [result, ...prev].slice(0, 10));
        setStreamingOutput(result.optimized_prompt);
        setSuggestions(result.suggestions || []);
      };
      
      wsClient.current.onTemplateOpportunity = (data) => {
        setTemplateOpportunity(data.suggestion);
      };
    }

    return () => {
      sseClient.current?.disconnect();
      wsClient.current?.disconnect();
    };
  }, []);

  // Search templates
  const searchTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await fetch(`/api/v2/templates/?${params}`, { headers });
      const data = await response.json();
      setTemplates(data.results || []);
    } catch (error) {
      console.error('Failed to search templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [searchQuery, selectedCategory]);

  // Run optimization
  const runOptimization = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to optimize');
      return;
    }

    if (transport === 'sse' && sseClient.current) {
      await sseClient.current.sendMessage(
        [{ role: 'user', content: `Optimize this prompt: ${prompt}` }],
        {
          model: modelConfig.model,
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.maxTokens,
          session_id: `optimize_${Date.now()}`,
        }
      );
    } else if (wsClient.current) {
      wsClient.current.send({
        type: 'optimize_prompt',
        prompt,
        context: { mode: 'enhancement' },
        optimization_type: 'enhancement',
      });
    }
  }, [prompt, transport, modelConfig]);

  // Save as template
  const saveAsTemplate = useCallback(async () => {
    if (!streamingOutput) {
      toast.error('No optimized content to save');
      return;
    }

    if (wsClient.current) {
      wsClient.current.send({
        type: 'save_conversation_as_template',
        title: `Optimized: ${prompt.slice(0, 50)}...`,
        category: 'Optimization',
        include_ai_responses: true,
        description: 'AI-optimized prompt template',
      });
      toast.success('Template saved!');
    } else {
      // Direct API call for SSE mode
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/v2/templates/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify({
            title: `Optimized: ${prompt.slice(0, 50)}...`,
            description: 'AI-optimized prompt template',
            template_content: streamingOutput,
            category: 1, // Default category ID
            is_public: false,
          }),
        });

        if (response.ok) {
          toast.success('Template saved successfully!');
          searchTemplates(); // Refresh templates
        }
      } catch (error) {
        toast.error('Failed to save template');
      }
    }
  }, [streamingOutput, prompt, searchTemplates]);

  // Fork version
  const forkVersion = useCallback(() => {
    const forkedContent = `${streamingOutput}\n\n[Forked variant]:\n`;
    setPrompt(forkedContent);
    setStreamingOutput('');
    toast.info('Created fork - edit and re-optimize');
  }, [streamingOutput]);

  // Apply suggestion
  const applySuggestion = useCallback((suggestion: string) => {
    setPrompt(suggestion);
    runOptimization();
  }, [runOptimization]);

  // Category options
  const categories = [
    { id: 'all', label: 'All Categories', icon: Hash },
    { id: 'creative', label: 'Creative Writing', icon: BookOpen },
    { id: 'technical', label: 'Technical', icon: Code },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'personal', label: 'Personal', icon: Heart },
  ];

  // Quick suggestions
  const quickSuggestions = [
    'Optimize for clarity and conciseness',
    'Make it more persuasive and action-oriented',
    'Add specific constraints and examples',
    'Improve structure with clear sections',
    'Enhance for technical accuracy',
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Left Panel - Prompt Editor */}
      <div className="flex w-1/2 flex-col border-r border-slate-200 bg-white">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Optimize Playground</h1>
              <p className="mt-1 text-sm text-slate-600">
                Transform your prompts with AI-powered optimization
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm",
                transport === 'sse' 
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              )}>
                <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
                {transport === 'sse' ? 'SSE Active' : 'WebSocket Active'}
              </div>
            </div>
          </div>
        </div>

        {/* Model Configuration */}
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-slate-500" />
              <select
                value={modelConfig.model}
                onChange={(e) => setModelConfig({ ...modelConfig, model: e.target.value })}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
              >
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Temperature:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={modelConfig.temperature}
                onChange={(e) => setModelConfig({ ...modelConfig, temperature: parseFloat(e.target.value) })}
                className="w-24"
              />
              <span className="text-sm font-medium">{modelConfig.temperature}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Max Tokens:</label>
              <input
                type="number"
                value={modelConfig.maxTokens}
                onChange={(e) => setModelConfig({ ...modelConfig, maxTokens: parseInt(e.target.value) })}
                className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
              />
            </div>

            <div className="ml-auto flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-slate-600">
                <DollarSign className="h-3.5 w-3.5" />
                <span>${estimatedCost.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="h-3.5 w-3.5" />
                <span>~{estimatedLatency}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Editor */}
        <div className="flex-1 p-6">
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Input Prompt</label>
              <span className="text-xs text-slate-500">{prompt.length} characters</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here... Be specific about what you want to achieve."
              className="flex-1 resize-none rounded-lg border border-slate-200 p-4 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            {/* Quick Suggestions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Quick optimizations:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => applySuggestion(`${prompt}\n\n${suggestion}`)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={runOptimization}
                disabled={isStreaming || !prompt.trim()}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors",
                  isStreaming
                    ? "bg-slate-100 text-slate-400"
                    : "bg-blue-600 text-white hover:bg-blue-700"
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

              <button
                onClick={saveAsTemplate}
                disabled={!streamingOutput}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 font-medium hover:bg-slate-50"
              >
                <Save className="h-4 w-4" />
                <span>Save as Template</span>
              </button>

              <button
                onClick={forkVersion}
                disabled={!streamingOutput}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 font-medium hover:bg-slate-50"
              >
                <GitBranch className="h-4 w-4" />
                <span>Fork</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Output & Suggestions */}
      <div className="flex w-1/2 flex-col bg-slate-50">
        {/* Search & Templates */}
        <div className="border-b border-slate-200 bg-white p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchTemplates()}
                placeholder="Search templates and suggestions..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={searchTemplates}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          {/* Category Filter */}
          <div className="mt-3 flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedCategory === cat.id
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Streaming Output */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Output Display */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-700">Optimized Output</h3>
                {streamingOutput && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(streamingOutput);
                      toast.success('Copied to clipboard');
                    }}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                )}
              </div>
              <div className={cn(
                "min-h-[200px] rounded-lg border p-4",
                isStreaming ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-white"
              )}>
                {streamingOutput ? (
                  <div className="whitespace-pre-wrap font-mono text-sm text-slate-800">
                    {streamingOutput}
                    {isStreaming && <span className="animate-pulse">▊</span>}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Optimized output will appear here...
                  </p>
                )}
              </div>
            </div>

            {/* Template Opportunity */}
            <AnimatePresence>
              {templateOpportunity && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-lg border border-green-200 bg-green-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900">Template Opportunity Detected!</h4>
                      <p className="mt-1 text-sm text-green-700">
                        {templateOpportunity.title || 'This could make a great reusable template'}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => {
                            saveAsTemplate();
                            setTemplateOpportunity(null);
                          }}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                        >
                          Create Template
                        </button>
                        <button
                          onClick={() => setTemplateOpportunity(null)}
                          className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-slate-700">Inline Suggestions</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => applySuggestion(suggestion)}
                      className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left hover:bg-slate-50"
                    >
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Template Results */}
            {templates.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-slate-700">Template Library</h3>
                <div className="space-y-2">
                  {templates.slice(0, 5).map((template) => (
                    <div
                      key={template.id}
                      className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{template.title}</h4>
                          <p className="mt-1 text-xs text-slate-600">{template.description}</p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {template.usage_count} uses
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {template.average_rating.toFixed(1)} rating
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// End of OptimizePlayground component
