'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Eye, Scroll, Play } from 'lucide-react';

import { LivingPromptEditor } from '@/components/prompt/LivingPromptEditor';
import { AIOraclePanel } from '@/components/insights/AIOraclePanel';
import { PharaohicFlowView } from '@/components/workflow/PharaohicFlowView';
import { useProactiveAI } from '@/hooks/useProactiveAI';

export const ProactiveAIDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [demoPrompt, setDemoPrompt] = useState('');
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [workflowGoal, setWorkflowGoal] = useState('');

  const {
    sessionInsights,
    generateWorkflowFromGoal,
    trackEvent,
    contextAnalysis,
    isAnalyzingContext,
  } = useProactiveAI('demo-session-123', {
    enableContextAnalysis: true,
    enableInsightMonitoring: true,
    autoTrackEvents: true,
  });

  const demoPrompts = [
    {
      title: "Marketing Campaign",
      content: "Create a comprehensive marketing campaign for a new SaaS productivity tool targeting remote teams",
      category: "Marketing"
    },
    {
      title: "Content Strategy",
      content: "Develop a content strategy for a tech startup's blog focusing on AI and automation trends",
      category: "Content"
    },
    {
      title: "Product Launch",
      content: "Plan a product launch sequence for a mobile app that helps users track their fitness goals",
      category: "Product"
    }
  ];

  const handleDemoPromptSelect = (prompt: string) => {
    setDemoPrompt(prompt);
    setActiveTab('editor');
  };

  const handleGenerateWorkflow = (goal: string) => {
    setWorkflowGoal(goal);
    setShowWorkflow(true);
    setActiveTab('workflow');
    generateWorkflowFromGoal(goal);
  };

  const handleSaveAsTemplate = () => {
    trackEvent({
      event_type: 'template_created',
      session_id: 'demo-session-123',
      metadata: {
        source: 'ai_suggestion',
        demo_mode: true,
      },
    });
    // Mock save success
    setTimeout(() => {
      alert('🎉 Template saved successfully! This is a demo, so it\'s not actually saved.');
    }, 500);
  };

  const handleApplyImprovement = (improvement: string) => {
    setDemoPrompt(prev => {
      const enhanced = prev + '\n\n' + improvement;
      return enhanced;
    });
    setActiveTab('editor');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3 mb-4"
        >
          <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Proactive AI Co-Pilot Demo
          </h1>
        </motion.div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Experience the future of AI-powered prompt crafting with real-time suggestions,
          intelligent insights, and pharaonic workflow generation.
        </p>
      </div>

      {/* Demo Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5 text-amber-600" />
            <span>Try These Demo Prompts</span>
          </CardTitle>
          <CardDescription>
            Click on any prompt below to see the Proactive AI Co-Pilot in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoPrompts.map((prompt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-amber-200 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
                onClick={() => handleDemoPromptSelect(prompt.content)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{prompt.title}</h3>
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    {prompt.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{prompt.content}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Demo Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Living Editor</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>AI Oracle</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center space-x-2">
            <Scroll className="w-4 h-4" />
            <span>Pharaonic Flow</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Living Prompt Editor */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span>Living Prompt Editor</span>
                    {isAnalyzingContext && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Analyzing...
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Type or paste a prompt to see real-time AI suggestions and variable highlighting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LivingPromptEditor
                    value={demoPrompt}
                    onChange={setDemoPrompt}
                    sessionId="demo-session-123"
                    placeholder="Start typing your prompt to see the magic happen..."
                    onTemplateSelect={(templateId) => {
                      console.log('Template selected:', templateId);
                      alert(`🎯 Template "${templateId}" selected! This is a demo.`);
                    }}
                  />

                  {demoPrompt && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => handleGenerateWorkflow(demoPrompt)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      >
                        <Scroll className="w-4 h-4 mr-2" />
                        Generate Pharaonic Workflow
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Context Analysis Results */}
              {contextAnalysis && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Real-time Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div>
                      <strong>Intent:</strong> {contextAnalysis.detected_intent.primary}
                      ({Math.round(contextAnalysis.detected_intent.confidence * 100)}% confidence)
                    </div>
                    <div>
                      <strong>Variables Found:</strong> {contextAnalysis.potential_variables.length}
                    </div>
                    <div>
                      <strong>Template Suggestions:</strong> {contextAnalysis.suggested_template_ids.length}
                    </div>
                    <div>
                      <strong>Response Time:</strong> {contextAnalysis.response_time_ms}ms
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* AI Oracle Panel Preview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Oracle Preview</CardTitle>
                  <CardDescription className="text-xs">
                    Switch to the AI Oracle tab for the full experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Eye className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    Real-time insights will appear here as you type
                  </p>
                  <Button
                    onClick={() => setActiveTab('insights')}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    View Full Oracle
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>About AI Oracle</CardTitle>
                <CardDescription>
                  The AI Oracle provides real-time insights about your conversation quality,
                  suggests improvements, and detects when your conversation has template potential.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Quality Scoring</h4>
                    <p className="text-sm text-blue-800">
                      Real-time analysis of clarity, specificity, actionability, and creativity
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-1">Smart Suggestions</h4>
                    <p className="text-sm text-green-800">
                      Actionable improvements to enhance your prompt effectiveness
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <h4 className="font-medium text-amber-900 mb-1">Template Detection</h4>
                    <p className="text-sm text-amber-800">
                      Automatic detection of high-quality conversations worth saving
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <AIOraclePanel
                sessionId="demo-session-123"
                onSaveAsTemplate={handleSaveAsTemplate}
                onApplyImprovement={handleApplyImprovement}
                className="h-fit"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          {showWorkflow && workflowGoal ? (
            <PharaohicFlowView
              goal={workflowGoal}
              onStepComplete={(stepId, result) => {
                console.log('Step completed:', stepId, result);
              }}
              onWorkflowComplete={(workflow) => {
                console.log('Workflow completed:', workflow);
                alert('🏆 Pharaonic Quest Completed! This is a demo.');
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scroll className="w-5 h-5 text-amber-600" />
                  <span>Pharaonic Flow Workflow</span>
                </CardTitle>
                <CardDescription>
                  Transform any goal into a step-by-step pharaonic quest with AI-generated workflows
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mx-auto mb-6 flex items-center justify-center"
                >
                  <Scroll className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-4">No Active Workflow</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Go to the Living Editor tab and enter a goal to generate your pharaonic workflow,
                  or try one of the demo prompts above.
                </p>
                <Button
                  onClick={() => setActiveTab('editor')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  Start Creating
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Feature Overview */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Key Features Demonstrated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Real-time Analysis</h4>
              <p className="text-sm text-gray-600">Context analysis under 150ms with variable highlighting</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">AI Oracle Insights</h4>
              <p className="text-sm text-gray-600">Quality scoring and improvement suggestions</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Scroll className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="font-medium mb-2">Pharaonic Workflows</h4>
              <p className="text-sm text-gray-600">Egyptian-themed step-by-step quest generation</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">Proactive AI</h4>
              <p className="text-sm text-gray-600">Anticipates needs with GitHub Copilot-style suggestions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProactiveAIDemo;