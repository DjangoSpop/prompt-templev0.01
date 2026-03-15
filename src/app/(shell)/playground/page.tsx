'use client';

import React, { useState, useCallback, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  Wand2,
  MessageSquare,
  Database,
  Sparkles,
  Lightbulb,
  Play,
  StopCircle,
  Settings2,
  ChevronDown,
  Info,
  Layers,
  RotateCcw,
  BrainCircuit,
  Cpu,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SmartFillPanel } from '@/components/templates/SmartFillPanel';
import {
  usePromptOptimization,
  useDeepSeekStream,
  useRAGRetrieve,
  useRAGAnswer,
  useGenerateWithAI,
  useAISuggestions,
  useAIModels,
  useOptimizeWithAgent,
} from '@/hooks/api/useAI';
import { useEntitlements } from '@/hooks/api/useBilling';
import { PaywallModal } from '@/components/PaywallModal';
import { usePaywallTrigger } from '@/lib/hooks/usePaywallTrigger';
import { CreditBar } from '@/components/playground/CreditBar';
import { PlaygroundOutputPanel } from '@/components/playground/PlaygroundOutputPanel';
import { AskMeWizard } from '@/components/assistant/AskMeWizard';

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceMode = 'optimize' | 'chat' | 'rag' | 'generate' | 'suggestions' | 'askme' | 'agent';

const TAB_PARAM_MAP: Record<string, ServiceMode> = {
  optimize: 'optimize', chat: 'chat', rag: 'rag',
  generate: 'generate', suggestions: 'suggestions',
  askme: 'askme', agent: 'agent',
};

interface ServiceConfig {
  id: ServiceMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  creditEstimate: string;
  creditKey: string;
  badge?: string;
}

const SERVICES: ServiceConfig[] = [
  {
    id: 'optimize',
    label: 'Optimize',
    description: 'Transform any prompt with AI-powered streaming enhancement',
    icon: Wand2,
    creditEstimate: '~3–5',
    creditKey: 'ai_generation',
    badge: 'Popular',
  },
  {
    id: 'chat',
    label: 'Chat',
    description: 'Live streaming conversation with the AI model of your choice',
    icon: MessageSquare,
    creditEstimate: '~2–4',
    creditKey: 'ai_generation',
  },
  {
    id: 'rag',
    label: 'RAG Q&A',
    description: 'Ground answers in your knowledge base via vector retrieval',
    icon: Database,
    creditEstimate: '~4–6',
    creditKey: 'ai_generation',
  },
  {
    id: 'generate',
    label: 'Generate',
    description: 'Direct AI text generation for any creative or technical task',
    icon: Sparkles,
    creditEstimate: '~2–3',
    creditKey: 'ai_generation',
  },
  {
    id: 'suggestions',
    label: 'Suggestions',
    description: 'Get actionable improvement ideas for any prompt instantly',
    icon: Lightbulb,
    creditEstimate: '~1–2',
    creditKey: 'ai_generation',
  },
  {
    id: 'askme',
    label: 'AskMe',
    description: 'AI interviews you with targeted questions then builds your perfect prompt',
    icon: BrainCircuit,
    creditEstimate: '~2–4',
    creditKey: 'ai_generation',
    badge: 'Wizard',
  },
  {
    id: 'agent',
    label: 'Deep Optimize',
    description: 'RAG-powered agent optimization — retrieves context then deeply enhances your prompt',
    icon: Cpu,
    creditEstimate: '~4–6',
    creditKey: 'ai_generation',
    badge: 'RAG',
  },
];

const MODEL_ROLE_MAP: Record<ServiceMode, 'user' | 'system'> = {
  optimize: 'user', chat: 'user', rag: 'user',
  generate: 'user', suggestions: 'user', askme: 'user', agent: 'user',
};

// ─── Settings Panel ───────────────────────────────────────────────────────────

interface ModelSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

