'use client';

import { ReactNode } from 'react';
import { useSuppressHydrationWarning } from '@/hooks/useSuppressHydrationWarning';

interface HydrationGuardProps {
  children: ReactNode;
}

export function HydrationGuard({ children }: HydrationGuardProps) {
  // Suppress hydration warnings caused by browser extensions
  useSuppressHydrationWarning();
  
  return <>{children}</>;
}