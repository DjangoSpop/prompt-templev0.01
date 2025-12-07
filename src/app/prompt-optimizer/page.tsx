'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Download,
  TrendingUp,
  Brain,
  Target,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { EgyptianLoadingAnimation } from '@/components/chat/EgyptianLoadingAnimation';
import { SkeletonLoader } from '@/components/chat/SkeletonLoader';
import { AIInsightsPanel } from '@/components/chat/AIInsightCard';
import { AISuggestionsPanel } from '@/components/chat/AISuggestionCard';

import {
  aiOptimizerAPI,
  type OptimizationRequest,
  type OptimizationTask,
  type OptimizationResult,
  type SuggestionResponse
} from '@/lib/api/ai-optimizer';

// Real-time suggestions component
const RealTimeSuggestions: React.FC<{
  inputValue: string;
  onSelectSuggestion: (suggestion: string) => void;
}> = ({ inputValue, onSelectSuggestion }) => {
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (inputValue.length < 3) {
      setSuggestions(null);
      return;
    }

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await aiOptimizerAPI.getSuggestions(inputValue);
        setSuggestions(result);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue]);

  if (!suggestions?.suggestions.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      {suggestions.suggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelectSuggestion(suggestion.text)}
          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">{suggestion.text}</p>
            {suggestion.context && (
              <p className="text-xs text-gray-500 mt-1">{suggestion.context}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={suggestion.type === 'template' ? 'default' : 'secondary'} className="text-xs">
              {suggestion.type}
            </Badge>
            <span className="text-xs text-gray-400">
              {Math.round(suggestion.confidence * 100)}%
            </span>
          </div>
        </motion.button>
      ))}
      <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50">
        {isLoading ? 'Loading...' : `${suggestions.suggestions.length} suggestions • ${suggestions.query_time}ms`}
      </div>
    </motion.div>
  );
};

