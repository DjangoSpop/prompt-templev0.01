/**
 * Prompt Library Management Component
 * Full-featured dashboard for managing saved prompts:
 * - Grid/list view with search & filters
 * - Category tabs, favorites, sort
 * - Quick actions: iterate, duplicate, delete, favorite
 * - Stats overview
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  Heart,
  BookOpen,
  GitBranch,
  Copy,
  Trash2,
  MoreHorizontal,
  Filter,
  Grid3X3,
  List,
  Clock,
  TrendingUp,
  Star,
  Tag,
  Sparkles,
  Send,
  Eye,
  Edit,
  Loader2,
  BarChart3,
  FolderOpen,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSavedPromptsStore } from '@/store/saved-prompts';
import {
  useSavedPrompts,
  useSavedPromptStats,
  useToggleFavorite,
  useDeleteSavedPrompt,
  useDuplicateSavedPrompt,
} from '@/hooks/api/useSavedPrompts';
import {
  PROMPT_CATEGORIES,
  type SavedPrompt,
  type SavedPromptFilters,
} from '@/types/saved-prompts';

// ============================================
// PromptCard Sub-Component
// ============================================

function PromptCard({
  prompt,
  viewMode,
  onIterate,
  onEdit,
  onUse,
}: {
  prompt: SavedPrompt;
  viewMode: 'grid' | 'list';
  onIterate: (prompt: SavedPrompt) => void;
  onEdit: (prompt: SavedPrompt) => void;
  onUse: (prompt: SavedPrompt) => void;
}) {
  const toggleFavorite = useToggleFavorite();
  const deleteMutation = useDeleteSavedPrompt();
  const duplicateMutation = useDuplicateSavedPrompt();

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors group"
      >
        {/* Favorite */}
        <button
          onClick={() => toggleFavorite.mutate(prompt.id)}
          className="shrink-0"
          aria-label={prompt.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              prompt.is_favorite
                ? 'text-red-500 fill-current'
                : 'text-muted-foreground hover:text-red-400'
            )}
          />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">{prompt.title}</h4>
            <Badge variant="outline" className="text-[10px] shrink-0">
              {prompt.category}
            </Badge>
            {prompt.current_version > 1 && (
              <Badge variant="secondary" className="text-[10px] shrink-0">
                <GitBranch className="h-2.5 w-2.5 mr-0.5" />
                v{prompt.current_version}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {prompt.content.substring(0, 120)}
            {prompt.content.length > 120 ? '...' : ''}
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {prompt.use_count}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeDate(prompt.updated_at)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onUse(prompt)} className="h-7 px-2">
            <Send className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onIterate(prompt)}
            className="h-7 px-2"
          >
            <GitBranch className="h-3.5 w-3.5" />
          </Button>
          <PromptActionMenu
            prompt={prompt}
            onEdit={onEdit}
            onCopy={handleCopy}
            onDelete={() => deleteMutation.mutate(prompt.id)}
            onDuplicate={() => duplicateMutation.mutate(prompt.id)}
          />
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="group hover:shadow-md transition-shadow h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate">
                {prompt.title}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {prompt.category}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => toggleFavorite.mutate(prompt.id)}
                className="p-1 rounded-md hover:bg-muted"
                aria-label={prompt.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={cn(
                    'h-3.5 w-3.5',
                    prompt.is_favorite
                      ? 'text-red-500 fill-current'
                      : 'text-muted-foreground'
                  )}
                />
              </button>
              <PromptActionMenu
                prompt={prompt}
                onEdit={onEdit}
                onCopy={handleCopy}
                onDelete={() => deleteMutation.mutate(prompt.id)}
                onDuplicate={() => duplicateMutation.mutate(prompt.id)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-3">
          {/* Preview */}
          <div className="p-2 border rounded bg-muted/20 text-xs font-mono text-muted-foreground whitespace-pre-wrap line-clamp-4 min-h-[60px]">
            {prompt.content}
          </div>

          {/* Tags */}
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
              {prompt.tags.length > 3 && (
                <Badge variant="outline" className="text-[10px]">
                  +{prompt.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {prompt.use_count}
              </span>
              {prompt.current_version > 1 && (
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  v{prompt.current_version}
                </span>
              )}
            </div>
            <span>{formatRelativeDate(prompt.updated_at)}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => onUse(prompt)}
            >
              <Send className="h-3 w-3 mr-1" />
              Use
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => onIterate(prompt)}
            >
              <GitBranch className="h-3 w-3 mr-1" />
              Iterate
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// Action Dropdown Menu
// ============================================

function PromptActionMenu({
  prompt,
  onEdit,
  onCopy,
  onDelete,
  onDuplicate,
}: {
  prompt: SavedPrompt;
  onEdit: (prompt: SavedPrompt) => void;
  onCopy: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onEdit(prompt)}>
          <Edit className="h-3.5 w-3.5 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCopy}>
          <Copy className="h-3.5 w-3.5 mr-2" />
          Copy Content
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <BookOpen className="h-3.5 w-3.5 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================
// Stats Bar
// ============================================

function StatsBar({ stats }: { stats: any }) {
  if (!stats) return null;

  const items = [
    { label: 'Total', value: stats.total_prompts || 0, icon: BookOpen },
    { label: 'Favorites', value: stats.total_favorites || 0, icon: Heart },
    { label: 'Iterations', value: stats.total_iterations || 0, icon: GitBranch },
    { label: 'Uses', value: stats.total_uses || 0, icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <Card key={item.label} className="p-3">
          <div className="flex items-center gap-2">
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function PromptLibrary() {
  const {
    filters,
    setFilters,
    clearFilters,
    openSaveModal,
    openIterationModal,
  } = useSavedPromptsStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Build query filters
  const queryFilters: SavedPromptFilters = useMemo(
    () => ({
      ...filters,
      search: searchInput || undefined,
      category: activeCategory !== 'all' ? activeCategory : undefined,
    }),
    [filters, searchInput, activeCategory]
  );

  const { data, isLoading, isFetching } = useSavedPrompts(queryFilters);
  const { data: stats } = useSavedPromptStats();

  const prompts = data?.results || [];
  const totalCount = data?.count || 0;

  // Handlers
  const handleIterate = (prompt: SavedPrompt) => {
    openIterationModal(prompt);
  };

  const handleEdit = (prompt: SavedPrompt) => {
    openSaveModal({
      mode: 'edit',
      promptId: prompt.id,
      initialData: {
        title: prompt.title,
        content: prompt.content,
        description: prompt.description,
        category: prompt.category,
        tags: prompt.tags,
        is_favorite: prompt.is_favorite,
        is_public: prompt.is_public,
      },
    });
  };

  const handleUsePrompt = (prompt: SavedPrompt) => {
    navigator.clipboard.writeText(prompt.content);
    // TODO: Optionally navigate to chat with prompt pre-filled
  };

  const handleNewPrompt = () => {
    openSaveModal({ mode: 'create' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-pharaoh" />
            Prompt Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, iterate, and organize your prompt collection
          </p>
        </div>
        <Button onClick={handleNewPrompt} className="pharaoh-button flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Prompt
        </Button>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Search & Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search prompts by title, content, or tags..."
            className="pl-9"
          />
        </div>

        <Select
          value={filters.sort_by || 'updated_at'}
          onValueChange={(v) =>
            setFilters({ sort_by: v as SavedPromptFilters['sort_by'] })
          }
        >
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Last Modified</SelectItem>
            <SelectItem value="created_at">Date Created</SelectItem>
            <SelectItem value="use_count">Most Used</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
            <SelectItem value="last_used_at">Recently Used</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-9 px-2.5 rounded-r-none"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-9 px-2.5 rounded-l-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger value="all" className="text-xs">
            All ({totalCount})
          </TabsTrigger>
          <TabsTrigger
            value="__favorites"
            className="text-xs"
            onClick={() => setFilters({ is_favorite: activeCategory !== '__favorites' ? true : undefined })}
          >
            <Heart className="h-3 w-3 mr-1" />
            Favorites
          </TabsTrigger>
          {PROMPT_CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/10">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-medium text-lg mb-1">No prompts found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchInput || activeCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start building your collection by saving your first prompt'}
          </p>
          {!searchInput && activeCategory === 'all' && (
            <Button onClick={handleNewPrompt} className="pharaoh-button">
              <Plus className="h-4 w-4 mr-1.5" />
              Save Your First Prompt
            </Button>
          )}
          {(searchInput || activeCategory !== 'all') && (
            <Button variant="outline" onClick={() => { setSearchInput(''); setActiveCategory('all'); clearFilters(); }}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-2'
            )}
          >
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                viewMode={viewMode}
                onIterate={handleIterate}
                onEdit={handleEdit}
                onUse={handleUsePrompt}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination hint */}
      {totalCount > prompts.length && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Showing {prompts.length} of {totalCount} prompts
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({ page: (filters.page || 1) + 1 })}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Utility
// ============================================

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 30) return `${diffDays}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default PromptLibrary;
