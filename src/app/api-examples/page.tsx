"use client";

/**
 * Example page demonstrating API coverage and new components
 * This shows how to use all the newly created billing, analytics, and core components
 */

import React from 'react';
import { Card } from '@/components/ui/card-unified';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Billing Components
import { 
  FeatureGate, 
  FeatureLimitWarning,
  EntitlementBadge,
  CreditDisplay,
  EntitlementsGrid 
} from '@/components/billing';

// Core Components
import { NotificationCenter } from '@/components/core';

// Dashboard Components
import { DashboardOverview } from '@/components/dashboard';

// Hooks
import { useFeatureAccess } from '@/hooks/api/useBilling';
import { useUserLevel } from '@/hooks/api/useGamification';

export default function APIExamplesPage() {
  const { hasAccess, remaining, limit } = useFeatureAccess('ai_generation');
  const { data: level } = useUserLevel();

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Coverage Examples</h1>
          <p className="text-muted-foreground">
            Demonstrating full backend integration with Prompt Temple API
          </p>
        </div>
        <NotificationCenter />
      </div>

      <Tabs defaultValue="billing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="billing">Billing & Limits</TabsTrigger>
          <TabsTrigger value="gating">Feature Gating</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="hooks">Hook Examples</TabsTrigger>
        </TabsList>

        {/* Billing & Limits */}
        <TabsContent value="billing" className="space-y-6">
          <Card variant="temple" className="p-6">
            <h2 className="text-xl font-semibold mb-4">Credit Displays</h2>
            <div className="space-y-4">
              <CreditDisplay feature="ai_generation" />
              <CreditDisplay feature="api_calls" />
              <CreditDisplay feature="templates_created" />
            </div>
          </Card>

          <Card variant="temple" className="p-6">
            <h2 className="text-xl font-semibold mb-4">Entitlements Grid</h2>
            <EntitlementsGrid />
          </Card>

          <Card variant="temple" className="p-6">
            <h2 className="text-xl font-semibold mb-4">Entitlement Badges</h2>
            <div className="flex flex-wrap gap-2">
              <EntitlementBadge feature="ai_generation" />
              <EntitlementBadge feature="api_calls" />
              <EntitlementBadge feature="templates_created" compact />
              <EntitlementBadge feature="storage" showLabel={false} />
            </div>
          </Card>

          <Card variant="temple" className="p-6">
            <h2 className="text-xl font-semibold mb-4">Limit Warnings</h2>
            <FeatureLimitWarning feature="ai_generation" threshold={80} />
            <FeatureLimitWarning feature="api_calls" threshold={90} />
          </Card>
        </TabsContent>

        {/* Feature Gating */}
        <TabsContent value="gating" className="space-y-6">
          <Card variant="temple" className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Feature Gate</h2>
            <FeatureGate feature="ai_generation">
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h3 className="font-semibold mb-2">✅ Premium Feature Unlocked</h3>
                <p className="text-sm text-muted-foreground">
                  This content is only visible to users with access to AI generation.
                </p>
                <p className="text-sm mt-2">
                  You have {remaining} of {limit} generations remaining.
                </p>
              </div>
            </FeatureGate>
          </Card>

          <Card variant="temple" className="p-6">
            <h2 className="text-xl font-semibold mb-4">Custom Fallback</h2>
            <FeatureGate 
              feature="advanced_analytics"
              fallback={
                <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
                  <h3 className="font-semibold mb-2">🔒 Advanced Analytics</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get insights into your usage patterns and recommendations.
                  </p>
                  <Button>Upgrade to Pro</Button>
                </div>
              }
            >
              <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h3 className="font-semibold mb-2">📊 Advanced Analytics Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Your advanced analytics data would appear here.
                </p>
              </div>
            </FeatureGate>
          </Card>

          <Card variant="temple" className="p-6">
            <h2 className="text-xl font-semibold mb-4">Code Example</h2>
            <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto">
              <code>{`import { FeatureGate } from '@/components/billing';

<FeatureGate feature="ai_generation">
  <AIGenerationUI />
</FeatureGate>

// With custom fallback
<FeatureGate 
  feature="premium_templates"
  fallback={<UpgradePrompt />}
>
  <PremiumTemplatesGrid />
</FeatureGate>`}</code>
            </pre>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <DashboardOverview />
        </TabsContent>

        {/* Hook Examples */}
        <TabsContent value="hooks" className="space-y-6">
          <Card variant="temple" className="p-6">
            <h2 className="text-xl font-semibold mb-4">Using Hooks</h2>
            <div className="space-y-4">
              <div className="p-4 bg-secondary/10 rounded-lg">
                <h3 className="font-semibold mb-2">Feature Access Hook</h3>
                <pre className="text-sm overflow-x-auto">
                  <code>{`const { hasAccess, remaining, limit } = useFeatureAccess('ai_generation');

// Result:
hasAccess: ${hasAccess}
remaining: ${remaining || 'N/A'}
limit: ${limit || 'N/A'}`}</code>
                </pre>
              </div>

              <div className="p-4 bg-secondary/10 rounded-lg">
                <h3 className="font-semibold mb-2">User Level Hook</h3>
                <pre className="text-sm overflow-x-auto">
                  <code>{`const { data: level } = useUserLevel();

// Result:
${level ? JSON.stringify(level, null, 2) : 'Loading...'}`}</code>
                </pre>
              </div>

              <div className="p-4 bg-secondary/10 rounded-lg">
                <h3 className="font-semibold mb-2">Available Hooks</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>useBillingPlans, useSubscription, useEntitlements</li>
                  <li>useAchievements, useBadges, useUserLevel, useStreak</li>
                  <li>useAnalyticsDashboard, useUserInsights</li>
                  <li>useNotifications, useAppConfig, useHealthCheck</li>
                  <li>useChatSessions, usePromptHistory</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card variant="temple" className="p-6">
            <h2 className="text-xl font-semibold mb-4">Complete Integration Example</h2>
            <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import { 
  useSubscription,
  useEntitlements,
  useFeatureAccess 
} from '@/hooks/api/useBilling';

import { 
  useUserLevel,
  useStreak 
} from '@/hooks/api/useGamification';

import { useAnalyticsDashboard } from '@/hooks/api/useAnalytics';

function MyComponent() {
  const { data: subscription } = useSubscription();
  const { data: entitlements } = useEntitlements();
  const { hasAccess } = useFeatureAccess('ai_generation');
  const { data: level } = useUserLevel();
  const { data: streak } = useStreak();
  const { data: analytics } = useAnalyticsDashboard();

  return (
    <div>
      <h2>Plan: {subscription?.plan?.name}</h2>
      <p>Level: {level?.current_level}</p>
      <p>Streak: {streak?.current_streak} days</p>
      {hasAccess && <PremiumFeature />}
    </div>
  );
}`}</code>
            </pre>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <Card variant="temple" className="p-6 text-center">
        <h3 className="font-semibold mb-2">✅ Full API Coverage Achieved</h3>
        <p className="text-sm text-muted-foreground">
          All backend endpoints are properly wired and surfaced in the UI.
          See <code>API_COVERAGE_COMPLETE.md</code> for full documentation.
        </p>
      </Card>
    </div>
  );
}
