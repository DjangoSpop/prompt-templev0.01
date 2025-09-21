import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Test connection to Django backend
    const response = await fetch(`${apiUrl}/health/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      backend_status: response.ok ? 'connected' : 'error',
      backend_data: data,
      frontend_time: new Date().toISOString(),
      websocket_url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
      api_url: apiUrl,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      backend_status: 'disconnected',
      frontend_time: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'test_billing':
        return await testBilling();
      case 'test_websocket':
        return await testWebSocket();
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function testBilling() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Test billing endpoints
    const responses = await Promise.all([
      fetch(`${apiUrl}/api/v2/billing/plans/`),
      fetch(`${apiUrl}/api/v2/core/health/`),
    ]);

    const results = await Promise.all(
      responses.map(async (response, index) => ({
        endpoint: index === 0 ? 'billing/plans' : 'core/health',
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : null,
      }))
    );

    return NextResponse.json({
      success: true,
      billing_test: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Billing test failed',
    }, { status: 500 });
  }
}

async function testWebSocket() {
  try {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    
    // Since we can't directly test WebSocket from server-side,
    // we'll test the HTTP equivalent endpoints
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    const response = await fetch(`${apiUrl}/api/v2/status/`);
    const data = response.ok ? await response.json() : null;

    return NextResponse.json({
      success: response.ok,
      websocket_url: wsUrl,
      status_endpoint: {
        status: response.status,
        ok: response.ok,
        data,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'WebSocket test failed',
    }, { status: 500 });
  }
}
