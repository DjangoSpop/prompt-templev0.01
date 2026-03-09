'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRecommendTemplates } from '@/hooks/api/useSmartTemplates';
import type { TemplateRecommendation } from '@/lib/api/typed-client';

interface AISearchBarProps {
  /** Called with the text query for keyword fallback or local filtering */
  onKeywordSearch: (query: string) => void;
  /** Called when user selects an AI recommendation */
  onRecommendationSelect?: (recommendation: TemplateRecommendation) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Sprint 4 — AI-powered search bar.
 * - Debounces at 500 ms
 * - When intent ≥ 10 chars, fires semantic search (1 credit)
 * - Falls back to keyword search when credits are depleted or query is short
 * - Drops down a results overlay with relevance scores
 */
export function AISearchBar({
  onKeywordSearch,
  onRecommendationSelect,
  placeholder = 'Search templates with AI…',
  className = '',
}: AISearchBarProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [aiMode, setAiMode] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Always fire keyword search for parent filtering
  useEffect(() => {
    onKeywordSearch(debouncedQuery);
  }, [debouncedQuery, onKeywordSearch]);

  // Semantic recommendations — only active in AI mode and query long enough
  const semanticEnabled = aiMode && debouncedQuery.length >= 10;
  const { data: recommendations, isFetching, isError } = useRecommendTemplates(
    semanticEnabled ? debouncedQuery : ''
  );

  // If AI errored (e.g. 402 insufficient credits), auto-fall back to keyword
  useEffect(() => {
    if (isError) setAiMode(false);
  }, [isError]);

  // Show dropdown when there are AI results and focus is inside
  useEffect(() => {
    setShowDropdown(
      semanticEnabled && !!recommendations && recommendations.length > 0
    );
  }, [semanticEnabled, recommendations]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (rec: TemplateRecommendation) => {
    setQuery(rec.title);
    setShowDropdown(false);
    onRecommendationSelect?.(rec);
  };

  const handleClear = () => {
    setQuery('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input row */}
      <div className="relative flex items-center">
        {/* Search icon / loading indicator */}
        <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (recommendations && recommendations.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-28 py-2.5 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          aria-label="Template search"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
        />

        {/* Right actions */}
        <div className="absolute right-2 inset-y-0 flex items-center gap-1.5">
          {/* Clear button */}
          {query && (
            <button
              onClick={handleClear}
              className="rounded-full p-0.5 hover:bg-muted transition-colors text-muted-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* AI mode toggle */}
          <button
            onClick={() => setAiMode((v) => !v)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              aiMode
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            title={aiMode ? 'AI search active (1 credit) — click to use keyword only' : 'AI search disabled — click to enable'}
            aria-pressed={aiMode}
          >
            <Sparkles className="h-3 w-3" />
            {aiMode ? 'AI' : 'KW'}
          </button>
        </div>
      </div>

      {/* Recommendations dropdown */}
      {showDropdown && recommendations && recommendations.length > 0 && (
        <div
          role="listbox"
          className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-2 border-b border-border flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>AI suggestions</span>
            <Badge variant="outline" className="text-[10px] ml-auto">1 credit</Badge>
          </div>

          <ul className="max-h-72 overflow-y-auto divide-y divide-border/50">
            {recommendations.map((rec) => (
              <li key={rec.template_id}>
                <button
                  role="option"
                  onClick={() => handleSelect(rec)}
                  className="w-full text-left px-3 py-2.5 hover:bg-accent/5 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {rec.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {Math.round(rec.relevance_score * 100)}%
                    </span>
                  </div>
                  {rec.reason && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {rec.reason}
                    </p>
                  )}
                  {rec.category && (
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      {rec.category}
                    </Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
