'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Search,
  Globe,
  Copy,
  Tag,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Sparkles,
  Check,
  Library,
  CalendarDays,
  Puzzle,
  Send,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useDiscoverTemplates,
  useDiscoverCategories,
  useCopyFromTemplate,
} from '@/hooks/api/useSavedPrompts';
import { PROMPT_CATEGORIES, type SavedPrompt } from '@/types/saved-prompts';
import {
  detectExtension,
  sendPromptToExtension,
  CHROME_STORE_URL,
} from '@/lib/extension';

// ============================================
// PromptDetailModal
// ============================================

function PromptDetailModal({
  prompt,
  open,
  onClose,
  onCopy,
  isCopying,
  onSendToExtension,
  extensionInstalled,
}: {
  prompt: SavedPrompt | null;
  open: boolean;
  onClose: () => void;
  onCopy: (id: string) => void;
  isCopying: boolean;
  onSendToExtension: (prompt: SavedPrompt) => void;
  extensionInstalled: boolean | null;
}) {
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(prompt.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold leading-snug">
                {prompt.title}
              </DialogTitle>
              {prompt.description && (
                <DialogDescription className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {prompt.description}
                </DialogDescription>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap mt-3">
            <Badge variant="outline" className="text-xs">
              {prompt.category}
            </Badge>
            {prompt.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] flex items-center gap-1">
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </Badge>
            ))}
            <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              {prompt.use_count} uses
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
          </div>
        </DialogHeader>

        {/* Prompt content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto max-h-[50vh]">
          <div className="relative group">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-muted/40 border rounded-lg px-4 py-3 text-foreground">
              {prompt.content}
            </pre>
            <button
              type="button"
              onClick={handleCopyText}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-background border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
              aria-label="Copy prompt text"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Text
              </>
            )}
          </Button>

          {extensionInstalled && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendToExtension(prompt)}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Use in Extension
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => onCopy(prompt.id)}
            disabled={isCopying}
            className="flex items-center gap-2 ml-auto"
          >
            {isCopying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Library className="h-4 w-4" />
            )}
            {isCopying ? 'Saving...' : 'Copy to Library'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// PublicPromptCard
// ============================================

function PublicPromptCard({
  prompt,
  onCopy,
  isCopying,
  onOpen,
}: {
  prompt: SavedPrompt;
  onCopy: (id: string) => void;
  isCopying: boolean;
  onOpen: (prompt: SavedPrompt) => void;
}) {
  const preview = prompt.content.slice(0, 160);
  const isTruncated = prompt.content.length > 160;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <Card className="p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
        {/* Header — clickable area opens modal */}
        <button
          type="button"
          onClick={() => onOpen(prompt)}
          className="flex items-start justify-between gap-3 text-left w-full group"
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-snug truncate group-hover:text-primary transition-colors">
              {prompt.title}
            </h3>
            {prompt.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {prompt.description}
              </p>
            )}
          </div>
        </button>

        {/* Prompt preview — also clickable */}
        <button
          type="button"
          onClick={() => onOpen(prompt)}
          className="rounded-md bg-muted/40 border px-3 py-2 text-xs text-muted-foreground font-mono leading-relaxed text-left w-full hover:bg-muted/60 transition-colors"
        >
          {preview}
          {isTruncated && '…'}
        </button>

        {/* Footer */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px]">
            {prompt.category}
          </Badge>
          {prompt.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] flex items-center gap-1">
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </Badge>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {prompt.use_count}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopy(prompt.id)}
              disabled={isCopying}
              className="h-7 px-2.5 text-[10px] flex items-center gap-1"
            >
              {isCopying ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {isCopying ? 'Saving…' : 'Copy'}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================
// Loading skeletons
// ============================================

function DiscoverSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="p-5 flex flex-col gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-16 w-full rounded-md" />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-14" />
            </div>
            <Skeleton className="h-7 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Discover Page
// ============================================

export default function DiscoverPage() {
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'use_count' | 'created_at'>('use_count');
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [extensionInstalled, setExtensionInstalled] = useState<boolean | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    detectExtension().then(setExtensionInstalled);
  }, []);

  const copyMutation = useCopyFromTemplate();

  const queryFilters = useMemo(
    () => ({
      search: searchInput || undefined,
      category: activeCategory !== 'all' ? activeCategory : undefined,
      sort_by: sortBy,
      sort_order: 'desc' as const,
    }),
    [searchInput, activeCategory, sortBy]
  );

  const { data, isLoading, isError, refetch } = useDiscoverTemplates(queryFilters);
  const { data: categoryList } = useDiscoverCategories();

  const prompts = data?.results ?? [];
  const categories = ['all', ...(categoryList ?? PROMPT_CATEGORIES)];

  const handleCopy = async (id: string) => {
    setCopyingId(id);
    try {
      await copyMutation.mutateAsync(id);
    } finally {
      setCopyingId(null);
    }
  };

  const handleCopyAndClose = async (id: string) => {
    await handleCopy(id);
    setSelectedPrompt(null);
  };

  const handleSendToExtension = async (prompt: SavedPrompt) => {
    await sendPromptToExtension({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      category: prompt.category,
      tags: prompt.tags,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Extension install banner */}
      {extensionInstalled === false && !bannerDismissed && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <Puzzle className="h-4 w-4 shrink-0 text-primary" />
          <span className="flex-1 text-foreground">
            Install the{' '}
            <Link
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2 hover:text-primary"
            >
              Prompt Temple extension
            </Link>{' '}
            to send any prompt directly to your browser.
          </span>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <Globe className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          Discover Prompts
          <Sparkles className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore prompts shared by the community. Click any prompt to preview it in full, then copy
          it directly into your personal library.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search public prompts..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3 py-1 rounded-full text-sm border transition-colors',
              activeCategory === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            )}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Result count + sort toggle */}
      {!isLoading && !isError && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>
              {data?.count ?? 0} public prompt{(data?.count ?? 0) !== 1 ? 's' : ''}
              {searchInput && ` matching "${searchInput}"`}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-lg border p-1">
            <button
              type="button"
              onClick={() => setSortBy('use_count')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors',
                sortBy === 'use_count'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <TrendingUp className="h-3 w-3" />
              Trending
            </button>
            <button
              type="button"
              onClick={() => setSortBy('created_at')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors',
                sortBy === 'created_at'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Clock className="h-3 w-3" />
              Newest
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <DiscoverSkeleton />
      ) : isError ? (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load public prompts</h3>
          <p className="text-muted-foreground mb-4">Could not connect to the server.</p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </Card>
      ) : prompts.length === 0 ? (
        <Card className="p-12 text-center">
          <Globe className="h-14 w-14 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">
            {searchInput || activeCategory !== 'all'
              ? 'No prompts match your filters'
              : 'No public prompts yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchInput || activeCategory !== 'all'
              ? 'Try adjusting your search or category filter.'
              : 'Be the first to share a prompt with the community by marking it as public in your library.'}
          </p>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <PublicPromptCard
                key={prompt.id}
                prompt={prompt}
                onCopy={handleCopy}
                isCopying={copyingId === prompt.id}
                onOpen={setSelectedPrompt}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Detail modal */}
      <PromptDetailModal
        prompt={selectedPrompt}
        open={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
        onCopy={handleCopyAndClose}
        isCopying={!!copyingId && copyingId === selectedPrompt?.id}
        onSendToExtension={handleSendToExtension}
        extensionInstalled={extensionInstalled}
      />
    </div>
  );
}
