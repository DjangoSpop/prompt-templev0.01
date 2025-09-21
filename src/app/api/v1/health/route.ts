import { NextRequest } from 'next/server';
import { withErrorHandling } from '@/lib/api/errorHandler';
import { db } from '@/lib/database/connection';
import { env, features } from '@/lib/config/env';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: 'healthy' | 'unhealthy';
    memory: 'healthy' | 'degraded' | 'unhealthy';
    disk?: 'healthy' | 'degraded' | 'unhealthy';
    external_services?: 'healthy' | 'degraded' | 'unhealthy';
  };
  features: {
    analytics: boolean;
    teams: boolean;
    billing: boolean;
  };
  performance?: {
    response_time: number;
    memory_usage?: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

const startTime = Date.now();

export const GET = withErrorHandling(async (request: NextRequest) => {
  const checkStart = Date.now();
  
  // Database health check
  const dbHealth = await db.getHealthCheck();
  
  // Memory usage check
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
  const usedMemory = memoryUsage.heapUsed;
  const memoryPercentage = (usedMemory / totalMemory) * 100;
  
  let memoryStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (memoryPercentage > 90) {
    memoryStatus = 'unhealthy';
  } else if (memoryPercentage > 75) {
    memoryStatus = 'degraded';
  }

  // Determine overall status
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (dbHealth.status === 'unhealthy' || memoryStatus === 'unhealthy') {
    overallStatus = 'unhealthy';
  } else if (dbHealth.status === 'unhealthy' || memoryStatus === 'degraded') {
    overallStatus = 'degraded';
  }

  const responseTime = Date.now() - checkStart;
  const uptime = Date.now() - startTime;

  const healthCheck: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: env.NEXT_PUBLIC_APP_VERSION,
    environment: env.NEXT_PUBLIC_APP_ENVIRONMENT,
    uptime,
    checks: {
      database: dbHealth.status,
      memory: memoryStatus,
    },
    features: {
      analytics: features.analytics,
      teams: features.teams,
      billing: features.billing,
    },
    performance: {
      response_time: responseTime,
      memory_usage: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round(memoryPercentage * 100) / 100,
      },
    },
  };

  return healthCheck;
});

// Simple readiness check
export const HEAD = withErrorHandling(async (request: NextRequest) => {
  // Quick database connectivity check
  const dbHealth = await db.getHealthCheck();
  
  if (dbHealth.status === 'unhealthy') {
    return new Response(null, { status: 503 });
  }

  return new Response(null, { status: 200 });
});