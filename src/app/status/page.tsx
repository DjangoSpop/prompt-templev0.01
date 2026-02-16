'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { StepTracker } from '@/components/onboarding/StepTracker';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw, 
  Server, 
  Wifi, 
  CreditCard,
  MessageSquare,
  Zap,
  Globe,
  Database
} from 'lucide-react';

interface TestResult {
  success: boolean;
  backend_status?: string;
  backend_data?: Record<string, unknown>;
  frontend_time?: string;
  websocket_url?: string;
  api_url?: string;
  error?: string;
  billing_test?: Array<{
    endpoint: string;
    status: number;
    ok: boolean;
    data?: Record<string, unknown>;
  }>;
  status_endpoint?: {
    status: number;
    ok: boolean;
    data?: Record<string, unknown>;
  };
}

export default function StatusPage() {
  const [systemStatus, setSystemStatus] = useState<TestResult | null>(null);
  const [billingTest, setBillingTest] = useState<TestResult | null>(null);
  const [websocketTest, setWebsocketTest] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runSystemTest();
  }, []);

  const runSystemTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      setSystemStatus({
        success: false,
        error: error instanceof Error ? error.message : 'System test failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const runBillingTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_billing' })
      });
      const data = await response.json();
      setBillingTest(data);
    } catch (error) {
      setBillingTest({
        success: false,
        error: error instanceof Error ? error.message : 'Billing test failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const runWebSocketTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_websocket' })
      });
      const data = await response.json();
      setWebsocketTest(data);
    } catch (error) {
      setWebsocketTest({
        success: false,
        error: error instanceof Error ? error.message : 'WebSocket test failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ success }: { success: boolean | undefined }) => {
    if (success === undefined) return <Loader2 className="h-4 w-4 animate-spin" />;
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const StatusBadge = ({ success }: { success: boolean | undefined }) => {
    if (success === undefined) return <Badge variant="secondary">Testing...</Badge>;
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "Operational" : "Error"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Track onboarding step completion */}
      <StepTracker stepId="analytics" />
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔧 PromptCraft System Status
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time system health and integration testing dashboard
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex gap-4">
          <Button onClick={runSystemTest} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh System Status
          </Button>
          <Button onClick={runBillingTest} variant="outline" disabled={loading}>
            <CreditCard className="h-4 w-4 mr-2" />
            Test Billing
          </Button>
          <Button onClick={runWebSocketTest} variant="outline" disabled={loading}>
            <Wifi className="h-4 w-4 mr-2" />
            Test WebSocket
          </Button>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Server className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="font-medium">Backend API</div>
                  <StatusBadge success={systemStatus?.success} />
                </div>
                <StatusIcon success={systemStatus?.success} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Wifi className="h-8 w-8 text-green-500" />
                <div>
                  <div className="font-medium">WebSocket</div>
                  <StatusBadge success={websocketTest?.success} />
                </div>
                <StatusIcon success={websocketTest?.success} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="font-medium">Billing</div>
                  <StatusBadge success={billingTest?.success} />
                </div>
                <StatusIcon success={billingTest?.success} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="font-medium">AI Chat</div>
                  <StatusBadge success={systemStatus?.success && websocketTest?.success} />
                </div>
                <StatusIcon success={systemStatus?.success && websocketTest?.success} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Backend Status:</span>
                      <div className="font-medium">
                        {systemStatus.backend_status || 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">API URL:</span>
                      <div className="font-mono text-xs break-all">
                        {systemStatus.api_url}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">WebSocket URL:</span>
                      <div className="font-mono text-xs break-all">
                        {systemStatus.websocket_url}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Check:</span>
                      <div className="text-xs">
                        {systemStatus.frontend_time ? 
                          new Date(systemStatus.frontend_time).toLocaleTimeString() : 
                          'Never'
                        }
                      </div>
                    </div>
                  </div>

                  {systemStatus.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{systemStatus.error}</AlertDescription>
                    </Alert>
                  )}

                  {systemStatus.backend_data && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                      <div className="text-sm font-medium mb-2">Backend Response:</div>
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(systemStatus.backend_data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {billingTest ? (
                <div className="space-y-4">
                  {billingTest.success ? (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Endpoint Tests:</div>
                      <div className="space-y-2">
                        {billingTest.billing_test?.map((test, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{test.endpoint}</span>
                            <Badge variant={test.ok ? "default" : "destructive"}>
                              {test.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{billingTest.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button onClick={runBillingTest} variant="outline" disabled={loading}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Test Billing Integration
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* WebSocket Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                WebSocket Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {websocketTest ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">WebSocket URL:</span>
                      <div className="font-mono text-xs break-all">
                        {websocketTest.websocket_url}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Status Test:</span>
                      <Badge variant={websocketTest.status_endpoint?.ok ? "default" : "destructive"}>
                        {websocketTest.status_endpoint?.status || 'Error'}
                      </Badge>
                    </div>
                  </div>

                  {websocketTest.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{websocketTest.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button onClick={runWebSocketTest} variant="outline" disabled={loading}>
                    <Wifi className="h-4 w-4 mr-2" />
                    Test WebSocket Connection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={() => window.open('/chat/live', '_blank')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Live Chat Interface
                </Button>
                
                <Button 
                  onClick={() => window.open('/chat/test', '_blank')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Basic Chat Test
                </Button>
                
                <Button 
                  onClick={() => window.open(`${systemStatus?.api_url || 'https://api.prompt-temple.com'}/admin/`, '_blank')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Django Admin
                </Button>
                
                <Button 
                  onClick={() => window.open(`${systemStatus?.api_url || 'https://api.prompt-temple.com'}/api/v2/`, '_blank')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Server className="h-4 w-4 mr-2" />
                  API Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environment Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">API Base URL:</span>
                <div className="font-mono">{process.env.NEXT_PUBLIC_API_URL || 'https://api.prompt-temple.com'}</div>
              </div>
              <div>
                <span className="text-gray-600">WebSocket URL:</span>
                <div className="font-mono">{process.env.NEXT_PUBLIC_WS_URL || 'wss://api.prompt-temple.com'}</div>
              </div>
              <div>
                <span className="text-gray-600">Environment:</span>
                <div className="font-mono">{process.env.NODE_ENV || 'development'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
