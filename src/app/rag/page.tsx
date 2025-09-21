'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, AlertTriangle, Database, Zap } from 'lucide-react';
import SSEChatInterface from '@/components/SSEChatInterface';
import SSEHealthCheck from '@/components/SSEHealthCheck';
import { toast } from 'sonner';

interface RagOptimizeResult {
  original: string;
  optimized: string;
  improvements?: string[];
  service_info?: Record<string, unknown>;
}

export default function RagPage() {
  const [isEnabled, setIsEnabled] = useState(false /* RAG enabled status */);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check RAG status
    const checkRagStatus = async () => {
      try {
        const response = await fetch('https://api.prompt-temple.com/api/v2/core/rag/status/');
        const data = await response.json();
        // Backend returns { feature_enabled, service_ready, ... } — support that shape,
        // but fall back to old `enabled` key if present for compatibility.
        const featureEnabled =
          typeof data === 'object' && data !== null
            ? ('feature_enabled' in data ? (data as any).feature_enabled : (data as any).enabled)
            : false;
        const serviceReady =
          typeof data === 'object' && data !== null
            ? ('service_ready' in data ? (data as any).service_ready : true)
            : false;
        setIsEnabled(Boolean(featureEnabled && serviceReady));
      } catch (error) {
        console.error('Failed to check RAG status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRagStatus();
  }, []);

  // RAG Optimize form state
  const [promptInput, setPromptInput] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<RagOptimizeResult | null>(null);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);

  const callRagOptimize = useCallback(async () => {
    const p = promptInput.trim();
    if (!p) return;
    setIsOptimizing(true);
    setOptimizeError(null);
    try {
      const token = localStorage.getItem('access_token');
      const resp = await fetch('/api/v2/rag/optimize/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ prompt: p }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      setOptimizeResult(data);
      toast.success('RAG optimization complete — copied to result area');
    } catch (err: unknown) {
      console.error('RAG optimize failed', err);
  const message = err instanceof Error ? err.message : String(err);
      setOptimizeError(message || 'Optimization failed');
      toast.error('RAG optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  }, [promptInput]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-gold-accent">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-gold-accent" />
            </div>
            <CardTitle className="text-2xl">RAG Temporarily Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              The Retrieval-Augmented Generation feature is currently disabled or not ready.
              Please check back later or contact support for more information.
            </p>
            <Badge variant="outline" className="border-gold-accent text-gold-accent">
              Feature Disabled
            </Badge>
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
                <Database className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Zap className="h-6 w-6 text-pharaoh animate-pulse" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-hieroglyph text-glow mb-4">
            RAG Knowledge Oracle
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Retrieval-Augmented Generation chat powered by SSE streaming. 
            Query your knowledge base with enhanced AI responses.
          </p>

          {/* RAG Optimize quick action */}
          <div className="max-w-2xl mx-auto mt-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Optimize a prompt with RAG</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Send a prompt to the RAG optimizer and get an enhanced version returned by the LangChain-based service.</p>
              <textarea
                id="rag-prompt-input"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Enter or paste a prompt to optimize..."
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 p-3 mb-3 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                rows={3}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={callRagOptimize}
                  disabled={isOptimizing || !promptInput.trim()}
                  className="rounded-lg bg-pharaoh px-4 py-2 text-sm font-medium text-white hover:brightness-95 disabled:opacity-50"
                >
                  {isOptimizing ? 'Optimizing…' : 'Optimize with RAG'}
                </button>
                <button
                  onClick={() => { setPromptInput(''); setOptimizeResult(null); setOptimizeError(null); }}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  Clear
                </button>
                {optimizeResult && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(optimizeResult.optimized || '');
                      toast.success('Optimized prompt copied to clipboard — paste into chat input');
                    }}
                    className="ml-auto rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
                  >
                    Copy Optimized
                  </button>
                )}
              </div>

              {isOptimizing && (
                <div className="mt-3 text-sm text-slate-500">Running RAG optimization… this should be quick.</div>
              )}
              {optimizeError && (
                <div className="mt-3 text-sm text-red-500">{optimizeError}</div>
              )}
              {optimizeResult && (
                <div className="mt-4 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">Optimized result</div>
                  <pre className="whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100">{optimizeResult.optimized}</pre>
                </div>
              )}
            </div>
          </div>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Database className="h-4 w-4" />
              RAG Enhanced
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Zap className="h-4 w-4" />
              SSE Streaming
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Bot className="h-4 w-4" />
              Knowledge Retrieval
            </Badge>
          </div>
        </div>

        {/* Health Check */}
        <div className="max-w-md mx-auto mb-6">
          <SSEHealthCheck />
        </div>

        {/* Main RAG Chat Interface */}
        <div className="max-w-6xl mx-auto">
          <Card className="h-[700px]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-500" />
                <span>RAG Chat Interface</span>
                <Badge variant="secondary">SSE Powered</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full p-0">
              <SSEChatInterface 
                className="h-full"
                enableOptimization={true}
                enableAnalytics={true}
                onPromptOptimized={(result) => {
                  console.log('RAG prompt optimized:', result);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
