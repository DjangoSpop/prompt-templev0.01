'use client';

import { useState } from 'react';
import { Star, Crown, Users, Eye, Copy } from 'lucide-react';
import type { TemplateList, TemplateDetail } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface TemplateCardProps {
  template: TemplateList | TemplateDetail;
  viewMode: 'grid' | 'list';
  onSelect?: (template: TemplateList | TemplateDetail) => void;
}

export function EnhancedTemplateCard({ template, viewMode }: TemplateCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUseTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      // Navigate to template detail page for usage
      router.push(`/templates/${template.id}`);
    } catch (error) {
      console.error('Failed to navigate to template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/templates/${template.id}`);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`} 
      />
    ));
  };

  // Helper function to get template content
  const getTemplateContent = () => {
    if ('template_content' in template) {
      return template.template_content;
    }
    return '';
  };

  // Helper function to check if template is featured
  const isFeatured = () => {
    if ('is_featured' in template) {
      return template.is_featured;
    }
    return false;
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-gray-900">
                {template.title || 'Untitled'}
              </h3>
              {isFeatured() && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {template.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                {renderStars(template.average_rating || 0)}
                <span className="ml-1">{(template.average_rating || 0).toFixed(1)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{template.usage_count || 0}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{template.category?.name || 'Unknown'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={handleUseTemplate}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
            >
              {isLoading ? 'Loading...' : 'Use Template'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
            {template.title || 'Untitled'}
          </h3>
          {isFeatured() && (
            <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0 ml-2" />
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {template.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-sm">
            {renderStars(template.average_rating || 0)}
            <span className="ml-1 text-gray-600">{(template.average_rating || 0).toFixed(1)}</span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {template.category?.name || 'Unknown'}
          </span>
        </div>
        
        {getTemplateContent() && (
          <div className="bg-gray-50 border rounded p-3 mb-4">
            <p className="text-xs text-gray-600 font-medium mb-1">Preview:</p>
            <p className="text-sm text-gray-700 font-mono">
              {getTemplateContent().substring(0, 100)}
              {getTemplateContent().length > 100 && '...'}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{template.usage_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{template.field_count || 0} fields</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const content = getTemplateContent();
                if (content) {
                  navigator.clipboard.writeText(content);
                }
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy template"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleUseTemplate}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? '...' : 'Use'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
