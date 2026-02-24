'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ConversationPane } from '@/components/assistant/ConversationPane';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = typeof params.id === 'string' ? params.id : '';

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)]">
      {/* Breadcrumb nav */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-background shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/threads')}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Conversations
        </Button>
      </div>

      {/* Conversation panel */}
      <div className="flex-1 overflow-hidden">
        <ConversationPane threadId={threadId} />
      </div>
    </div>
  );
}
