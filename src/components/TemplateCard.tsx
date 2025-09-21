'use client';

import { useState } from 'react';
import { Star, Crown, Users, Eye, Copy, ExternalLink, FileJson } from 'lucide-react';
import type { TemplateList, TemplateDetail, Template as MockTemplate } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface TemplateCardProps {
  template: TemplateList | TemplateDetail | MockTemplate;
  viewMode: 'grid' | 'list';
  onSelect?: (template: TemplateList | TemplateDetail | MockTemplate) => void;
}

export default function TemplateCard({ template, viewMode, onSelect }: TemplateCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUseTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      // Mock usage start - simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('Started usage for template:', template.id);
      onSelect?.(template);
    } catch (error) {
      console.error('Failed to start template usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    console.log('Template selected:', template.id, (template as any).title || (template as any).name);
    onSelect?.(template);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow fill-current' 
            : 'text-interactive-muted'
        }`} 
      />
    ));
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-bg-secondary border border-border rounded-lg p-4 hover:border-interactive-hover/30 transition-all cursor-pointer group"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-text-primary font-medium group-hover:text-interactive-hover transition-colors truncate">
                {(template as any).title || (template as any).name || 'Untitled'}
              </h3>
              {(template as any).is_premium && (
                <span title="Premium template">
                  <Crown className="w-4 h-4 text-yellow flex-shrink-0" />
                </span>
              )}
            </div>
            
            <p className="text-text-secondary text-sm mb-3 line-clamp-2">
              {template.description}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-text-muted">
              <div className="flex items-center space-x-1">
                {renderStars((template as any).average_rating || (template as any).rating || 0)}
                <span className="ml-1">{((template as any).average_rating || (template as any).rating || 0).toFixed(1)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{(template.usage_count || 0).toLocaleString()}</span>
              </div>
              
              <span className="bg-interactive-muted px-2 py-0.5 rounded text-xs">
                {typeof template.category === 'string' ? template.category : (template.category as any)?.name || 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle preview
              }}
              className="p-2 text-interactive-normal hover:text-interactive-hover hover:bg-interactive-hover/10 rounded transition-colors"
              title="Preview template"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleUseTemplate}
              disabled={isLoading}
              className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Use Template</span>
                  <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-bg-secondary border border-border rounded-lg overflow-hidden hover:border-interactive-hover/30 transition-all cursor-pointer group hover:shadow-elevation-medium"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-text-primary font-medium group-hover:text-interactive-hover transition-colors line-clamp-2 flex-1">
            {(template as any).title || (template as any).name || 'Untitled'}
          </h3>
          {(template as any).is_premium && (
            <span title="Premium template">
              <Crown className="w-4 h-4 text-yellow ml-2 flex-shrink-0" />
            </span>
          )}
        </div>
        
        <p className="text-text-secondary text-sm line-clamp-3 mb-3">
          {template.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center space-x-1">
            {renderStars((template as any).average_rating || (template as any).rating || 0)}
            <span className="ml-1">{((template as any).average_rating || (template as any).rating || 0).toFixed(1)}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{(template.usage_count || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="px-4 pb-3">
        <div className="bg-bg-tertiary rounded p-3 text-xs">
          <div className="text-text-muted line-clamp-3 font-mono">
            {(template as any).template_content || (template as any).content ? (
              <>
                {((template as any).template_content || (template as any).content || '').substring(0, 150)}
                {((template as any).template_content || (template as any).content || '').length > 150 && '...'}
              </>
            ) : (
              'No content available'
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <span className="bg-interactive-muted px-2 py-1 rounded text-xs text-text-secondary">
            {typeof template.category === 'string' ? template.category : (template.category as any)?.name || 'Unknown'}
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle quick copy
                navigator.clipboard.writeText((template as any).template_content || (template as any).content || '');
              }}
              className="p-1.5 text-interactive-normal hover:text-interactive-hover hover:bg-interactive-hover/10 rounded transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={handleUseTemplate}
              disabled={isLoading}
              className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Use'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
