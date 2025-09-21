import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Server,
  Globe,
} from 'lucide-react';
import { useSSEChat } from '@/lib/services/sse-chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
}

interface ConnectionMetrics {
  latency: number;
  reconnectAttempts: number;
  messagesPerMinute: number;
  lastConnected: Date | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className = '',
  showDetails = true,
}) => {
  const { service, isConnected, isConnecting, error } = useSSEChat();
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    latency: 0,
    reconnectAttempts: 0,
    messagesPerMinute: 0,
    lastConnected: null,
    connectionQuality: 'disconnected',
  });
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Track connection metrics
  useEffect(() => {
    if (!service) return;

    let pingInterval: NodeJS.Timeout;
    let messageCount = 0;
    let lastMinute = Date.now();

    const updateMetrics = () => {
      const now = Date.now();
      const minutesPassed = (now - lastMinute) / 60000;
      
      if (minutesPassed >= 1) {
        setMetrics(prev => ({
          ...prev,
          messagesPerMinute: Math.round(messageCount / minutesPassed),
        }));
        messageCount = 0;
        lastMinute = now;
      }
    };

    const handleConnected = () => {
      setMetrics(prev => ({
        ...prev,
        lastConnected: new Date(),
        connectionQuality: 'excellent',
        reconnectAttempts: 0,
      }));

      // Start ping monitoring
      pingInterval = setInterval(() => {
        const startTime = Date.now();
        service.getSocket()?.emit('ping', startTime);
      }, 5000);
    };

    const handleDisconnected = () => {
      setMetrics(prev => ({
        ...prev,
        connectionQuality: 'disconnected',
        latency: 0,
      }));
      clearInterval(pingInterval);
    };

    const handlePong = (startTime: number) => {
      const latency = Date.now() - startTime;
      setMetrics(prev => ({
        ...prev,
        latency,
        connectionQuality: latency < 100 ? 'excellent' : latency < 300 ? 'good' : 'poor',
      }));
    };

    const handleMessage = () => {
      messageCount++;
      updateMetrics();
    };

    const handleMaxRetries = () => {
      setMetrics(prev => ({
        ...prev,
        reconnectAttempts: prev.reconnectAttempts + 1,
      }));
    };

    // Register event handlers
    service.on('connected', handleConnected);
    service.on('disconnected', handleDisconnected);
    service.on('messageResponse', handleMessage);
    service.on('maxRetriesReached', handleMaxRetries);
    
    // Listen for pong responses
    service.getSocket()?.on('pong', handlePong);

    const metricsInterval = setInterval(updateMetrics, 1000);

    return () => {
      service.off('connected', handleConnected);
      service.off('disconnected', handleDisconnected);
      service.off('messageResponse', handleMessage);
      service.off('maxRetriesReached', handleMaxRetries);
      service.getSocket()?.off('pong', handlePong);
      clearInterval(pingInterval);
      clearInterval(metricsInterval);
    };
  }, [service]);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await service.reconnect();
    } catch (err) {
      console.error('Manual reconnection failed:', err);
    } finally {
      setIsReconnecting(false);
    }
  };

  const getStatusIcon = () => {
    if (isConnecting || isReconnecting) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    if (isConnected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (error) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    return <WifiOff className="w-4 h-4 text-gray-500" />;
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (isReconnecting) return 'Reconnecting...';
    if (isConnected) return 'Connected';
    if (error) return 'Connection Error';
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (isConnected) return 'text-green-600';
    if (error) return 'text-red-600';
    if (isConnecting || isReconnecting) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getQualityBadge = () => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
      disconnected: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={colors[metrics.connectionQuality]}>
        {metrics.connectionQuality}
      </Badge>
    );
  };

  return (
    <div className={className}>
      {/* Compact Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          
          {isConnected && (
            <div className="flex items-center space-x-2">
              {getQualityBadge()}
              {metrics.latency > 0 && (
                <span className="text-xs text-gray-500">
                  {metrics.latency}ms
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {error && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowErrorDetails(!showErrorDetails)}
            >
              <Info className="w-4 h-4" />
            </Button>
          )}
          
          {!isConnected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReconnect}
              disabled={isReconnecting}
            >
              {isReconnecting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              Reconnect
            </Button>
          )}
        </div>
      </motion.div>

      {/* Error Details */}
      <AnimatePresence>
        {showErrorDetails && error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Connection Error</h4>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                    <div className="mt-2 text-xs text-red-500">
                      <p>• Check your internet connection</p>
                      <p>• Verify the server is running</p>
                      <p>• Try refreshing the page</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Metrics */}
      {showDetails && isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-600">Latency</p>
                  <p className="text-lg font-semibold">{metrics.latency}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-gray-600">Messages/min</p>
                  <p className="text-lg font-semibold">{metrics.messagesPerMinute}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-600">Reconnects</p>
                  <p className="text-lg font-semibold">{metrics.reconnectAttempts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-600">Connected</p>
                  <p className="text-sm font-medium">
                    {metrics.lastConnected 
                      ? new Intl.DateTimeFormat('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(metrics.lastConnected)
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ConnectionStatus;
