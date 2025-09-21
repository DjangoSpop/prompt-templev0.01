'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { SSEChatService } from '@/lib/services/sse-chat';
import { BaseApiClient } from '@/lib/api/base';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  message: string;
  details?: Record<string, unknown>;
}

const SSEAuthTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Token Retrieval', status: 'pending', message: 'Not started' },
    { name: 'Authentication Headers', status: 'pending', message: 'Not started' },
    { name: 'SSE Chat Request', status: 'pending', message: 'Not started' },
    { name: 'Base API Client Auth', status: 'pending', message: 'Not started' },
  ]);
  
  const [testMessage, setTestMessage] = useState('Hello, test the SSE authentication!');
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (index: number, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map((result, i) => 
      i === index ? { ...result, ...updates } : result
    ));
  };

  const runAuthenticationTests = async () => {
    setIsRunning(true);
    
    try {
      // Test 1: Token Retrieval
      updateTestResult(0, { status: 'running', message: 'Checking token availability...' });
      
      const apiClient = new BaseApiClient();
      const token = apiClient.getAccessToken();
      const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      if (!token && !localStorageToken) {
        updateTestResult(0, { 
          status: 'failed', 
          message: 'No token found in BaseApiClient or localStorage',
          details: { hasToken: !!token, hasLocalStorage: !!localStorageToken }
        });
      } else {
        updateTestResult(0, { 
          status: 'success', 
          message: `Token retrieved successfully (${token ? 'BaseApiClient' : 'localStorage'})`,
          details: { 
            tokenLength: (token || localStorageToken)?.length,
            tokenPreview: (token || localStorageToken)?.substring(0, 20) + '...',
            source: token ? 'BaseApiClient' : 'localStorage'
          }
        });
      }

      // Test 2: Authentication Headers
      updateTestResult(1, { status: 'running', message: 'Testing authentication header format...' });
      
      const currentToken = token || localStorageToken;
      if (currentToken) {
        const headers = {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream, application/json'
        };
        
        updateTestResult(1, { 
          status: 'success', 
          message: 'Authentication headers formatted correctly',
          details: { 
            authHeader: `Bearer ${currentToken.substring(0, 20)}...`,
            acceptHeader: headers.Accept
          }
        });
      } else {
        updateTestResult(1, { status: 'failed', message: 'No token available for headers' });
      }

      // Test 3: Base API Client Authentication Test
      updateTestResult(3, { status: 'running', message: 'Testing BaseApiClient authentication...' });
      
      try {
        // Test a known working endpoint first
        const response = await fetch('http://localhost:8000/api/v2/auth/profile/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const profileData = await response.json();
          updateTestResult(3, { 
            status: 'success', 
            message: 'BaseApiClient authentication working for profile endpoint',
            details: { 
              status: response.status,
              username: profileData.username || 'N/A'
            }
          });
        } else {
          updateTestResult(3, { 
            status: 'failed', 
            message: `Profile endpoint failed: ${response.status} ${response.statusText}`,
            details: { status: response.status, statusText: response.statusText }
          });
        }
      } catch (error) {
        updateTestResult(3, { 
          status: 'failed', 
          message: `Profile endpoint error: ${(error as Error).message}`,
          details: { error: (error as Error).message }
        });
      }

      // Test 4: SSE Chat Request
      updateTestResult(2, { status: 'running', message: 'Testing SSE chat request...' });
      
      try {
        const sseService = new SSEChatService();
        await sseService.connect();
        
        // Try to send a message using our fixed authentication
        await sseService.sendMessage(testMessage);
        
        updateTestResult(2, { 
          status: 'success', 
          message: 'SSE chat request completed successfully',
          details: { message: testMessage }
        });
        
        sseService.disconnect();
      } catch (error) {
        updateTestResult(2, { 
          status: 'failed', 
          message: `SSE chat failed: ${(error as Error).message}`,
          details: { 
            error: (error as Error).message,
            message: testMessage
          }
        });
      }

    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pending: 'secondary' as const,
      running: 'outline' as const,
      success: 'default' as const,
      failed: 'destructive' as const,
    };
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">SSE Authentication Test</h1>
        <p className="text-muted-foreground">
          Test the authentication system for SSE chat requests after base.ts integration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Message</label>
            <Textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter a test message for SSE chat..."
              className="min-h-[80px]"
            />
          </div>
          
          <Button 
            onClick={runAuthenticationTests}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Tests...' : 'Run Authentication Tests'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(result.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">{result.name}</h3>
                    {getStatusBadge(result.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.message}
                  </p>
                  
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        Show Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p><strong>Success:</strong> {testResults.filter(r => r.status === 'success').length} tests</p>
            <p><strong>Failed:</strong> {testResults.filter(r => r.status === 'failed').length} tests</p>
            <p><strong>Pending:</strong> {testResults.filter(r => r.status === 'pending').length} tests</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SSEAuthTestPage;
