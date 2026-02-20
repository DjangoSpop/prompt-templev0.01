'use client';

import React from 'react';
import { AssistantProvider } from '@/components/assistant/AssistantProvider';

export default function ThreadsLayout({ children }: { children: React.ReactNode }) {
  return <AssistantProvider>{children}</AssistantProvider>;
}
