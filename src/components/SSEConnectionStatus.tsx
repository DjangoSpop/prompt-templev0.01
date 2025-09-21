'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Zap, 
  Clock,
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSSEChat } from '@/lib/services/sse-chat';

interface ConnectionMetrics {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  latency: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  lastConnected: Date | null;
  healthStatus: string;
}

export default function ConnectionStatus() {
  const { service, isConnected, isConnecting, error } = useSSEChat();
  
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    status: 'disconnected',
    latency: 0,
    connectionQuality: 'disconnected',
    lastConnected: null,
    healthStatus: 'unknown'
  });

  // Health check and metrics update
  useEffect(() => {
    const updateMetrics = async () => {
      if (!isConnected) {
        setMetrics(prev => ({
          ...prev,
          status: isConnecting ? 'connecting' : 'disconnected',
          connectionQuality: 'disconnected',
          latency: 0,
          healthStatus: error ? 'error' : 'disconnected'
        }));
        return;
      }

      try {
        const startTime = Date.now();
        const health = await service.checkHealth();
        const latency = Date.now() - startTime;
        
        setMetrics(prev => ({
          ...prev,
          status: 'connected',
          latency,
          connectionQuality: latency < 100 ? 'excellent' : latency < 300 ? 'good' : 'poor',
          lastConnected: new Date(),
          healthStatus: health.status
        }));
      } catch {
        setMetrics(prev => ({
          ...prev,
          status: 'error',
          connectionQuality: 'poor',
          healthStatus: 'error'
        }));
      }
    };

    updateMetrics();
    
    // Update metrics every 10 seconds
    const interval = setInterval(updateMetrics, 10000);
    return () => clearInterval(interval);
  }, [isConnected, isConnecting, error, service]);

  const getStatusIcon = () => {
    switch (metrics.status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (metrics.status) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getQualityBadge = () => {
    const qualityColors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
      disconnected: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={qualityColors[metrics.connectionQuality]}>
        {metrics.connectionQuality}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>SSE Connection Status</span>
          </div>
          {getQualityBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {metrics.status === 'connected' ? 'Connected (SSE)' : 
             metrics.status === 'connecting' ? 'Connecting...' :
             metrics.status === 'error' ? 'Connection Error' : 'Disconnected'}
          </span>
        </div>

        {/* Latency */}
        {metrics.status === 'connected' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Latency
            </span>
            <span className="text-sm font-mono">
              {metrics.latency}ms
            </span>
          </div>
        )}

        {/* Health Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Health</span>
          <div className="flex items-center space-x-1">
            {metrics.healthStatus === 'healthy' ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <AlertTriangle className="h-3 w-3 text-yellow-500" />
            )}
            <span className="text-sm">{metrics.healthStatus}</span>
          </div>
        </div>

        {/* Last Connected */}
        {metrics.lastConnected && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Connected</span>
            <span className="text-xs text-gray-500">
              {metrics.lastConnected.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-600">{error.message}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={() => service.connect()}
            >
              Reconnect
            </Button>
          </div>
        )}

        {/* Transport Info */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Transport</span>
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>HTTP SSE</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
