'use client';

import { motion } from 'framer-motion';
import {
  Coins,
  Activity,
  Timer,
  BarChart3,
} from 'lucide-react';
import { useDashboard } from '@/hooks/api/useDashboard';
import { useCreditsStore } from '@/store/credits';
import { StatCard } from '@/components/dashboard/StatCard';
import { DailyTrendChart } from '@/components/dashboard/DailyTrendChart';
import { FeatureBreakdown } from '@/components/dashboard/FeatureBreakdown';
import { ROICard } from '@/components/dashboard/ROICard';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { DailyRefillToast } from '@/components/credits/DailyRefillToast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function UsageDashboardPage() {
  const { data, isLoading } = useDashboard();
  const creditsAvailable = useCreditsStore((s) => s.creditsAvailable);

  return (
    <div className="min-h-screen bg-background">
      <DailyRefillToast />

      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Usage Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your AI credit consumption, analytics, and subscription
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoading ? (
          <div className="space-y-6">
            {/* Skeleton stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
            {/* Skeleton charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 rounded-xl bg-muted animate-pulse" />
              <div className="h-80 rounded-xl bg-muted animate-pulse" />
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* 4 Stat Cards */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              <StatCard
                title="Credits Remaining"
                value={data?.credits_remaining ?? creditsAvailable}
                icon={Coins}
                trend={undefined}
              />
              <StatCard
                title="API Calls This Month"
                value={data?.api_calls_this_month ?? 0}
                icon={Activity}
              />
              <StatCard
                title="Avg Latency"
                value={data?.avg_latency_ms ?? 0}
                icon={Timer}
                suffix="ms"
              />
              <StatCard
                title="Tokens Generated"
                value={data?.tokens_generated ?? 0}
                icon={BarChart3}
                formatValue={(n) =>
                  n >= 1_000_000
                    ? `${(n / 1_000_000).toFixed(1)}M`
                    : n >= 1_000
                    ? `${(n / 1_000).toFixed(1)}K`
                    : n.toString()
                }
              />
            </motion.div>

            {/* Charts row */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <DailyTrendChart data={data?.daily_usage ?? []} />
              <FeatureBreakdown data={data?.feature_breakdown ?? []} />
            </motion.div>

            {/* ROI Card */}
            <motion.div variants={itemVariants}>
              <ROICard
                directApiCost={data?.roi?.direct_api_cost ?? 0}
                templeCost={data?.roi?.temple_cost ?? 0}
                savingsPercentage={data?.roi?.savings_percentage ?? 0}
              />
            </motion.div>

            {/* Subscription Management */}
            <motion.div variants={itemVariants}>
              <SubscriptionCard />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
