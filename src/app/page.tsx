'use client';

import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useEventTracker } from '@/providers/AnalyticsProvider';
import { useDashboard } from '@/lib/hooks';
import { GamificationDashboard } from '@/components/GamificationDashboard';
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
import dynamic from 'next/dynamic';
import { PharaohHero } from '@/components/hero/PharaohHero';
import { NefertitiBackground } from '@/components/pharaonic/NefertitiIcon';
import { PyramidGrid } from '@/components/pharaonic/PyramidGrid';
import { HeroSection } from '@/components/HeroSection';
import { AssistantBadge } from '@/components/assistant';
import { ScrollifyContainer } from '@/components/animations/ScrollifyContainer';
import { FloatingParticles } from '@/components/animations/FloatingParticles';
import { RevealOnScroll } from '@/components/animations/RevealOnScroll';

const TempleGateHero = dynamic(() => import('@/components/temple/TempleGateHero').then(m => m.TempleGateHero), { ssr: false });

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  // const { trackPageView } = useEventTracker();

  // useEffect(() => {
  //   trackPageView('dashboard');
  // }, [trackPageView]);

  if (isLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen temple-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScrollifyContainer className="min-h-screen temple-background">
        <FloatingParticles count={30} />

        {/* Hero Section */}
        <div className="scrollify-section relative z-10">
          <TempleGateHero/>
        </div>

        {/* Welcome Section */}
        <div className="scrollify-section text-center max-w-4xl mx-auto relative z-10">
          <RevealOnScroll direction="up" duration={1.2}>
            <h1 className="text-5xl font-bold text-foreground mb-6 text-hieroglyph">
              Welcome to PromptTemple
            </h1>
          </RevealOnScroll>

          <RevealOnScroll direction="up" duration={1} delay={0.3}>
            <p className="text-xl text-muted-foreground mb-8">
              Discover, create, and manage AI prompt templates with powerful analytics and collaboration features.
            </p>
          </RevealOnScroll>

          <RevealOnScroll direction="scale" duration={1.5} delay={0.6}>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8 md:mb-12">
              <div className="parallax-element">
                <PyramidGrid/>
              </div>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto flex items-center justify-center space-x-2 hover:scale-105 transition-transform duration-300">
                  <Play className="h-5 w-5" />
                  <span>Get Started</span>
                </Button>
              </Link>
              <Link href="/templates" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto flex items-center justify-center space-x-2 hover:scale-105 transition-transform duration-300">
                  <BookOpen className="h-5 w-5" />
                  <span>Browse Templates</span>
                </Button>
              </Link>
            </div>
          </RevealOnScroll>
        </div>

        {/* Pharaoh Hero Section */}
        <div className="scrollify-section">
          <PharaohHero/>
        </div>

        {/* Hero Section */}
        <div className="scrollify-section">
          <HeroSection/>
        </div>

        {/* Feature Cards Section */}
        <div className="scrollify-section container mx-auto px-4 py-16">
          <RevealOnScroll direction="up" duration={1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-16">
              <Card className="temple-card p-6 text-center pyramid-elevation scale-element hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-oasis/20 rounded-lg flex items-center justify-center mx-auto mb-4 stagger-element">
                  <BookOpen className="h-6 w-6 text-oasis" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-hieroglyph stagger-element">Temple Library</h3>
                <p className="text-muted-foreground stagger-element">
                  Access thousands of tested prompt templates for every use case
                </p>
              </Card>

              <Card className="temple-card p-6 text-center pyramid-elevation scale-element hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-pharaoh/20 rounded-lg flex items-center justify-center mx-auto mb-4 stagger-element">
                  <BarChart3 className="h-6 w-6 text-pharaoh" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-hieroglyph stagger-element">Sacred Analysis</h3>
                <p className="text-muted-foreground stagger-element">
                  Upload your chat exports and discover your most effective prompts
                </p>
              </Card>

              <Card className="temple-card p-6 text-center pyramid-elevation scale-element hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4 stagger-element">
                  <Zap className="h-6 w-6 text-primary" />
                  <AssistantBadge/>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-hieroglyph stagger-element">Divine Enhancement</h3>
                <p className="text-muted-foreground stagger-element">
                  Get AI-powered suggestions to improve your prompts and templates
                </p>
              </Card>
            </div>
          </RevealOnScroll>
        </div>
      </ScrollifyContainer>
    );
  }

  return (
    <ScrollifyContainer className="min-h-screen temple-background">
      <FloatingParticles count={20} />
      <div className="container mx-auto px-4 py-4 md:py-8 relative z-10">
      {/* Welcome Header */}
      <div className="scrollify-section mb-8">
        <RevealOnScroll direction="up" duration={1}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 stagger-element">
            <div className="w-12 h-12 pharaoh-badge rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-hieroglyph text-glow-lg">
              Welcome back to the Temple, {user?.first_name || user?.username}!
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 text-lg stagger-element">
            Your journey through the sacred halls of prompt mastery continues. Here&apos;s your current progress.
          </p>
        </RevealOnScroll>
      </div>

      {/* Temple Progress Stats */}
      {dashboardData && (
        <div className="scrollify-section">
          <RevealOnScroll direction="scale" duration={1.2} stagger={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="temple-card p-6 text-center pyramid-elevation pharaoh-glow">
            <div className="w-12 h-12 bg-oasis rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-oasis mb-1">
              {dashboardData?.total_templates_used || 0}
            </div>
            <div className="text-sm text-muted-foreground font-medium">Sacred Templates Used</div>
          </Card>
          
          <Card className="temple-card p-6 text-center pyramid-elevation pharaoh-glow">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-primary mb-1">
              {dashboardData?.total_renders || 0}
            </div>
            <div className="text-sm text-muted-foreground font-medium">Prompts Forged</div>
          </Card>
          
          <Card className="temple-card p-6 text-center pyramid-elevation pharaoh-glow">
            <div className="w-12 h-12 pharaoh-badge rounded-full flex items-center justify-center mx-auto mb-3">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-pharaoh mb-1">
              {dashboardData?.gamification?.level || 1}
            </div>
            <div className="text-sm text-muted-foreground font-medium">Temple Rank</div>
          </Card>
          
          <Card className="temple-card p-6 text-center pyramid-elevation pharaoh-glow">
            <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-destructive mb-1">
              {dashboardData?.gamification?.daily_streak || 0}
            </div>
            <div className="text-sm text-muted-foreground font-medium">Devotion Streak</div>
          </Card>
            </div>
          </RevealOnScroll>
        </div>
      )}

      {/* Sacred Chambers Access */}
      <div className="scrollify-section">
        <RevealOnScroll direction="up" duration={1}>
          <Card className="temple-card p-8 mb-8 pyramid-elevation-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 pharaoh-badge rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-hieroglyph text-glow">Enter the Sacred Chambers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Link href="/templates" className="group">
            <Button variant="outline" className="w-full h-14 md:h-16 flex flex-col items-center justify-center space-y-1 md:space-y-2 border-2 hover:border-oasis hover:bg-oasis/10 transition-all duration-300 group-hover:scale-105">
              <BookOpen className="h-5 w-5 text-oasis" />
              <span className="text-xs md:text-sm font-medium">The Archive</span>
            </Button>
          </Link>
          
          <Link href="/templates/create" className="group">
            <Button variant="outline" className="w-full h-14 md:h-16 flex flex-col items-center justify-center space-y-1 md:space-y-2 border-2 hover:border-primary hover:bg-primary/10 transition-all duration-300 group-hover:scale-105">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-xs md:text-sm font-medium">The Forge</span>
            </Button>
          </Link>
          
          <Link href="/history" className="group">
            <Button variant="outline" className="w-full h-14 md:h-16 flex flex-col items-center justify-center space-y-1 md:space-y-2 border-2 hover:border-pharaoh hover:bg-pharaoh/10 transition-all duration-300 group-hover:scale-105">
              <TrendingUp className="h-5 w-5 text-pharaoh" />
              <span className="text-xs md:text-sm font-medium">The Chronicle</span>
            </Button>
          </Link>
          
          <Link href="/analysis" className="group">
            <Button variant="outline" className="w-full h-14 md:h-16 flex flex-col items-center justify-center space-y-1 md:space-y-2 border-2 hover:border-destructive hover:bg-destructive/10 transition-all duration-300 group-hover:scale-105">
              <BarChart3 className="h-5 w-5 text-destructive" />
              <span className="text-xs md:text-sm font-medium">The Observatory</span>
            </Button>
          </Link>
        </div>
          </Card>
        </RevealOnScroll>
      </div>

      <div className="scrollify-section">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Sacred Journey Log */}
        <div className="lg:col-span-2">
          <RevealOnScroll direction="left" duration={1}>
          <Card className="temple-card p-6 pyramid-elevation-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 pharaoh-badge rounded-full flex items-center justify-center">
                <BookOpen className="h-3 w-3 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-hieroglyph text-glow">Sacred Journey Log</h2>
            </div>
            {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recent_activity.map((activity: { template_name: string; category: string; used_at: string }, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-4 sandstone-gradient rounded-lg border border-primary/20 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 pharaoh-badge rounded-full flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-hieroglyph">{activity.template_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.category} • {new Date(activity.used_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600">
                  Your sacred journey awaits. Begin by exploring templates to see your path unfold here.
                </p>
              </div>
            )}
          </Card>
          </RevealOnScroll>
        </div>

        {/* Sacred Affinities */}
        <div>
          <RevealOnScroll direction="right" duration={1}>
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Sacred Affinities</h2>
            </div>
            {dashboardData?.favorite_categories && dashboardData.favorite_categories.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.favorite_categories.slice(0, 5).map((category: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
                    <span className="text-gray-900 font-medium">{category}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600">
                  Explore templates to discover your sacred affinities!
                </p>
              </div>
            )}
          </Card>
          </RevealOnScroll>
        </div>
        </div>
      </div>

      {/* Gamification Dashboard */}
      <div className="scrollify-section mt-8">
        <RevealOnScroll direction="up" duration={1.2}>
          <GamificationDashboard />
        </RevealOnScroll>
      </div>
      </div>
    </ScrollifyContainer>
  );
}
