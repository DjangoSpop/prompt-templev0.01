'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Pin, 
  PinOff, 
  Eye, 
  Copy, 
  Star,
  Filter,
  Grid,
  List,
  Tag
} from 'lucide-react';
import { usePromptStore } from '@/store/usePromptStore';
import { cn } from '@/lib/utils';

interface TemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void;
  selectedTemplateId?: string | null;
  className?: string;
}

type ViewMode = 'grid' | 'list';

export function TemplateGallery({ 
  onSelectTemplate, 
  selectedTemplateId, 
  className 
}: TemplateGalleryProps) {
  const {
    templates,
    categories,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    pinTemplate,
    unpinTemplate,
    selectTemplate,
  } = usePromptStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        template =>
          template.title.toLowerCase().includes(query) ||
          template.description?.toLowerCase().includes(query) ||
          template.tags.some(tag => tag.toLowerCase().includes(query)) ||
          template.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Sort: pinned first, then by usage, then by date
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if ((b.usageCount || 0) !== (a.usageCount || 0)) {
        return (b.usageCount || 0) - (a.usageCount || 0);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [templates, searchQuery, selectedCategory]);

  const handlePinToggle = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isPinned) {
      unpinTemplate(templateId);
    } else {
      pinTemplate(templateId);
    }
  };

  const handleCopyTemplate = (template: { content: string }) => {
    navigator.clipboard.writeText(template.content);
    // Could add toast notification here
  };

  const renderTemplateCard = (template: typeof templates[0]) => {
    const isSelected = selectedTemplateId === template.id;
    
    if (viewMode === 'list') {
      return (
        <Card 
          key={template.id}
          className={cn(
            "pharaoh-card cursor-pointer transition-all duration-200 hover:shadow-lg",
            isSelected && "ring-2 ring-pharaoh shadow-lg pharaoh-glow"
          )}
          onClick={() => {
            selectTemplate(template.id);
            onSelectTemplate(template.id);
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {template.isPinned && (
                    <Pin className="h-4 w-4 text-pharaoh" />
                  )}
                  <h3 className="font-display font-semibold text-hieroglyph truncate">
                    {template.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {template.description || 'No description available'}
                </p>
                <div className="flex items-center gap-2">
                  {template.tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{template.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinToggle(template.id);
                  }}
                  className="h-8 w-8 p-0"
                >
                  {template.isPinned ? (
                    <PinOff className="h-4 w-4" />
                  ) : (
                    <Pin className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyTemplate(template);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3" />
                  {template.usageCount || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Grid view
    return (
      <Card 
        key={template.id}
        className={cn(
          "pharaoh-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105",
          isSelected && "ring-2 ring-pharaoh shadow-lg pharaoh-glow"
        )}
        onClick={() => {
          selectTemplate(template.id);
          onSelectTemplate(template.id);
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {template.isPinned && (
                  <Pin className="h-4 w-4 text-pharaoh" />
                )}
                <CardTitle className="text-sm font-display font-semibold text-hieroglyph truncate">
                  {template.title}
                </CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {template.category}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePinToggle(template.id);
              }}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {template.isPinned ? (
                <PinOff className="h-3 w-3" />
              ) : (
                <Pin className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
            {template.description || template.content.substring(0, 100) + '...'}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 2}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyTemplate(template);
                }}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3" />
              {template.usageCount || 0}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-hieroglyph">
          Template Gallery
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-muted")}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <div className="flex items-center border rounded">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search templates, tags, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
        </span>
        {(searchQuery || selectedCategory) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Templates Grid/List */}
      <div 
        className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-3"
        )}
      >
        {filteredTemplates.map(renderTemplateCard)}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No templates found</p>
            <p className="text-sm">
              {searchQuery || selectedCategory 
                ? "Try adjusting your search or filters" 
                : "No templates available"}
            </p>
          </div>
          {(searchQuery || selectedCategory) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
