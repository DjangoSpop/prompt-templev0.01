'use client';

import React from 'react';
import EnhancedWebSocketChat from '../../../components/EnhancedWebSocketChat';

export default function ChatTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Chat Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chat with our AI assistant and automatically convert conversations to templates
          </p>
        </div>
        
        <EnhancedWebSocketChat />
      </div>
    </div>
  );
}
