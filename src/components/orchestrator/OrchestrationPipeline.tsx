'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls, Reorder } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PyramidGrid } from '@/components/pharaonic/PyramidGrid';
import { 
  Zap,
  Settings,
  Play,
  Pause,
  Square,
  RotateCcw,
  Copy,
  Download,
  Save,
  Trash2,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Target,
  Filter,
  BarChart3,
  GitBranch,
  Star,
  Sparkles,
  Thermometer,
  Hash,
  DollarSign
} from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  type: 'expand' | 'constrain' | 'evaluate' | 'compare';
  description: string;
  icon: any;
  color: string;
  isEnabled: boolean;
  isExpanded: boolean;
  status: 'idle' | 'running' | 'success' | 'error' | 'warning';
  settings: Record<string, any>;
  results?: any;
  duration?: number;
  tokens_used?: number;
}

interface OrchestrationSettings {
  model: 'deepseek-chat' | 'deepseek-reasoner';
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  budget_limit: number;
  timeout: number;
  retry_count: number;
  parallel_execution: boolean;
}

const DEFAULT_STAGES: PipelineStage[] = [
  {
    id: 'expand',
    name: 'Expand',
    type: 'expand',
    description: 'Transform idea into structured brief',
    icon: Sparkles,
    color: 'nile-teal',
    isEnabled: true,
    isExpanded: false,
    status: 'idle',
    settings: {
      expansion_style: 'structured',
      detail_level: 'comprehensive',
      focus_areas: ['clarity', 'completeness', 'specificity'],
      include_examples: true,
    }
  },
  {
    id: 'constrain',
    name: 'Constrain',
    type: 'constrain',
    description: 'Apply style guide, length, and safety rules',
    icon: Filter,
    color: 'pharaoh-gold',
    isEnabled: true,
    isExpanded: false,
    status: 'idle',
    settings: {
      max_length: 1000,
      style_guide: 'professional',
      tone: 'neutral',
      safety_level: 'standard',
      format_requirements: [],
    }
  },
  {
    id: 'evaluate',
    name: 'Evaluate',
    type: 'evaluate',
    description: 'Score against rubric criteria',
    icon: BarChart3,
    color: 'lapis-blue',
    isEnabled: true,
    isExpanded: false,
    status: 'idle',
    settings: {
      criteria: [
        { name: 'Clarity', weight: 0.3, min_score: 3 },
        { name: 'Specificity', weight: 0.3, min_score: 3 },
        { name: 'Faithfulness', weight: 0.4, min_score: 4 }
      ],
      scoring_scale: 5,
      require_explanations: true,
    }
  },
  {
    id: 'compare',
    name: 'Compare',
    type: 'compare',
    description: 'Generate and compare multiple variants',
    icon: GitBranch,
    color: 'royal-gold',
    isEnabled: true,
    isExpanded: false,
    status: 'idle',
    settings: {
      variant_count: 3,
      comparison_criteria: ['quality', 'relevance', 'creativity'],
      selection_method: 'automatic',
      include_reasoning: true,
    }
  }
];

const DEFAULT_SETTINGS: OrchestrationSettings = {
  model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 0.9,
  frequency_penalty: 0,
  presence_penalty: 0,
  budget_limit: 10,
  timeout: 60,
  retry_count: 3,
  parallel_execution: false,
};

interface OrchestrationPipelineProps {
  className?: string;
  initialPrompt?: string;
}

