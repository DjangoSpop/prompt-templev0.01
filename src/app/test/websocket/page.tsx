'use client';

import React from 'react';
import { WebSocketConnectionTest } from '@/components/debug/WebSocketConnectionTest';

export default function WebSocketTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            WebSocket Connection Test
          </h1>
          <p className="text-gray-600">
            Test your WebSocket connection to the PromptCraft backend
          </p>
        </div>
        
        <WebSocketConnectionTest />
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Expected Backend Response Types:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">Connection Messages:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• <code>connection_ack</code> - Connection established</li>
                <li>• <code>pong</code> - Heartbeat response</li>
                <li>• <code>typing_start</code> - AI is processing</li>
                <li>• <code>typing_stop</code> - AI stopped processing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-green-600 mb-2">Chat Messages:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• <code>stream_start</code> - Streaming response begins</li>
                <li>• <code>stream_token</code> - Token-by-token streaming</li>
                <li>• <code>stream_complete</code> - Streaming finished</li>
                <li>• <code>message</code> - Complete message (fallback)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-600 mb-2">AI Features:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• <code>template_opportunity</code> - Template suggestions</li>
                <li>• <code>template_created</code> - Template created</li>
                <li>• <code>optimization_result</code> - Prompt optimization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-red-600 mb-2">Error Handling:</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• <code>error</code> - Error messages</li>
                <li>• Connection timeout handling</li>
                <li>• Automatic reconnection logic</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
