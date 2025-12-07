'use client';

import { EnhancedChatInterface } from '@/components/chat/EnhancedChatInterface';

export default function SSEChatDemo() {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-2xl font-bold">PromptCraft SSE Chat Demo</h1>
        <p className="text-blue-100 mt-2">
          Real-time AI assistant powered by Server-Sent Events streaming
        </p>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto h-full">
          <EnhancedChatInterface
            className="h-full rounded-lg shadow-lg"
            placeholder="Ask me anything... I'll respond with real-time streaming!"
            onMessageSent={(message) => {
              console.log('Message sent:', message);
            }}
            config={{
              enableOptimization: true,
              enableAnalytics: true,
              model: 'deepseek-chat',
              temperature: 0.7,
              maxTokens: 4096
            }}
          />
        </div>
      </main>

      <footer className="bg-gray-100 text-center p-4 text-sm text-gray-600">
        <p>
          Powered by PromptCraft • SSE Streaming • Real-time AI Responses
        </p>
      </footer>
    </div>
  );
}