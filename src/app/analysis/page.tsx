'use client';

import { useState, useCallback } from 'react';
import { useConfig } from '@/providers/ConfigProvider';
import { apiClient } from '@/lib/api-client';
import { TemplateCreateUpdate } from '@/lib/types';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Award,
  Download,
  Save,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ChatExport {
  title?: string;
  conversations?: Array<{
    title?: string;
    messages: ChatMessage[];
  }>;
  messages?: ChatMessage[];
}

interface AnalysisResults {
  topPrompts: Array<{
    content: string;
    frequency: number;
    avgResponseLength: number;
    effectivenessScore: number;
  }>;
  clusters: Array<{
    name: string;
    prompts: string[];
    similarityScore: number;
  }>;
  insights: {
    mostEffectivePatterns: string[];
    improvementSuggestions: string[];
    usageStatistics: Record<string, number>;
  };
}

export default function AnalysisPage() {
  const { config } = useConfig();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getFeature = (featureName: string) => {
    return config?.features?.[featureName] || true;
  };

  const chatAnalysisEnabled = getFeature('chat_analysis');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
    }
  }, []);

  const parseJsonFile = async (file: File): Promise<ChatExport> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          resolve(parsed);
        } catch {
          reject(new Error('Invalid JSON format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const extractMessages = (chatData: ChatExport): ChatMessage[] => {
    let allMessages: ChatMessage[] = [];

    // Handle different chat export formats
    if (chatData.messages) {
      // Direct messages array
      allMessages = chatData.messages;
    } else if (chatData.conversations) {
      // Conversations array (ChatGPT format)
      chatData.conversations.forEach(conversation => {
        if (conversation.messages) {
          allMessages.push(...conversation.messages);
        }
      });
    }

    return allMessages.filter(msg => msg.role === 'user'); // Only analyze user prompts
  };

  const analyzePrompts = (messages: ChatMessage[]): AnalysisResults => {
    const prompts = messages.map(msg => msg.content);
    
    // Count prompt frequencies
    const promptCounts = new Map<string, number>();
    prompts.forEach(prompt => {
      promptCounts.set(prompt, (promptCounts.get(prompt) || 0) + 1);
    });

    // Calculate top prompts with mock effectiveness scores
    const topPrompts = Array.from(promptCounts.entries())
      .map(([content, frequency]) => ({
        content,
        frequency,
        avgResponseLength: Math.floor(Math.random() * 500) + 100, // Mock data
        effectivenessScore: Math.random() * 0.4 + 0.6, // Mock score between 0.6-1.0
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Simple clustering based on common words
    const clusters = performSimpleClustering(prompts);

    // Generate insights
    const insights = {
      mostEffectivePatterns: [
        'Questions starting with "How" tend to get better responses',
        'Specific context improves response quality',
        'Step-by-step requests are more effective',
      ],
      improvementSuggestions: [
        'Add more context to your prompts',
        'Be more specific about desired output format',
        'Use examples to clarify expectations',
      ],
      usageStatistics: {
        totalPrompts: prompts.length,
        uniquePrompts: promptCounts.size,
        avgPromptLength: prompts.reduce((sum, p) => sum + p.length, 0) / prompts.length,
        mostActiveHour: Math.floor(Math.random() * 24),
      },
    };

    return { topPrompts, clusters, insights };
  };

  const performSimpleClustering = (prompts: string[]): Array<{
    name: string;
    prompts: string[];
    similarityScore: number;
  }> => {
    // Simple clustering based on keywords
    const clusters = new Map<string, string[]>();
    
    const keywordGroups = {
      'Writing': ['write', 'draft', 'compose', 'create text'],
      'Code': ['code', 'program', 'function', 'debug', 'script'],
      'Analysis': ['analyze', 'review', 'examine', 'evaluate'],
      'Questions': ['what', 'how', 'why', 'when', 'where'],
      'Planning': ['plan', 'strategy', 'organize', 'schedule'],
    };

    prompts.forEach(prompt => {
      const lowerPrompt = prompt.toLowerCase();
      let assigned = false;
      
      for (const [category, keywords] of Object.entries(keywordGroups)) {
        if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
          if (!clusters.has(category)) {
            clusters.set(category, []);
          }
          clusters.get(category)!.push(prompt);
          assigned = true;
          break;
        }
      }
      
      if (!assigned) {
        if (!clusters.has('Other')) {
          clusters.set('Other', []);
        }
        clusters.get('Other')!.push(prompt);
      }
    });

    return Array.from(clusters.entries())
      .map(([name, prompts]) => ({
        name,
        prompts: prompts.slice(0, 5), // Limit to 5 examples
        similarityScore: Math.random() * 0.3 + 0.7, // Mock similarity score
      }))
      .filter(cluster => cluster.prompts.length > 0);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Parse the uploaded file
      const chatData = await parseJsonFile(uploadedFile);
      const messages = extractMessages(chatData);

      if (messages.length === 0) {
        throw new Error('No user messages found in the file');
      }

      // Perform client-side analysis
      const results = analyzePrompts(messages);
      setAnalysisResults(results);

      // Track analysis event
      await apiClient.trackEvent({
        event_type: 'chat_analysis_completed',
        data: {
          file_name: uploadedFile.name,
          message_count: messages.length,
          unique_prompts: results.topPrompts.length,
        },
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTemplate = async (promptContent: string) => {
    try {
      const templateData: TemplateCreateUpdate = {
        title: `Analyzed Prompt - ${new Date().toLocaleDateString()}`,
        description: 'Template created from chat analysis',
        category: 1, // Default category
        template_content: promptContent,
        version: '1.0',
        is_public: false,
      };

      const newTemplate = await apiClient.createTemplate(templateData);
      
      await apiClient.trackEvent({
        event_type: 'template_created_from_analysis',
        data: {
          template_id: newTemplate.id,
          source: 'chat_analysis',
        },
      });

      console.log('Template created successfully!');
      // TODO: Show success notification
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleExportResults = () => {
    if (!analysisResults) return;

    const exportData = {
      analysis_date: new Date().toISOString(),
      file_name: uploadedFile?.name,
      results: analysisResults,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_analysis_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!chatAnalysisEnabled) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Not Available</h3>
          <p className="text-gray-600">
            Chat analysis is not enabled in your current configuration.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen temple-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section with Egyptian Elements */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 pharaoh-badge rounded-full flex items-center justify-center pyramid-elevation-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-hieroglyph text-glow-lg">
                The Sacred Observatory
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Decipher the ancient patterns of conversation • Unlock hidden wisdom
              </p>
            </div>
          </div>
          
          {/* Claude Integration Banner */}
          {/* <Card className="temple-card p-6 mb-8 pyramid-elevation border-2 border-orange-400/30">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center pyramid-elevation">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-orange-600 text-glow">
                  Claude-Powered Analysis
                </h3>
                <p className="text-muted-foreground">
                  Advanced conversation analysis with Claude&apos;s intelligence
                </p>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white pharaoh-glow">
                Enable Claude Analysis
              </Button>
              <Button variant="outline" className="border-orange-400 text-orange-600 hover:bg-orange-50">
                Learn More
              </Button>
            </div>
          </Card> */}
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-hieroglyph text-glow">Sacred Text Analysis</h2>
          <p className="text-muted-foreground mt-2">
            Upload your conversation scrolls to analyze patterns and discover ancient wisdom.
          </p>
        </div>

      {/* Upload Section */}
      <Card className="temple-card p-6 mb-8 pyramid-elevation">
        <h2 className="text-xl font-semibold mb-4 text-hieroglyph text-glow">Upload Sacred Scrolls</h2>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium text-hieroglyph mb-2">
                Upload Sacred Text (JSON)
              </p>
              <p className="text-muted-foreground">
                Supports ChatGPT, Claude, and other conversation exports in JSON format
              </p>
            </label>
          </div>

          {uploadedFile && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">{uploadedFile.name}</span>
                <span className="text-blue-600 text-sm">
                  ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center space-x-2"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
                <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
              </Button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Analysis Results */}
      {analysisResults && (
        <div className="space-y-8">
          {/* Export Controls */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleExportResults}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Results</span>
            </Button>
          </div>

          {/* Usage Statistics */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Usage Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analysisResults.insights.usageStatistics.totalPrompts}
                </div>
                <div className="text-sm text-gray-600">Total Prompts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analysisResults.insights.usageStatistics.uniquePrompts}
                </div>
                <div className="text-sm text-gray-600">Unique Prompts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(analysisResults.insights.usageStatistics.avgPromptLength)}
                </div>
                <div className="text-sm text-gray-600">Avg Length</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {analysisResults.insights.usageStatistics.mostActiveHour}:00
                </div>
                <div className="text-sm text-gray-600">Most Active Hour</div>
              </div>
            </div>
          </Card>

          {/* Top Prompts Leaderboard */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Most Effective Prompts
            </h3>
            <div className="space-y-4">
              {analysisResults.topPrompts.slice(0, 5).map((prompt, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      #{index + 1} • Used {prompt.frequency} times
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Effectiveness: {(prompt.effectivenessScore * 100).toFixed(0)}%
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreateTemplate(prompt.content)}
                        className="flex items-center space-x-1"
                      >
                        <Save className="h-3 w-3" />
                        <span>Save as Template</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-900">{prompt.content}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span>Avg Response: {prompt.avgResponseLength} chars</span>
                    <span>Score: {(prompt.effectivenessScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Prompt Clusters */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Prompt Categories
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {analysisResults.clusters.map((cluster, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {cluster.name}
                    <span className="ml-2 text-sm text-gray-600">
                      ({cluster.prompts.length} prompts)
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {cluster.prompts.slice(0, 3).map((prompt, promptIndex) => (
                      <p key={promptIndex} className="text-sm text-gray-700 truncate">
                        • {prompt}
                      </p>
                    ))}
                    {cluster.prompts.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{cluster.prompts.length - 3} more prompts
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Insights and Recommendations */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Insights & Recommendations</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Effective Patterns</h4>
                <ul className="space-y-2">
                  {analysisResults.insights.mostEffectivePatterns.map((pattern, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Improvement Suggestions</h4>
                <ul className="space-y-2">
                  {analysisResults.insights.improvementSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  </div>
  );
}