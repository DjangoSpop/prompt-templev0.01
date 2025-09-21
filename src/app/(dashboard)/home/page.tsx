'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import useSWR from 'swr';
import { apiClient, type AnalyticsStats } from '@/lib/api';
import { Activity, TrendingUp, AlertCircle, Clock } from 'lucide-react';

const fetcher = async () => {
  const response = await apiClient.getAnalyticsStats();
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data;
};

const COLORS = ['#5865f2', '#3ba55d', '#faa81a', '#ed4245'];

export default function DashboardPage() {
  const { data: stats, error, isLoading } = useSWR<AnalyticsStats>('/analytics/stats');

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-bg-secondary rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-bg-secondary rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-bg-secondary rounded-lg"></div>
            <div className="h-96 bg-bg-secondary rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary">Failed to load analytics</h3>
            <p className="text-text-secondary">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const successRate = stats?.total_prompts ? 
    ((stats.successful_executions / stats.total_prompts) * 100).toFixed(1) : '0';

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-2">Monitor your PromptCraft Orchestrator performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-bg-secondary border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Prompts</CardTitle>
            <Activity className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{stats?.total_prompts || 0}</div>
            <p className="text-xs text-text-muted">Total prompts created</p>
          </CardContent>
        </Card>

        <Card className="bg-bg-secondary border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{successRate}%</div>
            <p className="text-xs text-text-muted">Successful executions</p>
          </CardContent>
        </Card>

        <Card className="bg-bg-secondary border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Failed Executions</CardTitle>
            <AlertCircle className="h-4 w-4 text-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{stats?.failed_executions || 0}</div>
            <p className="text-xs text-text-muted">Errors to investigate</p>
          </CardContent>
        </Card>

        <Card className="bg-bg-secondary border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-yellow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{stats?.average_response_time || 0}ms</div>
            <p className="text-xs text-text-muted">Average response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Usage Chart */}
        <Card className="bg-bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-text-primary">Monthly Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.monthly_usage || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#40444b" />
                <XAxis 
                  dataKey="month" 
                  stroke="#b9bbbe"
                  fontSize={12}
                />
                <YAxis stroke="#b9bbbe" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18191c', 
                    border: '1px solid #40444b',
                    borderRadius: '4px',
                    color: '#dcddde'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="prompts" 
                  stroke="#5865f2" 
                  strokeWidth={2}
                  name="Prompts"
                />
                <Line 
                  type="monotone" 
                  dataKey="executions" 
                  stroke="#3ba55d" 
                  strokeWidth={2}
                  name="Executions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Templates */}
        <Card className="bg-bg-secondary border-border">
          <CardHeader>
            <CardTitle className="text-text-primary">Top Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.top_templates || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#40444b" />
                <XAxis 
                  dataKey="name" 
                  stroke="#b9bbbe"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#b9bbbe" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18191c', 
                    border: '1px solid #40444b',
                    borderRadius: '4px',
                    color: '#dcddde'
                  }} 
                />
                <Bar 
                  dataKey="usage_count" 
                  fill="#5865f2"
                  name="Usage Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity (placeholder for now) */}
      <Card className="bg-bg-secondary border-border">
        <CardHeader>
          <CardTitle className="text-text-primary">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.top_templates?.slice(0, 5).map((template, index) => (
              <div key={template.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-green' : 
                    index === 1 ? 'bg-yellow' : 
                    'bg-brand'
                  }`}></div>
                  <span className="text-text-primary font-medium">{template.name}</span>
                </div>
                <span className="text-text-secondary text-sm">{template.usage_count} uses</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}