'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Clock, 
  Zap, 
  WifiOff,
  Wifi,
  RefreshCw,
  Bug,
  Globe
} from 'lucide-react';
import { useChatTransport } from '@/hooks/useChatTransport';
import { useSSECompletion } from '@/hooks/useSSECompletion';
import { cn } from '@/lib/utils';

interface TransportDebugProps {
  className?: string;
  isStreaming?: boolean;
  lastTraceId?: string;
  tokenCount?: number;
  elapsedTime?: number;
  retryCount?: number;
}

export function TransportDebug({ 
  className,
  isStreaming = false,
  lastTraceId,
  tokenCount,
  elapsedTime,
  retryCount = 0
}: TransportDebugProps) {
  const { transport, isLoading: transportLoading, error: transportError } = useChatTransport();
  const { error: sseError, trace_id, elapsed_time } = useSSECompletion();

  const formatTime = (ms?: number) => {
    if (!ms) return 'N/A';
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  const getTransportIcon = () => {
    if (transportLoading) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (transport === 'sse') return <Globe className="h-4 w-4" />;
    if (transport === 'ws') return <Wifi className="h-4 w-4" />;
    return <WifiOff className="h-4 w-4" />;
  };

  const getTransportStatus = () => {
    if (transportLoading) return 'Loading...';
    if (transportError) return 'Error';
    if (isStreaming) return 'Streaming';
    return 'Ready';
  };

  const getStatusColor = () => {
    if (transportError || sseError) return 'destructive';
    if (isStreaming) return 'default';
    if (transportLoading) return 'secondary';
    return 'secondary';
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <Card className={cn("pharaoh-card border-dashed border-muted-foreground/30", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display font-medium text-muted-foreground flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Transport Debug Panel
          <Badge variant="outline" className="text-xs">DEV</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Transport Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Transport</span>
              <div className="flex items-center gap-1">
                {getTransportIcon()}
                <span className="text-xs font-mono uppercase">
                  {transport || 'unknown'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge variant={getStatusColor()} className="text-xs">
                {getTransportStatus()}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Streaming</span>
              <div className="flex items-center gap-1">
                {isStreaming ? (
                  <Activity className="h-3 w-3 text-green-500 animate-pulse" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-muted" />
                )}
                <span className="text-xs">
                  {isStreaming ? 'Active' : 'Idle'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Retries</span>
              <span className="text-xs font-mono">{retryCount}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-dashed">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="text-xs font-mono">
              {formatTime(elapsed_time || elapsedTime)}
            </div>
            <div className="text-xs text-muted-foreground">Elapsed</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="text-xs font-mono">
              {tokenCount || 0}
            </div>
            <div className="text-xs text-muted-foreground">Tokens</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Activity className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="text-xs font-mono">
              {tokenCount && elapsedTime 
                ? Math.round((tokenCount / (elapsedTime / 1000)) * 10) / 10
                : 0}
            </div>
            <div className="text-xs text-muted-foreground">Tokens/s</div>
          </div>
        </div>

        {/* Trace ID */}
        {(trace_id || lastTraceId) && (
          <div className="pt-3 border-t border-dashed">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Trace ID</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(trace_id || lastTraceId || '')}
                className="h-auto p-1 text-xs font-mono"
              >
                {(trace_id || lastTraceId)?.slice(0, 8)}...
              </Button>
            </div>
          </div>
        )}

        {/* Errors */}
        {(transportError || sseError) && (
          <div className="pt-3 border-t border-dashed">
            <div className="text-xs text-red-600 space-y-1">
              {transportError && (
                <div>
                  <strong>Transport:</strong> {transportError}
                </div>
              )}
              {sseError && (
                <div>
                  <strong>SSE:</strong> {sseError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Environment Info */}
        <div className="pt-3 border-t border-dashed text-xs text-muted-foreground">
          <div className="grid grid-cols-2 gap-2">
            <div>Node ENV: {process.env.NODE_ENV}</div>
            <div>Version: {process.env.NEXT_PUBLIC_APP_VERSION || 'dev'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
