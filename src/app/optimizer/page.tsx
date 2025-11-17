'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiStrategyOptimize } from '@/hooks/api/useMultiStrategyOptimize';
import { InteractiveOptimizationViewer } from '@/components/Optimization/InteractiveOptimizationViewer';
import { StrategyBreakdown } from '@/components/Optimization/StrategyBreakdown';
import { EgyptianLoading } from '@/components/TryMe/EgyptianLoading';
import {
  OptimizationStrategy,
  STRATEGY_METADATA,
  TMultiStrategyOptimizationRequest,
} from '@/schemas/optimization';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sparkles,
  Zap,
  AlertCircle,
  CheckCircle2,
  Play,
  StopCircle,
  RotateCcw,
} from 'lucide-react';

export default function OptimizerPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedStrategies, setSelectedStrategies] = useState<Set<OptimizationStrategy>>(
    new Set(Object.values(OptimizationStrategy))
  );
  const [optimizationLevel, setOptimizationLevel] = useState<'basic' | 'standard' | 'advanced' | 'expert'>('standard');

  const {
    isOptimizing,
    error,
    progress,
    currentStrategy,
    strategyResults,
    finalResult,
    optimize,
    stop,
    reset,
  } = useMultiStrategyOptimize();

  const handleOptimize = () => {
    if (!prompt.trim()) return;

    const request: TMultiStrategyOptimizationRequest = {
      prompt: prompt.trim(),
      strategies: Array.from(selectedStrategies),
      optimization_level: optimizationLevel,
    };

    optimize(request);
  };

  const toggleStrategy = (strategy: OptimizationStrategy) => {
    setSelectedStrategies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(strategy)) {
        newSet.delete(strategy);
      } else {
        newSet.add(strategy);
      }
      return newSet;
    });
  };

  const examplePrompts = [
    "Write a professional email to a client",
    "Create a marketing campaign for a new product",
    "Explain quantum computing to a 10-year-old",
    "Analyze sales data and provide insights",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-pharaoh-gold to-nile-teal rounded-full flex items-center justify-center shadow-pyramid"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-lapis-blue via-pharaoh-gold to-nile-teal bg-clip-text text-transparent">
                Multi-Strategy Optimizer
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Transform your prompts with AI-powered optimization strategies
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="text-sm py-2 px-4">
              <Zap className="h-4 w-4 mr-2" />
              Average improvement: 50-80%
            </Badge>
            <Badge variant="outline" className="text-sm py-2 px-4">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              5 optimization strategies
            </Badge>
            <Badge variant="outline" className="text-sm py-2 px-4">
              ⚡ Processing time: &lt;600ms
            </Badge>
          </div>
        </motion.div>

        {!finalResult ? (
          <>
            {/* Input Section */}
            <Card className="temple-card pyramid-elevation mb-8">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-hieroglyph mb-4">
                  Enter Your Prompt
                </h2>
                <Textarea
                  placeholder="Type or paste your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="mb-4 text-base"
                  disabled={isOptimizing}
                />

                {/* Example Prompts */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Try an example:</p>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((example, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setPrompt(example)}
                        disabled={isOptimizing}
                        className="text-xs"
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Strategy Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-hieroglyph mb-3">
                    Select Optimization Strategies
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.values(OptimizationStrategy).map((strategy) => {
                      const metadata = STRATEGY_METADATA[strategy];
                      const isSelected = selectedStrategies.has(strategy);

                      return (
                        <button
                          key={strategy}
                          onClick={() => toggleStrategy(strategy)}
                          disabled={isOptimizing}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-200 hover:border-primary/50'
                          } ${isOptimizing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm">{metadata.name}</h4>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {metadata.description}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            +{metadata.expectedGain}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optimization Level */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-hieroglyph mb-3">
                    Optimization Level
                  </h3>
                  <div className="flex space-x-2">
                    {(['basic', 'standard', 'advanced', 'expert'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={optimizationLevel === level ? 'default' : 'outline'}
                        onClick={() => setOptimizationLevel(level)}
                        disabled={isOptimizing}
                        className="capitalize"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  {!isOptimizing ? (
                    <Button
                      size="lg"
                      onClick={handleOptimize}
                      disabled={!prompt.trim() || selectedStrategies.size === 0}
                      className="bg-pharaoh-gold hover:bg-pharaoh-gold/90 text-white flex-1 md:flex-initial"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Optimize Prompt
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={stop}
                      className="flex-1 md:flex-initial"
                    >
                      <StopCircle className="h-5 w-5 mr-2" />
                      Stop
                    </Button>
                  )}

                  {!isOptimizing && strategyResults.length > 0 && (
                    <Button size="lg" variant="outline" onClick={reset}>
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Progress Indicator */}
            {isOptimizing && (
              <Card className="temple-card pyramid-elevation mb-8">
                <div className="p-8">
                  <div className="flex flex-col items-center space-y-6">
                    <EgyptianLoading className="scale-150" />
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-hieroglyph mb-2">
                        Optimizing Your Prompt
                      </h3>
                      {currentStrategy && (
                        <p className="text-sm text-muted-foreground">
                          Applying {STRATEGY_METADATA[currentStrategy].name}...
                        </p>
                      )}
                    </div>
                    <div className="w-full max-w-md">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-pharaoh-gold to-nile-teal"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        {progress.toFixed(0)}% complete
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Strategy Results (as they come in) */}
            {strategyResults.length > 0 && !finalResult && (
              <StrategyBreakdown improvements={strategyResults} className="mb-8" />
            )}
          </>
        ) : (
          /* Final Results */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <InteractiveOptimizationViewer result={finalResult} />
            <StrategyBreakdown improvements={finalResult.strategy_breakdown} />

            {/* Start Over Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  reset();
                  setPrompt('');
                }}
                className="border-primary hover:bg-primary/10"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Optimize Another Prompt
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
