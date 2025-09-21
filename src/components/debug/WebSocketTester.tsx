'use client';

import React, { useState } from 'react';
import { Send, TestTube } from 'lucide-react';

interface WebSocketTesterProps {
  onSendMessage: (message: string, options?: { type?: 'chat' | 'slash_command'; command?: string }) => void;
  isConnected: boolean;
  isLoading: boolean;
}

export const WebSocketTester: React.FC<WebSocketTesterProps> = ({
  onSendMessage,
  isConnected,
  isLoading,
}) => {
  const [testMessage, setTestMessage] = useState('');

  const quickTests = [
    {
      label: 'Simple Chat',
      message: 'Hello, can you help me write a business email?',
      type: 'chat' as const,
    },
    {
      label: 'Optimize Command',
      message: '/optimize Write a compelling product description for a new smartphone',
      type: 'slash_command' as const,
      command: 'optimize',
    },
    {
      label: 'Intent Analysis',
      message: '/intent I need help with marketing copy that converts better',
      type: 'slash_command' as const,
      command: 'intent',
    },
    {
      label: 'Code Help',
      message: '/code Create a React component with a form for user registration',
      type: 'slash_command' as const,
      command: 'code',
    },
  ];

  const sendTestMessage = () => {
    if (!testMessage.trim()) return;
    
    // Detect if it's a slash command
    const isSlashCommand = testMessage.startsWith('/');
    if (isSlashCommand) {
      const parts = testMessage.split(' ');
      const command = parts[0].substring(1); // Remove the '/'
      const content = parts.slice(1).join(' ');
      onSendMessage(content, { type: 'slash_command', command });
    } else {
      onSendMessage(testMessage);
    }
    
    setTestMessage('');
  };

  const sendQuickTest = (test: typeof quickTests[0]) => {
    if (test.type === 'slash_command') {
      const content = test.message.replace(`/${test.command}`, '').trim();
      onSendMessage(content, { type: 'slash_command', command: test.command });
    } else {
      onSendMessage(test.message);
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-sand-50 to-amber-50 border-2 border-sand-200 rounded-cartouche mb-4">
      <div className="flex items-center gap-2 mb-3">
        <TestTube className="h-5 w-5 text-sun" />
        <h3 className="font-display font-bold text-stone-800">WebSocket Test Panel</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Quick Test Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {quickTests.map((test, index) => (
          <button
            key={index}
            onClick={() => sendQuickTest(test)}
            disabled={!isConnected || isLoading}
            className="p-2 text-left text-xs bg-white border border-sand-300 rounded-lg hover:bg-sand-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div className="font-semibold text-stone-700">{test.label}</div>
            <div className="text-stone-500 truncate">{test.message}</div>
          </button>
        ))}
      </div>

      {/* Custom Test Message */}
      <div className="flex gap-2">
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Type a test message or /command..."
          className="flex-1 px-3 py-2 border border-sand-300 rounded-cartouche text-sm focus:border-sun focus:ring-2 focus:ring-sun/20 outline-none"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendTestMessage();
            }
          }}
          disabled={!isConnected || isLoading}
        />
        <button
          onClick={sendTestMessage}
          disabled={!isConnected || isLoading || !testMessage.trim()}
          className="px-4 py-2 bg-sun text-white rounded-cartouche text-sm font-semibold hover:bg-sun/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-3 text-xs text-stone-600 bg-white/50 p-2 rounded">
        <strong>Test Instructions:</strong>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Use quick test buttons to send pre-configured messages</li>
          <li>Type custom messages in the input field</li>
          <li>Start with &quot;/&quot; for slash commands (e.g., &quot;/optimize your text here&quot;)</li>
          <li>Watch browser console for WebSocket message logs</li>
          <li>Check backend terminal for server-side processing</li>
        </ul>
      </div>
    </div>
  );
};