function SettingsPanel({
  settings,
  onChange,
  models,
  mode,
}: {
  settings: ModelSettings;
  onChange: (s: Partial<ModelSettings>) => void;
  models: string[];
  mode: ServiceMode;
}) {
  return (
    <div className="space-y-3 p-4 bg-bg-secondary rounded-xl border border-border">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Model Settings</p>

      {/* Model selector */}
      <div>
        <label className="block text-xs text-text-muted mb-1">Model</label>
        <select
          aria-label="AI model"
          value={settings.model}
          onChange={(e) => onChange({ model: e.target.value })}
          className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {models.length > 0
            ? models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))
            : [
                <option key="deepseek-chat" value="deepseek-chat">deepseek-chat</option>,
                <option key="gpt-4o" value="gpt-4o">gpt-4o</option>,
                <option key="claude-3-5-sonnet" value="claude-3-5-sonnet">claude-3-5-sonnet</option>,
              ]}
        </select>
      </div>

      {/* Temperature */}
      <div>
        <label className="flex justify-between text-xs text-text-muted mb-1">
          <span>Temperature</span>
          <span className="font-mono text-brand">{settings.temperature.toFixed(1)}</span>
        </label>
        <input
          type="range"
          aria-label="Temperature"
          min="0"
          max="1"
          step="0.1"
          value={settings.temperature}
          onChange={(e) => onChange({ temperature: parseFloat(e.target.value) })}
          className="w-full accent-brand"
        />
      </div>

      {/* Max tokens */}
      <div>
        <label className="flex justify-between text-xs text-text-muted mb-1">
          <span>Max Tokens</span>
          <span className="font-mono text-brand">{settings.maxTokens}</span>
        </label>
        <input
          type="range"
          aria-label="Max tokens"
          min="256"
          max="4096"
          step="128"
          value={settings.maxTokens}
          onChange={(e) => onChange({ maxTokens: parseInt(e.target.value) })}
          className="w-full accent-brand"
        />
      </div>

      {/* System prompt — chat / generate only */}
      {(mode === 'chat' || mode === 'generate') && (
        <div>
          <label className="block text-xs text-text-muted mb-1">System Prompt (optional)</label>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => onChange({ systemPrompt: e.target.value })}
            placeholder="You are a helpful assistant…"
            rows={3}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-brand resize-none"
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Playground Component ────────────────────────────────────────────────

// Extract {variable} or {{variable}} names from a prompt string
function extractVariables(text: string): Record<string, string> {
  const seen = new Set<string>();
  const result: Record<string, string> = {};
  const regex = /\{\{?\s*(\w+)\s*\}?\}/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const key = m[1];
    if (!seen.has(key)) {
      seen.add(key);
      result[key] = '';
    }
  }
  return result;
}

