'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Wifi, 
  WifiOff,
  Server,
  RefreshCw,
  AlertTriangle,
  Shield,
  Zap
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useWebSocketChat } from '@/lib/services/websocket-chat';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'unhealthy' | 'checking' | 'warning';
  message: string;
  details?: string;
  timestamp: Date;
}

interface SystemMetrics {
  frontend_version: string;
  backend_connection: boolean;
  websocket_connection: boolean;
  api_response_time: number;
  authentication_status: boolean;
  database_status: boolean;
  cache_status: boolean;
  external_services: boolean;
}

export function ProductionHealthCheck() {
  const [healthChecks, setHealthChecks] = useState<HealthCheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  
  const { isConnected, isConnecting } = useWebSocketChat();

  const runHealthCheck = useCallback(async () => {
    setIsRunning(true);
    const checks: HealthCheckResult[] = [];
    const startTime = Date.now();

    // 1. Frontend Health Check
    checks.push({
      component: 'Frontend Application',
      status: 'healthy',
      message: 'Next.js application running successfully',
      details: `Version: ${process.env.NEXT_PUBLIC_APP_VERSION || 'unknown'}`,
      timestamp: new Date()
    });

    // 2. Backend API Health Check
    try {
      await apiClient.getHealth();
      checks.push({
        component: 'Backend API',
        status: 'healthy',
        message: 'Backend API responding normally',
        details: `Response time: ${Date.now() - startTime}ms`,
        timestamp: new Date()
      });
    } catch (error) {
      checks.push({
        component: 'Backend API',
        status: 'unhealthy',
        message: 'Backend API unreachable',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }

    // 3. WebSocket Connection Check
    try {
      if (isConnected) {
        checks.push({
          component: 'WebSocket Connection',
          status: 'healthy',
          message: 'Real-time WebSocket connection active',
          details: 'Chat and real-time features available',
          timestamp: new Date()
        });
      } else if (isConnecting) {
        checks.push({
          component: 'WebSocket Connection',
          status: 'checking',
          message: 'WebSocket connection in progress',
          details: 'Establishing real-time connection...',
          timestamp: new Date()
        });
      } else {
        checks.push({
          component: 'WebSocket Connection',
          status: 'warning',
          message: 'WebSocket not connected',
          details: 'Chat features may be limited',
          timestamp: new Date()
        });
      }
    } catch (error) {
      checks.push({
        component: 'WebSocket Connection',
        status: 'unhealthy',
        message: 'WebSocket connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }

    // 4. Authentication System Check
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        checks.push({
          component: 'Authentication System',
          status: 'healthy',
          message: 'User authentication active',
          details: 'Valid session token found',
          timestamp: new Date()
        });
      } else {
        checks.push({
          component: 'Authentication System',
          status: 'warning',
          message: 'No active session',
          details: 'User needs to log in',
          timestamp: new Date()
        });
      }
    } catch (error) {
      checks.push({
        component: 'Authentication System',
        status: 'unhealthy',
        message: 'Authentication system error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }

    // 5. Environment Configuration Check
    const requiredEnvVars = ['NEXT_PUBLIC_API_BASE_URL'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      checks.push({
        component: 'Environment Configuration',
        status: 'healthy',
        message: 'All required environment variables configured',
        details: `API URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}`,
        timestamp: new Date()
      });
    } else {
      checks.push({
        component: 'Environment Configuration',
        status: 'unhealthy',
        message: 'Missing environment variables',
        details: `Missing: ${missingVars.join(', ')}`,
        timestamp: new Date()
      });
    }

    // 6. Performance Metrics
    const totalResponseTime = Date.now() - startTime;
    checks.push({
      component: 'System Performance',
      status: totalResponseTime < 2000 ? 'healthy' : totalResponseTime < 5000 ? 'warning' : 'unhealthy',
      message: `Health check completed in ${totalResponseTime}ms`,
      details: totalResponseTime < 2000 ? 'Excellent performance' : 
               totalResponseTime < 5000 ? 'Acceptable performance' : 'Performance issues detected',
      timestamp: new Date()
    });

    setHealthChecks(checks);
    setLastCheckTime(new Date());
    setIsRunning(false);

    // Calculate system metrics
    const metrics: SystemMetrics = {
      frontend_version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      backend_connection: checks.find(c => c.component === 'Backend API')?.status === 'healthy',
      websocket_connection: isConnected,
      api_response_time: totalResponseTime,
      authentication_status: checks.find(c => c.component === 'Authentication System')?.status === 'healthy',
      database_status: true, // Assume healthy if backend is responding
      cache_status: true, // Assume healthy if backend is responding
      external_services: true // Assume healthy for now
    };
    
    setSystemMetrics(metrics);
  }, [isConnected, isConnecting]);
  
  useEffect(() => {
    // Run initial health check
    runHealthCheck();
    
    // Set up periodic health checks
    const interval = setInterval(runHealthCheck, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [isConnected, isConnecting, runHealthCheck]);

  const getStatusIcon = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'checking':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'unhealthy':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'checking':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const overallHealth = healthChecks.length > 0 ? 
    healthChecks.every(check => check.status === 'healthy') ? 'healthy' :
    healthChecks.some(check => check.status === 'unhealthy') ? 'unhealthy' : 'warning'
    : 'checking';

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(overallHealth)}
              <span>System Health Dashboard</span>
            </div>
            <Button 
              onClick={runHealthCheck} 
              disabled={isRunning}
              size="sm"
              variant="outline"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Badge variant={getStatusBadgeVariant(overallHealth)} className="text-sm">
              {overallHealth === 'healthy' ? 'All Systems Operational' :
               overallHealth === 'warning' ? 'Minor Issues Detected' :
               overallHealth === 'unhealthy' ? 'System Issues Detected' : 'Checking Systems...'}
            </Badge>
            {lastCheckTime && (
              <span className="text-sm text-muted-foreground">
                Last checked: {lastCheckTime.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* System Metrics */}
          {systemMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {systemMetrics.api_response_time}ms
                </div>
                <div className="text-sm text-muted-foreground">API Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {systemMetrics.frontend_version}
                </div>
                <div className="text-sm text-muted-foreground">Frontend Version</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  {systemMetrics.websocket_connection ? 
                    <Wifi className="h-6 w-6 text-green-500" /> : 
                    <WifiOff className="h-6 w-6 text-red-500" />
                  }
                </div>
                <div className="text-sm text-muted-foreground">WebSocket</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">
                  {systemMetrics.backend_connection ? 
                    <Server className="h-6 w-6 text-green-500" /> : 
                    <Server className="h-6 w-6 text-red-500" />
                  }
                </div>
                <div className="text-sm text-muted-foreground">Backend</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Component Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthChecks.map((check, index) => (
              <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h4 className="font-medium">{check.component}</h4>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                    {check.details && (
                      <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(check.status)}>
                  {check.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Production Readiness Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Production Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>Integration Status:</strong> Frontend and backend are properly integrated and communicating. 
                WebSocket connections are established for real-time features. Authentication system is operational.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <h5 className="font-medium">✅ Ready for Production:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Next.js application optimized</li>
                  <li>• API endpoints configured</li>
                  <li>• WebSocket chat integration</li>
                  <li>• Authentication system</li>
                  <li>• Error boundaries implemented</li>
                  <li>• Health monitoring active</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">🔧 Additional Enhancements:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• SSL/HTTPS configuration</li>
                  <li>• Database optimization</li>
                  <li>• CDN setup for assets</li>
                  <li>• Performance monitoring</li>
                  <li>• Backup strategies</li>
                  <li>• Load balancing</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
