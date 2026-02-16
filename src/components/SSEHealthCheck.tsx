'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HealthCheckData {
  status: 'healthy' | 'degraded' | 'error';
  message: string;
  config?: {
    transport: string;
    model: string;
    rate_limit: string;
    version: string;
  };
  timestamp?: string;
}

interface SSEHealthCheckProps {
  className?: string;
  onHealthChange?: (health: HealthCheckData) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const SSEHealthCheck: React.FC<SSEHealthCheckProps> = ({
  className = '',
  onHealthChange,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [health, setHealth] = useState<HealthCheckData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setIsChecking(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';
      const response = await fetch(`${apiBaseUrl}/api/v2/chat/health/`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      const healthData: HealthCheckData = await response.json();
      healthData.timestamp = new Date().toISOString();
      
      setHealth(healthData);
      setLastChecked(new Date());
      
      if (onHealthChange) {
        onHealthChange(healthData);
      }
    } catch (error) {
      const errorHealth: HealthCheckData = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Cannot connect to chat service',
        timestamp: new Date().toISOString(),
      };
      
      setHealth(errorHealth);
      setLastChecked(new Date());
      
      if (onHealthChange) {
        onHealthChange(errorHealth);
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial health check
    const performCheck = async () => {
      setIsChecking(true);
      
      try {
        const token = localStorage.getItem('access_token');
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';
        const response = await fetch(`${apiBaseUrl}/api/v2/chat/health/`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        const healthData: HealthCheckData = await response.json();
        healthData.timestamp = new Date().toISOString();
        
        setHealth(healthData);
        setLastChecked(new Date());
        
        if (onHealthChange) {
          onHealthChange(healthData);
        }
      } catch (error) {
        const errorHealth: HealthCheckData = {
          status: 'error',
          message: error instanceof Error ? error.message : 'Cannot connect to chat service',
          timestamp: new Date().toISOString(),
        };
        
        setHealth(errorHealth);
        setLastChecked(new Date());
        
        if (onHealthChange) {
          onHealthChange(errorHealth);
        }
      } finally {
        setIsChecking(false);
      }
    };

    performCheck();
    
    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(performCheck, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, onHealthChange]);

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    
    switch (health?.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (health?.status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConnectionIcon = () => {
    return health?.status === 'healthy' ? (
      <Wifi className="w-4 h-4 text-green-500" />
    ) : (
      <WifiOff className="w-4 h-4 text-red-500" />
    );
  };

  const formatLastChecked = () => {
    if (!lastChecked) return 'Never';
    
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastChecked.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return lastChecked.toLocaleTimeString();
  };

  return (
    <TooltipProvider>
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {getConnectionIcon()}
              <span>SSE Chat Health</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkHealth}
              disabled={isChecking}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-lg border ${getStatusColor()}`}
          >
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <div className="flex-1">
                <div className="font-medium text-sm capitalize">
                  {health?.status || 'Unknown'}
                </div>
                <div className="text-xs opacity-80">
                  {health?.message || 'Checking status...'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Configuration Details */}
          {health?.config && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="text-xs font-medium text-gray-600">Configuration</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-help">
                        {health.config.transport?.toUpperCase() || 'SSE'}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Transport Protocol</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-help">
                        {health.config.model || 'GLM-4'}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>AI Model</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="space-y-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-help">
                        {health.config.rate_limit || '5/min'}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rate Limit</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="cursor-help">
                        v{health.config.version || '2.0'}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>API Version</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </motion.div>
          )}

          {/* Last Checked */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last checked:</span>
            <span>{formatLastChecked()}</span>
          </div>

          {/* Migration Success Indicator */}
          {health?.status === 'healthy' && health.config?.transport === 'sse' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-2"
            >
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <div className="text-xs">
                  <div className="font-medium">Migration Complete! 🚀</div>
                  <div className="opacity-80">Successfully using SSE streaming</div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default SSEHealthCheck;