function PlaygroundInner() {
  const searchParams = useSearchParams();
  const initialTab = TAB_PARAM_MAP[searchParams.get('tab') ?? ''] ?? 'optimize';

  // URL params — library can link here with ?templateId=&content=&title=
  const urlTemplateId = searchParams.get('templateId') ?? '';
  const urlContent = searchParams.get('content') ?? '';
  const urlTitle = searchParams.get('title') ?? '';

  // Service & UI state
  const [mode, setMode] = useState<ServiceMode>(initialTab);
  const [prompt, setPrompt] = useState(() =>
    urlContent ? decodeURIComponent(urlContent) : ''
  );
  const [showSettings, setShowSettings] = useState(false);

  // Smart Fill state
  const [smartFillOpen, setSmartFillOpen] = useState(false);
  const promptVariables = useMemo(() => extractVariables(prompt), [prompt]);
  const hasVariables = Object.keys(promptVariables).length > 0;
  const [settings, setSettings] = useState<ModelSettings>({
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 1024,
    systemPrompt: '',
  });

  // Output accumulator for modes that aren't self-managed
  const [generateOutput, setGenerateOutput] = useState('');
  const [suggestionsOutput, setSuggestionsOutput] = useState<string[]>([]);
  const [ragAnswer, setRagAnswer] = useState('');
  const [ragChunks, setRagChunks] = useState<Array<{ content: string; source?: string; score?: number }>>([])
  const [agentOutput, setAgentOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Paywall
  const { checkAndTrigger } = usePaywallTrigger();

  // Billing
  const { data: entitlements } = useEntitlements();

  // AI hooks
  const {
    optimize: runOptimize,
    cancel: cancelOptimize,
    isStreaming: isOptimizing,
    output: optimizeOutput,
    result: optimizeResult,
    error: optimizeError,
  } = usePromptOptimization();

  const {
    stream: runChat,
    cancel: cancelChat,
    isStreaming: isChatStreaming,
    output: chatOutput,
  } = useDeepSeekStream();

  const ragRetrieve = useRAGRetrieve();
  const ragAnswerMutation = useRAGAnswer();
  const generateMutation = useGenerateWithAI();
  const suggestionsMutation = useAISuggestions();
  const agentMutation = useOptimizeWithAgent();

  // Models
  const { data: modelsData } = useAIModels();
  const modelList: string[] = React.useMemo(() => {
    if (!modelsData) return [];
    if (Array.isArray(modelsData)) return (modelsData as any[]).map((m: any) => m.id ?? m.name ?? String(m));
    if ((modelsData as any).models) return (modelsData as any).models.map((m: any) => m.id ?? m.name ?? String(m));
    return [];
  }, [modelsData]);

  // ─── Derived streaming/running state ───────────────────────────────────────

  const isAnyStreaming = isOptimizing || isChatStreaming || isRunning;
  const activeOutput =
    mode === 'optimize' ? optimizeOutput :
    mode === 'chat' ? chatOutput :
    mode === 'rag' ? ragAnswer :
    mode === 'generate' ? generateOutput :
    mode === 'agent' ? agentOutput :
    '';

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const abort = useCallback(() => {
    if (mode === 'optimize') cancelOptimize();
    else if (mode === 'chat') cancelChat();
    setIsRunning(false);
  }, [mode, cancelOptimize, cancelChat]);

  const handleRun = useCallback(async () => {
    if (!prompt.trim()) {
      toast.warning('Please enter a prompt first.');
      return;
    }

    // Credit guard
    if (!checkAndTrigger()) {
      return;
    }

    try {
      if (mode === 'optimize') {
        await runOptimize({
          original: prompt,
          model: settings.model,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
        });
      } else if (mode === 'chat') {
        const messages = settings.systemPrompt
          ? [
              { role: 'system' as const, content: settings.systemPrompt },
              { role: 'user' as const, content: prompt },
            ]
          : [{ role: 'user' as const, content: prompt }];
        await runChat({ messages, model: settings.model });
      } else if (mode === 'rag') {
        setIsRunning(true);
        setRagAnswer('');
        setRagChunks([]);
        // Step 1 — retrieve context (trim trailing newlines from textarea)
        const retrieved = await ragRetrieve.mutateAsync({ query: prompt.trim() });
        const chunks =
          (retrieved as any)?.chunks ??
          (retrieved as any)?.results ??
          (retrieved as any)?.context?.results ??
          [];
        setRagChunks(chunks);
        // Step 2 — generate answer grounded in context
        const answer = await ragAnswerMutation.mutateAsync({ query: prompt.trim(), context: retrieved });
        setRagAnswer(
          (answer as any)?.answer ??
          (answer as any)?.response ??
          (answer as any)?.optimized ??
          (answer as any)?.text ??
          (answer as any)?.content ??
          String(answer)
        );
        setIsRunning(false);
      } else if (mode === 'generate') {
        setIsRunning(true);
        setGenerateOutput('');
        const result = await generateMutation.mutateAsync({
          prompt,
          model: settings.model,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          system: settings.systemPrompt || undefined,
        });
        setGenerateOutput((result as any)?.text ?? (result as any)?.content ?? String(result));
        setIsRunning(false);
      } else if (mode === 'agent') {
        setIsRunning(true);
        setAgentOutput('');
        const result = await agentMutation.mutateAsync({
          session_id: `playground-${Date.now()}`,
          original: prompt,
          mode: 'deep',
          context: settings.systemPrompt ? { intent: settings.systemPrompt } : undefined,
          budget: { max_credits: 6 },
        });
        setAgentOutput((result as any)?.optimized ?? (result as any)?.text ?? String(result));
        setIsRunning(false);
      } else if (mode === 'suggestions') {
        setIsRunning(true);
        setSuggestionsOutput([]);
        const result = await suggestionsMutation.mutateAsync({ prompt, model: settings.model });

        // Normalise any item shape → string
        const toStr = (s: any): string => {
          if (typeof s === 'string') return s;
          return s?.text ?? s?.suggestion ?? s?.description ?? s?.content ?? JSON.stringify(s);
        };

        const rawList: any[] = Array.isArray(result)
          ? result
          : (result as any)?.suggestions ?? (result as any)?.results ?? [];

        const list: string[] = rawList.map(toStr).filter(Boolean);
        setSuggestionsOutput(list);
        setIsRunning(false);
      }
    } catch (err: any) {
      setIsRunning(false);
      if (err?.status === 402 || err?.code === 'INSUFFICIENT_CREDITS') {
        checkAndTrigger();
      }
    }
  }, [
    prompt, mode, settings,
    runOptimize, runChat, ragRetrieve, ragAnswerMutation,
    generateMutation, suggestionsMutation, agentMutation,
    checkAndTrigger,
  ]);

  const handleReset = useCallback(() => {
    setPrompt('');
    setGenerateOutput('');
    setSuggestionsOutput([]);
    setRagAnswer('');
    setRagChunks([]);
    setAgentOutput('');
  }, []);

  const handleInsertSuggestion = useCallback((text: string) => {
    setPrompt(text);
    setMode('optimize');
    toast.success('Suggestion loaded — ready to optimize!');
  }, []);

  // Smart Fill — apply AI suggestions back into the prompt
  const handleSmartFillApply = useCallback((suggestions: Record<string, string>) => {
    setPrompt((prev) => {
      let filled = prev;
      Object.entries(suggestions).forEach(([key, value]) => {
        filled = filled.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
        filled = filled.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
      return filled;
    });
    toast.success('Variables filled — ready to run!');
  }, []);

  const serviceConfig = SERVICES.find((s) => s.id === mode)!;

  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)] bg-bg-primary pb-20 lg:pb-0">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-border bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10">
            <Layers className="w-4 h-4 text-brand" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-text-primary">AI Playground</h1>
            <p className="text-xs text-text-muted hidden sm:block">Bundle of all AI services — powered by your credits</p>
          </div>
        </div>
        <div className="scale-90 sm:scale-100 origin-right"><CreditBar /></div>
      </div>

      {/* ── Service Tabs ── */}
      <div className="px-3 py-2 md:px-6 md:py-3 border-b border-border overflow-x-auto">
        <div className="flex gap-1.5 md:gap-2 min-w-max">
          {SERVICES.map((svc) => {
            const Icon = svc.icon;
            const active = mode === svc.id;
            return (
              <button
                type="button"
                key={svc.id}
                onClick={() => setMode(svc.id)}
                className={cn(
                  'flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap',
                  active
                    ? 'bg-brand text-white shadow-sm'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary hover:text-text-primary border border-border'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {svc.label}
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-semibold hidden sm:inline',
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-bg-tertiary text-text-muted'
                )}>
                  {svc.creditEstimate} cr
                </span>
                {svc.badge && (
                  <span className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide',
                    active ? 'bg-white/30 text-white' : 'bg-brand/10 text-brand'
                  )}>
                    {svc.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Body ── */}
      <div className="flex flex-col lg:flex-row gap-0">

        {/* AskMe — full-width wizard, replaces split layout */}
        {mode === 'askme' && (
          <div className="p-4 md:p-6 overflow-y-auto min-h-[500px]">
            <div className="max-w-2xl mx-auto">
              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-brand/5 border border-brand/20">
                <BrainCircuit className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  Describe what you want to build in the box below. The AI will ask you targeted questions, then generate a highly specific prompt tailored to your needs.
                </p>
              </div>
              <AskMeWizard className="w-full" />
            </div>
          </div>
        )}

        {/* Left — Input Panel (hidden for askme) */}
        {mode !== 'askme' && (
        <div className="w-full lg:w-[45%] flex flex-col border-b lg:border-b-0 lg:border-r border-border p-4 gap-4 min-w-0">

          {/* Service description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-start gap-2 p-3 rounded-lg bg-brand/5 border border-brand/20"
            >
              <Info className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary leading-relaxed">{serviceConfig.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Prompt textarea */}
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">
              {mode === 'suggestions' ? 'Prompt to Improve' :
               mode === 'chat' ? 'Your Message' :
               mode === 'rag' ? 'Your Question' :
               mode === 'agent' ? 'Prompt to deep-optimize' :
               'Prompt'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'optimize' ? 'Write me a blog post about artificial intelligence and its impact on society…' :
                mode === 'chat' ? 'Ask anything — the AI will respond in real time…' :
                mode === 'rag' ? 'What does the documentation say about authentication flows?' :
                mode === 'generate' ? 'Generate a product description for a noise-cancelling headphone…' :
                mode === 'agent' ? 'Paste the prompt you want deeply optimized using knowledge retrieval…' :
                'Enter a prompt to get improvement suggestions…'
              }
              disabled={isAnyStreaming}
              className={cn(
                'w-full min-h-[150px] md:min-h-[200px] lg:min-h-[300px] resize-y bg-bg-secondary border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted leading-relaxed',
                'focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all',
                isAnyStreaming ? 'opacity-60 cursor-not-allowed border-border' : 'border-border hover:border-border-hover'
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isAnyStreaming) {
                  handleRun();
                }
              }}
            />
            <p className="text-xs text-text-muted mt-1 text-right">
              {prompt.length} chars · Ctrl+Enter to run
            </p>
          </div>

          {/* Settings toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors self-start"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Model settings
            <ChevronDown className={cn('w-3 h-3 transition-transform', showSettings && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <SettingsPanel
                  settings={settings}
                  onChange={(partial) => setSettings((s) => ({ ...s, ...partial }))}
                  models={modelList}
                  mode={mode}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex items-center gap-x-3 gap-y-2 flex-wrap">
            {isAnyStreaming ? (
              <button
                type="button"
                onClick={abort}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-sm font-medium hover:bg-red-500/20 transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRun}
                disabled={!prompt.trim()}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  prompt.trim()
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md'
                    : 'bg-secondary text-muted-foreground border border-border cursor-not-allowed opacity-60'
                )}
              >
                <Play className="w-4 h-4" />
                Run
                <span className="text-xs opacity-70">{serviceConfig.creditEstimate} cr</span>
              </button>
            )}

            {/* Smart Fill — enabled when prompt has {variables} and a templateId */}
            {hasVariables && urlTemplateId && (
              <button
                type="button"
                onClick={() => setSmartFillOpen(true)}
                disabled={isAnyStreaming}
                title="AI-fill template variables"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all',
                  isAnyStreaming
                    ? 'opacity-40 cursor-not-allowed border-border text-muted-foreground'
                    : 'border-primary/40 text-primary hover:bg-primary/10 hover:border-primary'
                )}
              >
                <Wand2 className="w-3.5 h-3.5" />
                Smart Fill
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              disabled={isAnyStreaming}
              className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              title="Clear"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Live credit status */}
            {entitlements && (
              <p className="text-xs text-text-muted ml-auto">
                <span className={cn(
                  'font-medium',
                  (entitlements.credits_balance ?? 0) < 20 ? 'text-orange-400' : 'text-text-primary'
                )}>
                  {entitlements.credits_balance?.toLocaleString() ?? '—'}
                </span>{' '}
                credits remaining
              </p>
            )}
          </div>

          {/* Error display */}
          {optimizeError && mode === 'optimize' && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {optimizeError}
            </p>
          )}
        </div>
        )} {/* end mode !== 'askme' left panel */}

        {/* Right — Output Panel (hidden for askme) */}
        {mode !== 'askme' && (
        <div className="p-4 min-h-[300px] lg:min-h-0 lg:flex-1">
          <PlaygroundOutputPanel
            mode={mode}
            isStreaming={isAnyStreaming}
            output={activeOutput}
            result={mode === 'optimize' ? optimizeResult : null}
            originalPrompt={prompt}
            suggestions={mode === 'suggestions' ? suggestionsOutput : undefined}
            ragContext={mode === 'rag' ? { chunks: ragChunks } : undefined}
            className="h-full"
            onInsertSuggestion={mode === 'suggestions' ? handleInsertSuggestion : undefined}
          />
        </div>
        )} {/* end mode !== 'askme' right panel */}
      </div>

      {/* Paywall Modal (self-managed via Zustand store) */}
      <PaywallModal />

      {/* Smart Fill panel — only when a templateId is known */}
      {urlTemplateId && (
        <SmartFillPanel
          open={smartFillOpen}
          onOpenChange={setSmartFillOpen}
          templateId={urlTemplateId}
          templateTitle={urlTitle || undefined}
          templatePreview={prompt.substring(0, 150)}
          variables={promptVariables}
          onApply={handleSmartFillApply}
        />
      )}
    </div>
  );
}

// ─── Page Export (with Suspense for useSearchParams safety) ──────────────────

export default function PlaygroundPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen text-text-muted text-sm">
        Loading AI Playground…
      </div>
    }>
      <PlaygroundInner />
    </Suspense>
  );
}
