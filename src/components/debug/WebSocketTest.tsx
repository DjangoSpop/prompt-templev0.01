'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Send, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WebSocketTestProps {
  wsUrl?: string;
  authToken?: string;
}

interface TestMessage {
  id: string;
  type: 'sent' | 'received' | 'error';
  content: string;
  timestamp: Date;
}

export const WebSocketTest: React.FC<WebSocketTestProps> = ({
  wsUrl = 'ws://127.0.0.1:8000',
  authToken,
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [testMessage, setTestMessage] = useState('');
  const [sessionId] = useState(() => `test_session_${Date.now()}`);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  // Get or create test token
  const getTestToken = () => {
    if (authToken) return authToken;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || localStorage.getItem('access_token') || 'test_token';
    }
    return 'test_token';
  };

  // Build WebSocket URL
  const buildWSUrl = () => {
    const token = getTestToken();
    return `${wsUrl}/ws/chat/${sessionId}/?token=${encodeURIComponent(token)}`;
  };

  // Add message to log
  const addMessage = (type: TestMessage['type'], content: string) => {
    const message: TestMessage = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  // Connect to WebSocket
  const connect = () => {
    if (ws?.readyState === WebSocket.CONNECTING || ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = buildWSUrl();
    addMessage('sent', `Connecting to: ${wsUrl}`);
    
    try {
      const newWs = new WebSocket(wsUrl);

      newWs.onopen = () => {
        console.log('✅ WebSocket Test Connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        addMessage('received', '✅ Connected successfully');
        toast.success('WebSocket connected');

        // Send initial connection test
        setTimeout(() => {
          if (newWs.readyState === WebSocket.OPEN) {
            newWs.send(JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString(),
            }));
            addMessage('sent', 'Ping: Connection test');
          }
        }, 1000);
      };

      newWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket Test Message:', data);
          addMessage('received', `${data.type}: ${JSON.stringify(data, null, 2)}`);
        } catch (error) {
          console.error('Failed to parse message:', error);
          addMessage('error', `Parse error: ${event.data}`);
        }
      };

      newWs.onclose = (event) => {
        console.log('🔌 WebSocket Test Disconnected:', event.code, event.reason);
        setIsConnected(false);
        addMessage('error', `Disconnected: Code ${event.code} - ${event.reason || 'Unknown reason'}`);
        
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const delay = 1000 * Math.pow(2, reconnectAttempts);
          addMessage('sent', `Reconnecting in ${delay}ms... (attempt ${reconnectAttempts + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };

      newWs.onerror = (error) => {
        console.error('❌ WebSocket Test Error:', error);
        addMessage('error', `WebSocket error: ${error}`);
      };

      setWs(newWs);
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      addMessage('error', `Failed to create WebSocket: ${error}`);
    }
  };

  // Disconnect
  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (ws) {
      ws.close(1000, 'Manual disconnect');
      setWs(null);
    }
    setIsConnected(false);
    setReconnectAttempts(0);
    addMessage('sent', 'Manually disconnected');
  };

  // Send test message
  const sendTestMessage = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error('WebSocket not connected');
      return;
    }

    const message = {
      type: 'chat_message',
      message_id: crypto.randomUUID(),
      content: testMessage,
      timestamp: new Date().toISOString(),
    };

    ws.send(JSON.stringify(message));
    addMessage('sent', `Chat: ${testMessage}`);
    setTestMessage('');
  };

  // Send ping
  const sendPing = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error('WebSocket not connected');
      return;
    }

    ws.send(JSON.stringify({
      type: 'ping',
      timestamp: new Date().toISOString(),
    }));
    addMessage('sent', 'Ping: Manual ping test');
  };

  // Clear messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [ws]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          WebSocket Connection Test
        </h2>

        {/* Connection Controls */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={connect}
            disabled={isConnected}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Connect
          </button>
          <button
            onClick={disconnect}
            disabled={!isConnected}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Disconnect
          </button>
          <button
            onClick={sendPing}
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Ping
          </button>
          <button
            onClick={clearMessages}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          
          <div className="ml-auto text-sm text-gray-600">
            Status: {isConnected ? 'Connected' : 'Disconnected'}
            {reconnectAttempts > 0 && ` (Attempts: ${reconnectAttempts})`}
          </div>
        </div>

        {/* Test Message Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Type a test message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendTestMessage();
              }
            }}
          />
          <button
            onClick={sendTestMessage}
            disabled={!isConnected || !testMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>

        {/* Connection Info */}
        <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded">
          <div><strong>Session ID:</strong> {sessionId}</div>
          <div><strong>WebSocket URL:</strong> {buildWSUrl()}</div>
          <div><strong>Auth Token:</strong> {getTestToken().slice(0, 20)}...</div>
        </div>
      </div>

      {/* Message Log */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Message Log</h3>
        <div className="h-96 overflow-y-auto border border-gray-200 rounded p-4 font-mono text-sm space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`p-2 rounded ${
              msg.type === 'sent' ? 'bg-blue-50 border-l-4 border-blue-400' :
              msg.type === 'received' ? 'bg-green-50 border-l-4 border-green-400' :
              'bg-red-50 border-l-4 border-red-400'
            }`}>
              <div className="flex justify-between items-start">
                <span className={`font-semibold ${
                  msg.type === 'sent' ? 'text-blue-700' :
                  msg.type === 'received' ? 'text-green-700' :
                  'text-red-700'
                }`}>
                  {msg.type.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1 whitespace-pre-wrap break-words">
                {msg.content}
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              No messages yet. Click &quot;Connect&quot; to start testing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
