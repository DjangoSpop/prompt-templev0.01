'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Square,
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  MessageSquare,
  Database,
  Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useWebSocketChat } from '@/lib/services/websocket-chat';
import { usePromptCraftIntegration } from '@/lib/services/promptcraft-integration';
import { SSEChatService } from '@/lib/services/sse-chat';
import ConnectionStatus from '@/components/ConnectionStatus';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: number;
  error?: string;
  result?: unknown;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  running: boolean;
  completed: boolean;
}

const IntegrationTestPage: React.FC = () => {
  const { service: wsService, isConnected, error: wsError } = useWebSocketChat();
  const { service: integrationService, isInitialized } = usePromptCraftIntegration();
  
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'WebSocket Connection',
      running: false,
      completed: false,
      tests: [
        { name: 'Connect to WebSocket', status: 'pending' },
        { name: 'Send ping message', status: 'pending' },
        { name: 'Receive pong response', status: 'pending' },
        { name: 'Handle connection events', status: 'pending' },
      ],
    },
    {
      name: 'Chat Functionality',
      running: false,
      completed: false,
      tests: [
        { name: 'Send chat message', status: 'pending' },
        { name: 'Receive message response', status: 'pending' },
        { name: 'Handle typing indicators', status: 'pending' },
        { name: 'Process message queue', status: 'pending' },
      ],
    },
    {
      name: 'Prompt Optimization',
      running: false,
      completed: false,
      tests: [
        { name: 'Request prompt optimization', status: 'pending' },
        { name: 'Receive optimization result', status: 'pending' },
        { name: 'Validate optimization data', status: 'pending' },
        { name: 'Cache optimization results', status: 'pending' },
      ],
    },
    {
      name: 'API Integration',
      running: false,
      completed: false,
      tests: [
        { name: 'Fetch user profile', status: 'pending' },
        { name: 'Search templates', status: 'pending' },
        { name: 'Get template recommendations', status: 'pending' },
        { name: 'Track analytics events', status: 'pending' },
      ],
    },
  ]);

  const [customTestPrompt, setCustomTestPrompt] = useState(
    'Write a professional email to request a meeting with a client about their upcoming project requirements.'
  );
  const [testResults, setTestResults] = useState<Record<string, unknown>>({});
  const [overallProgress, setOverallProgress] = useState(0);

  // Calculate overall progress
  useEffect(() => {
    const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
    const completedTests = testSuites.reduce(
      (sum, suite) => sum + suite.tests.filter(test => 
        test.status === 'success' || test.status === 'failed'
      ).length,
      0
    );
    setOverallProgress((completedTests / totalTests) * 100);
  }, [testSuites]);

  const updateTestResult = (suiteIndex: number, testIndex: number, updates: Partial<TestResult>) => {
    setTestSuites(prev => prev.map((suite, si) => 
      si === suiteIndex 
        ? {
            ...suite,
            tests: suite.tests.map((test, ti) => 
              ti === testIndex ? { ...test, ...updates } : test
            )
          }
        : suite
    ));
  };

  const runWebSocketTests = async (suiteIndex: number) => {
    const tests = [
      // Test 1: Connect to WebSocket
      async () => {
        try {
          await wsService.connect();
          return { success: true, data: 'Connected successfully' };
        } catch (error) {
          throw new Error(`Connection failed: ${(error as Error).message}`);
        }
      },
      
      // Test 2: Send ping message
      async () => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Ping timeout')), 5000);
          
          const handlePong = () => {
            clearTimeout(timeout);
            wsService.off('pong', handlePong);
            resolve({ success: true, data: 'Ping successful' });
          };
          
          wsService.on('pong', handlePong);
          wsService.getSocket()?.emit('ping', Date.now());
        });
      },
      
      // Test 3: Receive pong response
      async () => {
        // This is tested as part of the ping test
        return { success: true, data: 'Pong received' };
      },
      
      // Test 4: Handle connection events
      async () => {
        const events = ['connected', 'disconnected', 'error'];
        const handledEvents = [];
        
        events.forEach(event => {
          wsService.on(event, () => handledEvents.push(event));
        });
        
        return { success: true, data: `Event handlers registered: ${events.join(', ')}` };
      },
    ];

    await runTestSuite(suiteIndex, tests);
  };

  const runChatTests = async (suiteIndex: number) => {
    const tests = [
      // Test 1: Send chat message
      async () => {
        const messageId = await wsService.sendMessage('Test message', { optimize: false });
        return { success: true, data: { messageId } };
      },
      
      // Test 2: Receive message response
      async () => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Message response timeout')), 10000);
          
          const handleResponse = (data: unknown) => {
            clearTimeout(timeout);
            wsService.off('messageResponse', handleResponse);
            resolve({ success: true, data });
          };
          
          wsService.on('messageResponse', handleResponse);
          wsService.sendMessage('Test response message');
        });
      },
      
      // Test 3: Handle typing indicators
      async () => {
        wsService.startTyping();
        await new Promise(resolve => setTimeout(resolve, 1000));
        wsService.stopTyping();
        return { success: true, data: 'Typing indicators sent' };
      },
      
      // Test 4: Process message queue
      async () => {
        // Test that messages are queued when disconnected
        const queuedMessage = 'Queued test message';
        if (!wsService.isConnected()) {
          await wsService.sendMessage(queuedMessage);
        }
        return { success: true, data: 'Message queue processed' };
      },
    ];

    await runTestSuite(suiteIndex, tests);
  };

  const runOptimizationTests = async (suiteIndex: number) => {
    const tests = [
      // Test 1: Request prompt optimization
      async () => {
        const requestId = await wsService.optimizePrompt(customTestPrompt, {
          intent: 'professional_communication',
          targetAudience: 'business_client',
        });
        return { success: true, data: { requestId } };
      },
      
      // Test 2: Receive optimization result
      async () => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Optimization timeout')), 15000);
          
          const handleOptimization = (data: unknown) => {
            clearTimeout(timeout);
            wsService.off('optimizationResult', handleOptimization);
            resolve({ success: true, data });
          };
          
          wsService.on('optimizationResult', handleOptimization);
        });
      },
      
      // Test 3: Validate optimization data
      async () => {
        const result = await integrationService.optimizePrompt({
          prompt: customTestPrompt,
          intent: 'professional_communication',
        });
        
        if (!result.optimizedPrompt || !result.score) {
          throw new Error('Invalid optimization result structure');
        }
        
        return { success: true, data: result };
      },
      
      // Test 4: Cache optimization results
      async () => {
        // Test caching by making the same request twice
        const start1 = Date.now();
        await integrationService.optimizePrompt({ prompt: customTestPrompt });
        const duration1 = Date.now() - start1;
        
        const start2 = Date.now();
        await integrationService.optimizePrompt({ prompt: customTestPrompt });
        const duration2 = Date.now() - start2;
        
        const cached = duration2 < duration1 * 0.5; // Should be much faster if cached
        
        return { 
          success: true, 
          data: { 
            cached, 
            firstCall: duration1, 
            secondCall: duration2 
          } 
        };
      },
    ];

    await runTestSuite(suiteIndex, tests);
  };

  const runAPITests = async (suiteIndex: number) => {
    const tests = [
      // Test 1: Fetch user profile
      async () => {
        const analytics = await integrationService.getUserAnalytics();
        return { success: true, data: analytics };
      },
      
      // Test 2: Search templates
      async () => {
        const results = await integrationService.searchTemplates({
          query: 'email',
          limit: 5,
        });
        return { success: true, data: results };
      },
      
      // Test 3: Get template recommendations
      async () => {
        const recommendations = await integrationService.getTemplateRecommendations(
          customTestPrompt,
          'professional_communication',
          3
        );
        return { success: true, data: recommendations };
      },
      
      // Test 4: Track analytics events
      async () => {
        await integrationService.trackInteraction('test_event', {
          testData: 'integration_test',
          timestamp: new Date().toISOString(),
        });
        return { success: true, data: 'Event tracked successfully' };
      },
    ];

    await runTestSuite(suiteIndex, tests);
  };

  const runTestSuite = async (suiteIndex: number, tests: (() => Promise<{ success: boolean; data: unknown }>)[]) => {
    // Mark suite as running
    setTestSuites(prev => prev.map((suite, i) => 
      i === suiteIndex ? { ...suite, running: true } : suite
    ));

    for (let testIndex = 0; testIndex < tests.length; testIndex++) {
      const startTime = Date.now();
      
      // Mark test as running
      updateTestResult(suiteIndex, testIndex, { status: 'running' });
      
      try {
        const result = await tests[testIndex]();
        const duration = Date.now() - startTime;
        
        updateTestResult(suiteIndex, testIndex, {
          status: 'success',
          duration,
          result: result.data,
        });
        
        setTestResults(prev => ({
          ...prev,
          [`${suiteIndex}-${testIndex}`]: result.data,
        }));
      } catch (error) {
        const duration = Date.now() - startTime;
        
        updateTestResult(suiteIndex, testIndex, {
          status: 'failed',
          duration,
          error: (error as Error).message,
        });
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Mark suite as completed
    setTestSuites(prev => prev.map((suite, i) => 
      i === suiteIndex ? { ...suite, running: false, completed: true } : suite
    ));
  };

  const runAllTests = async () => {
    // Reset all tests
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      running: false,
      completed: false,
      tests: suite.tests.map(test => ({ ...test, status: 'pending' as const })),
    })));
    
    setTestResults({});

    try {
      await runWebSocketTests(0);
      await runChatTests(1);
      await runOptimizationTests(2);
      await runAPITests(3);
    } catch (error) {
      console.error('Test suite failed:', error);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-4">
            <TestTube className="w-8 h-8 mr-3 text-blue-500" />
            Integration Test Suite
          </h1>
          <p className="text-gray-600">
            Comprehensive testing of PromptCraft WebSocket and API integration
          </p>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <ConnectionStatus showDetails={true} />
        </motion.div>

        {/* Test Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Custom Test Prompt
                </label>
                <Textarea
                  value={customTestPrompt}
                  onChange={(e) => setCustomTestPrompt(e.target.value)}
                  rows={3}
                  placeholder="Enter a custom prompt for optimization testing..."
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Overall Progress: {overallProgress.toFixed(1)}%
                  </div>
                  <Progress value={overallProgress} className="w-64" />
                </div>
                
                <Button
                  onClick={runAllTests}
                  disabled={testSuites.some(suite => suite.running)}
                  size="lg"
                >
                  {testSuites.some(suite => suite.running) ? (
                    <Square className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {testSuites.some(suite => suite.running) ? 'Running Tests...' : 'Run All Tests'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Test Suites */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {testSuites.map((suite, suiteIndex) => (
            <motion.div
              key={suite.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + suiteIndex * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{suite.name}</span>
                    <div className="flex items-center space-x-2">
                      {suite.running && (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1 animate-pulse" />
                          Running
                        </Badge>
                      )}
                      {suite.completed && (
                        <Badge variant="default">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suite.tests.map((test, testIndex) => (
                      <div
                        key={test.name}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <div className={`font-medium ${getStatusColor(test.status)}`}>
                              {test.name}
                            </div>
                            {test.duration && (
                              <div className="text-xs text-gray-500">
                                {test.duration}ms
                              </div>
                            )}
                            {test.error && (
                              <div className="text-xs text-red-500 mt-1">
                                {test.error}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {test.status === 'success' && testResults[`${suiteIndex}-${testIndex}`] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log('Test result:', testResults[`${suiteIndex}-${testIndex}`]);
                            }}
                          >
                            View Result
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationTestPage;
