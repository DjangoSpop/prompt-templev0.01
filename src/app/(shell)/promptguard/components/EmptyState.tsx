'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
  title,
  message,
  hint,
  icon,
}: {
  title: string;
  message: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <div className="text-muted-foreground">
          {icon ?? <Inbox className="h-8 w-8" />}
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
        {hint && <p className="max-w-sm text-xs text-muted-foreground/80">{hint}</p>}
      </CardContent>
    </Card>
  );
}
