'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';

interface FeatureSlice {
  feature: string;
  credits_used: number;
  call_count: number;
  percentage: number;
}

interface FeatureBreakdownProps {
  data: FeatureSlice[];
}

// Egyptian-inspired palette: gold, lapis, sand, turquoise, papyrus, terracotta
const COLORS = [
  '#C9A227', // pharaoh gold
  '#1E3A8A', // lapis blue
  '#D4B896', // sand
  '#0E7490', // turquoise
  '#A16207', // papyrus/amber
  '#B91C1C', // terracotta red
  '#6D28D9', // amethyst
  '#059669', // emerald
];

const LABEL_MAP: Record<string, string> = {
  optimizer: 'Optimizer',
  askme: 'AskMe',
  ask_me: 'AskMe',
  broadcast: 'Broadcast',
  seo_spec: 'SEO Spec',
  smart_fill: 'Smart Fill',
  chat: 'Chat',
  generate: 'Generate',
};

function formatFeatureName(feature: string): string {
  return LABEL_MAP[feature.toLowerCase()] ?? feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function FeatureBreakdown({ data }: FeatureBreakdownProps) {
  const chartData = useMemo(
    () => data.map((d) => ({ name: formatFeatureName(d.feature), value: d.credits_used, calls: d.call_count })),
    [data],
  );

  if (!data.length) {
    return (
      <Card className="border border-[hsl(var(--royal-gold))]/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-[hsl(var(--royal-gold))]" />
            Feature Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          No usage data yet. Start using AI features to see your breakdown.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[hsl(var(--royal-gold))]/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-[hsl(var(--royal-gold))]" />
          Feature Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
                formatter={(value: number, name: string, props: { payload?: { calls?: number } }) => [
                  `${value} credits (${props.payload?.calls ?? 0} calls)`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