// Progress indicator component
const OptimizationProgress: React.FC<{
  task: OptimizationTask;
  showEgyptianLoader?: boolean;
}> = ({ task, showEgyptianLoader = false }) => {
  const getStageIcon = () => {
    switch (task.progress?.stage) {
      case 'initializing': return <Brain className="w-4 h-4" />;
      case 'retrieving_context': return <Target className="w-4 h-4" />;
      case 'analyzing': return <BarChart3 className="w-4 h-4" />;
      case 'optimizing': return <Sparkles className="w-4 h-4" />;
      case 'finalizing': return <CheckCircle className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getStageColor = () => {
    switch (task.progress?.stage) {
      case 'initializing': return 'text-blue-500';
      case 'retrieving_context': return 'text-purple-500';
      case 'analyzing': return 'text-yellow-500';
      case 'optimizing': return 'text-green-500';
      case 'finalizing': return 'text-emerald-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <div className={`${getStageColor()} animate-pulse`}>
              {getStageIcon()}
            </div>
            <span>AI Optimization in Progress</span>
          </CardTitle>
          <Badge variant="outline" className="animate-pulse">
            {task.status}
          </Badge>
        </div>
        <CardDescription>
          {task.progress?.message || 'Processing your prompt...'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{task.progress?.percentage || 0}%</span>
            </div>
            <Progress value={task.progress?.percentage || 0} className="h-2" />
          </div>

          {showEgyptianLoader && (
            <div className="flex justify-center py-4">
              <EgyptianLoadingAnimation message="Consulting ancient wisdom for optimal prompts..." />
            </div>
          )}

          {!showEgyptianLoader && (
            <div className="flex justify-center py-4">
              <SkeletonLoader lines={2} />
            </div>
          )}

          {task.estimated_completion && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>
                Estimated completion: {new Date(task.estimated_completion).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Results comparison component
const OptimizationResults: React.FC<{
  result: OptimizationResult;
  onApplyOptimization: () => void;
  onCopyOptimized: () => void;
  onTryAlternative: (prompt: string) => void;
}> = ({ result, onApplyOptimization, onCopyOptimized, onTryAlternative }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Before/After Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span>Optimization Results</span>
          </CardTitle>
          <CardDescription>
            Your prompt has been enhanced for better clarity and effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Original Prompt</h3>
                <Badge variant="outline">Before</Badge>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 border">
                {result.original_prompt}
              </div>
              <div className="text-xs text-gray-500">
                {result.original_prompt.length} characters
              </div>
            </div>

            {/* Optimized */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Optimized Prompt</h3>
                <Badge className="bg-green-100 text-green-800">Enhanced</Badge>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 text-sm text-gray-900 border border-green-200">
                {result.optimized_prompt}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {result.optimized_prompt.length} characters
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={onCopyOptimized}>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" onClick={onApplyOptimization}>
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Metrics</CardTitle>
          <CardDescription>
            Detailed analysis of prompt enhancements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(result.improvements.clarity_score)}`}>
                {result.improvements.clarity_score}
              </div>
              <div className="text-sm text-gray-600">Clarity</div>
              <Badge className={getScoreBadgeColor(result.improvements.clarity_score)} variant="outline">
                {result.improvements.clarity_score >= 80 ? 'Excellent' :
                 result.improvements.clarity_score >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(result.improvements.specificity_score)}`}>
                {result.improvements.specificity_score}
              </div>
              <div className="text-sm text-gray-600">Specificity</div>
              <Badge className={getScoreBadgeColor(result.improvements.specificity_score)} variant="outline">
                {result.improvements.specificity_score >= 80 ? 'Excellent' :
                 result.improvements.specificity_score >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(result.improvements.effectiveness_score)}`}>
                {result.improvements.effectiveness_score}
              </div>
              <div className="text-sm text-gray-600">Effectiveness</div>
              <Badge className={getScoreBadgeColor(result.improvements.effectiveness_score)} variant="outline">
                {result.improvements.effectiveness_score >= 80 ? 'Excellent' :
                 result.improvements.effectiveness_score >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(result.improvements.overall_score)}`}>
                {result.improvements.overall_score}
              </div>
              <div className="text-sm text-gray-600">Overall</div>
              <Badge className={getScoreBadgeColor(result.improvements.overall_score)} variant="outline">
                {result.improvements.overall_score >= 80 ? 'Excellent' :
                 result.improvements.overall_score >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span>Optimization Insights</span>
            </CardTitle>
            <CardDescription>
              Specific improvements made to enhance your prompt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type}
                        </Badge>
                        <Badge
                          className={`text-xs ${
                            suggestion.impact === 'high' ? 'bg-red-100 text-red-800' :
                            suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          {suggestion.impact} impact
                        </Badge>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {suggestion.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {suggestion.description}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 ml-4">
                      {Math.round(suggestion.confidence * 100)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alternative Prompts */}
      {result.alternatives && result.alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alternative Versions</CardTitle>
            <CardDescription>
              Different approaches tailored for specific use cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.alternatives.map((alternative, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{alternative.use_case}</Badge>
                        <span className="text-sm text-gray-500">
                          Score: {Math.round(alternative.score * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 mb-3">
                        {alternative.prompt}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTryAlternative(alternative.prompt)}
                      >
                        Try This Version
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Technical details about the optimization process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {result.performance_metrics.processing_time}s
              </div>
              <div className="text-sm text-gray-600">Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {result.performance_metrics.tokens_used.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Tokens Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${result.performance_metrics.cost_estimate.toFixed(4)}
              </div>
              <div className="text-sm text-gray-600">Cost Estimate</div>
            </div>
          </div>

          {result.rag_context && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-3">RAG Context Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-semibold text-indigo-600">
                    {result.rag_context.retrieved_templates}
                  </div>
                  <div className="text-sm text-gray-600">Templates Retrieved</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-indigo-600">
                    {Math.round(result.rag_context.context_relevance * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Context Relevance</div>
                </div>
              </div>

              {result.rag_context.sources.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Top Sources:</h5>
                  <div className="space-y-2">
                    {result.rag_context.sources.slice(0, 3).map((source, index) => (
                      <div key={source.template_id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-900">{source.title}</span>
                        <Badge variant="outline">
                          {Math.round(source.relevance_score * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main AI Optimizer Page
export default function AIOptimizerPage() {
  const [prompt, setPrompt] = useState('');
  const [optimizationLevel, setOptimizationLevel] = useState<'basic' | 'advanced' | 'expert'>('advanced');
  const [currentTask, setCurrentTask] = useState<OptimizationTask | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [showEgyptianLoader, setShowEgyptianLoader] = useState(false);
  const queryClient = useQueryClient();
  const pollingRef = useRef<NodeJS.Timeout>();

  // Fetch optimization stats
  const { data: stats } = useQuery({
    queryKey: ['optimization-stats'],
    queryFn: () => aiOptimizerAPI.getOptimizationStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Start optimization mutation
  const optimizationMutation = useMutation({
    mutationFn: (request: OptimizationRequest) => aiOptimizerAPI.startOptimization(request),
    onSuccess: (task) => {
      setCurrentTask(task);
      setResult(null);
      startPolling(task.task_id);

      // Show Egyptian loader for complex prompts
      const isComplex = prompt.length > 200 ||
                       optimizationLevel === 'expert' ||
                       prompt.includes('analyze') ||
                       prompt.includes('comprehensive');
      setShowEgyptianLoader(isComplex);

      toast.success('Optimization started successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to start optimization: ${error.message}`);
    },
  });

  // Polling for task status
  const startPolling = useCallback((taskId: string) => {
    setIsPolling(true);

    const poll = async () => {
      try {
        const task = await aiOptimizerAPI.getOptimizationStatus(taskId);
        setCurrentTask(task);

        if (task.status === 'completed') {
          const result = await aiOptimizerAPI.getOptimizationResult(taskId);
          setResult(result);
          setIsPolling(false);
          setShowEgyptianLoader(false);
          toast.success('Optimization completed!');

          // Invalidate stats to refresh
          queryClient.invalidateQueries({ queryKey: ['optimization-stats'] });
          return;
        }

        if (task.status === 'failed') {
          setIsPolling(false);
          setShowEgyptianLoader(false);
          toast.error('Optimization failed. Please try again.');
          return;
        }

        // Continue polling
        pollingRef.current = setTimeout(poll, 2000);
      } catch (error) {
        console.error('Polling error:', error);
        setIsPolling(false);
        setShowEgyptianLoader(false);
      }
    };

    poll();
  }, [queryClient]);

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

  const handleOptimize = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to optimize');
      return;
    }

    const request: OptimizationRequest = {
      prompt: prompt.trim(),
      session_id: `session_${Date.now()}`,
      preferences: {
        optimization_level: optimizationLevel,
        include_suggestions: true,
        include_alternatives: true,
        max_tokens: 4096,
      },
    };

    optimizationMutation.mutate(request);
  };

  const handleApplyOptimization = () => {
    if (result) {
      setPrompt(result.optimized_prompt);
      setResult(null);
      setCurrentTask(null);
      toast.success('Optimized prompt applied!');
    }
  };

  const handleCopyOptimized = () => {
    if (result) {
      navigator.clipboard.writeText(result.optimized_prompt);
      toast.success('Optimized prompt copied to clipboard!');
    }
  };

  const handleTryAlternative = (alternativePrompt: string) => {
    setPrompt(alternativePrompt);
    setResult(null);
    setCurrentTask(null);
    toast.success('Alternative prompt loaded!');
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleReset = () => {
    setPrompt('');
    setResult(null);
    setCurrentTask(null);
    setIsPolling(false);
    setShowEgyptianLoader(false);
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Prompt Optimizer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your prompts into powerful, precise instructions using advanced RAG-powered optimization
          </p>

          {stats && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-6 text-sm text-gray-600">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{stats.total_optimizations}</div>
                  <div>Optimizations</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{Math.round(stats.success_rate * 100)}%</div>
                  <div>Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">{Math.round(stats.average_improvement * 100)}%</div>
                  <div>Avg Improvement</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="optimizer" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
              <TabsTrigger value="optimizer">Optimizer</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="optimizer" className="space-y-6">
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-blue-500" />
                    <span>Prompt Input</span>
                  </CardTitle>
                  <CardDescription>
                    Enter your prompt below and let our AI enhance it for maximum effectiveness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Textarea
                        placeholder="Enter your prompt here... (e.g., 'Write something about AI')"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[120px] text-base"
                        disabled={isPolling}
                      />
                      <RealTimeSuggestions
                        inputValue={prompt}
                        onSelectSuggestion={handleSuggestionSelect}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Select
                          value={optimizationLevel}
                          onValueChange={(value: 'basic' | 'advanced' | 'expert') => setOptimizationLevel(value)}
                          disabled={isPolling}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          onClick={handleReset}
                          disabled={isPolling}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>

                      <Button
                        onClick={handleOptimize}
                        disabled={!prompt.trim() || isPolling}
                        size="lg"
                        className="min-w-32"
                      >
                        {isPolling ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {isPolling ? 'Optimizing...' : 'Optimize Prompt'}
                      </Button>
                    </div>

                    <div className="text-sm text-gray-500">
                      {prompt.length} characters • {prompt.split(' ').length} words
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Section */}
              <AnimatePresence>
                {currentTask && isPolling && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <OptimizationProgress
                      task={currentTask}
                      showEgyptianLoader={showEgyptianLoader}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <AnimatePresence>
                {result ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <OptimizationResults
                      result={result}
                      onApplyOptimization={handleApplyOptimization}
                      onCopyOptimized={handleCopyOptimized}
                      onTryAlternative={handleTryAlternative}
                    />
                  </motion.div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Sparkles className="w-12 h-12" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Optimization Results Yet
                      </h3>
                      <p className="text-gray-500 text-center max-w-md">
                        Start by entering a prompt in the optimizer tab to see detailed results and improvements here.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {stats.total_optimizations}
                          </div>
                          <div className="text-sm text-gray-600">Total Optimizations</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round(stats.success_rate * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Success Rate</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(stats.user_satisfaction * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">User Satisfaction</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Efficiency Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold text-indigo-600">
                            {Math.round(stats.average_improvement * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Average Improvement</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-emerald-600">
                            {stats.total_tokens_saved.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Tokens Saved</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.recent_optimizations.map((opt, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div>
                              <div className="font-medium">
                                {new Date(opt.date).toLocaleDateString()}
                              </div>
                              <div className="text-gray-500">
                                {opt.original_length} → {opt.optimized_length} chars
                              </div>
                            </div>
                            <Badge variant="outline">
                              +{Math.round(opt.improvement_score * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <SkeletonLoader lines={3} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}