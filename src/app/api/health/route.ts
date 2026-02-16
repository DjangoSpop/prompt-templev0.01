import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if we can reach the backend
    const backendUrl = process.env.BACKEND_URL || 'https://api.prompt-temple.com';
    
    let backendStatus = 'unknown';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${backendUrl}/health/`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      backendStatus = response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      backendStatus = 'unhealthy';
    }

    const health = {
      status: backendStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        frontend: 'healthy',
        backend: backendStatus,
      },
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    );
  }
}