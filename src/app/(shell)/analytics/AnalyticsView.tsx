'use client';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  PieChart,
  Activity,
  Clock,
  Download,
  RefreshCw,
  Filter,
} from 'lucide-react';
import {
  useDashboard,
  useUserInsights,
  useTemplatesAnalytics,
} from '@/lib/hooks/useAnalytics';          // ← your existing hooks
import type { DashboardData } from '@/lib/types';

type DateRange = '1d' | '7d' | '30d' | '90d';
type Tab = 'overview' | 'insights' | 'templates';

/* ------------------------------------------------------------------ */
/* UI helpers                                                         */
/* ------------------------------------------------------------------ */
const StatCard = ({
  label,
  value,
  icon,
  trend,
  trendText,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendText?: string;
}) => {
  const Icon = icon;
  return (
    <div className="bg-bg-secondary rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-muted text-sm">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div className="p-3 bg-brand/10 rounded-lg">
          <Icon className="w-6 h-6 text-brand" />
        </div>
      </div>
      {trend && trendText && (
        <div className="mt-4 flex items-center text-sm">
          <TrendingUp
            className={clsx('w-4 h-4 mr-1', {
              'text-green': trend === 'up',
              'text-red rotate-180': trend === 'down',
            })}
          />
          <span className={clsx({ 'text-green': trend === 'up', 'text-red': trend === 'down' })}>
            {trendText}
          </span>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */
export default function AnalyticsView() {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  /* ---------- data ---------- */
  const dashboardQ   = useDashboard();
  const insightsQ    = useUserInsights();
  const templatesQ   = useTemplatesAnalytics();

  /* ---------- side effects ---------- */
  useEffect(() => {
    /* invalidate all analytics slices when range changes */
    dashboardQ.refetch();
    insightsQ.refetch();
    templatesQ.refetch();
  }, [dateRange]);

  /* ---------- derived ---------- */
  const dashboard   = dashboardQ.data;
  const insights    = insightsQ.data;
  const templates   = templatesQ.data;

  const isLoading   = dashboardQ.isLoading || insightsQ.isLoading || templatesQ.isLoading;
  const isRefetching= dashboardQ.isRefetching || insightsQ.isRefetching || templatesQ.isRefetching;

  /* ---------- handlers ---------- */
  const exportData = () => {
    const payload = {
      dashboard,
      userInsights: insights,
      templateAnalytics: templates,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `promptcord-analytics-${Date.now()}.json` });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ---------- render ---------- */
  return (
    <div className="flex-1 bg-bg-primary">
      {/* ------- header ------- */}
      <header className="h-12 bg-bg-primary border-b border-border px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-brand" />
          <h1 className="text-text-primary font-semibold">Analytics Dashboard</h1>
        </div>

        <div className="flex items-center space-x-2">
          <select
            aria-label="Select date range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-1.5 bg-bg-secondary border border-border rounded text-text-primary text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          <button
            onClick={() => [dashboardQ.refetch(), insightsQ.refetch(), templatesQ.refetch()]}
            disabled={isRefetching}
            className="p-2 text-interactive-normal hover:text-interactive-hover hover:bg-interactive-hover/10 rounded transition-colors disabled:opacity-50"
            title="Refresh data"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportData}
            className="p-2 text-interactive-normal hover:text-interactive-hover hover:bg-interactive-hover/10 rounded transition-colors"
            title="Export data"
            aria-label="Export data"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ------- tabs ------- */}
      <nav className="border-b border-border bg-bg-secondary">
        <div className="px-4 flex space-x-6">
          {[
            { id: 'overview',   label: 'Overview',   icon: PieChart },
            { id: 'insights',   label: 'User Insights', icon: Users },
            { id: 'templates',  label: 'Template Analytics', icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as Tab)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ------- content ------- */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <SkeletonGrid />
          ) : activeTab === 'overview' ? (
            <Overview dashboard={dashboard} />
          ) : activeTab === 'insights' ? (
            <UserInsights data={insights} />
          ) : (
            <TemplateAnalytics data={templates} />
          )}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton loader (keeps UI identical while loading)                 */
/* ------------------------------------------------------------------ */
function SkeletonGrid() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-interactive-muted rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-48 bg-interactive-muted rounded-lg animate-pulse" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab renderers (pure presentational)                                */
/* ------------------------------------------------------------------ */
function Overview({ dashboard }: { dashboard?: DashboardData }) {
  if (!dashboard) return <Empty />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Templates Used"
          value={dashboard.total_templates_used}
          icon={Target}
          trend="up"
          trendText="+12 % from last week"
        />
        <StatCard
          label="Total Renders"
          value={dashboard.total_renders}
          icon={Activity}
          trend="up"
          trendText="+8 % from last week"
        />
        <StatCard
          label="Avg. Session Time"
          value="14 m"
          icon={Clock}
          trend="up"
          trendText="+5 % from last week"
        />
        <StatCard label="Success Rate" value="94 %" icon={PieChart} trend="up" trendText="+2 % from last week" />
      </div>

      <div className="bg-bg-secondary rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-text-primary font-medium">Recent Activity</h3>
        </div>
        <div className="p-6 space-y-4">
          {dashboard.recent_activity?.map((act, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-brand rounded-full" />
              <div className="flex-1">
                <p className="text-text-primary text-sm">
                  Used template: <span className="font-medium">{act.template_name}</span>
                </p>
                <p className="text-text-muted text-xs">
                  {act.category} • {new Date(act.used_at).toLocaleString()}
                </p>
              </div>
            </div>
          )) ?? <Empty />}
        </div>
      </div>
    </div>
  );
}

function UserInsights({ data }: { data?: any }) {
  if (!data) return <Empty />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Sessions" value={data.total_sessions} icon={Users} />
        <StatCard label="Avg. Duration" value={`${Math.round((data.avg_session_duration ?? 0) / 60)} m`} icon={Clock} />
        <StatCard
          label="Peak Activity"
          value={`${data.activity_by_hour?.reduce((max: any, c: any) => (c.activity_count > max.activity_count ? c : max))?.hour ?? 0}:00`}
          icon={Activity}
        />
      </div>

      <div className="bg-bg-secondary rounded-lg border border-border p-6">
        <h3 className="text-text-primary font-medium mb-4">Favorite Categories</h3>
        <div className="flex flex-wrap gap-2">
          {data.favorite_categories?.map((c: string) => (
            <span key={c} className="px-3 py-1 bg-brand/10 text-brand rounded-full text-sm">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-bg-secondary rounded-lg border border-border p-6">
        <h3 className="text-text-primary font-medium mb-4">Most Used Templates</h3>
        <div className="space-y-4">
          {data.most_used_templates?.map((t: any) => (
            <div key={t.template_id} className="flex items-center justify-between">
              <div>
                <p className="text-text-primary font-medium">{t.template_name}</p>
                <p className="text-text-muted text-sm">ID: {t.template_id}</p>
              </div>
              <div className="text-right">
                <p className="text-text-primary font-medium">{t.usage_count}</p>
                <p className="text-text-muted text-sm">uses</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateAnalytics({ data }: { data?: any[] }) {
  if (!data?.length) return <Empty />;
  return (
    <div className="space-y-6">
      {data.map((t) => (
        <div key={t.template_id} className="bg-bg-secondary rounded-lg border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-text-primary font-medium">{t.template_name}</h3>
              <p className="text-text-muted text-sm">{t.category}</p>
            </div>
            <div className="text-right">
              <p className="text-text-primary font-bold">{t.total_usage}</p>
              <p className="text-text-muted text-sm">total uses</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Avg Rating" value={`${t.avg_rating.toFixed(1)} / 5`} icon={Target} />
            <StatCard label="Success Rate" value={`${(t.success_rate * 100).toFixed(1)} %`} icon={PieChart} />
            <StatCard label="Avg Completion" value={`${Math.round(t.avg_completion_time / 1000)} s`} icon={Clock} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="bg-bg-secondary rounded-lg border border-border p-12 text-center">
      <BarChart3 className="w-12 h-12 text-interactive-muted mx-auto mb-4" />
      <h3 className="text-text-primary font-medium mb-2">No data</h3>
      <p className="text-text-muted">Analytics will appear here once you start using templates.</p>
    </div>
  );
}