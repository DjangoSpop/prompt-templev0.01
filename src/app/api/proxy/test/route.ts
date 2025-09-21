// Simple test route to verify proxy is working
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Test the proxy route with a simple path
    const testUrl = new URL('/api/proxy/health', req.url);
    const proxyResponse = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'authorization': req.headers.get('authorization') || '',
      },
    });

    return NextResponse.json({
      status: 'proxy_test',
      proxyStatus: proxyResponse.status,
      message: 'Proxy route is working correctly',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
