'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePromptOptimization, useAIModels, useAIUsage } from '@/hooks/api/useAI';
import { AskMeWizard } from '@/components/assistant/AskMeWizard';

import {
  Zap,
  Download,
  Copy,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Settings,
  RotateCcw,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OptimizationResult } from '@/hooks/useStreamingChat';

type OptimizerTab = 'optimize' | 'guided';

const FALLBACK_PROVIDERS: { id: string; name: string; models: string[] }[] = [
  { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
  { id: 'openai',   name: 'OpenAI',   models: ['gpt-4', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Anthropic', models: ['claude-3-opus', 'claude-instant'] },
];

function OptimizerPageInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<OptimizerTab>(
    searchParams.get('mode') === 'guided' ? 'guided' : 'optimize'
  );
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('deepseek');
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationResult[]>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState({
    focus: 'clarity',
    creativity: 0.7,
    specificity: 0.8,
    safety: true,
    includeExamples: true,
    targetAudience: 'general',
  });

  // Real API hooks
  const { optimize, isStreaming, output, result, error } = usePromptOptimization();
  const { data: modelsData } = useAIModels();
  const { data: usageData } = useAIUsage();

  // Group API models by provider; fall back to static list when API is empty
  const providers = useMemo(() => {
    if (modelsData && (modelsData as any[]).length > 0) {
      const grouped: Record<string, string[]> = {};
      (modelsData as any[]).forEach((m: any) => {
        const provider = m.provider?.name || m.provider_name || m.provider || 'DeepSeek';
        if (!grouped[provider]) grouped[provider] = [];
        grouped[provider].push(m.name || m.model_id || m.id);
      });
      return Object.entries(grouped).map(([name, models]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        models,
      }));
    }
    return FALLBACK_PROVIDERS;
  }, [modelsData]);

  // Map streaming result → OptimizationResult shape the UI expects
  useEffect(() => {
    if (result) {
      const mapped: OptimizationResult = {
        original_prompt: inputPrompt,
        optimized_prompt: result.optimized || output,
        improvements: result.suggestions ?? [],
        confidence: ((result as any).scores?.overall ?? 0) / 10,
        processing_time_ms: result.usage?.tokens_out ?? 0,
      };
      setOptimizationResult(mapped);
      setOptimizationHistory(prev => [mapped, ...prev].slice(0, 10));
    }
  }, [result]);

  // Fallback: if backend sends only token stream (no final result blob), build result from accumulated output
  useEffect(() => {
    if (!isStreaming && output && !result && !optimizationResult) {
      const mapped: OptimizationResult = {
        original_prompt: inputPrompt,
        optimized_prompt: output,
        improvements: [],
        confidence: 0.85,
        processing_time_ms: 0,
      };
      setOptimizationResult(mapped);
      setOptimizationHistory(prev => [mapped, ...prev].slice(0, 10));
    }
  }, [isStreaming, output, result, optimizationResult, inputPrompt]);

  const handleOptimize = async () => {
    if (!inputPrompt.trim()) return;
    setOptimizationResult(null);
    await optimize({
      original: inputPrompt,
      session_id: `optimize_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      model: selectedModel,
      mode: 'fast',
      context: {
        focus: optimizationSettings.focus,
        target_audience: optimizationSettings.targetAudience,
        include_examples: optimizationSettings.includeExamples,
      },
    });
  };

  const isOptimizing = isStreaming;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  const handleSaveTemplate = async () => {
    if (!optimizationResult) return;

    try {
      // TODO: Implement save as template
      console.log('Saving optimized prompt as template...');
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const getProviderModels = (providerId: string) => {
    return providers.find(p => p.id === providerId)?.models || [];
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Prompt Optimizer
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Transform your prompts into high-performance instructions optimized for specific AI models.
          Get better results with structured, clear, and effective prompts.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-xs">
        <button
          type="button"
          onClick={() => setActiveTab('optimize')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'optimize'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Zap className="h-4 w-4" />
          Optimize
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('guided')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'guided'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Guided Build
        </button>
      </div>

      {/* Guided Builder tab */}
      {activeTab === 'guided' && (
        <Card className="p-6 max-w-2xl">
          <AskMeWizard />
        </Card>
      )}

      {/* Optimize tab */}
      {activeTab === 'optimize' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Prompt
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>

              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Enter your prompt here... For example: 'Write a professional email to request a meeting with the marketing team.'"
                className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />

              {/* Model Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI Provider
                  </label>
                 <label htmlFor="provider-select" className="sr-only">AI Provider</label>
<select
  id="provider-select"
  aria-label="AI Provider"
  value={selectedProvider}
  onChange={(e) => {
    setSelectedProvider(e.target.value);
    setSelectedModel(getProviderModels(e.target.value)[0] || '');
  }}
  className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
>
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

  <div className="space-y-2">
    <label htmlFor="model-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Model
    </label>
    <select
      id="model-select"
      aria-label="Model"
      value={selectedModel}
      onChange={(e) => setSelectedModel(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
    >
      {getProviderModels(selectedProvider).map((model: string) => (
        <option key={model} value={model}>
          {model}
        </option>
      ))}
    </select>
  </div>
              </div>

              {/* Advanced Settings */}
              <AnimatePresence>
                {showAdvancedSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 border-t pt-4"
                  >
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Optimization Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="focus-select" className="text-sm text-gray-600 dark:text-gray-400">
                          Focus Area
                        </label>
                        <select
                          id="focus-select"
                          aria-label="Focus Area"
                          value={optimizationSettings.focus}
                          onChange={(e) => setOptimizationSettings(prev => ({
                            ...prev,
                            focus: e.target.value
                          }))}
                          className="w-full p-2 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
                        >
                          <option value="clarity">Clarity & Structure</option>
                          <option value="creativity">Creativity & Innovation</option>
                          <option value="precision">Precision & Accuracy</option>
                          <option value="engagement">Engagement & Tone</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="audience-select" className="text-sm text-gray-600 dark:text-gray-400">
                          Target Audience
                        </label>
                        <select
                          id="audience-select"
                          aria-label="Target Audience"
                          value={optimizationSettings.targetAudience}
                          onChange={(e) => setOptimizationSettings(prev => ({
                            ...prev,
                            targetAudience: e.target.value
                          }))}
                          className="w-full p-2 text-sm border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
                        >
                          <option value="general">General Audience</option>
                          <option value="technical">Technical/Professional</option>
                          <option value="creative">Creative/Marketing</option>
                          <option value="academic">Academic/Research</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={optimizationSettings.safety}
                          onChange={(e) => setOptimizationSettings(prev => ({
                            ...prev,
                            safety: e.target.checked
                          }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Safety guardrails
                        </span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={optimizationSettings.includeExamples}
                          onChange={(e) => setOptimizationSettings(prev => ({
                            ...prev,
                            includeExamples: e.target.checked
                          }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Include examples
                        </span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleOptimize}
                disabled={!inputPrompt.trim() || isOptimizing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    {output ? 'Streaming...' : 'Optimizing...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Optimize Prompt
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Live streaming output — shown while SSE tokens arrive */}
          {isStreaming && output && (
            <Card className="p-6 border-purple-200 bg-purple-50/30">
              <h2 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Optimizing...
              </h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                {output}<span className="animate-pulse">▋</span>
              </pre>
            </Card>
          )}

          {/* Results Section */}
          {optimizationResult && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Optimized Result
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {optimizationResult.confidence * 100}% confidence
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      +{optimizationResult.processing_time_ms}ms improvement
                    </span>
                  </div>
                </div>

                {/* Before/After Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Original Prompt
                    </h3>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {optimizationResult.original_prompt}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(optimizationResult.original_prompt)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Optimized Prompt
                    </h3>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                        {optimizationResult.optimized_prompt}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(optimizationResult.optimized_prompt)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveTemplate}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save as Template
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Improvements List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Key Improvements
                  </h3>
                  <div className="space-y-2">
                    {optimizationResult.improvements.map((improvement: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {improvement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Optimization Tips
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Be Specific
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Include context, desired format, and clear objectives
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Use Examples
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Show the AI what good output looks like
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Set Constraints
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Define length, tone, and style requirements
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setInputPrompt('')}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear Input
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open('/library', '_blank')}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  const sample = "Write a comprehensive project proposal for implementing a new customer relationship management (CRM) system. Include budget estimates, timeline, team requirements, and potential risks.";
                  setInputPrompt(sample);
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Try Sample Prompt
              </Button>
            </div>
          </Card>

          {/* Usage Stats */}
          {user && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your AI Usage
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Tokens used today
                  </span>
                  <span className="text-sm font-medium">
                    {(usageData as any)?.tokens_used_today ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Tokens remaining
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {(usageData as any)?.tokens_remaining_today ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Cost today
                  </span>
                  <span className="text-sm font-medium">
                    ${(usageData as any)?.cost_today?.toFixed(4) ?? '0.0000'}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      )} {/* end activeTab === 'optimize' */}
    </div>
  );
}

export default function OptimizerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading…</div>}>
      <OptimizerPageInner />
    </Suspense>
  );
}
