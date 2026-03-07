'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-muted">
            <XCircle className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">Payment cancelled</h1>
          <p className="text-muted-foreground text-sm">
            No charge was made. You can upgrade whenever you&apos;re ready.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button onClick={() => router.push('/billing')}>
            View Plans
          </Button>
        </div>
      </div>
    </div>
  );
}
