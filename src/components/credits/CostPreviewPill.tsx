'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/typed-client';
import { Coins } from 'lucide-react';

const costPreviewKeys = {
  preview: (feature: string) => ['billing', 'cost-preview', feature] as const,
};

interface CostPreviewPillProps {
  feature: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function CostPreviewPill({ feature, size = 'sm', className = '' }: CostPreviewPillProps) {
  const { data, isLoading } = useQuery({
    queryKey: costPreviewKeys.preview(feature),
    queryFn: () => apiClient.getCostPreview(feature),
    staleTime: 10 * 60 * 1000,
    retry: 0,
  });

  // Silent on error — don't block user action for failed previews
  if (isLoading) {
    return (
      <span className={`inline-flex items-center gap-1 text-muted-foreground animate-pulse ${size === 'sm' ? 'text-xs' : 'text-sm'} ${className}`}>
        <Coins className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
        <span>~? credits</span>
      </span>
    );
  }

  if (!data) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-muted-foreground ${size === 'sm' ? 'text-xs' : 'text-sm'} ${className}`}
      title={data.description}
    >
      <Coins className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      <span>~{data.estimated_credits} credit{data.estimated_credits !== 1 ? 's' : ''}</span>
    </span>
  );
}
