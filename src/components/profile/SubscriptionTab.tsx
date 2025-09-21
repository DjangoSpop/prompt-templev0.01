"use client";

import React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card-unified';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { authService } from '@/lib/api/auth';

export const SubscriptionTab: React.FC = () => {
  const queryClient = useQueryClient();
  const profile = queryClient.getQueryData(['profile']);

  const subscription = profile?.subscription || { tier: 'Free', expiresAt: null };

  const cancelMutation = useMutation({
    mutationFn: () => (authService as any).cancelSubscription?.() || Promise.reject(new Error('Not implemented')),
    onSuccess() {
      toast.success('Subscription cancelled');
      // refetch profile
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError(err: any) {
      toast.error(err?.message || 'Failed to cancel subscription');
    },
  });

  return (
    <Card variant="temple" className="p-6">
      <h3 className="text-lg font-semibold mb-4">Subscription</h3>

      <div className="space-y-3">
        <div className="text-fg/80">Tier: <span className="font-medium">{subscription.tier}</span></div>
        <div className="text-fg/80">Expires: <span className="font-medium">{subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'N/A'}</span></div>

        <div className="flex gap-2 mt-4">
          <Button onClick={() => (window.location.href = '/billing')}>Manage Billing</Button>
          {subscription.tier !== 'Free' && (
            <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SubscriptionTab;
