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
  Save,
  Brain,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useDiscoverTemplatesInfinite,
  useDiscoverCategories,
  useCopyFromTemplate,
  useCreateSavedPrompt,
  useRagSearch,
  type RagSearchResult,
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
  const shareUrl = `${SITE_URL}/p/${prompt.id}`;
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
  similarityScore,
}: {
  prompt: SavedPrompt;
  onCopy: (id: string) => void;
  isCopying: boolean;
  onOpen: (prompt: SavedPrompt) => void;
  onEnhance: (prompt: SavedPrompt) => void;
  similarityScore?: number;
}) {
  const preview = prompt.content.slice(0, 160);
  const isTruncated = prompt.content.length > 160;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="min-w-0"
    >
      <Card className="min-w-0 overflow-hidden p-4 md:p-5 flex flex-col gap-3 rounded-xl border-border/50 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/5 transition-all duration-200 h-full">
        {/* Header — clickable area opens modal */}
        <button
          type="button"
          onClick={() => onOpen(prompt)}
          className="flex items-start justify-between gap-3 text-left w-full group"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-sm leading-snug line-clamp-1 break-words group-hover:text-primary transition-colors flex-1">
                {prompt.title}
              </h3>
              {similarityScore !== undefined && (
                <span
                  className={cn(
                    'shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                    similarityScore >= 0.85
                      ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                      : similarityScore >= 0.70
                      ? 'bg-[#C9A227]/15 text-[#C9A227]'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Brain className="h-2.5 w-2.5" />
                  {Math.round(similarityScore * 100)}%
                </span>
              )}
            </div>
            {prompt.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 break-words">
                {prompt.description}
              </p>
            )}
          </div>
        </button>

        {/* Prompt preview — also clickable */}
        <button
          type="button"
          onClick={() => onOpen(prompt)}
          className="rounded-md bg-muted/40 border px-3 py-2 text-xs text-muted-foreground font-mono leading-relaxed text-left w-full hover:bg-muted/60 transition-colors line-clamp-3 overflow-hidden break-words"
        >
          {preview}
          {isTruncated && '…'}
        </button>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-h-8">
          <Badge variant="outline" className="text-[10px] shrink-0 max-w-full truncate">
            {prompt.category}
          </Badge>
          {prompt.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] flex items-center gap-1 shrink-0 max-w-full truncate">
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

// Map a RAG result to the SavedPrompt shape expected by cards/modals
function ragToPrompt(r: RagSearchResult): SavedPrompt {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    content: r.content,
    category: r.category,
    tags: r.tags ?? [],
    use_count: 0,
    is_public: true,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    prompt_framework: r.framework || '',
    extracted_keywords: [],
  } as unknown as SavedPrompt;
}

export default function DiscoverPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'use_count' | 'created_at'>('use_count');
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [extensionInstalled, setExtensionInstalled] = useState<boolean | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>('keyword');

  const ragSearch = useRagSearch();

  // AI Enhance state — same pattern as PromptLibrary
  const [enhancingPrompt, setEnhancingPrompt] = useState<SavedPrompt | null>(null);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [enhanceSetupMode, setEnhanceSetupMode] = useState(false);
  const [professionalismLevel, setProfessionalismLevel] = useState(3);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const createSavedPrompt = useCreateSavedPrompt();
  const { optimize, cancel, isStreaming: isEnhanceStreaming, output: enhanceOutput } = usePromptOptimization();
  const { creditsAvailable, creditsRemaining } = useCreditsStore();
  const hasCredits = creditsRemaining === null || creditsAvailable > 0;

  const PROFESSIONALISM_LABELS: Record<number, { label: string; description: string }> = {
    1: { label: 'Casual', description: 'Conversational and simple' },
    2: { label: 'Clear', description: 'Clear and accessible' },
    3: { label: 'Balanced', description: 'Neutral, professional tone' },
    4: { label: 'Professional', description: 'Formal and structured' },
    5: { label: 'Executive', description: 'Highly formal and precise' },
  };

  // Sync streaming output into enhanced content preview
  useEffect(() => {
    if (enhancingPrompt && enhanceOutput) setEnhancedContent(enhanceOutput);
  }, [enhancingPrompt, enhanceOutput]);

  // Debounce search — 300ms delay for server queries
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fire RAG search when in semantic mode and debounced query is ready
  useEffect(() => {
    if (searchMode === 'semantic' && debouncedSearch.trim().length >= 2) {
      ragSearch.mutate({
        query: debouncedSearch.trim(),
        top_k: 30,
        category: activeCategory !== 'all' ? activeCategory : undefined,
      });
    }
  // ragSearch.mutate is stable across renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMode, debouncedSearch, activeCategory]);

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

  // RAG results mapped to SavedPrompt shape, with score lookup
  const ragResults = useMemo(
    () => (ragSearch.data?.results ?? []).map(ragToPrompt),
    [ragSearch.data]
  );
  const ragScoreMap = useMemo(() => {
    const map = new Map<string, number>();
    (ragSearch.data?.results ?? []).forEach((r) => map.set(r.id, r.similarity_score));
    return map;
  }, [ragSearch.data]);
  const ragMode = ragSearch.data?.mode;
  const isSemanticMode = searchMode === 'semantic';
  const displayPrompts = isSemanticMode ? ragResults : filteredPrompts;
  const isSemanticLoading = ragSearch.isPending;
  const isSemanticError = ragSearch.isError;

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

  const handleEnhance = (prompt: SavedPrompt) => {
    if (!hasCredits) {
      toast.error("You've run out of credits. Upgrade your plan to continue.", {
        action: { label: 'Upgrade', onClick: () => window.location.href = '/billing' },
        duration: 6000,
      });
      return;
    }
    // Open setup step — user picks professionalism level before streaming starts
    setEnhancingPrompt(prompt);
    setEnhancedContent('');
    setEnhanceSetupMode(true);
  };

  const handleStartEnhance = async () => {
    if (!enhancingPrompt) return;
    setEnhanceSetupMode(false);
    const toneInfo = PROFESSIONALISM_LABELS[professionalismLevel];
    await optimize({
      original: enhancingPrompt.content,
      session_id: `discover_enhance_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      mode: 'fast',
      context: { professionalism_level: professionalismLevel, tone: toneInfo.label },
    });
  };

  const handleCopyEnhanced = async () => {
    if (!enhancedContent) return;
    await navigator.clipboard.writeText(enhancedContent);
    toast.success('Enhanced prompt copied to clipboard!');
  };

  const handleSaveToLibrary = async () => {
    if (!enhancedContent || !enhancingPrompt) return;
    const toneLabel = PROFESSIONALISM_LABELS[professionalismLevel].label;
    await createSavedPrompt.mutateAsync({
      title: `${enhancingPrompt.title} (Enhanced — ${toneLabel})`,
      content: enhancedContent,
      description: `AI-enhanced from Discover. Original by community. Tone: ${toneLabel}.`,
      category: enhancingPrompt.category || 'general',
      tags: [...(enhancingPrompt.tags || []), 'enhanced', 'ai-improved'],
      is_public: false,
    });
    setSavedToLibrary(true);
  };

  const handleCloseEnhanceModal = () => {
    if (isEnhanceStreaming) cancel();
    setEnhancingPrompt(null);
    setEnhancedContent('');
    setEnhanceSetupMode(false);
    setSavedToLibrary(false);
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden pb-24 lg:pb-8">
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

      {/* Search + mode toggle */}
      <div className="mb-5 space-y-2">
        <div className="relative">
          {isSemanticMode ? (
            <Brain className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9A227]" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <input
            type="text"
            placeholder={isSemanticMode ? 'Describe what you need… (semantic search)' : 'Search public prompts...'}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={cn(
              'w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-primary bg-background text-foreground transition-colors',
              isSemanticMode
                ? 'border-[#C9A227]/40 focus:ring-[#C9A227]/20'
                : 'focus:ring-primary/20'
            )}
          />
          {isSemanticLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#C9A227]" />
          )}
        </div>

        {/* Search mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <button
              type="button"
              onClick={() => setSearchMode('keyword')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors',
                searchMode === 'keyword'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Search className="h-3 w-3" />
              Keyword
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('semantic')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors',
                searchMode === 'semantic'
                  ? 'bg-[#C9A227] text-black font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Brain className="h-3 w-3" />
              Semantic
            </button>
          </div>
          {isSemanticMode && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3 text-[#C9A227]" />
              AI finds prompts by meaning, not exact words
              {ragMode === 'fallback' && (
                <span className="text-orange-500 ml-1">(fallback mode)</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="w-full overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
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
      </div>

      {/* Result count + sort toggle */}
      {!isLoading && !isError && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            {isSemanticMode ? (
              <Brain className="h-4 w-4 shrink-0 text-[#C9A227]" />
            ) : (
              <BookOpen className="h-4 w-4 shrink-0" />
            )}
            <span className="min-w-0 truncate">
              {isSemanticMode
                ? ragResults.length > 0
                  ? `${ragResults.length} semantic result${ragResults.length !== 1 ? 's' : ''}${searchInput ? ` for "${searchInput}"` : ''}`
                  : debouncedSearch
                  ? 'No semantic results'
                  : 'Type to search semantically'
                : `${filteredPrompts.length} of ${totalCount.toLocaleString()} prompt${totalCount !== 1 ? 's' : ''}${searchInput ? ` matching "${searchInput}"` : ''}`
              }
            </span>
          </div>
          {!isSemanticMode && (
            <div className="sm:ml-auto flex items-center gap-1 rounded-lg border p-1 w-full sm:w-auto overflow-x-auto">
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
          )}
        </div>
      )}

      {/* Content */}
      {(isSemanticMode ? isSemanticLoading && !ragSearch.data : isLoading) ? (
        <DiscoverSkeleton />
      ) : (isSemanticMode ? isSemanticError : isError) ? (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {isSemanticMode ? 'Semantic search failed' : 'Failed to load public prompts'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {isSemanticMode
              ? (ragSearch.error as Error)?.message || 'Could not reach the RAG service.'
              : 'Could not connect to the server.'}
          </p>
          <Button
            onClick={() => isSemanticMode
              ? debouncedSearch && ragSearch.mutate({ query: debouncedSearch, top_k: 30 })
              : refetch()
            }
            variant="outline"
            className="flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </Card>
      ) : displayPrompts.length === 0 ? (
        <Card className="p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-[#C9A227]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C9A227]/20">
            {isSemanticMode ? (
              <Brain className="h-8 w-8 text-[#C9A227]/50" />
            ) : (
              <Globe className="h-8 w-8 text-[#C9A227]/50" />
            )}
          </div>
          <h3 className="text-lg font-medium mb-2">
            {isSemanticMode && !debouncedSearch
              ? 'Describe what you need'
              : searchInput || activeCategory !== 'all'
              ? 'No prompts match your filters'
              : 'No public prompts yet'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isSemanticMode && !debouncedSearch
              ? 'Type a natural-language description — the AI will find the most relevant prompts.'
              : isSemanticMode
              ? 'Try a different description or switch to Keyword search.'
              : searchInput || activeCategory !== 'all'
              ? 'Try adjusting your search or category filter.'
              : 'Be the first to share a prompt with the community.'}
          </p>
        </Card>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {displayPrompts.map((prompt) => (
                <PublicPromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onCopy={handleCopy}
                  isCopying={copyingId === prompt.id}
                  onOpen={setSelectedPrompt}
                  onEnhance={handleEnhance}
                  similarityScore={isSemanticMode ? ragScoreMap.get(prompt.id) : undefined}
                />
              ))}
            </div>
          </AnimatePresence>

          {/* Load More — keyword mode only; RAG returns all results at once */}
          {!isSemanticMode && hasNextPage && (
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

      {/* AI Enhance Modal */}
      <Modal
        isOpen={!!enhancingPrompt}
        onClose={handleCloseEnhanceModal}
        title={`Enhance with AI: ${enhancingPrompt?.title || ''}`}
        size="lg"
      >
        <div className="space-y-5">

          {/* ── Step 1: Setup — choose professionalism level ── */}
          {enhanceSetupMode && (
            <div className="space-y-5">
              {/* Prompt preview */}
              <div className="rounded-lg border bg-muted/30 px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Prompt to enhance</p>
                <p className="text-sm text-foreground line-clamp-3 font-mono leading-relaxed">
                  {enhancingPrompt?.content}
                </p>
              </div>

              {/* Professionalism slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Professionalism Level
                  </label>
                  <span className="text-sm font-bold text-[#C9A227]">
                    {PROFESSIONALISM_LABELS[professionalismLevel].label}
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={professionalismLevel}
                  onChange={(e) => setProfessionalismLevel(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#C9A227]"
                  aria-label="Professionalism level"
                />

                {/* Level labels */}
                <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <span
                      key={lvl}
                      className={lvl === professionalismLevel ? 'text-[#C9A227] font-semibold' : ''}
                    >
                      {PROFESSIONALISM_LABELS[lvl].label}
                    </span>
                  ))}
                </div>

                {/* Active level description */}
                <p className="text-xs text-muted-foreground text-center bg-muted/40 rounded-md px-3 py-2">
                  {PROFESSIONALISM_LABELS[professionalismLevel].description}
                </p>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t">
                <Button type="button" variant="outline" size="sm" onClick={handleCloseEnhanceModal}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleStartEnhance}
                  className="bg-[#C9A227] hover:bg-[#C9A227]/90 text-white flex items-center gap-1.5"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Enhance Now
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Streaming — word chunks appear as they arrive ── */}
          {!enhanceSetupMode && isEnhanceStreaming && (() => {
            // Split into settled text + the live "arriving" portion (last ~50 chars)
            const LIVE_WINDOW = 50;
            const settled = enhancedContent.length > LIVE_WINDOW
              ? enhancedContent.slice(0, -LIVE_WINDOW)
              : '';
            const live = enhancedContent.length > LIVE_WINDOW
              ? enhancedContent.slice(-LIVE_WINDOW)
              : enhancedContent;
            return (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-500" />
                  Enhancing at{' '}
                  <span className="font-medium text-foreground">
                    {PROFESSIONALISM_LABELS[professionalismLevel].label}
                  </span>{' '}
                  level…
                </p>
                <div className="p-4 rounded-lg border bg-purple-50/40 dark:bg-purple-900/10 text-sm font-mono whitespace-pre-wrap min-h-[100px] max-h-[280px] overflow-auto leading-relaxed">
                  <span className="text-foreground/80">{settled}</span>
                  <span
                    key={live}
                    className="text-foreground animate-[fadeIn_0.25s_ease_forwards]"
                  >
                    {live}
                  </span>
                  <span className="animate-pulse text-purple-500">▋</span>
                </div>
              </div>
            );
          })()}

          {/* ── Step 3: Before / After result ── */}
          {!enhanceSetupMode && !isEnhanceStreaming && enhancedContent && (
            <>
              {/* Tone badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wand2 className="h-3.5 w-3.5 text-[#C9A227]" />
                Enhanced at <span className="font-semibold text-foreground">{PROFESSIONALISM_LABELS[professionalismLevel].label}</span> tone
              </div>

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

              <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-2">
                <p className="text-xs text-muted-foreground">
                  Copy or save to your library to access it from the extension.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button type="button" variant="outline" size="sm" onClick={handleCloseEnhanceModal}>
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSaveToLibrary}
                    disabled={createSavedPrompt.isPending || savedToLibrary}
                    className="flex items-center gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
                  >
                    {createSavedPrompt.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : savedToLibrary ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {savedToLibrary ? 'Saved!' : 'Save to Library'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCopyEnhanced}
                    className="bg-[#C9A227] hover:bg-[#C9A227]/90 text-white flex items-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
              </div>
            </>
          )}

        </div>
      </Modal>
    </div>
  );
}
