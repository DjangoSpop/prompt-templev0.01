'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Star,
  TrendingUp,
  Eye,
  ThumbsUp,
  Calendar,
  User,
  Tag,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  useTemplates,
  useFeaturedTemplates,
  useTrendingTemplates,
  useMyTemplates,
  useDeleteTemplate,
  useDuplicateTemplate,
  useRateTemplate,
} from '@/lib/hooks/useTemplates';
import type { AppTemplate } from '@/lib/types/adapters';
import type { TemplateSearch } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface TemplateManagerProps {
  view?: 'all' | 'featured' | 'trending' | 'my' | 'category';
  categoryId?: number;
  initialFilters?: TemplateSearch;
}

export default function TemplateManager({ 
  view = 'all', 
  categoryId, 
  initialFilters = {} 
}: TemplateManagerProps) {
  const [filters, setFilters] = useState<TemplateSearch>(initialFilters);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Query hooks based on view
  const allTemplatesQuery = useTemplates(filters);
  const featuredQuery = useFeaturedTemplates();
  const trendingQuery = useTrendingTemplates();
  const myTemplatesQuery = useMyTemplates();

  // Mutation hooks
  const deleteTemplateMutation = useDeleteTemplate();
  const duplicateTemplateMutation = useDuplicateTemplate();
  const rateTemplateMutation = useRateTemplate();

  const getTemplateData = () => {
    switch (view) {
      case 'featured':
        return {
          data: featuredQuery.data ?? [],
          isLoading: featuredQuery.isLoading,
          error: featuredQuery.error,
          totalCount: featuredQuery.data?.length ?? 0,
        };
      case 'trending':
        return {
          data: trendingQuery.data ?? [],
          isLoading: trendingQuery.isLoading,
          error: trendingQuery.error,
          totalCount: trendingQuery.data?.length ?? 0,
        };
      case 'my':
        return {
          data: myTemplatesQuery.data ?? [],
          isLoading: myTemplatesQuery.isLoading,
          error: myTemplatesQuery.error,
          totalCount: myTemplatesQuery.data?.length ?? 0,
        };
      default:
        return {
          data: allTemplatesQuery.templates,
          isLoading: allTemplatesQuery.isLoading,
          error: allTemplatesQuery.error,
          totalCount: allTemplatesQuery.totalCount,
        };
    }
  };

  const { data: rawTemplates, isLoading, error, totalCount } = getTemplateData();
  const templates: AppTemplate[] = rawTemplates ?? [];

  // Handle search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== filters.search) {
        setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filters.search]);

  const handleTemplateAction = async (action: string, template: AppTemplate) => {
    try {
      switch (action) {
        case 'edit':
          router.push(`/templates/${template.id}/edit`);
          break;
        case 'view':
          router.push(`/templates/${template.id}`);
          break;
        case 'duplicate':
          await duplicateTemplateMutation.mutateAsync(template.id);
          break;
        case 'delete':
          await deleteTemplateMutation.mutateAsync(template.id);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const handleRateTemplate = async (templateId: string, rating: number) => {
    try {
      await rateTemplateMutation.mutateAsync({ id: templateId, rating: { rating } });
    } catch (error) {
      console.error('Error rating template:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRating = (value: AppTemplate['average_rating']) => {
    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
    return Number.isFinite(numericValue) ? numericValue.toFixed(1) : 'N/A';
  };

  const currentPage = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / 20));
  const showPagination = view === 'all' && totalCount > 20;
  const canGoBack = showPagination && currentPage > 1;
  const canGoForward = showPagination && Boolean(allTemplatesQuery.hasNextPage);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'text-green-600 bg-green-100';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'complex':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div className="space-y-2">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="text-text-secondary">Failed to load templates</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary capitalize">
            {view === 'my' ? 'My Templates' : `${view} Templates`}
          </h1>
          <p className="text-text-secondary">
            {templates?.length || 0} template(s) found
          </p>
        </div>
        
        {isAuthenticated && (
          <Button
            onClick={() => router.push('/templates/create')}
            className="bg-brand hover:bg-brand-hover text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-floating border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="border-border"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="bg-bg-secondary border-border">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    category: e.target.value ? parseInt(e.target.value) : undefined,
                    page: 1 
                  }))}
                  className="w-full px-3 py-2 bg-bg-floating border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">All Categories</option>
                  {/* Add category options here */}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Sort By
                </label>
                <select
                  value={filters.ordering || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    ordering: e.target.value || undefined,
                    page: 1 
                  }))}
                  className="w-full px-3 py-2 bg-bg-floating border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Default</option>
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="-usage_count">Most Used</option>
                  <option value="-average_rating">Highest Rated</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({});
                    setSearchQuery('');
                  }}
                  className="w-full border-border"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      {templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="bg-bg-secondary border-border hover:border-brand/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg text-text-primary truncate">
                      {template.title}
                    </CardTitle>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    {template.is_featured && (
                      <Star className="h-4 w-4 text-yellow-500" />
                    )}
                    
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      
                      {/* Dropdown menu would go here */}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Template Stats */}
                  <div className="flex items-center justify-between text-sm text-text-muted">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {template.usage_count}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {formatRating(template.average_rating)}
                      </span>
                    </div>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(template.created_at)}
                    </span>
                  </div>

                  {/* Author and Category */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-text-secondary">
                      <User className="h-3 w-3 mr-1" />
                      {template.author}
                    </span>
                    <span className="text-brand font-medium">
                      {template.category.name}
                    </span>
                  </div>

                  {/* Tags */}
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-bg-floating text-text-secondary"
                        >
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="text-xs text-text-muted">
                          +{template.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTemplateAction('view', template)}
                      className="flex-1 border-border"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    
                    {isAuthenticated && (
                      <>
                        {user?.id === template.author.id ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTemplateAction('edit', template)}
                            className="border-border"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTemplateAction('duplicate', template)}
                            disabled={duplicateTemplateMutation.isPending}
                            className="border-border"
                          >
                            {duplicateTemplateMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                        
                        {user?.id === template.author.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{template.title}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleTemplateAction('delete', template)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="space-y-4">
            <div className="text-6xl">📝</div>
            <h3 className="text-lg font-medium text-text-primary">
              No templates found
            </h3>
            <p className="text-text-secondary">
              {view === 'my' 
                ? "You haven't created any templates yet." 
                : "No templates match your current filters."
              }
            </p>
            {isAuthenticated && view === 'my' && (
              <Button
                onClick={() => router.push('/templates/create')}
                className="bg-brand hover:bg-brand-hover text-white mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            disabled={!canGoBack}
            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
            className="border-border"
          >
            Previous
          </Button>

          <span className="text-sm text-text-secondary">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={!canGoForward}
            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
            className="border-border"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
