'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/api-client';
import { TemplateList, TemplateCategory, PaginatedResponse, TemplateSearch } from '@/lib/types';
import { EnhancedTemplateDetailModal } from '@/components/templates/EnhancedTemplateDetailModal';
import { PyramidGrid } from '@/components/pharaonic/PyramidGrid';
import { NefertitiBackground } from '@/components/pharaonic/NefertitiIcon';
import { StepTracker } from '@/components/onboarding/StepTracker';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Award,
  Plus,
  Grid,
  List,
  Eye,
  Copy,
  Heart,
  Users,
  BookOpen,
  Sparkles,
  Zap,
  Clock,
  Hash,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';

type ViewMode = 'grid' | 'list';
type SortOption = 'popularity' | 'rating' | 'recent' | 'trending';

export default function TemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TemplateList[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<TemplateList[]>([]);
  const [trendingTemplates, setTrendingTemplates] = useState<TemplateList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Enhanced modal state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateList | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Quick copy state
  const [copyingTemplates, setCopyingTemplates] = useState<Set<string>>(new Set());

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadTemplates = async (page = 1) => {
    setIsLoading(true);
    try {
      const filters: TemplateSearch = {
        page,
        ordering: getOrderingString(sortBy),
      };

      if (debouncedSearch) filters.search = debouncedSearch;
      if (selectedCategory) filters.category = selectedCategory;
      if (showFeaturedOnly) filters.is_featured = true;

      const response = await apiClient.getTemplates(filters);
      setTemplates(response.results);
      setTotalPages(Math.ceil(response.count / 20)); // Assuming 20 items per page
      setCurrentPage(page);

      // Track template browsing (optional - don't fail if analytics fails)
      try {
        await apiClient.trackEvent({
          event_type: 'templates_browsed',
          data: {
            search_query: debouncedSearch,
            category: selectedCategory,
            page,
            sort_by: sortBy,
          },
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiClient.getTemplateCategories();
      setCategories(response.results);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadFeaturedTemplates = async () => {
    try {
      const featured = await apiClient.getFeaturedTemplates();
      setFeaturedTemplates(featured.slice(0, 4)); // Show top 4
    } catch (error) {
      console.error('Failed to load featured templates:', error);
    }
  };

  const loadTrendingTemplates = async () => {
    try {
      const trending = await apiClient.getTrendingTemplates();
      setTrendingTemplates(trending.slice(0, 4)); // Show top 4
    } catch (error) {
      console.error('Failed to load trending templates:', error);
    }
  };

  useEffect(() => {
    loadCategories();
    loadFeaturedTemplates();
    loadTrendingTemplates();
  }, []);

  useEffect(() => {
    loadTemplates(1);
  }, [debouncedSearch, selectedCategory, sortBy, showFeaturedOnly]);

  const getOrderingString = (sort: SortOption): string => {
    switch (sort) {
      case 'popularity': return '-popularity_score';
      case 'rating': return '-average_rating';
      case 'recent': return '-created_at';
      case 'trending': return '-usage_count';
      default: return '-popularity_score';
    }
  };

  const handleTemplateAction = async (template: TemplateList, action: string) => {
    try {
      switch (action) {
        case 'view':
          setSelectedTemplate(template);
          setIsDetailModalOpen(true);
          // Track template view
          try {
            await apiClient.trackEvent({
              event_type: 'template_viewed',
              data: {
                template_id: template.id,
                template_title: template.title,
              },
            });
          } catch (analyticsError) {
            console.warn('Analytics tracking failed:', analyticsError);
          }
          break;
        
        case 'quick_copy':
          setCopyingTemplates(prev => new Set([...prev, template.id]));
          try {
            // Get basic template content for quick copy
            const basicPrompt = `Template: ${template.title}\nDescription: ${template.description}\n\n[This is a template placeholder - open template for full customization]`;
            await navigator.clipboard.writeText(basicPrompt);
            toast.success(`${template.title} copied to clipboard!`, {
              icon: '📋',
              duration: 3000,
            });
            
            // Track quick copy
            await apiClient.trackEvent({
              event_type: 'template_quick_copied',
              data: {
                template_id: template.id,
                template_title: template.title,
              },
            });
          } catch (error) {
            toast.error('Failed to copy template');
          } finally {
            setCopyingTemplates(prev => {
              const newSet = new Set(prev);
              newSet.delete(template.id);
              return newSet;
            });
          }
          break;
        
        case 'use':
          await apiClient.startTemplateUsage(template.id);
          setSelectedTemplate(template);
          setIsDetailModalOpen(true);
          // Track template usage (optional)
          try {
            await apiClient.trackEvent({
              event_type: 'template_used',
              data: {
                template_id: template.id,
                template_title: template.title,
              },
            });
          } catch (analyticsError) {
            console.warn('Analytics tracking failed:', analyticsError);
          }
          break;
        
        case 'duplicate':
          await apiClient.duplicateTemplate(template.id);
          toast.success(`${template.title} duplicated!`, {
            icon: '✨',
            duration: 3000,
          });
          // Track template duplication (optional)
          try {
            await apiClient.trackEvent({
              event_type: 'template_duplicated',
              properties: {
                template_id: template.id,
                original_title: template.title,
              },
            });
          } catch (analyticsError) {
            console.warn('Analytics tracking failed:', analyticsError);
          }
          // Refresh templates
          loadTemplates(currentPage);
          break;
        
        case 'favorite':
          // TODO: Implement favorite functionality
          toast.success(`${template.title} added to favorites!`, {
            icon: '⭐',
            duration: 3000,
          });
          try {
            await apiClient.trackEvent({
              event_type: 'template_favorited',
              properties: {
                template_id: template.id,
              },
            });
          } catch (analyticsError) {
            console.warn('Analytics tracking failed:', analyticsError);
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} template:`, error);
      toast.error(`Failed to ${action} template`);
    }
  };

  const handleUseTemplate = useCallback((templateId: string) => {
    // Navigate to builder with template
    // TODO: Implement navigation to builder
    toast.success('Opening template in builder...', {
      icon: '🚀',
      duration: 2000,
    });
  }, []);

  const TemplateCard = ({ template }: { template: TemplateList }) => {
    const isCopying = copyingTemplates.has(template.id);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="temple-card pyramid-elevation hover:pharaoh-glow transition-all duration-300 group overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <button
                  onClick={() => handleTemplateAction(template, 'view')}
                  className="text-lg font-semibold text-hieroglyph hover:text-primary transition-colors text-glow group-hover:text-glow-lg text-left"
                >
                  {template.title}
                </button>
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {template.description}
                </p>
              </div>
              {template.is_featured && (
                <div className="pharaoh-badge rounded-full p-1 flex-shrink-0 ml-2">
                  <Award className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-pharaoh fill-current" />
                    <span>{template.average_rating.toFixed(1)}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average rating from {template.usage_count} users</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-oasis" />
                    <span>{template.usage_count.toLocaleString()}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Times this template has been used</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Badge variant="outline" className="text-xs border-oasis/30 text-oasis">
                {template.category.name}
              </Badge>
              
              {template.field_count && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center space-x-1 text-xs">
                      <Hash className="h-3 w-3" />
                      <span>{template.field_count}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{template.field_count} customizable fields</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-pharaoh-gold hover:bg-pharaoh-gold/90 text-white text-xs"
                        onClick={() => handleTemplateAction(template, 'use')}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        <span>Use</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open template with full customization</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/30 hover:border-primary hover:bg-primary/10 text-xs"
                        onClick={() => handleTemplateAction(template, 'quick_copy')}
                        disabled={isCopying}
                      >
                        {isCopying ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quick copy template info</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/30 hover:border-destructive hover:bg-destructive/10 text-xs"
                        onClick={() => handleTemplateAction(template, 'favorite')}
                      >
                        <Heart className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add to favorites</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="text-xs text-muted-foreground flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>2 min setup</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const TemplateListItem = ({ template }: { template: TemplateList }) => (
    <Card className="temple-card pyramid-elevation hover:pharaoh-glow transition-all duration-300">
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <Link 
              href={`/templates/${template.id}`}
              className="text-lg font-semibold text-hieroglyph hover:text-primary transition-colors text-glow"
            >
              {template.title}
            </Link>
            {template.is_featured && (
              <div className="pharaoh-badge rounded-full p-1">
                <Award className="h-3 w-3 text-white" />
              </div>
            )}
            <span className="text-xs bg-oasis/20 text-oasis px-2 py-1 rounded border border-oasis/30">
              {template.category.name}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
            {template.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-pharaoh fill-current" />
              <span>{template.average_rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3 text-oasis" />
              <span>{template.usage_count} uses</span>
            </div>
            <span>{template.field_count} sacred fields</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            size="sm"
            className="pharaoh-badge text-xs"
            onClick={() => handleTemplateAction(template, 'use')}
          >
            Invoke Template
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-primary/30 hover:border-primary hover:bg-primary/10"
            onClick={() => handleTemplateAction(template, 'duplicate')}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/30 hover:border-destructive hover:bg-destructive/10"
            onClick={() => handleTemplateAction(template, 'favorite')}
          >
            <Heart className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background relative">
      {/* Track onboarding step completion */}
      <StepTracker stepId="library" />
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <PyramidGrid animate={false} />
      </div>
      <NefertitiBackground opacity={0.03} />
      
      <div className="relative z-10 container mx-auto px-4 py-4 md:px-6 md:py-8">
        {/* Enhanced Header Section */}
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-pharaoh-gold to-nile-teal rounded-full flex items-center justify-center shadow-pyramid"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <BookOpen className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-lapis-blue via-pharaoh-gold to-nile-teal bg-clip-text text-transparent text-center sm:text-left">
                The Sacred Archive
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mt-2 text-center sm:text-left">
                Ancient wisdom meets modern AI • {templates.length.toLocaleString()} sacred scrolls
              </p>
            </div>
          </div>
          


          {/* Download Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="temple-card p-6 text-center pyramid-elevation hover:pharaoh-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-hieroglyph mb-2">Browser Extension</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Access templates directly in your browser
              </p>
              <Button variant="outline" className="w-full hover:border-primary hover:bg-primary/10">
                Download Extension
              </Button>
            </Card>

            <Card className="temple-card p-6 text-center pyramid-elevation hover:pharaoh-glow transition-all duration-300">
              <div className="w-12 h-12 bg-oasis rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-hieroglyph mb-2">Desktop App</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Full featured Prompt Temple application
              </p>
              <Button variant="outline" className="w-full hover:border-oasis hover:bg-oasis/10">
                Download App
              </Button>
            </Card>

            <Card className="temple-card p-6 text-center pyramid-elevation hover:pharaoh-glow transition-all duration-300">
              <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-hieroglyph mb-2">Beta Access</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Early access to new features
              </p>
              <Button variant="outline" className="w-full hover:border-destructive hover:bg-destructive/10">
                Join Beta
              </Button>
            </Card>
          </div>
        </motion.div>

        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-hieroglyph text-glow">Temple Library</h2>
            <p className="text-muted-foreground mt-2">
              Discover, use, and create AI prompt templates for every sacred ritual.
            </p>
          </div>
          <Link href="/templates/create">
            <Button className="pharaoh-badge mt-4 md:mt-0 flex items-center space-x-2 pyramid-elevation">
              <Plus className="h-4 w-4" />
              <span>Forge New Template</span>
            </Button>
          </Link>
        </div>

      {/* Featured & Trending Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center text-hieroglyph text-glow">
            <Award className="h-5 w-5 mr-2 text-pharaoh" />
            Sacred Featured Scrolls
          </h2>
          <div className="space-y-3">
            {featuredTemplates.map(template => (
              <Card key={template.id} className="temple-card p-3 pyramid-elevation hover:pharaoh-glow transition-all duration-300">
                <Link 
                  href={`/templates/${template.id}`}
                  className="font-medium text-hieroglyph hover:text-primary transition-colors text-glow"
                >
                  {template.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {template.description}
                </p>
                <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 text-pharaoh fill-current" />
                  <span>{template.average_rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{template.usage_count} uses</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center text-hieroglyph text-glow">
            <TrendingUp className="h-5 w-5 mr-2 text-oasis" />
            Trending Ancient Wisdom
          </h2>
          <div className="space-y-3">
            {trendingTemplates.map(template => (
              <Card key={template.id} className="temple-card p-3 pyramid-elevation hover:pharaoh-glow transition-all duration-300">
                <Link 
                  href={`/templates/${template.id}`}
                  className="font-medium text-hieroglyph hover:text-primary transition-colors text-glow"
                >
                  {template.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {template.description}
                </p>
                <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 text-pharaoh fill-current" />
                  <span>{template.average_rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{template.usage_count} uses</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="temple-card p-6 mb-6 pyramid-elevation">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
              <input
                type="text"
                placeholder="Search the sacred scrolls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-secondary/50 text-hieroglyph placeholder-muted-foreground"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center space-x-4">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary bg-secondary/50 text-hieroglyph"
            >
              <option value="">All Sacred Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary bg-secondary/50 text-hieroglyph"
            >
              <option value="popularity">Most Revered</option>
              <option value="rating">Highest Blessed</option>
              <option value="recent">Newest Discoveries</option>
              <option value="trending">Rising Power</option>
            </select>

            <label className="flex items-center space-x-2 text-hieroglyph">
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                className="rounded border-primary/30 text-primary focus:ring-primary"
              />
              <span>Sacred Scrolls Only</span>
            </label>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="pharaoh-badge"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Templates Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : templates.length === 0 ? (
        <Card className="temple-card p-8 text-center pyramid-elevation">
          <Search className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-hieroglyph mb-2">No Sacred Scrolls Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or explore our featured temple archives.
          </p>
        </Card>
      ) : (
        <>
          <motion.div 
            className={viewMode === 'grid' 
              ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            }
            layout
          >
            <AnimatePresence mode="popLayout">
              {templates.map((template, index) => 
                viewMode === 'grid' ? (
                  <TemplateCard key={template.id} template={template} />
                ) : (
                  <TemplateListItem key={template.id} template={template} />
                )
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => loadTemplates(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => loadTemplates(page)}
                      className={currentPage === page ? 'pharaoh-badge' : 'border-primary/30 hover:border-primary hover:bg-primary/10'}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => loadTemplates(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Enhanced Template Detail Modal */}
      {selectedTemplate && (
        <EnhancedTemplateDetailModal
          template={selectedTemplate}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTemplate(null);
          }}
          onUse={handleUseTemplate}
        />
      )}
    </div>
  </div>
  );
}