'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';
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
  Share2,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useDiscoverTemplatesInfinite,
  useDiscoverCategories,
  useCopyFromTemplate,
} from '@/hooks/api/useSavedPrompts';
import { PROMPT_CATEGORIES, type SavedPrompt } from '@/types/saved-prompts';
import {
  detectExtension,
  sendPromptToExtension,
  CHROME_STORE_URL,
} from '@/lib/extension';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { usePromptOptimization } from '@/hooks/api/useAI';
import { useCreditsStore } from '@/store/credits';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.prompt-temple.com').replace(/\/$/, '');

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
  onEnhance,
}: {
  prompt: SavedPrompt | null;
  open: boolean;
  onClose: () => void;
  onCopy: (id: string) => void;
  isCopying: boolean;
  onSendToExtension: (prompt: SavedPrompt) => void;
  extensionInstalled: boolean | null;
  onEnhance: (prompt: SavedPrompt) => void;
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => { onEnhance(prompt); onClose(); }}
            className="flex items-center gap-2 border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10"
          >
            <Wand2 className="h-4 w-4" />
            Enhance with AI
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

          <div className="ml-auto flex items-center gap-2">
            <PromptShareMenu prompt={prompt} />
            <Button
              size="sm"
              onClick={() => onCopy(prompt.id)}
              disabled={isCopying}
              className="flex items-center gap-2"
            >
              {isCopying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Library className="h-4 w-4" />
              )}
              {isCopying ? 'Saving...' : 'Copy to Library'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// PublicPromptCard
// ============================================

function PromptShareMenu({ prompt }: { prompt: SavedPrompt }) {
  const shareUrl = `${SITE_URL}/discover?prompt=${prompt.id}`;
  const shareText = `Check out "${prompt.title}" on Prompt Temple`;
  const ogUrl = `${SITE_URL}/api/og/share/prompt?title=${encodeURIComponent(prompt.title)}&category=${encodeURIComponent(prompt.category)}&uses=${prompt.use_count}`;

  const handleShare = async (channel: string) => {
    if (channel === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer,width=640,height=560');
    } else if (channel === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer,width=640,height=560');
    } else if (channel === 'copy') {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied!');
    } else if (navigator.share) {
      await navigator.share({ title: prompt.title, text: shareText, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied!');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 px-2 text-[10px]" onClick={(e) => e.stopPropagation()}>
          <Share2 className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">Share Prompt</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleShare('native')}>
          <Share2 className="h-3.5 w-3.5 mr-2" /> Quick Share
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleShare('x')}>
          X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleShare('linkedin')}>
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleShare('copy')}>
          <Copy className="h-3.5 w-3.5 mr-2" /> Copy Link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={ogUrl} target="_blank" rel="noopener noreferrer">Preview OG Card</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PublicPromptCard({
  prompt,
  onCopy,
  isCopying,
  onOpen,
  onEnhance,
}: {
  prompt: SavedPrompt;
  onCopy: (id: string) => void;
  isCopying: boolean;
  onOpen: (prompt: SavedPrompt) => void;
  onEnhance: (prompt: SavedPrompt) => void;
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
      <Card className="p-4 md:p-5 flex flex-col gap-3 rounded-xl border-border/50 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/5 transition-all duration-200 h-full">
        {/* Header — clickable area opens modal */}
        <button
          type="button"
          onClick={() => onOpen(prompt)}
          className="flex items-start justify-between gap-3 text-left w-full group"
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
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
          className="rounded-md bg-muted/40 border px-3 py-2 text-xs text-muted-foreground font-mono leading-relaxed text-left w-full hover:bg-muted/60 transition-colors line-clamp-3 overflow-hidden"
        >
          {preview}
          {isTruncated && '…'}
        </button>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-h-6">
          <Badge variant="outline" className="text-[10px] shrink-0">
            {prompt.category}
          </Badge>
          {prompt.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] flex items-center gap-1 shrink-0">
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </Badge>
          ))}
          {prompt.tags.length > 2 && (
            <span className="text-[10px] text-muted-foreground">+{prompt.tags.length - 2}</span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground mr-auto">
            <TrendingUp className="h-3 w-3" />
            {prompt.use_count}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onEnhance(prompt); }}
            className="h-7 px-2 text-[10px] flex items-center gap-1 border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10"
          >
            <Wand2 className="h-3 w-3" />
            <span className="hidden sm:inline">Enhance</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onCopy(prompt.id); }}
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
          <PromptShareMenu prompt={prompt} />
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'use_count' | 'created_at'>('use_count');
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [extensionInstalled, setExtensionInstalled] = useState<boolean | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // AI Enhance state — same pattern as PromptLibrary
  const [enhancingPrompt, setEnhancingPrompt] = useState<SavedPrompt | null>(null);
  const [enhancedContent, setEnhancedContent] = useState('');
  const { optimize, cancel, isStreaming: isEnhanceStreaming, output: enhanceOutput } = usePromptOptimization();
  const { creditsAvailable, creditsRemaining } = useCreditsStore();
  const hasCredits = creditsRemaining === null || creditsAvailable > 0;

  // Sync streaming output into enhanced content preview
  useEffect(() => {
    if (enhancingPrompt && enhanceOutput) setEnhancedContent(enhanceOutput);
  }, [enhancingPrompt, enhanceOutput]);

  // Debounce search — 300ms delay for server queries
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    detectExtension().then(setExtensionInstalled);
  }, []);

  const copyMutation = useCopyFromTemplate();

  const queryFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: activeCategory !== 'all' ? activeCategory : undefined,
      sort_by: sortBy,
      sort_order: 'desc' as const,
    }),
    [debouncedSearch, activeCategory, sortBy]
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiscoverTemplatesInfinite(queryFilters);
  const { data: categoryList } = useDiscoverCategories();

  // Flatten all pages into a single array
  const prompts = useMemo(
    () => data?.pages?.flatMap((page) => page.results ?? []) ?? [],
    [data]
  );
  const totalCount = data?.pages?.[0]?.count ?? 0;
  const categories = ['all', ...(categoryList ?? PROMPT_CATEGORIES)];

  // Client-side instant filtering on already-loaded prompts
  const filteredPrompts = useMemo(() => {
    if (!searchInput || searchInput === debouncedSearch) return prompts;
    // Instant client-side filter while debounced server search fires
    const q = searchInput.toLowerCase();
    return prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [prompts, searchInput, debouncedSearch]);

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

  const handleEnhance = async (prompt: SavedPrompt) => {
    if (!hasCredits) {
      toast.error("You've run out of credits. Upgrade your plan to continue.", {
        action: { label: 'Upgrade', onClick: () => window.location.href = '/billing' },
        duration: 6000,
      });
      return;
    }
    setEnhancingPrompt(prompt);
    setEnhancedContent('');
    await optimize({
      original: prompt.content,
      session_id: `discover_enhance_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      mode: 'fast',
    });
  };

  const handleCopyEnhanced = async () => {
    if (!enhancedContent) return;
    await navigator.clipboard.writeText(enhancedContent);
    toast.success('Enhanced prompt copied to clipboard!');
  };

  const handleCloseEnhanceModal = () => {
    if (isEnhanceStreaming) cancel();
    setEnhancingPrompt(null);
    setEnhancedContent('');
  };

  return (
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-8 max-w-6xl pb-24 lg:pb-8 overflow-x-hidden">
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
      <div className="mb-6 md:mb-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#C9A227]/10 mb-3 md:mb-4">
          <Globe className="h-6 w-6 md:h-7 md:w-7 text-[#C9A227]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          Discover Prompts
          <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-[#C9A227]" />
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
          Explore {totalCount > 0 ? `${totalCount.toLocaleString()}+` : ''} prompts shared by the community
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
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3 py-1 rounded-full text-sm border transition-colors whitespace-nowrap shrink-0',
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
              {filteredPrompts.length} of {totalCount.toLocaleString()} prompt{totalCount !== 1 ? 's' : ''}
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
      ) : filteredPrompts.length === 0 ? (
        <Card className="p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-[#C9A227]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C9A227]/20">
            <Globe className="h-8 w-8 text-[#C9A227]/50" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {searchInput || activeCategory !== 'all'
              ? 'No prompts match your filters'
              : 'No public prompts yet'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {searchInput || activeCategory !== 'all'
              ? 'Try adjusting your search or category filter.'
              : 'Be the first to share a prompt with the community.'}
          </p>
        </Card>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {filteredPrompts.map((prompt) => (
                <PublicPromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onCopy={handleCopy}
                  isCopying={copyingId === prompt.id}
                  onOpen={setSelectedPrompt}
                  onEnhance={handleEnhance}
                />
              ))}
            </div>
          </AnimatePresence>

          {/* Load More */}
          {hasNextPage && (
            <div className="flex flex-col items-center gap-2 mt-8">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10 px-8"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading more...
                  </>
                ) : (
                  <>Load More Prompts</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Showing {filteredPrompts.length} of {totalCount.toLocaleString()} prompts
              </p>
            </div>
          )}
        </>
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
        onEnhance={handleEnhance}
      />

      {/* AI Enhance Result Modal — same as PromptLibrary */}
      <Modal
        isOpen={!!enhancingPrompt}
        onClose={handleCloseEnhanceModal}
        title={`AI Enhance: ${enhancingPrompt?.title || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          {isEnhanceStreaming ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-500" />
                Enhancing your prompt with AI…
              </p>
              <div className="p-4 rounded-lg border bg-purple-50/40 dark:bg-purple-900/10 text-sm font-mono whitespace-pre-wrap min-h-[100px] max-h-[280px] overflow-auto leading-relaxed">
                {enhancedContent}<span className="animate-pulse text-purple-500">▋</span>
              </div>
            </div>
          ) : enhancedContent ? (
            <>
              {/* Before / After diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    Original
                  </p>
                  <div className="p-3 border rounded-md bg-red-50/30 dark:bg-red-900/10 text-sm font-mono whitespace-pre-wrap max-h-[220px] overflow-auto">
                    {enhancingPrompt?.content}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                    AI Enhanced
                  </p>
                  <div className="p-3 border rounded-md bg-green-50/30 dark:bg-green-900/10 text-sm font-mono whitespace-pre-wrap max-h-[220px] overflow-auto">
                    {enhancedContent}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Copy the enhanced version to use it anywhere.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCloseEnhanceModal}
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCopyEnhanced}
                    className="bg-[#C9A227] hover:bg-[#C9A227]/90 text-white flex items-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Enhanced
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
