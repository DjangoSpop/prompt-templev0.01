'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import type { TemplateCategory } from '@/lib/types';

interface CategoryChipsProps {
  categories: TemplateCategory[];
  selectedCategory: number | null;
  onCategorySelect: (categoryId: number | null) => void;
  className?: string;
}

export function CategoryChips({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  className = "" 
}: CategoryChipsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    checkScrollability();
  }, [categories]);

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  if (categories.length === 0) {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="h-8 w-20 bg-interactive-muted rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg-floating/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-interactive-normal hover:text-interactive-hover hover:bg-bg-floating transition-all shadow-elevation-medium"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Categories container */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* All categories chip */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${!selectedCategory
              ? 'bg-brand text-white shadow-elevation-low'
              : 'bg-bg-secondary text-text-secondary hover:bg-interactive-hover/10 hover:text-interactive-hover border border-border'
            }
          `}
        >
          All Templates
        </button>

        {categories.map((category) => {
          const categoryId = category.id;
          const isSelected = selectedCategory === categoryId;

          return (
            <button
              key={categoryId}
              onClick={() => onCategorySelect(categoryId)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${isSelected
                  ? 'bg-brand text-white shadow-elevation-low'
                  : 'bg-bg-secondary text-text-secondary hover:bg-interactive-hover/10 hover:text-interactive-hover border border-border'
                }
              `}
              title={category.description}
            >
              <span>{category.name}</span>
              <span
                className={`ml-2 text-xs ${
                  isSelected ? 'text-white/80' : 'text-text-muted'
                }`}
              >
                {category.template_count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-bg-floating/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-interactive-normal hover:text-interactive-hover hover:bg-bg-floating transition-all shadow-elevation-medium"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
