'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSavedPrompts, useDuplicateSavedPrompt } from '@/hooks/api/useSavedPrompts';
import { PROMPT_CATEGORIES, type SavedPrompt } from '@/types/saved-prompts';

// ============================================
// PublicPromptCard
// ============================================

function PublicPromptCard({
  prompt,
  onCopy,
  isCopying,
}: {
  prompt: SavedPrompt;
  onCopy: (id: string) => void;
  isCopying: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const preview = prompt.content.slice(0, 180);
  const isTruncated = prompt.content.length > 180;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <Card className="p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-snug truncate">{prompt.title}</h3>
            {prompt.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{prompt.description}</p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopy(prompt.id)}
            disabled={isCopying}
            className="shrink-0 flex items-center gap-1.5 text-xs"
          >
            {isCopying ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {isCopying ? 'Saving...' : 'Copy to Library'}
          </Button>
        </div>

        {/* Prompt preview */}
        <div className="rounded-md bg-muted/40 border px-3 py-2 text-xs text-muted-foreground font-mono leading-relaxed">
          {expanded ? prompt.content : preview}
          {isTruncated && !expanded && '…'}
        </div>
        {isTruncated && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-primary hover:underline text-left"
          >
            {expanded ? 'Show less' : 'Show full prompt'}
          </button>
        )}

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
          <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            {prompt.use_count} uses
          </span>
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
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-28 shrink-0" />
          </div>
          <Skeleton className="h-16 w-full rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-14" />
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
  const [copyingId, setCopyingId] = useState<string | null>(null);

  const duplicateMutation = useDuplicateSavedPrompt();

  const queryFilters = useMemo(
    () => ({
      is_public: true as const,
      search: searchInput || undefined,
      category: activeCategory !== 'all' ? activeCategory : undefined,
      sort_by: 'use_count' as const,
      sort_order: 'desc' as const,
    }),
    [searchInput, activeCategory]
  );

  const { data, isLoading, isError, refetch } = useSavedPrompts(queryFilters);
  const prompts = data?.results ?? [];

  const handleCopy = async (id: string) => {
    setCopyingId(id);
    try {
      await duplicateMutation.mutateAsync(id);
    } finally {
      setCopyingId(null);
    }
  };

  const categories = ['all', ...PROMPT_CATEGORIES];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
          Explore prompts shared by the community. Copy any prompt directly into your personal
          library to use and iterate on.
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

      {/* Result count */}
      {!isLoading && !isError && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>
            {data?.count ?? 0} public prompt{(data?.count ?? 0) !== 1 ? 's' : ''}
            {searchInput && ` matching "${searchInput}"`}
          </span>
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
          <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2 mx-auto">
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
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
