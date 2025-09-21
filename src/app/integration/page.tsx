'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Zap,
  MessageSquare,
  BarChart3,
  Trophy,
  Cpu,
  Database,
  Globe,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Play,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { EnhancedChatInterface } from '@/components/EnhancedChatInterface';
import ConnectionStatus from '@/components/ConnectionStatus';
import { usePromptCraftIntegration } from '@/lib/services/promptcraft-integration';
import { useWebSocketChat } from '@/lib/services/websocket-chat';

interface SystemStatus {
  api: 'connected' | 'disconnected' | 'error';
  websocket: 'connected' | 'connecting' | 'disconnected' | 'error';
  database: 'healthy' | 'slow' | 'error';
  ai_services: 'operational' | 'degraded' | 'offline';
}

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  activeUsers: number;
}

const ConfigurationDashboard: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api: 'disconnected',
    websocket: 'disconnected',
    database: 'healthy',
    ai_services: 'operational',
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    activeUsers: 0,
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    realTimeOptimization: true,
    templateRecommendations: true,
    analytics: true,
    gamification: true,
    autoSave: true,
    notifications: true,
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const { service: integrationService, isInitialized, isLoading, error } = usePromptCraftIntegration();
  const { isConnected: wsConnected, isConnecting: wsConnecting } = useWebSocketChat();

  // Update system status based on service states
  useEffect(() => {
    setSystemStatus(prev => ({
      ...prev,
      api: error ? 'error' : isInitialized ? 'connected' : 'disconnected',
      websocket: wsConnecting ? 'connecting' : wsConnected ? 'connected' : 'disconnected',
    }));
  }, [error, isInitialized, wsConnected, wsConnecting]);

  // Simulate performance metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceMetrics({
        responseTime: Math.floor(Math.random() * 200) + 50,
        throughput: Math.floor(Math.random() * 1000) + 500,
        errorRate: Math.random() * 5,
        activeUsers: Math.floor(Math.random() * 50) + 10,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      await integrationService.initialize();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate test
    } catch (err) {
      console.error('Connection test failed:', err);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
      case 'operational':
        return 'text-green-500';
      case 'connecting':
      case 'slow':
      case 'degraded':
        return 'text-yellow-500';
      case 'disconnected':
      case 'error':
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'healthy':
      case 'operational':
        return <CheckCircle className="w-4 h-4" />;
      case 'connecting':
      case 'slow':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'disconnected':
      case 'error':
      case 'offline':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <RefreshCw className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Settings className="w-8 h-8 mr-3 text-blue-500" />
                PromptCraft Integration Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Configure and monitor your PromptCraft AI integration
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={isInitialized ? 'default' : 'secondary'}>
                {isLoading ? 'Initializing...' : isInitialized ? 'Active' : 'Inactive'}
              </Badge>
              <Button
                onClick={testConnection}
                disabled={isTestingConnection}
                variant="outline"
              >
                {isTestingConnection ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Test Connection
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <ConnectionStatus showDetails={true} />
        </motion.div>

        {/* Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API Status</p>
                  <p className={`text-lg font-semibold ${getStatusColor(systemStatus.api)}`}>
                    {systemStatus.api}
                  </p>
                </div>
                <div className={getStatusColor(systemStatus.api)}>
                  {getStatusIcon(systemStatus.api)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">WebSocket</p>
                  <p className={`text-lg font-semibold ${getStatusColor(systemStatus.websocket)}`}>
                    {systemStatus.websocket}
                  </p>
                </div>
                <div className={getStatusColor(systemStatus.websocket)}>
                  {getStatusIcon(systemStatus.websocket)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Database</p>
                  <p className={`text-lg font-semibold ${getStatusColor(systemStatus.database)}`}>
                    {systemStatus.database}
                  </p>
                </div>
                <div className={getStatusColor(systemStatus.database)}>
                  {getStatusIcon(systemStatus.database)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Services</p>
                  <p className={`text-lg font-semibold ${getStatusColor(systemStatus.ai_services)}`}>
                    {systemStatus.ai_services}
                  </p>
                </div>
                <div className={getStatusColor(systemStatus.ai_services)}>
                  {getStatusIcon(systemStatus.ai_services)}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="chat">Live Chat</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    Features Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Real-time Optimization</span>
                    <Badge variant={integrationSettings.realTimeOptimization ? 'default' : 'secondary'}>
                      {integrationSettings.realTimeOptimization ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Template Recommendations</span>
                    <Badge variant={integrationSettings.templateRecommendations ? 'default' : 'secondary'}>
                      {integrationSettings.templateRecommendations ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analytics Tracking</span>
                    <Badge variant={integrationSettings.analytics ? 'default' : 'secondary'}>
                      {integrationSettings.analytics ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Gamification</span>
                    <Badge variant={integrationSettings.gamification ? 'default' : 'secondary'}>
                      {integrationSettings.gamification ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm text-gray-600">{performanceMetrics.responseTime}ms</span>
                    </div>
                    <Progress value={(300 - performanceMetrics.responseTime) / 3} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Throughput</span>
                      <span className="text-sm text-gray-600">{performanceMetrics.throughput}/min</span>
                    </div>
                    <Progress value={performanceMetrics.throughput / 15} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Error Rate</span>
                      <span className="text-sm text-gray-600">{performanceMetrics.errorRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={100 - performanceMetrics.errorRate * 20} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
                    Chat Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Real-time Optimization</label>
                      <p className="text-xs text-gray-600">Automatically optimize prompts as they&apos;re typed</p>
                    </div>
                    <Switch
                      checked={integrationSettings.realTimeOptimization}
                      onCheckedChange={(checked: boolean) =>
                        setIntegrationSettings(prev => ({ ...prev, realTimeOptimization: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Template Recommendations</label>
                      <p className="text-xs text-gray-600">Suggest relevant templates based on input</p>
                    </div>
                    <Switch
                      checked={integrationSettings.templateRecommendations}
                      onCheckedChange={(checked: boolean) =>
                        setIntegrationSettings(prev => ({ ...prev, templateRecommendations: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-purple-500" />
                    Gamification & Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Analytics Tracking</label>
                      <p className="text-xs text-gray-600">Track usage patterns and performance</p>
                    </div>
                    <Switch
                      checked={integrationSettings.analytics}
                      onCheckedChange={(checked: boolean) =>
                        setIntegrationSettings(prev => ({ ...prev, analytics: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Gamification</label>
                      <p className="text-xs text-gray-600">Enable badges, levels, and achievements</p>
                    </div>
                    <Switch
                      checked={integrationSettings.gamification}
                      onCheckedChange={(checked: boolean) =>
                        setIntegrationSettings(prev => ({ ...prev, gamification: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cpu className="w-5 h-5 mr-2 text-red-500" />
                    System Load
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor(Math.random() * 40) + 20}%
                  </div>
                  <p className="text-sm text-gray-600">CPU Usage</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2 text-blue-500" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor(Math.random() * 30) + 50}%
                  </div>
                  <p className="text-sm text-gray-600">RAM Utilization</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-green-500" />
                    Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor(Math.random() * 100) + 200}ms
                  </div>
                  <p className="text-sm text-gray-600">Avg Latency</p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Live Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[600px]"
            >
              <EnhancedChatInterface
                enableOptimization={integrationSettings.realTimeOptimization}
                enableTemplateSearch={integrationSettings.templateRecommendations}
                enableAnalytics={integrationSettings.analytics}
                className="h-full"
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConfigurationDashboard;
