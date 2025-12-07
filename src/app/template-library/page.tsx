'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Star,
  TrendingUp,
  User,
  Heart,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Download,
  Share,
  BookOpen,
  Sparkles,
  Target,
  Zap,
  Clock,
  ThumbsUp,
  Eye
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

import { SkeletonLoader } from '@/components/chat/SkeletonLoader';
import { AIInsightCard, type AIInsight } from '@/components/chat/AIInsightCard';

import { apiClient } from '@/lib/api-client';
import type { components } from '@/lib/types/api';

type TemplateDetail = components['schemas']['TemplateDetail'];
type TemplateCategory = components['schemas']['TemplateCategory'];
type PaginatedTemplateList = components['schemas']['PaginatedTemplateListList'];

// Advanced search filters
interface TemplateFilters {
  search: string;
  category?: string;
  author?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  minRating?: number;
  isPublic?: boolean;
  sortBy: 'created_at' | 'updated_at' | 'rating' | 'usage_count' | 'title';
  sortOrder: 'asc' | 'desc';
}

// Template card component with AI insights
const TemplateCard: React.FC<{
  template: TemplateDetail;
  onAnalyze: (template: TemplateDetail) => void;
  onCopy: (template: TemplateDetail) => void;
  onFavorite: (template: TemplateDetail) => void;
  onView: (template: TemplateDetail) => void;
  insights?: AIInsight[];
}> = ({ template, onAnalyze, onCopy, onFavorite, onView, insights }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await onAnalyze(template);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {template.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(template)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAnalyze} disabled={isAnalyzing}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopy(template)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFavorite(template)}>
                  <Heart className="w-4 h-4 mr-2" />
                  Add to Favorites
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2 mt-3">
            {template.category && (
              <Badge variant="outline" className="text-xs">
                {typeof template.category === 'object' ? template.category.name : template.category}
              </Badge>
            )}
            {template.difficulty && (
              <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </Badge>
            )}
            {template.is_featured && (
              <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 line-clamp-3">
              {template.template_content || 'No preview available'}
            </div>

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="flex">{getRatingStars(template.rating || 0)}</div>
                <span className="text-gray-600">
                  ({template.rating_count || 0})
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <ThumbsUp className="w-3 h-3" />
                <span>{template.usage_count || 0} uses</span>
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={template.author?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {template.author?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                {template.author?.username || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-400">
                {template.created_at && new Date(template.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* AI Insights */}
            {insights && insights.length > 0 && (
              <div className="space-y-2">
                {insights.slice(0, 1).map((insight) => (
                  <div
                    key={insight.id}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 text-xs"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span className="font-medium text-blue-900">{insight.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confident
                      </Badge>
                    </div>
                    <p className="text-blue-800">{insight.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <Button
                size="sm"
                onClick={() => onView(template)}
                className="flex-1"
              >
                <BookOpen className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-3 h-3" />
                  </motion.div>
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCopy(template)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Advanced search component
const AdvancedSearch: React.FC<{
  filters: TemplateFilters;
  onFiltersChange: (filters: TemplateFilters) => void;
  categories: TemplateCategory[];
}> = ({ filters, onFiltersChange, categories }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof TemplateFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const availableTags = [
    'business', 'creative', 'technical', 'educational', 'marketing',
    'research', 'analysis', 'writing', 'coding', 'planning'
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Search & Filter</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates, tags, or authors..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Category & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Category
                    </label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => updateFilter('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Difficulty
                    </label>
                    <Select
                      value={filters.difficulty}
                      onValueChange={(value) => updateFilter('difficulty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={filters.tags.includes(tag)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter('tags', [...filters.tags, tag]);
                            } else {
                              updateFilter('tags', filters.tags.filter(t => t !== tag));
                            }
                          }}
                        />
                        <label htmlFor={tag} className="text-sm text-gray-700 cursor-pointer">
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Sort By
                    </label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => updateFilter('sortBy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Date Created</SelectItem>
                        <SelectItem value="updated_at">Last Updated</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="usage_count">Usage Count</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Order
                    </label>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value) => updateFilter('sortOrder', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Public Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public"
                    checked={filters.isPublic}
                    onCheckedChange={(checked) => updateFilter('isPublic', checked)}
                  />
                  <label htmlFor="public" className="text-sm text-gray-700">
                    Show only public templates
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Template Library Page
export default function TemplateLibraryPage() {
  const [filters, setFilters] = useState<TemplateFilters>({
    search: '',
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [activeTab, setActiveTab] = useState('all');
  const [templateInsights, setTemplateInsights] = useState<Record<string, AIInsight[]>>({});

  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['template-categories'],
    queryFn: () => apiClient.getTemplateCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Build search params from filters
  const searchParams = useMemo(() => {
    const params: any = {};

    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.author) params.author = filters.author;
    if (filters.isPublic !== undefined) params.is_public = filters.isPublic;
    if (filters.sortBy) params.ordering = filters.sortOrder === 'desc' ? `-${filters.sortBy}` : filters.sortBy;

    return params;
  }, [filters]);

  // Fetch templates based on active tab
  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates', activeTab, searchParams],
    queryFn: () => {
      switch (activeTab) {
        case 'featured':
          return apiClient.getFeaturedTemplates().then(templates => ({ results: templates }));
        case 'trending':
          return apiClient.getTrendingTemplates().then(templates => ({ results: templates }));
        case 'my-templates':
          return apiClient.getMyTemplates().then(templates => ({ results: templates }));
        default:
          return apiClient.getTemplates(searchParams);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // AI Analysis mutation
  const analyzeTemplateMutation = useMutation({
    mutationFn: (templateId: string) => apiClient.analyzeTemplateWithAI(templateId),
    onSuccess: (data, templateId) => {
      // Convert API response to AI insights
      const insights: AIInsight[] = [
        {
          id: `insight_${templateId}_quality`,
          type: 'optimization',
          title: 'Template Quality Score',
          description: `This template has a quality score of ${data.score}/100. ${data.suggestions?.[0] || 'Well-structured template.'}`,
          confidence: data.score,
          impact: data.score >= 80 ? 'high' : data.score >= 60 ? 'medium' : 'low',
          actionable: true,
          metadata: {
            category: 'Quality Analysis',
            tags: ['ai-analysis', 'quality'],
          }
        }
      ];

      if (data.suggestions && data.suggestions.length > 1) {
        insights.push({
          id: `insight_${templateId}_suggestions`,
          type: 'suggestion',
          title: 'Improvement Suggestions',
          description: data.suggestions.slice(1).join(' '),
          confidence: 75,
          impact: 'medium',
          actionable: true,
          metadata: {
            category: 'Suggestions',
            tags: ['improvements', 'ai-suggestions'],
          }
        });
      }

      setTemplateInsights(prev => ({
        ...prev,
        [templateId]: insights
      }));

      toast.success('AI analysis completed!');
    },
    onError: (error) => {
      toast.error(`Analysis failed: ${error.message}`);
    },
  });

  const handleAnalyze = async (template: TemplateDetail) => {
    if (!template.id) return;
    analyzeTemplateMutation.mutate(template.id.toString());
  };

  const handleCopy = async (template: TemplateDetail) => {
    await navigator.clipboard.writeText(template.template_content || '');
    toast.success('Template copied to clipboard!');
  };

  const handleFavorite = async (template: TemplateDetail) => {
    try {
      // This would typically call an API endpoint
      toast.success('Added to favorites!');
    } catch (error) {
      toast.error('Failed to add to favorites');
    }
  };

  const handleView = (template: TemplateDetail) => {
    // Navigate to template detail page
    window.open(`/library/${template.id}`, '_blank');
  };

  const categories = categoriesData?.results || [];
  const templates = templatesData?.results || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Template Library
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover, analyze, and use professional prompt templates enhanced with AI insights
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <AdvancedSearch
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
            />
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>All Templates</span>
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Featured</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </TabsTrigger>
              <TabsTrigger value="my-templates" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>My Templates</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {templatesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="h-80">
                      <CardContent className="pt-6">
                        <SkeletonLoader lines={6} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : templates.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  <AnimatePresence>
                    {templates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onAnalyze={handleAnalyze}
                        onCopy={handleCopy}
                        onFavorite={handleFavorite}
                        onView={handleView}
                        insights={template.id ? templateInsights[template.id.toString()] : undefined}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-gray-400 mb-4">
                      <BookOpen className="w-12 h-12" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Templates Found
                    </h3>
                    <p className="text-gray-500 text-center max-w-md">
                      {filters.search || filters.category || filters.tags.length > 0
                        ? 'Try adjusting your search filters to find more templates.'
                        : 'No templates available in this category yet.'}
                    </p>
                    {(filters.search || filters.category || filters.tags.length > 0) && (
                      <Button
                        variant="outline"
                        onClick={() => setFilters({
                          search: '',
                          tags: [],
                          sortBy: 'created_at',
                          sortOrder: 'desc'
                        })}
                        className="mt-4"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Pagination placeholder */}
              {templates.length > 0 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <Button variant="outline" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" className="bg-blue-50">
                      1
                    </Button>
                    <Button variant="outline">
                      2
                    </Button>
                    <Button variant="outline">
                      3
                    </Button>
                    <Button variant="outline">
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}