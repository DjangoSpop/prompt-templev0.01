'use client';
/* eslint-disable */

import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useEventTracker } from '@/providers/AnalyticsProvider';
import { useDashboard } from '@/lib/hooks';
import { GamificationDashboard } from '@/components/GamificationDashboard';
import { HeroSection } from '@/components/HeroSection';
import { 
  TrendingUp, 
  Zap, 
  Star,
  ArrowRight,
  Play,
  BookOpen,
  BarChart3,
  Crown,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { trackPageView } = useEventTracker();

  useEffect(() => {
    trackPageView('home');
  }, [trackPageView]);

  if (isLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-desert-sand-50 to-desert-sand-200">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lapis-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <HeroSection />;
  }

  // Authenticated dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-desert-sand-50 to-desert-sand-200">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl font-display font-display-bold text-lapis-blue-900 mb-6">
            Welcome back to the Temple, {user?.first_name || 'Devotee'}
          </h1>
          <p className="text-xl text-obsidian-700 mb-8">
            Your sacred workspace awaits. Continue your journey of prompt mastery.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex justify-center space-x-4 mb-12">
          <Link href="/templates">
            <Button size="lg" className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Browse Templates</span>
            </Button>
          </Link>
          <Link href="/orchestrate">
            <Button size="lg" variant="outline" className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Orchestrate</span>
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="temple-card p-6 text-center pyramid-elevation">
            <div className="w-12 h-12 bg-oasis/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-oasis" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-hieroglyph">Temple Library</h3>
            <p className="text-muted-foreground">
              Access thousands of tested prompt templates for every use case
            </p>
          </Card>
          
          <Card className="temple-card p-6 text-center pyramid-elevation">
            <div className="w-12 h-12 bg-pharaoh/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-pharaoh" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-hieroglyph">Sacred Analysis</h3>
            <p className="text-muted-foreground">
              Upload your chat exports and discover your most effective prompts
            </p>
          </Card>
          
          <Card className="temple-card p-6 text-center pyramid-elevation">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-hieroglyph">Divine Enhancement</h3>
            <p className="text-muted-foreground">
              Get AI-powered suggestions to improve your prompts and templates
            </p>
          </Card>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 pharaoh-badge rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-hieroglyph">
                Welcome back, {user?.first_name || 'Temple Devotee'}
              </h2>
              <p className="text-muted-foreground">
                Continue your journey of prompt mastery
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="temple-card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Templates Created
                  </p>
                  <p className="text-2xl font-bold text-hieroglyph">
                    {dashboardData?.templates_created || 0}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-oasis" />
              </div>
            </div>
          </Card>

          <Card className="temple-card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Usage
                  </p>
                  <p className="text-2xl font-bold text-hieroglyph">
                    {dashboardData?.total_usage || 0}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-pharaoh" />
              </div>
            </div>
          </Card>

          <Card className="temple-card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Rating
                  </p>
                  <p className="text-2xl font-bold text-hieroglyph">
                    {dashboardData?.average_rating || '0.0'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-gold" />
              </div>
            </div>
          </Card>

          <Card className="temple-card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Achievement Points
                  </p>
                  <p className="text-2xl font-bold text-hieroglyph">
                    {dashboardData?.achievement_points || 0}
                  </p>
                </div>
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Templates */}
          <Card className="temple-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-hieroglyph flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-oasis" />
                Recent Templates
              </h3>
              <div className="space-y-4">
                {dashboardData?.recent_templates?.length > 0 ? (
                  dashboardData.recent_templates.map((template: any) => (
                    <div key={template.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-hieroglyph">{template.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {template.category}
                        </p>
                      </div>
                      <Link href={`/templates/${template.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No templates yet</p>
                )}
              </div>
            </div>
          </Card>

          {/* Top Performing */}
          <Card className="temple-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-hieroglyph flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-pharaoh" />
                Top Performing
              </h3>
              <div className="space-y-4">
                {dashboardData?.top_performing?.length > 0 ? (
                  dashboardData.top_performing.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-hieroglyph">{item.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Star className="h-3 w-3 text-gold" />
                          <span className="text-sm text-muted-foreground">
                            {item.rating}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            • {item.usage_count} uses
                          </span>
                        </div>
                      </div>
                      <Link href={`/templates/${item.id}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Gamification Dashboard */}
        <div className="mt-8">
          <GamificationDashboard />
        </div>
      </div>
    </div>
  );
}