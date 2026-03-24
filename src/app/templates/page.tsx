'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/api-client';
import { TemplateList, TemplateDetail, TemplateCategory, PaginatedResponse, TemplateSearch } from '@/lib/types';
import { EnhancedTemplateDetailModal } from '@/components/templates/EnhancedTemplateDetailModal';
import { AISearchBar } from '@/components/templates/AISearchBar';
import { PyramidGrid } from '@/components/pharaonic/PyramidGrid';
import { Modal } from '@/components/ui/modal';
import { usePromptOptimization } from '@/hooks/api/useAI';
import { useCreditsStore } from '@/store/credits';
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
  Share2,
  CheckCircle,
  Loader2,
  X,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

type ViewMode = 'grid' | 'list';
type SortOption = 'popularity' | 'rating' | 'recent' | 'trending';
type ShareChannel = 'native' | 'copy_link' | 'x' | 'linkedin';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.prompt-temple.com').replace(/\/$/, '');

export default function TemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TemplateList[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<TemplateDetail[]>([]);
  const [trendingTemplates, setTrendingTemplates] = useState<TemplateDetail[]>([]);
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

  // AI Enhance state — same streaming pattern as PromptLibrary
  const [enhancingTemplate, setEnhancingTemplate] = useState<TemplateList | null>(null);
  const [enhancedContent, setEnhancedContent] = useState('');
  const { optimize, cancel, isStreaming: isEnhanceStreaming, output: enhanceOutput } = usePromptOptimization();
  const { creditsAvailable, creditsRemaining } = useCreditsStore();
  const hasCredits = creditsRemaining === null || creditsAvailable > 0;

  // Sync streaming output
  useEffect(() => {
    if (enhancingTemplate && enhanceOutput) setEnhancedContent(enhanceOutput);
  }, [enhancingTemplate, enhanceOutput]);

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
              data: {
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
              data: {
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

  const buildTemplateSharePayload = (template: TemplateList) => {
    const templateUrl = `${SITE_URL}/templates/${template.id}`;
    const ogImageUrl = `${SITE_URL}/api/og/share/template?title=${encodeURIComponent(template.title)}&category=${encodeURIComponent(template.category.name)}&fields=${encodeURIComponent(String(template.field_count || '0'))}`;
    const shareText = `Discover the \"${template.title}\" template on Prompt Temple and start building faster with AI.`;
    const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(templateUrl)}`;
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(templateUrl)}`;

    return {
      templateUrl,
      ogImageUrl,
      shareText,
      xShareUrl,
      linkedInShareUrl,
    };
  };

  const trackTemplateShare = async (template: TemplateList, channel: ShareChannel, shareUrl: string) => {
    try {
      await apiClient.trackEvent({
        event_type: 'template_shared',
        data: {
          template_id: template.id,
          template_title: template.title,
          channel,
          share_url: shareUrl,
        },
      });
    } catch (analyticsError) {
      console.warn('Analytics tracking failed:', analyticsError);
    }
  };

  const handleTemplateShare = async (template: TemplateList, channel: ShareChannel = 'native') => {
    const { templateUrl, shareText, xShareUrl, linkedInShareUrl } = buildTemplateSharePayload(template);

    try {
      if (channel === 'x') {
        window.open(xShareUrl, '_blank', 'noopener,noreferrer,width=640,height=560');
        toast.success('Opening X share...');
        await trackTemplateShare(template, 'x', templateUrl);
        return;
      }

      if (channel === 'linkedin') {
        window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer,width=640,height=560');
        toast.success('Opening LinkedIn share...');
        await trackTemplateShare(template, 'linkedin', templateUrl);
        return;
      }

      if (channel === 'copy_link') {
        await navigator.clipboard.writeText(templateUrl);
        toast.success('Template link copied!', {
          icon: '🔗',
          duration: 2500,
        });
        await trackTemplateShare(template, 'copy_link', templateUrl);
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: `${template.title} · Prompt Temple`,
          text: shareText,
          url: templateUrl,
        });
        toast.success('Template shared successfully!');
        await trackTemplateShare(template, 'native', templateUrl);
        return;
      }

      await navigator.clipboard.writeText(templateUrl);
      toast.success('Share not supported here. Link copied instead!', {
        icon: '🔗',
        duration: 3000,
      });
      await trackTemplateShare(template, 'copy_link', templateUrl);
    } catch (error) {
      console.error('Failed to share template:', error);
      toast.error('Unable to share this template right now.');
    }
  };

  const TemplateShareMenu = ({ template }: { template: TemplateList }) => {
    const share = buildTemplateSharePayload(template);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="border-primary/30 hover:border-primary hover:bg-primary/10 text-xs"
            onClick={(event) => event.stopPropagation()}
            aria-label={`Share ${template.title}`}
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Share Template</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => handleTemplateShare(template, 'native')}>
            <Share2 className="h-4 w-4 mr-2" />
            Quick Share
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleTemplateShare(template, 'x')}>
            X (Twitter)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleTemplateShare(template, 'linkedin')}>
            LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleTemplateShare(template, 'copy_link')}>
            Copy Link
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href={share.ogImageUrl} target="_blank" rel="noopener noreferrer">
              Preview OG Card
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const handleUseTemplate = useCallback((templateId: string) => {
    // Navigate to template detail page
    window.location.href = `/templates/${templateId}`;
  }, []);

  const handleEnhanceTemplate = useCallback(async (template: TemplateList) => {
    if (!hasCredits) {
      toast.error("You've run out of credits. Upgrade your plan to continue.", {
        duration: 6000,
      });
      return;
    }
    const content = `Template: ${template.title}\n\n${template.description}`;
    setEnhancingTemplate(template);
    setEnhancedContent('');
    await optimize({
      original: content,
      session_id: `tpl_enhance_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      mode: 'fast',
    });
  }, [hasCredits, optimize]);

  const handleCopyEnhanced = useCallback(async () => {
    if (!enhancedContent) return;
    await navigator.clipboard.writeText(enhancedContent);
    toast.success('Enhanced prompt copied to clipboard!');
  }, [enhancedContent]);

  const handleCloseEnhanceModal = useCallback(() => {
    if (isEnhanceStreaming) cancel();
    setEnhancingTemplate(null);
    setEnhancedContent('');
  }, [isEnhanceStreaming, cancel]);

  const TemplateCard = ({ template }: { template: TemplateList }) => {
    const isCopying = copyingTemplates.has(template.id);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="min-w-0"
      >
        <Card className="group rounded-xl bg-card border border-border/50 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/5 transition-all duration-200 overflow-hidden h-full flex flex-col">
          <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1 min-w-0">
            {/* Top row: category + rating */}
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                <span className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#6CA0FF]/10 dark:text-[#6CA0FF] truncate max-w-[120px]">
                  {template.category.name}
                </span>
                {template.is_featured && (
                  <Award className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-muted-foreground">{(template.average_rating ?? 0).toFixed(1)}</span>
              </div>
            </div>

            {/* Title */}
            <button
              onClick={() => handleTemplateAction(template, 'view')}
              className="text-sm sm:text-base font-semibold text-foreground hover:text-[#C9A227] transition-colors text-left line-clamp-2 mb-1.5 break-words"
            >
              {template.title}
            </button>

            {/* Description */}
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3 break-words">
              {template.description}
            </p>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Stats row */}
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{(template.usage_count ?? 0).toLocaleString()}</span>
                </div>
                {template.field_count && (
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    <span>{template.field_count} fields</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions — wrapped for mobile */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                size="sm"
                className="bg-[#C9A227] hover:bg-[#C9A227]/90 text-white text-[10px] sm:text-xs font-medium h-7 px-2 sm:px-3"
                onClick={() => handleTemplateAction(template, 'use')}
              >
                <Zap className="h-3 w-3 mr-0.5 sm:mr-1" />
                Use
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10 text-[10px] sm:text-xs h-7 px-2"
                onClick={() => handleEnhanceTemplate(template)}
              >
                <Sparkles className="h-3 w-3 mr-0.5" />
                <span className="hidden sm:inline">Enhance</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-border hover:border-[#C9A227]/40 hover:bg-[#C9A227]/5 text-xs h-7 w-7 p-0"
                onClick={() => handleTemplateAction(template, 'quick_copy')}
                disabled={isCopying}
              >
                {isCopying ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-border hover:border-red-400/40 hover:bg-red-500/5 text-xs h-7 w-7 p-0"
                onClick={() => handleTemplateAction(template, 'favorite')}
              >
                <Heart className="h-3 w-3" />
              </Button>

              <div className="ml-auto">
                <TemplateShareMenu template={template} />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const TemplateListItem = ({ template }: { template: TemplateList }) => (
    <Card className="group rounded-xl bg-card border border-border/50 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/5 transition-all duration-200 overflow-hidden">
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <Link
              href={`/templates/${template.id}`}
              className="text-sm sm:text-base font-semibold text-foreground hover:text-[#C9A227] transition-colors truncate"
            >
              {template.title}
            </Link>
            {template.is_featured && (
              <Award className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
            )}
            <span className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#6CA0FF]/10 dark:text-[#6CA0FF] shrink-0 hidden sm:inline-flex">
              {template.category.name}
            </span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-1 mb-1.5">
            {template.description}
          </p>
          <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span>{(template.average_rating ?? 0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{(template.usage_count ?? 0).toLocaleString()}</span>
            </div>
            <span>{template.field_count} fields</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          <Button
            size="sm"
            className="bg-[#C9A227] hover:bg-[#C9A227]/90 text-white text-[10px] sm:text-xs h-7 px-2 sm:px-3"
            onClick={() => handleTemplateAction(template, 'use')}
          >
            <Zap className="h-3 w-3 mr-0.5" />
            Use
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10 text-[10px] sm:text-xs h-7 px-2"
            onClick={() => handleEnhanceTemplate(template)}
          >
            <Sparkles className="h-3 w-3 mr-0.5" />
            <span className="hidden sm:inline">Enhance</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-border hover:border-[#C9A227]/40 text-xs h-7 w-7 p-0"
            onClick={() => handleTemplateAction(template, 'duplicate')}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-border hover:border-red-400/40 text-xs h-7 w-7 p-0"
            onClick={() => handleTemplateAction(template, 'favorite')}
          >
            <Heart className="h-3 w-3" />
          </Button>
          <TemplateShareMenu template={template} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background relative pb-20 lg:pb-0 overflow-x-hidden">
      {/* Track onboarding step completion */}
      <StepTracker stepId="library" />

      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <PyramidGrid animate={false} />
      </div>
      <NefertitiBackground opacity={0.03} />

      <div className="relative z-10 container mx-auto px-3 py-4 md:px-6 md:py-8 max-w-full overflow-hidden">
        {/* Hero — compact, search-first layout */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between gap-3 mb-4 md:mb-5">
            <div className="flex items-center gap-3 min-w-0">
              <motion.div
                className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-pharaoh-gold to-nile-teal rounded-xl flex items-center justify-center shadow-pyramid shrink-0"
                animate={{ rotate: [0, 4, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </motion.div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-display font-bold bg-gradient-to-r from-lapis-blue via-pharaoh-gold to-nile-teal bg-clip-text text-transparent truncate">
                  Template Library
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  Discover and use AI prompt templates
                </p>
              </div>
            </div>
            <Link href="/templates/create" className="shrink-0">
              <Button className="pharaoh-badge flex items-center gap-1.5 sm:gap-2 pyramid-elevation text-xs sm:text-sm">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Create Template</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </Link>
          </div>

          {/* Search bar — prominent, above the fold */}
          <AISearchBar
            onKeywordSearch={(q) => setSearchQuery(q)}
            placeholder="Search templates... e.g. 'marketing email', 'code review', 'blog post'"
            className="w-full"
          />
        </motion.div>

        {/* Filters bar */}
        <motion.div
          className="flex items-center gap-2 md:gap-3 mb-5 md:mb-6 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-1.5 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary bg-secondary/50 text-hieroglyph text-sm shrink-0"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary bg-secondary/50 text-hieroglyph text-sm shrink-0"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Top Rated</option>
            <option value="recent">Newest</option>
            <option value="trending">Trending</option>
          </select>

          <label className="flex items-center gap-2 text-hieroglyph text-sm shrink-0">
            <input
              type="checkbox"
              checked={showFeaturedOnly}
              onChange={(e) => setShowFeaturedOnly(e.target.checked)}
              className="rounded border-primary/30 text-primary focus:ring-primary"
            />
            <span className="hidden sm:inline">Featured Only</span>
            <span className="sm:hidden">Featured</span>
          </label>

          <div className="flex items-center gap-1 shrink-0 ml-auto">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'pharaoh-badge' : 'border-primary/30'}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'pharaoh-badge' : 'border-primary/30'}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Featured & Trending — compact horizontal strips */}
        {(featuredTemplates.length > 0 || trendingTemplates.length > 0) && (
          <motion.div
            className="mb-6 md:mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {featuredTemplates.length > 0 && (
              <div className="mb-4">
                <h2 className="text-sm md:text-base font-semibold mb-2.5 flex items-center text-hieroglyph">
                  <Award className="h-4 w-4 mr-1.5 text-pharaoh shrink-0" />
                  Featured
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {featuredTemplates.map(template => (
                    <motion.div
                      key={template.id}
                      whileHover={{ y: -2 }}
                      className="shrink-0 w-[260px] sm:w-[280px]"
                    >
                      <Card className="temple-card p-3 h-full pyramid-elevation hover:pharaoh-glow transition-all duration-200 overflow-hidden">
                        <Link
                          href={`/templates/${template.id}`}
                          className="font-medium text-sm text-hieroglyph hover:text-primary transition-colors line-clamp-1 block"
                        >
                          {template.title}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 text-pharaoh fill-current" />
                              {template.average_rating.toFixed(1)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Users className="h-3 w-3" />
                              {template.usage_count}
                            </span>
                          </div>
                          <TemplateShareMenu template={template} />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {trendingTemplates.length > 0 && (
              <div>
                <h2 className="text-sm md:text-base font-semibold mb-2.5 flex items-center text-hieroglyph">
                  <TrendingUp className="h-4 w-4 mr-1.5 text-oasis shrink-0" />
                  Trending
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {trendingTemplates.map(template => (
                    <motion.div
                      key={template.id}
                      whileHover={{ y: -2 }}
                      className="shrink-0 w-[260px] sm:w-[280px]"
                    >
                      <Card className="temple-card p-3 h-full pyramid-elevation hover:pharaoh-glow transition-all duration-200 overflow-hidden">
                        <Link
                          href={`/templates/${template.id}`}
                          className="font-medium text-sm text-hieroglyph hover:text-primary transition-colors line-clamp-1 block"
                        >
                          {template.title}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 text-pharaoh fill-current" />
                              {template.average_rating.toFixed(1)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Users className="h-3 w-3" />
                              {template.usage_count}
                            </span>
                          </div>
                          <TemplateShareMenu template={template} />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

      {/* Templates Grid/List */}
      {isLoading ? (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6'
          : 'space-y-3'
        }>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card p-4 animate-pulse min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 w-20 rounded-full bg-muted" />
                <div className="h-4 w-10 rounded bg-muted" />
              </div>
              <div className="h-5 w-3/4 rounded bg-muted mb-2" />
              <div className="h-4 w-full rounded bg-muted mb-1" />
              <div className="h-4 w-2/3 rounded bg-muted mb-4" />
              <div className="flex gap-2">
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-8 w-16 rounded-lg bg-muted" />
                <div className="h-8 w-8 rounded-lg bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="temple-card p-8 md:p-12 text-center pyramid-elevation">
          <div className="w-20 h-20 bg-[#C9A227]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C9A227]/20">
            <Search className="h-10 w-10 text-[#C9A227]/60" />
          </div>
          <h3 className="text-lg font-semibold text-hieroglyph mb-2">No Sacred Scrolls Found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Try adjusting your search criteria or explore our featured temple archives.
          </p>
          <Button
            variant="outline"
            className="mt-4 border-primary/30"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              setShowFeaturedOnly(false);
            }}
          >
            Clear all filters
          </Button>
        </Card>
      ) : (
        <>
          <motion.div
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6'
              : 'space-y-3'
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
            <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadTemplates(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-border text-sm"
              >
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => loadTemplates(page)}
                      className={currentPage === page ? 'bg-[#C9A227] hover:bg-[#C9A227]/90 text-white' : 'border-border'}
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
                disabled={currentPage === totalPages}
                className="border-border text-sm"
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

      {/* AI Enhance Result Modal */}
      <Modal
        isOpen={!!enhancingTemplate}
        onClose={handleCloseEnhanceModal}
        title={`AI Enhance: ${enhancingTemplate?.title || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          {isEnhanceStreaming ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-500" />
                Enhancing your template with AI…
              </p>
              <div className="p-4 rounded-lg border bg-purple-50/40 dark:bg-purple-900/10 text-sm font-mono whitespace-pre-wrap min-h-[100px] max-h-[280px] overflow-auto leading-relaxed">
                {enhancedContent}<span className="animate-pulse text-purple-500">▋</span>
              </div>
            </div>
          ) : enhancedContent ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    Original
                  </p>
                  <div className="p-3 border rounded-md bg-red-50/30 dark:bg-red-900/10 text-sm font-mono whitespace-pre-wrap max-h-[220px] overflow-auto">
                    {enhancingTemplate?.description}
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
  </div>
  );
}