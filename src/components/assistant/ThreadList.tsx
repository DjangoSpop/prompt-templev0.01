'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Thread } from '@/types/assistant';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquareIcon,
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
  ClockIcon
} from 'lucide-react';
import { useDeleteThread, useUpdateThread } from '@/hooks/useAssistants';
// Simple date formatting utility
const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

interface ThreadListProps {
  threads: Thread[];
  selectedAssistantId: string | null;
  selectedThreadId?: string;
  onSelectThread: (threadId: string) => void;
}

export function ThreadList({
  threads,
  selectedAssistantId,
  selectedThreadId,
  onSelectThread,
}: ThreadListProps) {
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const deleteThreadMutation = useDeleteThread();
  const updateThreadMutation = useUpdateThread();

  // Sort threads by last message time
  const sortedThreads = [...threads].sort((a, b) =>
    new Date(b.last_message_at || b.updated_at).getTime() -
    new Date(a.last_message_at || a.updated_at).getTime()
  );

  const handleEdit = (thread: Thread) => {
    setEditingThreadId(thread.id);
    setEditTitle(thread.title);
  };

  const handleSaveEdit = async (threadId: string) => {
    if (editTitle.trim()) {
      await updateThreadMutation.mutateAsync({
        threadId,
        updates: { title: editTitle.trim() }
      });
    }
    setEditingThreadId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingThreadId(null);
    setEditTitle('');
  };

  const handleDelete = async (threadId: string) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      await deleteThreadMutation.mutateAsync(threadId);
    }
  };

  const handleDuplicate = (thread: Thread) => {
    // TODO: Implement thread duplication
    console.log('Duplicate thread:', thread.id);
  };

  if (sortedThreads.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <MessageSquareIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Start a new conversation to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
      {sortedThreads.map(thread => (
        <ThreadCard
          key={thread.id}
          thread={thread}
          isSelected={selectedThreadId === thread.id}
          isEditing={editingThreadId === thread.id}
          editTitle={editTitle}
          onEditTitle={setEditTitle}
          onSelect={() => onSelectThread(thread.id)}
          onEdit={() => handleEdit(thread)}
          onSaveEdit={() => handleSaveEdit(thread.id)}
          onCancelEdit={handleCancelEdit}
          onDelete={() => handleDelete(thread.id)}
          onDuplicate={() => handleDuplicate(thread)}
        />
      ))}
    </div>
  );
}

interface ThreadCardProps {
  thread: Thread;
  isSelected: boolean;
  isEditing: boolean;
  editTitle: string;
  onEditTitle: (title: string) => void;
  onSelect: () => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function ThreadCard({
  thread,
  isSelected,
  isEditing,
  editTitle,
  onEditTitle,
  onSelect,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onDuplicate,
}: ThreadCardProps) {
  const lastActivity = formatDistanceToNow(
    new Date(thread.last_message_at || thread.updated_at),
    { addSuffix: true }
  );

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-sm border",
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400"
          : "hover:border-gray-300 dark:hover:border-gray-600"
      )}
      onClick={!isEditing ? onSelect : undefined}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => onEditTitle(e.target.value)}
                  className="w-full px-2 py-1 text-sm font-medium bg-background border rounded"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSaveEdit();
                    } else if (e.key === 'Escape') {
                      onCancelEdit();
                    }
                  }}
                  autoFocus
                />
                <div className="flex space-x-1">
                  <Button size="sm" onClick={onSaveEdit} className="h-6 px-2 text-xs">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={onCancelEdit} className="h-6 px-2 text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                  {thread.title}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MessageSquareIcon className="h-3 w-3" />
                    <span>{thread.message_count || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>{lastActivity}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontalIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <EditIcon className="h-3 w-3 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                  <CopyIcon className="h-3 w-3 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-red-600 dark:text-red-400"
                >
                  <TrashIcon className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}