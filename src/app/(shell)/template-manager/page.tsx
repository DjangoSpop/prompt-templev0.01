'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedTemplateCard } from '@/components/EnhancedTemplateCard';
import { SearchBar } from '@/components/SearchBar';
import { CategoryChips } from '@/components/CategoryChips';
import { TemplateList, TemplateCategory, PaginatedResponse } from '@/lib/types';
import { 
  Filter, 
  SortAsc, 
  LayoutGrid, 
  List,
  Star,
  TrendingUp,
  Clock,
  Users,
  ArrowUpDown
} from 'lucide-react';

export default function LibraryPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TemplateList[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'usage_count' | 'average_rating' | 'popularity_score'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    is_featured: false,
    is_public: true,
    author: '',
    min_rating: 0,
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const loadTemplates = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const ordering = `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;
      const params = {
        page,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        ordering,
        is_featured: filters.is_featured || undefined,
        is_public: filters.is_public,
        author: filters.author || undefined,
      };

      const result: PaginatedResponse<TemplateList> = await apiClient.getTemplates(params);
      
      setTemplates(result.results);
      setTotalCount(result.count);
      setTotalPages(Math.ceil(result.count / 20)); // Assuming 20 items per page
      setHasNextPage(!!result.next);
      setHasPrevPage(!!result.previous);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, sortOrder, filters]);

  const loadCategories = useCallback(async () => {
    try {
      const result = await apiClient.getCategories();
      setCategories(result.results);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadTemplates(1);
  }, [loadTemplates]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (filterKey: keyof typeof filters, value: boolean | string | number) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      is_featured: false,
      is_public: true,
      author: '',
      min_rating: 0,
    });
    setSelectedCategory(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'desc' ? '↓' : '↑';
  };

  if (isLoading && templates.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Template Library
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Discover and use professional AI prompt templates
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {totalCount.toLocaleString()} templates
            </span>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            
            <div className="flex border border-gray-300 rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none border-l"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

      {/* Search and Quick Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search templates by title, description, or tags..."
            className="max-w-2xl"
          />
          
          <CategoryChips
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategoryFilter}
          />
          
          {/* Quick Sort Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={sortBy === 'created_at' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('created_at')}
              className="flex items-center gap-1"
            >
              <Clock className="w-4 h-4" />
              Latest {getSortIcon('created_at')}
            </Button>
            <Button
              variant={sortBy === 'usage_count' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('usage_count')}
              className="flex items-center gap-1"
            >
              <Users className="w-4 h-4" />
              Most Used {getSortIcon('usage_count')}
            </Button>
            <Button
              variant={sortBy === 'average_rating' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('average_rating')}
              className="flex items-center gap-1"
            >
              <Star className="w-4 h-4" />
              Top Rated {getSortIcon('average_rating')}
            </Button>
            <Button
              variant={sortBy === 'popularity_score' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('popularity_score')}
              className="flex items-center gap-1"
            >
              <TrendingUp className="w-4 h-4" />
              Trending {getSortIcon('popularity_score')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Advanced Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Type</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={filters.is_featured}
                    onChange={(e) => handleFilterChange('is_featured', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="featured" className="text-sm">Featured Only</label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="public"
                    checked={filters.is_public}
                    onChange={(e) => handleFilterChange('is_public', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="public" className="text-sm">Public Templates</label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="author" className="text-sm font-medium">Author</label>
                <input
                  id="author"
                  type="text"
                  value={filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  placeholder="Filter by author..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="rating" className="text-sm font-medium">Minimum Rating</label>
                <select
                  id="rating"
                  value={filters.min_rating}
                  onChange={(e) => handleFilterChange('min_rating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value={0}>Any Rating</option>
                  <option value={1}>1+ Stars</option>
                  <option value={2}>2+ Stars</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Templates Grid/List */}
      <div className="space-y-4">
        {templates.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No templates found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          </Card>
        ) : (
          <>
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {templates.map((template) => (
                <EnhancedTemplateCard
                  key={template.id}
                  template={template}
                  variant={viewMode}
                  showAuthor={true}
                  showStats={true}
                  onTemplateAction={(action, templateId) => {
                    console.log(`${action} action on template ${templateId}`);
                    // Handle template actions (use, save, share, etc.)
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} templates
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadTemplates(currentPage - 1)}
                      disabled={!hasPrevPage || isLoading}
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
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
    </div>
  );
}
