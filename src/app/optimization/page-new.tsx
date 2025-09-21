'use client';

import { useCallback, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useChatStore } from '@/lib/store/chatStore';
import { useWebSocket } from '@/lib/ws/useWebSocket';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { Button } from '@/components/ui/button';
import { Brain, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { WsOutbound } from '@/types/chat';

const OPTIMIZATION_PROMPTS = [
  {
    title: "Analyze Intent",
    description: "Understand the purpose and goals behind your prompt",
    template: "/intent Please analyze the intent of this prompt and suggest improvements: "
  },
  {
    title: "Optimize Performance", 
    description: "Improve clarity, specificity, and effectiveness",
    template: "/rewrite Please optimize this prompt for better performance and clarity: "
  },
  {
    title: "A/B Test Variants",
    description: "Generate alternative versions for testing",
    template: "Please create 3 different variations of this prompt for A/B testing: "
  }
];

export default function OptimizationPage() {
  const { user, isAuthenticated } = useAuth();

  const {
    sessions,
    currentSessionId,
    getCurrentMessages,
    streaming,
    rateLimited,
    createSession,
    selectSession,
    addMessage,
    setStreaming,
  } = useChatStore();

  const { send, status, latency } = useWebSocket();

  // Create or select optimization session
  useEffect(() => {
    if (isAuthenticated) {
      const optimizationSession = sessions.find(s => s.title.includes('Optimization'));
      if (!optimizationSession) {
        const sessionId = createSession('Prompt Optimization Session');
        selectSession(sessionId);
      } else {
        selectSession(optimizationSession.id);
      }
    }
  }, [isAuthenticated, sessions, createSession, selectSession]);

  const handleSendMessage = useCallback((content: string) => {
    if (!currentSessionId || !content.trim() || streaming || rateLimited) {
      return;
    }

    // Add user message immediately (optimistic update)
    const userMessageId = addMessage({
      role: 'user',
      content: content.trim(),
      sessionId: currentSessionId,
    });

    // Add placeholder assistant message
    const assistantMessageId = addMessage({
      role: 'assistant',
      content: '',
      partial: true,
      sessionId: currentSessionId,
    });

    // Send via WebSocket with optimization context
    const wsMessage: WsOutbound = {
      type: 'chat.send',
      content: content.trim(),
      sessionId: currentSessionId,
      meta: {
        userMessageId,
        assistantMessageId,
        context: 'optimization',
        mode: 'prompt_optimization'
      },
    };

    send(wsMessage);
    setStreaming(true);
  }, [currentSessionId, streaming, rateLimited, addMessage, send, setStreaming]);

  const handleQuickPrompt = useCallback((template: string) => {
    handleSendMessage(template);
  }, [handleSendMessage]);

  const currentMessages = getCurrentMessages();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600 mb-6">You need to be authenticated to access prompt optimization.</p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Prompt Optimization
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Improve your prompts with AI-powered analysis and optimization. Get real-time feedback on clarity, 
            specificity, and effectiveness to maximize your AI interactions.
          </p>
        </motion.div>

        {/* Quick Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          {OPTIMIZATION_PROMPTS.map((prompt, index) => (
            <motion.div
              key={prompt.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleQuickPrompt(prompt.template)}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  {index === 0 && <Brain className="w-4 h-4 text-blue-600" />}
                  {index === 1 && <Zap className="w-4 h-4 text-blue-600" />}
                  {index === 2 && <TrendingUp className="w-4 h-4 text-blue-600" />}
                </div>
                <h3 className="font-semibold text-gray-900">{prompt.title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{prompt.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          style={{ height: '600px' }}
        >
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5" />
                  <div>
                    <h2 className="font-semibold">Optimization Assistant</h2>
                    <p className="text-blue-100 text-sm">Real-time prompt analysis and improvement</p>
                  </div>
                </div>
                
                {/* Connection Status */}
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${status.connected ? 'bg-green-300' : 'bg-red-300'}`} />
                  <span className="text-blue-100">
                    {status.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1">
              <ChatWindow
                messages={currentMessages}
                isStreaming={streaming}
                wsStatus={status}
                latency={latency}
                className="h-full"
              />
            </div>

            {/* Composer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <ChatComposer
                onSend={handleSendMessage}
                disabled={streaming || rateLimited || !status.connected}
                credits={user?.credits}
                placeholder={
                  !status.connected 
                    ? "Connecting to optimization service..."
                    : streaming 
                    ? "AI is analyzing your prompt..."
                    : rateLimited
                    ? "Rate limited, please wait..."
                    : "Paste your prompt here for optimization... (Cmd/Ctrl+Enter to send)"
                }
                maxLength={8000} // Longer limit for optimization
              />
              
              {/* Tips */}
              <div className="mt-3 text-xs text-gray-500 text-center">
                💡 Try: &quot;/intent analyze this prompt&quot; or &quot;/rewrite improve this prompt&quot; or paste any prompt for analysis
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid md:grid-cols-3 gap-6 text-center"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Brain className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Intent Analysis</h3>
            <p className="text-gray-600 text-sm">
              Understand what your prompt is trying to achieve and identify areas for improvement.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Zap className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Optimization</h3>
            <p className="text-gray-600 text-sm">
              Get instant feedback and suggestions to make your prompts more effective.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Performance Insights</h3>
            <p className="text-gray-600 text-sm">
              Track improvements and measure the effectiveness of your optimized prompts.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
