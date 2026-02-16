'use client';

import React, { useState, useEffect } from 'react';
import { NativeWebSocketChatService } from '@/lib/services/native-websocket-chat';

interface ConnectionTestProps {
  className?: string;
}

export function WebSocketConnectionTest({ className = '' }: ConnectionTestProps) {
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    error: null as string | null,
    messages: [] as string[],
    latency: null as number | null,
  });

  const [wsService] = useState(() => new NativeWebSocketChatService({
    sessionId: `test_${Date.now()}`,
    apiUrl: process.env.NEXT_PUBLIC_WS_URL || 'wss://api.prompt-temple.com',
  }));

  useEffect(() => {
    // Setup event listeners
    wsService.on('connected', () => {
      setConnectionState(prev => ({ 
        ...prev, 
        isConnected: true, 
        error: null,
        messages: [...prev.messages, '✅ Connected to WebSocket']
      }));
    });

    wsService.on('disconnected', (data?: unknown) => {
      const disconnectData = data as { reason?: string };
      setConnectionState(prev => ({ 
        ...prev, 
        isConnected: false,
        messages: [...prev.messages, `❌ Disconnected: ${disconnectData?.reason || 'Unknown'}`]
      }));
    });

    wsService.on('error', (error?: unknown) => {
      const errorData = error as { message?: string };
      setConnectionState(prev => ({ 
        ...prev, 
        error: errorData?.message || 'Connection error',
        messages: [...prev.messages, `🚨 Error: ${errorData?.message || 'Unknown error'}`]
      }));
    });

    wsService.on('latency', (data?: unknown) => {
      const latencyData = data as { latency?: number };
      setConnectionState(prev => ({ 
        ...prev, 
        latency: latencyData?.latency || null
      }));
    });

    wsService.on('messageResponse', (data?: unknown) => {
      setConnectionState(prev => ({ 
        ...prev,
        messages: [...prev.messages, `📧 Message: ${JSON.stringify(data, null, 2)}`]
      }));
    });

    // Connect
    wsService.connect().catch(error => {
      console.error('Failed to connect:', error);
      setConnectionState(prev => ({ 
        ...prev, 
        error: 'Failed to connect',
        messages: [...prev.messages, `💥 Connection failed: ${error.message}`]
      }));
    });

    return () => {
      wsService.destroy();
    };
  }, [wsService]);

  const sendTestMessage = () => {
    if (wsService.isConnected()) {
      wsService.sendMessage('Hello from WebSocket test!', {
        optimize: false,
        model: 'deepseek-chat'
      });
      setConnectionState(prev => ({ 
        ...prev,
        messages: [...prev.messages, '📤 Sent test message']
      }));
    }
  };

  const reconnect = () => {
    wsService.reconnect();
    setConnectionState(prev => ({ 
      ...prev,
      messages: [...prev.messages, '🔄 Attempting to reconnect...']
    }));
  };

  return (
    <div className={`p-6 bg-white border-2 border-gray-200 rounded-lg ${className}`}>
      <h3 className="text-lg font-bold mb-4">Native WebSocket Connection Test</h3>
      
      {/* Connection Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${connectionState.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-semibold">
            {connectionState.isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {connectionState.latency && (
            <span className="text-sm text-gray-600">
              ({connectionState.latency}ms)
            </span>
          )}
        </div>
        
        {connectionState.error && (
          <div className="text-red-600 text-sm mb-2">
            Error: {connectionState.error}
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          URL: {wsService.getConnectionInfo().sessionId}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={sendTestMessage}
          disabled={!connectionState.isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send Test Message
        </button>
        <button
          onClick={reconnect}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Reconnect
        </button>
      </div>

      {/* Message Log */}
      <div className="bg-black text-green-400 p-3 rounded font-mono text-xs h-64 overflow-y-auto">
        {connectionState.messages.map((msg, index) => (
          <div key={index} className="mb-1">
            {new Date().toLocaleTimeString()} - {msg}
          </div>
        ))}
      </div>
    </div>
  );
}
