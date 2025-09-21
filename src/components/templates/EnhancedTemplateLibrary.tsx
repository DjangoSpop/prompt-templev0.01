'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EnhancedTemplateCard } from '@/components/EnhancedTemplateCard';
import { SearchBar } from '@/components/SearchBar';
import { CategoryChips } from '@/components/CategoryChips';
import { TemplateList, TemplateCategory } from '@/lib/types';
import { normalizeTemplateLists, normalizeTemplateCategories } from '@/lib/utils/template-normalizers';
import { PyramidGrid } from '@/components/pharaonic/PyramidGrid';
import { 
  Filter, 
  SortAsc, 
  LayoutGrid, 
  List,
  Star,
  TrendingUp,
  Clock,
  Users,
  ArrowUpDown,
  Search,
  X,
  Sparkles,
  Globe,
  Lock
} from 'lucide-react';

interface EnhancedTemplateLibraryProps {
  className?: string;
}

const sortOptions = [
  { key: 'created_at', label: 'Latest', icon: Clock },
  { key: 'usage_count', label: 'Most Used', icon: Users },
  { key: 'average_rating', label: 'Top Rated', icon: Star },
  { key: 'popularity_score', label: 'Trending', icon: TrendingUp },
];

const filterPresets = [
  { 
    id: 'featured', 
    label: 'Featured', 
    icon: Sparkles,
    filters: { is_featured: true, is_public: true }
  },
  { 
    id: 'public', 
    label: 'Community', 
    icon: Globe,
    filters: { is_public: true, is_featured: false }
  },
  { 
    id: 'private', 
    label: 'Private', 
    icon: Lock,
    filters: { is_public: false }
  },
];

