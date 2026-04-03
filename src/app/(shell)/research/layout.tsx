'use client';

import { ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function ResearchLayout({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