export function OrchestrationPipeline({ 
  className = '', 
  initialPrompt = '' 
}: OrchestrationPipelineProps) {
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_STAGES);
  const [settings, setSettings] = useState<OrchestrationSettings>(DEFAULT_SETTINGS);
  const [inputPrompt, setInputPrompt] = useState(initialPrompt);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [executionLog, setExecutionLog] = useState<Array<{
    timestamp: Date;
    stage: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
  }>>([]);
  const [results, setResults] = useState<Record<string, any>>({});
  const [totalCost, setTotalCost] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const dragControls = useDragControls();

  const addLogEntry = useCallback((stage: string, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setExecutionLog(prev => [...prev, {
      timestamp: new Date(),
      stage,
      message,
      type
    }]);
  }, []);

  const updateStageStatus = useCallback((stageId: string, status: PipelineStage['status'], results?: any) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, status, results, duration: status === 'success' ? Math.random() * 3000 + 1000 : undefined }
        : stage
    ));
  }, []);

  const toggleStageEnabled = useCallback((stageId: string) => {
    setStages(prev => prev.map(stage =>
      stage.id === stageId ? { ...stage, isEnabled: !stage.isEnabled } : stage
    ));
  }, []);

  const toggleStageExpanded = useCallback((stageId: string) => {
    setStages(prev => prev.map(stage =>
      stage.id === stageId ? { ...stage, isExpanded: !stage.isExpanded } : stage
    ));
  }, []);

  const updateStageSetting = useCallback((stageId: string, key: string, value: any) => {
    setStages(prev => prev.map(stage =>
      stage.id === stageId 
        ? { ...stage, settings: { ...stage.settings, [key]: value } }
        : stage
    ));
  }, []);

  const runPipeline = async () => {
    if (!inputPrompt.trim()) {
      addLogEntry('system', 'Input prompt is required', 'error');
      return;
    }

    setIsRunning(true);
    setExecutionLog([]);
    setResults({});
    setTotalCost(0);
    setTotalTokens(0);
    setTotalDuration(0);

    const enabledStages = stages.filter(stage => stage.isEnabled);
    
    addLogEntry('system', `Starting pipeline with ${enabledStages.length} stages`, 'info');

    try {
      let currentResults = { input: inputPrompt };
      
      for (const stage of enabledStages) {
        setCurrentStage(stage.id);
        updateStageStatus(stage.id, 'running');
        addLogEntry(stage.id, `Starting ${stage.name} stage`, 'info');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
        
        // Mock results based on stage type
        let stageResults;
        const duration = Math.random() * 3000 + 500;
        const tokens = Math.floor(Math.random() * 500 + 100);
        const cost = tokens * 0.00002; // Mock pricing
        
        setTotalDuration(prev => prev + duration);
        setTotalTokens(prev => prev + tokens);
        setTotalCost(prev => prev + cost);

        switch (stage.type) {
          case 'expand':
            stageResults = {
              expanded_brief: `Expanded version of: ${currentResults.input}`,
              structure: ['Introduction', 'Main Content', 'Conclusion'],
              word_count: 250,
              tokens_used: tokens,
              duration,
            };
            break;
          case 'constrain':
            stageResults = {
              constrained_output: 'Output refined according to constraints',
              applied_constraints: ['length', 'tone', 'style'],
              compliance_score: 0.95,
              tokens_used: tokens,
              duration,
            };
            break;
          case 'evaluate':
            stageResults = {
              scores: {
                clarity: 4.2,
                specificity: 4.5,
                faithfulness: 4.8,
              },
              overall_score: 4.5,
              explanations: {
                clarity: 'Clear and well-structured',
                specificity: 'Highly specific and detailed',
                faithfulness: 'Excellent adherence to requirements',
              },
              tokens_used: tokens,
              duration,
            };
            break;
          case 'compare':
            stageResults = {
              variants: [
                { id: 'A', content: 'Variant A content', score: 4.2 },
                { id: 'B', content: 'Variant B content', score: 4.6 },
                { id: 'C', content: 'Variant C content', score: 4.3 },
              ],
              best_variant: 'B',
              comparison_reasoning: 'Variant B scored highest across all criteria',
              tokens_used: tokens,
              duration,
            };
            break;
        }

        currentResults = { ...currentResults, [stage.id]: stageResults };
        updateStageStatus(stage.id, 'success', stageResults);
        addLogEntry(stage.id, `Completed ${stage.name} stage successfully`, 'success');
      }

      setResults(currentResults);
      setCurrentStage(null);
      addLogEntry('system', 'Pipeline completed successfully', 'success');
      
    } catch (error) {
      const errorStage = currentStage || 'system';
      updateStageStatus(errorStage, 'error');
      addLogEntry(errorStage, `Error: ${error}`, 'error');
      setCurrentStage(null);
    } finally {
      setIsRunning(false);
    }
  };

  const stopPipeline = () => {
    setIsRunning(false);
    setCurrentStage(null);
    addLogEntry('system', 'Pipeline stopped by user', 'warning');
  };

  const resetPipeline = () => {
    setStages(prev => prev.map(stage => ({ ...stage, status: 'idle', results: undefined })));
    setExecutionLog([]);
    setResults({});
    setCurrentStage(null);
    setTotalCost(0);
    setTotalTokens(0);
    setTotalDuration(0);
  };

  const exportResults = (format: 'json' | 'markdown') => {
    if (format === 'json') {
      const exportData = {
        input: inputPrompt,
        settings,
        stages: stages.map(s => ({ id: s.id, name: s.name, settings: s.settings, results: s.results })),
        results,
        metadata: {
          total_cost: totalCost,
          total_tokens: totalTokens,
          total_duration: totalDuration,
          timestamp: new Date().toISOString(),
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orchestration-results-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Markdown export implementation
      const markdown = `# Orchestration Results

## Input Prompt
\`\`\`
${inputPrompt}
\`\`\`

## Pipeline Results
${Object.entries(results).map(([key, value]) => `### ${key}\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``).join('\n\n')}

## Execution Summary
- **Total Duration**: ${(totalDuration / 1000).toFixed(2)}s
- **Total Tokens**: ${totalTokens.toLocaleString()}
- **Total Cost**: $${totalCost.toFixed(4)}
- **Timestamp**: ${new Date().toISOString()}
`;

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orchestration-results-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`min-h-screen bg-background relative ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <PyramidGrid animate={false} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 space-y-8 max-w-7xl">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-lapis-blue via-pharaoh-gold to-royal-gold bg-clip-text text-transparent">
            DeepSeek Orchestrator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Optimize your prompts through an intelligent pipeline of expansion, constraint, evaluation, and comparison
          </p>
        </motion.div>

        {/* Input & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Input Prompt</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Model: {settings.model}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Budget: ${settings.budget_limit}
                  </Badge>
                </div>
              </div>
              
              <Textarea
                placeholder="Enter your initial prompt or idea to optimize..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                rows={4}
                className="text-base focus:border-pharaoh-gold/50 focus:ring-pharaoh-gold/20"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={runPipeline}
                    disabled={isRunning || !inputPrompt.trim()}
                    className="bg-pharaoh-gold hover:bg-pharaoh-gold/90 text-white"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Pipeline
                      </>
                    )}
                  </Button>
                  
                  {isRunning && (
                    <Button
                      onClick={stopPipeline}
                      variant="destructive"
                      size="sm"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  )}
                  
                  <Button
                    onClick={resetPipeline}
                    variant="outline"
                    size="sm"
                    disabled={isRunning}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
                
                {Object.keys(results).length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => exportResults('json')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                    <Button
                      onClick={() => exportResults('markdown')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export MD
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Pipeline Stages */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Pipeline Stages</h2>
            <p className="text-sm text-muted-foreground">
              Drag to reorder • Click to configure • Toggle to enable/disable
            </p>
          </div>

          <Reorder.Group 
            axis="y" 
            values={stages} 
            onReorder={setStages}
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {stages.map((stage, index) => (
                <Reorder.Item 
                  key={stage.id} 
                  value={stage}
                  dragControls={dragControls}
                  className="relative"
                >
                  <motion.div
                    layout
                    className={`relative ${stage.isEnabled ? '' : 'opacity-50'}`}
                    whileHover={{ scale: stage.isEnabled ? 1.01 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`p-6 transition-all duration-300 ${
                      currentStage === stage.id
                        ? 'ring-2 ring-pharaoh-gold shadow-pyramid'
                        : stage.status === 'success'
                        ? 'border-green-500/50 bg-green-500/5'
                        : stage.status === 'error'
                        ? 'border-red-500/50 bg-red-500/5'
                        : 'border-border hover:border-pharaoh-gold/30'
                    }`}>
                      {/* Stage Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          {/* Drag Handle */}
                          <div
                            className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
                            onPointerDown={(e) => dragControls.start(e)}
                          >
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                          </div>
                          
                          {/* Stage Icon & Info */}
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-lg bg-${stage.color}/10 border border-${stage.color}/20`}>
                              <stage.icon className={`w-6 h-6 text-${stage.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                  {index + 1}. {stage.name}
                                </h3>
                                {/* Status indicator */}
                                {stage.status === 'running' && (
                                  <Loader2 className="w-4 h-4 animate-spin text-pharaoh-gold" />
                                )}
                                {stage.status === 'success' && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                {stage.status === 'error' && (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {stage.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Stage Controls */}
                        <div className="flex items-center space-x-2">
                          {stage.results && (
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                              {stage.duration && (
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {(stage.duration / 1000).toFixed(1)}s
                                </div>
                              )}
                              {stage.results.tokens_used && (
                                <div className="flex items-center">
                                  <Hash className="w-3 h-3 mr-1" />
                                  {stage.results.tokens_used}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStageExpanded(stage.id)}
                            className="p-2"
                          >
                            {stage.isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant={stage.isEnabled ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleStageEnabled(stage.id)}
                            className={stage.isEnabled ? 'bg-pharaoh-gold hover:bg-pharaoh-gold/90' : ''}
                          >
                            {stage.isEnabled ? 'Enabled' : 'Disabled'}
                          </Button>
                        </div>
                      </div>

                      {/* Connection line to next stage */}
                      {index < stages.length - 1 && (
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="flex flex-col items-center">
                            <ArrowRight className="w-5 h-5 text-pharaoh-gold" />
                            <div className="w-px h-4 bg-pharaoh-gold/30" />
                          </div>
                        </div>
                      )}

                      {/* Stage Settings & Results */}
                      <AnimatePresence>
                        {stage.isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-border pt-4"
                          >
                            <Tabs defaultValue="settings" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                                <TabsTrigger value="results" disabled={!stage.results}>
                                  Results
                                  {stage.results && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      ✓
                                    </Badge>
                                  )}
                                </TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="settings" className="space-y-4">
                                {/* Stage-specific settings */}
                                {stage.type === 'expand' && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Expansion Style</label>
                                      <select
                                        value={stage.settings.expansion_style}
                                        onChange={(e) => updateStageSetting(stage.id, 'expansion_style', e.target.value)}
                                        className="w-full p-2 border border-border rounded-lg bg-background"
                                      >
                                        <option value="structured">Structured</option>
                                        <option value="creative">Creative</option>
                                        <option value="analytical">Analytical</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Detail Level</label>
                                      <select
                                        value={stage.settings.detail_level}
                                        onChange={(e) => updateStageSetting(stage.id, 'detail_level', e.target.value)}
                                        className="w-full p-2 border border-border rounded-lg bg-background"
                                      >
                                        <option value="brief">Brief</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="comprehensive">Comprehensive</option>
                                      </select>
                                    </div>
                                  </div>
                                )}

                                {stage.type === 'constrain' && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">
                                        Max Length: {stage.settings.max_length}
                                      </label>
                                      <Slider
                                        value={[stage.settings.max_length]}
                                        onValueChange={([value]) => updateStageSetting(stage.id, 'max_length', value)}
                                        max={5000}
                                        min={100}
                                        step={50}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Style Guide</label>
                                      <select
                                        value={stage.settings.style_guide}
                                        onChange={(e) => updateStageSetting(stage.id, 'style_guide', e.target.value)}
                                        className="w-full p-2 border border-border rounded-lg bg-background"
                                      >
                                        <option value="professional">Professional</option>
                                        <option value="casual">Casual</option>
                                        <option value="academic">Academic</option>
                                        <option value="creative">Creative</option>
                                      </select>
                                    </div>
                                  </div>
                                )}

                                {stage.type === 'evaluate' && (
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Evaluation Criteria</label>
                                      <div className="space-y-2">
                                        {stage.settings.criteria.map((criterion: any, idx: number) => (
                                          <div key={idx} className="flex items-center space-x-4 p-2 border border-border rounded">
                                            <span className="font-medium min-w-24">{criterion.name}</span>
                                            <span className="text-sm text-muted-foreground">Weight:</span>
                                            <Slider
                                              value={[criterion.weight * 100]}
                                              onValueChange={([value]) => {
                                                const newCriteria = [...stage.settings.criteria];
                                                newCriteria[idx] = { ...criterion, weight: value / 100 };
                                                updateStageSetting(stage.id, 'criteria', newCriteria);
                                              }}
                                              max={100}
                                              min={0}
                                              step={5}
                                              className="flex-1"
                                            />
                                            <span className="text-sm min-w-12">{Math.round(criterion.weight * 100)}%</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {stage.type === 'compare' && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">
                                        Variant Count: {stage.settings.variant_count}
                                      </label>
                                      <Slider
                                        value={[stage.settings.variant_count]}
                                        onValueChange={([value]) => updateStageSetting(stage.id, 'variant_count', value)}
                                        max={5}
                                        min={2}
                                        step={1}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Selection Method</label>
                                      <select
                                        value={stage.settings.selection_method}
                                        onChange={(e) => updateStageSetting(stage.id, 'selection_method', e.target.value)}
                                        className="w-full p-2 border border-border rounded-lg bg-background"
                                      >
                                        <option value="automatic">Automatic</option>
                                        <option value="manual">Manual Review</option>
                                        <option value="hybrid">Hybrid</option>
                                      </select>
                                    </div>
                                  </div>
                                )}
                              </TabsContent>
                              
                              <TabsContent value="results" className="space-y-4">
                                {stage.results ? (
                                  <div className="space-y-4">
                                    {/* Results display based on stage type */}
                                    {stage.type === 'expand' && stage.results && (
                                      <div>
                                        <h4 className="font-medium mb-2">Expanded Brief</h4>
                                        <Card className="p-4 bg-muted/30">
                                          <p className="text-sm">{stage.results.expanded_brief}</p>
                                          <div className="mt-3 flex items-center space-x-4 text-xs text-muted-foreground">
                                            <span>Words: {stage.results.word_count}</span>
                                            <span>Structure: {stage.results.structure?.length || 0} sections</span>
                                          </div>
                                        </Card>
                                      </div>
                                    )}

                                    {stage.type === 'evaluate' && stage.results && (
                                      <div>
                                        <h4 className="font-medium mb-3">Evaluation Scores</h4>
                                        <div className="space-y-3">
                                          {Object.entries(stage.results.scores).map(([criterion, score]) => (
                                            <div key={criterion} className="flex items-center justify-between">
                                              <span className="capitalize">{criterion}</span>
                                              <div className="flex items-center space-x-2">
                                                <div className="flex items-center">
                                                  {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                      key={i}
                                                      className={`w-4 h-4 ${
                                                        i < Math.floor(score as number)
                                                          ? 'text-pharaoh-gold fill-current'
                                                          : 'text-muted-foreground'
                                                      }`}
                                                    />
                                                  ))}
                                                </div>
                                                <span className="font-medium">{score}/5</span>
                                              </div>
                                            </div>
                                          ))}
                                          <div className="pt-2 border-t border-border">
                                            <div className="flex items-center justify-between font-semibold">
                                              <span>Overall Score</span>
                                              <span className="text-pharaoh-gold">{stage.results.overall_score}/5</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {stage.type === 'compare' && stage.results && (
                                      <div>
                                        <h4 className="font-medium mb-3">Variant Comparison</h4>
                                        <div className="space-y-3">
                                          {stage.results.variants?.map((variant: any) => (
                                            <Card
                                              key={variant.id}
                                              className={`p-3 ${
                                                variant.id === stage.results.best_variant
                                                  ? 'border-pharaoh-gold bg-pharaoh-gold/5'
                                                  : ''
                                              }`}
                                            >
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">Variant {variant.id}</span>
                                                <div className="flex items-center space-x-2">
                                                  <span className="text-sm">Score: {variant.score}</span>
                                                  {variant.id === stage.results.best_variant && (
                                                    <Badge className="bg-pharaoh-gold text-white">
                                                      <Star className="w-3 h-3 mr-1 fill-current" />
                                                      Best
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                              <p className="text-sm text-muted-foreground">{variant.content}</p>
                                            </Card>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No results yet</p>
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </motion.div>

        {/* Execution Log & Stats */}
        {(executionLog.length > 0 || Object.keys(results).length > 0) && (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Execution Log */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Execution Log</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {executionLog.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start space-x-3 p-2 rounded text-sm ${
                      entry.type === 'error' ? 'bg-red-500/10 text-red-500' :
                      entry.type === 'success' ? 'bg-green-500/10 text-green-500' :
                      entry.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <span className="text-xs opacity-70 min-w-16">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="font-medium min-w-20 capitalize">{entry.stage}</span>
                    <span>{entry.message}</span>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Execution Stats */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Execution Summary</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-nile-teal" />
                    <span className="font-medium">Duration</span>
                  </div>
                  <span className="font-semibold">{(totalDuration / 1000).toFixed(2)}s</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <Hash className="w-5 h-5 text-pharaoh-gold" />
                    <span className="font-medium">Total Tokens</span>
                  </div>
                  <span className="font-semibold">{totalTokens.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-royal-gold" />
                    <span className="font-medium">Estimated Cost</span>
                  </div>
                  <span className="font-semibold">${totalCost.toFixed(4)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Success Rate</span>
                  </div>
                  <span className="font-semibold">
                    {stages.filter(s => s.status === 'success').length}/{stages.filter(s => s.isEnabled).length}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}