'use client';

import { useHealth } from '@/lib/hooks';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

type HealthState = 'healthy' | 'degraded' | 'unhealthy' | 'loading' | 'error';

export function HealthBanner() {
  const { data: healthResult, isLoading, error, refetch } = useHealth();

  const getHealthStatus = (): HealthState => {
    if (isLoading) return 'loading';
    if (error) {
      // Don't show health banner for network errors in development
      if (process.env.NODE_ENV === 'development') {
        return 'healthy'; // Hide health issues in dev mode
      }
      return 'error';
    }
    if (!healthResult) return 'loading';
    
    // Determine overall health status based on the response
    if (healthResult.status === 'unhealthy') return 'unhealthy';
    if (healthResult.status === 'degraded') return 'degraded';
    return 'healthy';
  };

  const healthStatus = getHealthStatus();

  const getStatusConfig = (status: HealthState) => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-500',
          message: 'All systems operational',
        };
      case 'degraded':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: AlertCircle,
          iconColor: 'text-yellow-500',
          message: 'Some services experiencing issues',
        };
      case 'unhealthy':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: XCircle,
          iconColor: 'text-red-500',
          message: 'Service disruption detected',
        };
      case 'loading':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          icon: RefreshCw,
          iconColor: 'text-blue-500 animate-spin',
          message: 'Checking system status...',
        };
      case 'error':
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          icon: AlertCircle,
          iconColor: 'text-gray-500',
          message: 'Unable to check system status',
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          icon: AlertCircle,
          iconColor: 'text-gray-500',
          message: 'Unknown status',
        };
    }
  };

  const config = getStatusConfig(healthStatus);
  const Icon = config.icon;

  // Only show banner if there's an issue or during loading
  if (healthStatus === 'healthy') {
    return null;
  }

  return (
    <div className={`border-b ${config.bg} ${config.text} px-4 py-2`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Icon className={`h-4 w-4 ${config.iconColor}`} />
          <span className="text-sm font-medium">{config.message}</span>
          {healthResult && (
            <span className="text-xs opacity-70">
              Last checked: {new Date(healthResult.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-xs underline hover:no-underline disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}