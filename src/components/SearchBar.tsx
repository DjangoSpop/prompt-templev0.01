'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock } from 'lucide-react';
import type { SearchSuggestion } from '@/lib/types';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search...", className = "" }: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches] = useState<string[]>(() => {
    // In a real app, this would come from localStorage or user preferences
    return ['email templates', 'marketing copy', 'code documentation'];
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value && value.length >= 2) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  }, [value]);

  const fetchSuggestions = async (query: string) => {
    try {
      setIsLoading(true);
      // Mock suggestions based on query
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mockSuggestions = [
        { text: `${query} templates`, type: 'template' as const },
        { text: `${query} examples`, type: 'template' as const },
        { text: `${query.split(' ')[0]} category`, type: 'category' as const },
      ];
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'template':
        return '📄';
      case 'category':
        return '📁';
      case 'tag':
        return '🏷️';
      default:
        return '🔍';
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-interactive-muted" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
        />
        
        {value && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-interactive-muted hover:text-interactive-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-floating border border-border rounded-lg shadow-elevation-high z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="inline-flex items-center space-x-2 text-text-muted">
                <div className="w-4 h-4 border-2 border-interactive-muted border-t-brand rounded-full animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Recent searches (shown when no query or no suggestions) */}
              {(!value || suggestions.length === 0) && recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-text-muted font-medium uppercase tracking-wide">
                    Recent Searches
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-3 py-2 hover:bg-interactive-hover/10 rounded transition-colors flex items-center space-x-2 text-text-secondary hover:text-text-primary"
                    >
                      <Clock className="w-3.5 h-3.5 text-interactive-muted" />
                      <span className="text-sm">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Search suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  {value && (
                    <div className="px-3 py-2 text-xs text-text-muted font-medium uppercase tracking-wide">
                      Suggestions
                    </div>
                  )}
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="w-full text-left px-3 py-2 hover:bg-interactive-hover/10 rounded transition-colors flex items-center space-x-2 text-text-secondary hover:text-text-primary"
                    >
                      <span className="text-sm">{getSuggestionIcon(suggestion.type)}</span>
                      <span className="text-sm">{suggestion.text}</span>
                      <span className="text-xs text-interactive-muted ml-auto capitalize">
                        {suggestion.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {value && suggestions.length === 0 && !isLoading && (
                <div className="p-4 text-center text-text-muted">
                  <div className="text-sm">No suggestions found for &quot;{value}&quot;</div>
                  <div className="text-xs mt-1">Try a different search term</div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}