export function EnhancedTemplateLibrary({ className = '' }: EnhancedTemplateLibraryProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TemplateList[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'usage_count' | 'average_rating' | 'popularity_score'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    is_featured: false,
    is_public: true,
    author: '',
    min_rating: 0,
    tags: [] as string[],
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadTemplates = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const ordering = `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;
      const params = {
        page,
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        ordering,
        is_featured: filters.is_featured || undefined,
        is_public: filters.is_public,
        author: filters.author || undefined,
        tags: filters.tags.length > 0 ? filters.tags.join(',') : undefined,
      };

      const result = await apiClient.getTemplates(params);
      const normalizedResults = normalizeTemplateLists(result.results);

      setTemplates(normalizedResults);
      const count = result.count ?? normalizedResults.length;
      setTotalCount(count);
      setTotalPages(Math.max(1, Math.ceil(count / 20)));
      setHasNextPage(Boolean(result.next));
      setHasPrevPage(Boolean(result.previous));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sortBy, sortOrder, filters]);

  const loadCategories = useCallback(async () => {
    try {
      const result = await apiClient.getCategories();
      setCategories(normalizeTemplateCategories(result.results));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadTemplates(1);
    setCurrentPage(1);
  }, [loadTemplates]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setActivePreset(null);
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleFilterChange = (filterKey: keyof typeof filters, value: boolean | string | number | string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setActivePreset(null);
  };

  const applyPreset = (presetId: string) => {
    const preset = filterPresets.find(p => p.id === presetId);
    if (preset) {
      setFilters(prev => ({ ...prev, ...preset.filters }));
      setActivePreset(presetId);
    }
  };

  const clearFilters = () => {
    setFilters({
      is_featured: false,
      is_public: true,
      author: '',
      min_rating: 0,
      tags: [],
    });
    setSelectedCategory(null);
    setSearchQuery('');
    setActivePreset(null);
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'desc' ? '↓' : '↑';
  };

  const hasActiveFilters = useMemo(() => {
    return searchQuery || 
           selectedCategory !== null || 
           filters.is_featured || 
           !filters.is_public || 
           filters.author || 
           filters.min_rating > 0 || 
           filters.tags.length > 0;
  }, [searchQuery, selectedCategory, filters]);

  if (isLoading && templates.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <motion.div 
            className="animate-pulse space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="h-12 bg-muted/50 rounded-temple w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-80 bg-muted/30 rounded-temple"></div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background relative ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <PyramidGrid animate={false} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 space-y-8 max-w-7xl">
        {/* Enhanced Header */}
        <motion.div 
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-lapis-blue to-pharaoh-gold bg-clip-text text-transparent">
              Template Library
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Discover and master professional AI prompt templates
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm font-normal border-pharaoh-gold/30">
              {totalCount.toLocaleString()} templates
            </Badge>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 transition-colors ${showFilters ? 'bg-pharaoh-gold/10 border-pharaoh-gold text-pharaoh-gold' : ''}`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <div className="w-2 h-2 bg-pharaoh-gold rounded-full" />
              )}
            </Button>
            
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none border-l"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Search and Quick Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search templates by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10 h-12 text-base border-border/50 focus:border-pharaoh-gold/50 focus:ring-pharaoh-gold/20"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {/* Category Chips */}
              <CategoryChips
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategoryFilter}
              />
              
              {/* Quick Filters Row */}
              <div className="flex flex-wrap gap-3">
                {/* Filter Presets */}
                {filterPresets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant={activePreset === preset.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyPreset(preset.id)}
                    className="flex items-center gap-2"
                  >
                    <preset.icon className="w-4 h-4" />
                    {preset.label}
                  </Button>
                ))}
                
                <div className="w-px h-8 bg-border mx-2" />
                
                {/* Sort Options */}
                {sortOptions.map((option) => (
                  <Button
                    key={option.key}
                    variant={sortBy === option.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange(option.key as typeof sortBy)}
                    className="flex items-center gap-2"
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label} {getSortIcon(option.key as typeof sortBy)}
                  </Button>
                ))}
              </div>
              
              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <motion.div 
                  className="flex items-center gap-2 pt-2 border-t border-border/50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <Badge variant="secondary" className="bg-pharaoh-gold/10 text-pharaoh-gold">
                        Search: {searchQuery}
                        <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSearchQuery('')} />
                      </Badge>
                    )}
                    {selectedCategory && (
                      <Badge variant="secondary" className="bg-nile-teal/10 text-nile-teal">
                        Category: {categories.find(c => c.id === selectedCategory)?.name}
                        <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSelectedCategory(null)} />
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-muted-foreground hover:text-pharaoh-gold">
                    Clear All
                  </Button>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 bg-card/30 backdrop-blur-sm border-pharaoh-gold/20">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">Advanced Filters</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-pharaoh-gold hover:bg-pharaoh-gold/10">
                      Reset All
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Template Type</label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.is_featured}
                            onChange={(e) => handleFilterChange('is_featured', e.target.checked)}
                            className="rounded border-border text-pharaoh-gold focus:ring-pharaoh-gold/20"
                          />
                          <span className="text-sm">Featured Templates</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.is_public}
                            onChange={(e) => handleFilterChange('is_public', e.target.checked)}
                            className="rounded border-border text-nile-teal focus:ring-nile-teal/20"
                          />
                          <span className="text-sm">Public Templates</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label htmlFor="author" className="text-sm font-medium text-foreground">Author</label>
                      <Input
                        id="author"
                        type="text"
                        value={filters.author}
                        onChange={(e) => handleFilterChange('author', e.target.value)}
                        placeholder="Filter by author..."
                        className="border-border/50 focus:border-pharaoh-gold/50"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label htmlFor="rating" className="text-sm font-medium text-foreground">Minimum Rating</label>
                      <select
                        id="rating"
                        value={filters.min_rating}
                        onChange={(e) => handleFilterChange('min_rating', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-border/50 rounded-lg bg-background text-foreground focus:border-pharaoh-gold/50 focus:ring-pharaoh-gold/20"
                      >
                        <option value={0}>Any Rating</option>
                        <option value={1}>1+ Stars</option>
                        <option value={2}>2+ Stars</option>
                        <option value={3}>3+ Stars</option>
                        <option value={4}>4+ Stars</option>
                        <option value={5}>5 Stars Only</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {/* This would be populated with actual tag data */}
                        <Badge variant="outline" className="cursor-pointer hover:bg-pharaoh-gold/10">
                          +Add Tags
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Templates Grid/List */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {templates.length === 0 ? (
            <Card className="p-12 text-center bg-card/30 backdrop-blur-sm">
              <motion.div 
                className="space-y-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-20 h-20 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  No templates found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try adjusting your search criteria or filters to discover more templates
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} className="bg-pharaoh-gold hover:bg-pharaoh-gold/90">
                    Clear All Filters
                  </Button>
                )}
              </motion.div>
            </Card>
          ) : (
            <>
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                <AnimatePresence mode="popLayout">
                  {templates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <EnhancedTemplateCard
                        template={template}
                        variant={viewMode}
                        showAuthor={true}
                        showStats={true}
                        onTemplateAction={(action, templateId) => {
                          console.log(`${action} action on template ${templateId}`);
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="p-6 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing <span className="font-semibold text-foreground">{((currentPage - 1) * 20) + 1}</span> to{' '}
                        <span className="font-semibold text-foreground">{Math.min(currentPage * 20, totalCount)}</span> of{' '}
                        <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span> templates
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadTemplates(currentPage - 1)}
                          disabled={!hasPrevPage || isLoading}
                          className="hover:bg-pharaoh-gold/10 hover:border-pharaoh-gold/30"
                        >
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + Math.max(1, currentPage - 2);
                            if (page > totalPages) return null;
                            
                            return (
                              <Button
                                key={page}
                                variant={page === currentPage ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => loadTemplates(page)}
                                disabled={isLoading}
                                className={page === currentPage ? 'bg-pharaoh-gold hover:bg-pharaoh-gold/90' : 'hover:bg-pharaoh-gold/10'}
                              >
                                {page}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadTemplates(currentPage + 1)}
                          disabled={!hasNextPage || isLoading}
                          className="hover:bg-pharaoh-gold/10 hover:border-pharaoh-gold/30"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
