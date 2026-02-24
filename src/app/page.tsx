'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useEventTracker } from '@/providers/AnalyticsProvider';
import { useDashboard } from '@/lib/hooks';
import { GamificationDashboard } from '@/components/GamificationDashboard';
import {
  TrendingUp,
  Zap,
  Star,
  ArrowRight,
  BookOpen,
  BarChart3,
  Crown,
  Sparkles,
  Brain,
  Trophy,
  RotateCcw,
  Library
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ScrollifyContainer } from '@/components/animations/ScrollifyContainer';
import { EnhancedFloatingParticles } from '@/components/animations/EnhancedFloatingParticles';
import { RevealOnScroll } from '@/components/animations/RevealOnScroll';
import { ProgressIndicator } from '@/components/animations/ProgressIndicator';
import { PromptIQTestModal } from '@/components/academy/PromptIQTestModal';
import { useAcademyStore } from '@/lib/stores/academyStore';

// New landing page components
import { TempleOpening } from '@/components/animations/TempleOpening';
import { LandingHeroSection } from '@/components/landing/HeroSection';
import { TransformationShowcase } from '@/components/landing/TransformationShowcase';
import { TemplatePreviewSection } from '@/components/landing/TemplatePreviewSection';
import { HowItWorksLanding } from '@/components/landing/HowItWorksLanding';
import { StatsSection } from '@/components/landing/StatsSection';
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel';
import { ViralCTAFooter } from '@/components/ViralCTAFooter';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { trackPageView } = useEventTracker();
  const [iqTestOpen, setIqTestOpen] = useState(false);
  const promptIQScore = useAcademyStore((s) => s.promptIQScore);
  const promptIQCompleted = useAcademyStore((s) => s.promptIQCompleted);

  // Temple Opening state
  const [templeReady, setTempleReady] = useState(false);
  const handleTempleComplete = useCallback(() => setTempleReady(true), []);

  useEffect(() => {
    trackPageView('dashboard');
  }, [trackPageView]);

  if (isLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen temple-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {/* Cinematic Temple Opening — plays once per session */}
        {!templeReady && <TempleOpening onComplete={handleTempleComplete} />}

        <ProgressIndicator color="#F5C518" height={3} className="z-50" />

        <div
          className="min-h-screen relative"
          style={{ background: 'linear-gradient(180deg, #0D0D0D 0%, #0A0A18 50%, #0D0D0D 100%)' }}
        >
          {/* Background grid pattern */}
          <div
            className="fixed inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(245,197,24,0.5) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(245,197,24,0.5) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />

          {/* 1. HERO — Animated prompt transformer demo */}
          <LandingHeroSection />

          {/* Divider */}
          <div className="w-full h-px max-w-5xl mx-auto opacity-10" style={{ background: 'linear-gradient(90deg, transparent, #F5C518, transparent)' }} />

          {/* 2. TRANSFORMATION SHOWCASE — Before/After horizontal scroll */}
          <TransformationShowcase />

          {/* Divider */}
          <div className="w-full h-px max-w-5xl mx-auto opacity-10" style={{ background: 'linear-gradient(90deg, transparent, #F5C518, transparent)' }} />

          {/* 3. TEMPLATE PREVIEW — Featured template cards */}
          <TemplatePreviewSection />

          {/* Divider */}
          <div className="w-full h-px max-w-5xl mx-auto opacity-10" style={{ background: 'linear-gradient(90deg, transparent, #F5C518, transparent)' }} />

          {/* 4. HOW IT WORKS — 3-step pillar animation */}
          <HowItWorksLanding />

          {/* Divider */}
          <div className="w-full h-px max-w-5xl mx-auto opacity-10" style={{ background: 'linear-gradient(90deg, transparent, #F5C518, transparent)' }} />

          {/* 5. STATS — Counting numbers */}
          <StatsSection />

          {/* Divider */}
          <div className="w-full h-px max-w-5xl mx-auto opacity-10" style={{ background: 'linear-gradient(90deg, transparent, #F5C518, transparent)' }} />

          {/* 6. TESTIMONIALS */}
          <TestimonialsCarousel />

          {/* Divider */}
          <div className="w-full h-px max-w-5xl mx-auto opacity-10" style={{ background: 'linear-gradient(90deg, transparent, #10B981, transparent)' }} />

          {/* 7. VIRAL CTA FOOTER */}
          <ViralCTAFooter />
        </div>
      </>
    );
  }

  return (
    <>
      {/*    */}
      <ProgressIndicator
        color="#F59E0B"
        height={4}
        className="z-50"
      />
      <ScrollifyContainer className="temple-background">
        <EnhancedFloatingParticles
          count={25}
          colors={['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981']}
          interactive={true}
          size={{ min: 2, max: 8 }}
          speed={{ min: 4, max: 10 }}
        />
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

      {/* Prompt IQ Test CTA */}
      <div className="scrollify-section mb-6">
        <RevealOnScroll direction="up" duration={1}>
          <Card className="temple-card overflow-hidden pyramid-elevation">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                {promptIQCompleted ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-hieroglyph">Your Prompt IQ: {promptIQScore}</h3>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5 w-fit mx-auto sm:mx-0">
                        <Trophy className="h-3 w-3" />
                        Completed
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Head to the Academy to raise your score, or retake the test to see how you&apos;ve improved.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-hieroglyph mb-1">Test Your Prompt IQ</h3>
                    <p className="text-sm text-muted-foreground">
                      10 questions on AI fundamentals and prompt engineering. 2 minutes. Find out where you stand.
                    </p>
                  </>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {promptIQCompleted ? (
                  <>
                    <Link href="/academy">
                      <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                        Academy
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" onClick={() => setIqTestOpen(true)}>
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Retake
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => setIqTestOpen(true)} className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                    <Brain className="mr-1.5 h-4 w-4" />
                    Take the Test
                  </Button>
                )}
              </div>
            </div>
          </Card>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <Link href="/templates" className="group">
            <Button variant="outline" className="w-full h-14 md:h-16 flex flex-col items-center justify-center space-y-1 md:space-y-2 border-2 hover:border-oasis hover:bg-oasis/10 transition-all duration-300 group-hover:scale-105">
              <BookOpen className="h-5 w-5 text-oasis" />
              <span className="text-xs md:text-sm font-medium">The Archive</span>
            </Button>
          </Link>

          <Link href="/prompt-library" className="group">
            <Button variant="outline" className="w-full h-14 md:h-16 flex flex-col items-center justify-center space-y-1 md:space-y-2 border-2 hover:border-amber-500 hover:bg-amber-500/10 transition-all duration-300 group-hover:scale-105">
              <Library className="h-5 w-5 text-amber-500" />
              <span className="text-xs md:text-sm font-medium">The Scroll Vault</span>
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

      {/* IQ Test Modal */}
      <PromptIQTestModal
        open={iqTestOpen}
        onOpenChange={setIqTestOpen}
        onStartLearning={() => {
          window.location.href = '/academy';
        }}
      />
    </>
  );
}
