'use client';

import { useState } from 'react';
import { Star, Crown, Users, Wand2, Layers } from 'lucide-react';
import type { TemplateList, TemplateDetail } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface TemplateCardProps {
  template: TemplateList | TemplateDetail;
  viewMode: 'grid' | 'list';
  onSelect?: (template: TemplateList | TemplateDetail) => void;
  onSmartFill?: (templateId: string) => void;
  relevanceScore?: number;
  isAIRecommended?: boolean;
}

function formatUsageCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return String(count);
}

export function EnhancedTemplateCard({
  template,
  viewMode,
  onSelect,
  onSmartFill,
  relevanceScore,
  isAIRecommended,
}: TemplateCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUseTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      router.push(`/templates/${template.id}`);
    } catch (error) {
      console.error('Failed to navigate to template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(template);
    } else {
      router.push(`/templates/${template.id}`);
    }
  };

  const isFeatured = () => {
    if ('is_featured' in template) {
      return template.is_featured;
    }
    return false;
  };

  const rating = template.average_rating || 0;
  const usageCount = template.usage_count || 0;
  const fieldCount = template.field_count || 0;
  const categoryName = template.category?.name || 'General';
  const tags: string[] = Array.isArray(template.tags) ? template.tags as string[] : [];

  // ─── List View ───────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div
        className="group rounded-xl bg-card border border-border/50 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/5 transition-all duration-200 p-4 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-4">
          {/* Left content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Category badge */}
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#6CA0FF]/10 dark:text-[#6CA0FF] shrink-0">
                {categoryName}
              </span>

              {isFeatured() && (
                <Crown className="w-4 h-4 text-[#C9A227] shrink-0" />
              )}
              {isAIRecommended && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#C9A227]/15 text-[#C9A227] shrink-0">
                  AI
                </span>
              )}
              {relevanceScore !== undefined && (
                <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded shrink-0">
                  {Math.round(relevanceScore * 100)}%
                </span>
              )}
            </div>

            <h3 className="text-base font-semibold text-foreground line-clamp-1 mb-1">
              {template.title || 'Untitled'}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {template.description}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
              {/* Uses */}
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{formatUsageCount(usageCount)} uses</span>
              </div>
              {/* Fields */}
              <div className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>{fieldCount} fields</span>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleUseTemplate}
              disabled={isLoading}
              className="bg-[#C9A227] text-white hover:bg-[#C9A227]/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? '...' : 'Use'}
            </button>
            {onSmartFill && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSmartFill(template.id);
                }}
                className="flex items-center gap-1.5 border border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10 rounded-lg px-3 py-2 text-sm transition-colors"
                title="AI Fill — auto-fill variables with AI"
              >
                <Wand2 className="w-3.5 h-3.5" />
                AI Fill
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Grid View ───────────────────────────────────────────────
  return (
    <div
      className="group rounded-xl bg-card border border-border/50 hover:border-[#C9A227]/40 hover:shadow-lg hover:shadow-[#C9A227]/5 transition-all duration-200 p-5 h-full flex flex-col cursor-pointer hover:-translate-y-0.5"
      onClick={handleCardClick}
    >
      {/* Top row: category + featured/AI badges + rating */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#6CA0FF]/10 dark:text-[#6CA0FF] truncate">
            {categoryName}
          </span>
          {isFeatured() && (
            <Crown className="w-4 h-4 text-[#C9A227] shrink-0" />
          )}
          {isAIRecommended && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#C9A227]/15 text-[#C9A227] shrink-0">
              AI
            </span>
          )}
          {relevanceScore !== undefined && (
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded shrink-0">
              {Math.round(relevanceScore * 100)}%
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-sm text-muted-foreground">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-foreground line-clamp-2 mb-1.5">
        {template.title || 'Untitled'}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {template.description}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-[11px] text-muted-foreground px-1 py-0.5">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Spacer to push footer down */}
      <div className="flex-1" />

      {/* Footer: usage + fields */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>{formatUsageCount(usageCount)} uses</span>
        </div>
        <div className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          <span>{fieldCount} fields</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleUseTemplate}
          disabled={isLoading}
          className="bg-[#C9A227] text-white hover:bg-[#C9A227]/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? '...' : 'Use'}
        </button>
        {onSmartFill && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSmartFill(template.id);
            }}
            className="flex items-center gap-1.5 border border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10 rounded-lg px-3 py-2 text-sm transition-colors"
            title="AI Fill — auto-fill variables with AI"
          >
            <Wand2 className="w-3.5 h-3.5" />
            AI Fill
          </button>
        )}
      </div>
    </div>
  );
}
