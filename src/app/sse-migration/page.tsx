'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Wifi, 
  MessageSquare,
  BarChart3,
  Settings,
  BookOpen
} from 'lucide-react';

import SSEChatInterface from '@/components/SSEChatInterface';
import SSEHealthCheck from '@/components/SSEHealthCheck';
import SSEMigrationGuide from '@/components/SSEMigrationGuide';

export default function SSEMigrationDemo() {
  const [showMigrationGuide, setShowMigrationGuide] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-2 shadow-sm">
            <Zap className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">WebSocket → SSE Migration</span>
            <Badge variant="secondary">Live Demo</Badge>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800">
            HTTP Server-Sent Events Chat
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the next generation of real-time chat with improved reliability, 
            simpler implementation, and better scalability.
          </p>

          <div className="flex items-center justify-center space-x-4">
            <Button onClick={() => setShowMigrationGuide(true)}>
              <BookOpen className="w-4 h-4 mr-2" />
              Migration Guide
            </Button>
            
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Performance Stats
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[700px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <span>SSE Chat Interface</span>
                  <Badge variant="secondary">New</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0">
                <SSEChatInterface 
                  className="h-full"
                  enableOptimization={true}
                  enableAnalytics={true}
                  onPromptOptimized={(result) => {
                    console.log('Prompt optimized:', result);
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Health Check */}
            <SSEHealthCheck 
              onHealthChange={(health) => {
                console.log('Health status:', health);
              }}
            />

            {/* Migration Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Migration Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backend</span>
                  <Badge variant="default" className="bg-green-500">
                    ✅ Ready
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Frontend</span>
                  <Badge variant={migrationCompleted ? "default" : "secondary"} 
                         className={migrationCompleted ? "bg-green-500" : ""}>
                    {migrationCompleted ? "✅ Complete" : "🚀 In Progress"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WebSocket</span>
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    📦 Deprecated
                  </Badge>
                </div>

                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowMigrationGuide(true)}
                >
                  View Migration Guide
                </Button>
              </CardContent>
            </Card>

            {/* Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Connection Time</span>
                    <span className="text-green-600">-60% ↓</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-green-500 h-1 rounded-full w-4/10"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Error Rate</span>
                    <span className="text-green-600">-80% ↓</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-green-500 h-1 rounded-full w-2/10"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Memory Usage</span>
                    <span className="text-green-600">-40% ↓</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-green-500 h-1 rounded-full w-6/10"></div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500 text-center">
                    vs WebSocket implementation
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span>Standard HTTP/2</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-3 h-3 text-blue-500" />
                    <span>Auto-reconnection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-3 h-3 text-purple-500" />
                    <span>Load balancer friendly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-3 h-3 text-gray-500" />
                    <span>CDN compatible</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="api" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="api">API Endpoint</TabsTrigger>
                <TabsTrigger value="client">Client Code</TabsTrigger>
                <TabsTrigger value="events">Event Flow</TabsTrigger>
                <TabsTrigger value="migration">Migration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="api" className="space-y-4">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                  <div className="text-blue-400">POST</div>
                  <div className="text-white">/api/v2/chat/completions/</div>
                  <div className="mt-2 text-gray-400">Content-Type: application/json</div>
                  <div className="text-gray-400">Accept: text/event-stream</div>
                  <div className="text-gray-400">Authorization: Bearer &lt;JWT_TOKEN&gt;</div>
                </div>
              </TabsContent>
              
              <TabsContent value="client" className="space-y-4">
                <div className="bg-gray-900 text-white p-4 rounded-lg text-sm font-mono">
                  <div className="text-green-400">// New SSE Code</div>
                  <div className="text-blue-400">import</div> {'{ useSSEChat }'} <div className="text-blue-400">from</div> <div className="text-yellow-400">'@/lib/services/sse-chat'</div>
                  <div className="mt-2">
                    <div className="text-blue-400">const</div> {'{ service, isConnected }'} = <div className="text-purple-400">useSSEChat</div>()
                  </div>
                  <div className="mt-2">
                    <div className="text-blue-400">await</div> service.<div className="text-purple-400">sendMessage</div>(<div className="text-yellow-400">Hello!</div>)
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="events" className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">1</Badge>
                    <span>stream_start → Connection established</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">2</Badge>
                    <span>data → Streaming tokens (OpenAI format)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">3</Badge>
                    <span>stream_complete → Finished with metadata</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">4</Badge>
                    <span>[DONE] → Stream termination</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="migration" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">❌ Old (WebSocket)</h4>
                    <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                      <code>useWebSocketChat()</code><br/>
                      <code>EnhancedChatInterface</code><br/>
                      <code>socket.io-client</code>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">✅ New (SSE)</h4>
                    <div className="bg-green-50 border border-green-200 p-3 rounded text-sm">
                      <code>useSSEChat()</code><br/>
                      <code>SSEChatInterface</code><br/>
                      <code>fetch() + EventSource</code>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Migration Guide Modal */}
      {showMigrationGuide && (
        <SSEMigrationGuide
          onMigrationComplete={() => {
            setMigrationCompleted(true);
            setShowMigrationGuide(false);
          }}
          onClose={() => setShowMigrationGuide(false)}
        />
      )}
    </div>
  );
}
