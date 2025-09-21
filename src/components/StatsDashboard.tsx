'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCard {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

interface StatsDashboardProps {
  stats: StatCard[];
  className?: string;
}

export function StatsDashboard({ stats, className = "" }: StatsDashboardProps) {
  const formatValue = (value: string | number): string => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
    }
    return value;
  };

  const getTrendIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red" />;
      default:
        return <Minus className="w-4 h-4 text-text-muted" />;
    }
  };

  const getTrendColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green';
      case 'decrease':
        return 'text-red';
      default:
        return 'text-text-muted';
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-bg-secondary rounded-lg p-6 border border-border hover:border-interactive-hover/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-text-muted text-sm font-medium mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {formatValue(stat.value)}
              </p>
            </div>
            
            {stat.icon && (
              <div className="ml-4 p-3 bg-bg-primary rounded-lg">
                {stat.icon}
              </div>
            )}
          </div>

          {stat.change && (
            <div className="mt-4 flex items-center space-x-1">
              {getTrendIcon(stat.change.type)}
              <span className={`text-sm font-medium ${getTrendColor(stat.change.type)}`}>
                {stat.change.type === 'increase' ? '+' : stat.change.type === 'decrease' ? '-' : ''}
                {Math.abs(stat.change.value)}%
              </span>
              <span className="text-text-muted text-sm">
                from {stat.change.period}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}