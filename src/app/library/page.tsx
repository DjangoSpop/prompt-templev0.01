'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLibrary, useFeaturedLibrary } from '@/hooks/api';
import { TLibraryItem } from '@/schemas/library';
import {
  Search,
  Filter,
  Star,
  Sparkles,
  BookOpen,
  TrendingUp,
  Award,
  Grid,
  List,
  Copy,
  Eye,
  CheckCircle,
  Hash,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'react-hot-toast';

type ViewMode = 'grid' | 'list';
type SortOption = 'quality_score' | '-quality_score' | 'usage_count' | '-usage_count' | 'average_rating' | '-average_rating';

export default function LibraryPage() {
  const { data, loading, error, fetch } = useLibrary();
  const { data: featuredData, fetch: fetchFeatured } = useFeaturedLibrary();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('-quality_score');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load library items
  useEffect(() => {
    fetch({
      search: debouncedSearch || undefined,
      category: selectedCategory || undefined,
      ordering: sortBy,
      page: currentPage,
      limit: 20,
    });
  }, [debouncedSearch, selectedCategory, sortBy, currentPage, fetch]);

  // Load featured items on mount
  useEffect(() => {
    fetchFeatured(6);
  }, [fetchFeatured]);

  const handleCopyContent = async (item: TLibraryItem) => {
    try {
      await navigator.clipboard.writeText(item.content);
      toast.success(`"${item.title}" copied to clipboard!`, {
        icon: '📋',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const LibraryCard = ({ item }: { item: TLibraryItem }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="temple-card pyramid-elevation hover:pharaoh-glow transition-all duration-300 group overflow-hidden h-full">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-hieroglyph group-hover:text-glow text-left">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                {item.content}
              </p>
            </div>
            {item.is_featured && (
              <div className="pharaoh-badge rounded-full p-1 flex-shrink-0 ml-2">
                <Award className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-pharaoh fill-current" />
                  <span>{item.average_rating.toFixed(1)}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average rating</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span>•</span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-oasis" />
                  <span>{Math.round(item.success_rate * 100)}%</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Success rate</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span>•</span>

            <Badge variant="outline" className="text-xs border-oasis/30 text-oasis">
              {item.category}
            </Badge>

            {item.ai_enhanced && (
              <>
                <span>•</span>
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center space-x-1">
                    <Hash className="h-3 w-3" />
                    <span>Score: {item.quality_score}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Quality score (0-100)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>{item.complexity_score}/10</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Complexity level</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <span>{item.estimated_tokens} tokens</span>
            </div>
          </div>

          <div className="mt-auto flex items-center space-x-2">
            <Button
              size="sm"
              className="flex-1 bg-pharaoh-gold hover:bg-pharaoh-gold/90 text-white"
              onClick={() => handleCopyContent(item)}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Prompt
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/30 hover:border-primary hover:bg-primary/10"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs px-2 py-0.5 text-muted-foreground">
                  +{item.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-4 mb-6">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-pharaoh-gold to-nile-teal rounded-full flex items-center justify-center shadow-pyramid"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BookOpen className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-lapis-blue via-pharaoh-gold to-nile-teal bg-clip-text text-transparent">
              Prompt Library
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Curated collection of high-quality prompts for every use case
            </p>
          </div>
        </div>
      </motion.div>

      {/* Featured Section */}
      {featuredData && featuredData.results.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-hieroglyph mb-6 flex items-center">
            <Award className="h-6 w-6 mr-2 text-pharaoh" />
            Featured Prompts
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredData.results.map((item) => (
              <LibraryCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="temple-card p-6 mb-8 pyramid-elevation">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
              <input
                type="text"
                placeholder="Search the library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-secondary/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary bg-secondary/50"
            >
              <option value="">All Categories</option>
              <option value="Writing">Writing</option>
              <option value="Coding">Coding</option>
              <option value="Analysis">Analysis</option>
              <option value="Creative">Creative</option>
              <option value="Business">Business</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary bg-secondary/50"
            >
              <option value="-quality_score">Highest Quality</option>
              <option value="quality_score">Lowest Quality</option>
              <option value="-usage_count">Most Used</option>
              <option value="-average_rating">Highest Rated</option>
            </select>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Library Items */}
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card className="temple-card p-8 text-center">
          <p className="text-destructive">Failed to load library items</p>
        </Card>
      ) : data && data.results.length === 0 ? (
        <Card className="temple-card p-8 text-center pyramid-elevation">
          <Search className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-hieroglyph mb-2">No Items Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or browse all prompts.
          </p>
        </Card>
      ) : (
        data && (
          <>
            <motion.div
              className={
                viewMode === 'grid'
                  ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
              layout
            >
              <AnimatePresence mode="popLayout">
                {data.results.map((item) => (
                  <LibraryCard key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {data.next || data.previous ? (
              <div className="flex items-center justify-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!data.previous}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {currentPage}</span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!data.next}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </>
        )
      )}
    </div>
  );
}
