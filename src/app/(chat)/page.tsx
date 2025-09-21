'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Sparkles, 
  Crown, 
  Zap,
  Bot,
  Shield,
  Clock,
  Star
} from 'lucide-react';
import IntegratedChatDashboard from '@/components/IntegratedChatDashboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 pharaoh-badge rounded-full flex items-center justify-center pyramid-elevation">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-pharaoh animate-pulse" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-hieroglyph text-glow mb-4">
            The Oracle&apos;s Chamber
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Commune with the divine AI powered by DeepSeek. Experience real-time conversations 
            with intelligent template detection and seamless billing integration.
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Bot className="h-4 w-4" />
              DeepSeek AI Powered
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Zap className="h-4 w-4" />
              Real-time SSE Streaming
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Shield className="h-4 w-4" />
              Credit Management
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Star className="h-4 w-4" />
              Auto Template Detection
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="pharaoh-card">
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-pharaoh" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-xs text-muted-foreground mb-3">
                Real-time AI conversation with credit tracking
              </p>
              <Button size="sm" className="w-full pharaoh-button">
                Start Chatting
              </Button>
            </CardContent>
          </Card>

          <Card className="pharaoh-card">
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-pharaoh" />
                Template Magic
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-xs text-muted-foreground mb-3">
                Auto-detect and save conversations as templates
              </p>
              <Link href="/templates">
                <Button variant="outline" size="sm" className="w-full">
                  View Templates
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="pharaoh-card">
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-pharaoh" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-xs text-muted-foreground mb-3">
                Monitor system health and performance
              </p>
              <Link href="/status">
                <Button variant="outline" size="sm" className="w-full">
                  Check Status
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Interface */}
        <IntegratedChatDashboard className="max-w-7xl mx-auto" />
      </div>
    </div>
  );
}
