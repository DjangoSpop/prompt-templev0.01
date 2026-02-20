'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThreads, useAssistants, useCreateThread, useDeleteThread } from '@/hooks/useAssistants';
import type { Thread } from '@/types/assistant';
import {
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';
import { toast } from 'sonner';

function formatRelative(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

export default function ThreadsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: threads = [], isLoading, isError, refetch } = useThreads();
  const { data: assistantsData } = useAssistants();
  const createThread = useCreateThread();
  const deleteThread = useDeleteThread();

  const assistants = assistantsData?.assistants ?? [];
  const defaultAssistantId = assistantsData?.default_assistant;

  const filteredThreads = (threads as Thread[]).filter((t) =>
    t.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewThread = async () => {
    const assistantId = defaultAssistantId ?? assistants[0]?.id;
    if (!assistantId) {
      toast.error('No assistant available. Please try again later.');
      return;
    }
    try {
      const newThread = await createThread.mutateAsync({
        assistantId,
        title: 'New Conversation',
      });
      router.push(`/threads/${newThread.id}`);
    } catch {
      toast.error('Failed to create conversation');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    await deleteThread.mutateAsync(deleteTargetId);
    setDeleteTargetId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-primary" />
            Conversations
          </h1>
          <p className="text-muted-foreground mt-1">
            Your AI conversation history and threads
          </p>
        </div>
        <Button
          onClick={handleNewThread}
          disabled={createThread.isPending}
          className="flex items-center gap-2"
        >
          {createThread.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          New Conversation
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load conversations</h3>
          <p className="text-muted-foreground mb-4">Could not connect to the server.</p>
          <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2 mx-auto">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </Card>
      ) : filteredThreads.length === 0 ? (
        <Card className="p-12 text-center">
          <Bot className="h-14 w-14 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? 'No matching conversations' : 'No conversations yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'Try a different search term.'
              : 'Start a new conversation with the AI assistant.'}
          </p>
          {!searchQuery && (
            <Button onClick={handleNewThread} disabled={createThread.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Start Your First Conversation
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredThreads.map((thread) => (
            <Card
              key={thread.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => router.push(`/threads/${thread.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{thread.title || 'Untitled Conversation'}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelative(thread.last_message_at || thread.updated_at)}
                      </span>
                      {thread.message_count > 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          {thread.message_count} messages
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetId(thread.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete conversation"
        description="Are you sure you want to delete this conversation? All messages will be lost."
        onConfirm={handleDeleteConfirm}
        isPending={deleteThread.isPending}
      />
    </div>
  );
}
