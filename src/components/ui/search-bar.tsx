'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Hash, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Kbd } from './kbd';
import { useI18nStore } from '@/store/i18nStore';

export interface SearchSuggestion {
  id: string;
  type: 'recent' | 'trending' | 'tag' | 'author' | 'template';
  text: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface SearchBarProps extends React.ComponentProps<typeof Input> {
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  showSuggestions?: boolean;
  onSearch?: (query: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  onClearRecent?: () => void;
  debounceMs?: number;
  showShortcut?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({
  suggestions = [],
  recentSearches = [],
  showSuggestions = true,
  onSearch,
  onSuggestionClick,
  onClearRecent,
  debounceMs = 300,
  showShortcut = true,
  variant = 'default',
  className,
  ...props
}, ref) => {
  const { t, isRTL } = useI18nStore();
  const [value, setValue] = useState(props.value || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Combine ref forwarding
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else {
        ref.current = inputRef.current;
      }
    }
  }, [ref]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value) {
      debounceRef.current = setTimeout(() => {
        onSearch?.(String(value));
      }, debounceMs);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, onSearch, debounceMs]);

  // Global keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowDropdown(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    props.onChange?.(e);
    
    if (newValue && showSuggestions) {
      setShowDropdown(true);
      setHighlightedIndex(-1);
    }
  };

  // Handle focus/blur
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (showSuggestions) {
      setShowDropdown(true);
    }
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding dropdown to allow clicking on suggestions
    setTimeout(() => {
      setIsFocused(false);
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }, 200);
    props.onBlur?.(e);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown && (suggestions.length > 0 || recentSearches.length > 0)) {
      const totalItems = suggestions.length + recentSearches.length;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < totalItems - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : totalItems - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            if (highlightedIndex < recentSearches.length) {
              const recent = recentSearches[highlightedIndex];
              setValue(recent);
              onSearch?.(recent);
            } else {
              const suggestion = suggestions[highlightedIndex - recentSearches.length];
              onSuggestionClick?.(suggestion);
            }
          } else if (value) {
            onSearch?.(String(value));
          }
          setShowDropdown(false);
          inputRef.current?.blur();
          break;
        case 'Escape':
          setShowDropdown(false);
          inputRef.current?.blur();
          break;
      }
    }
    
    props.onKeyDown?.(e);
  };

  // Handle clear
  const handleClear = () => {
    setValue('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'recent') {
      setValue(suggestion.text);
      onSearch?.(suggestion.text);
    } else {
      onSuggestionClick?.(suggestion);
    }
    setShowDropdown(false);
  };

  // Get suggestion icon
  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    if (suggestion.icon) return suggestion.icon;
    
    switch (suggestion.type) {
      case 'recent':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-trending" />;
      case 'tag':
        return <Hash className="h-4 w-4 text-accent" />;
      case 'author':
        return <User className="h-4 w-4 text-primary" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const isCompact = variant === 'compact';
  const hasContent = value || isFocused;
  const showClearButton = value && isFocused;
  
  return (
    <div className={cn('relative', className)}>
      {/* Search Input Container */}
      <div className={cn(
        'relative flex items-center group',
        'bg-background/50 backdrop-blur-sm',
        'border border-border/50 rounded-lg',
        'transition-all duration-200',
        'hover:border-border',
        'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
        isCompact ? 'h-8' : 'h-10',
        hasContent && 'border-accent/50',
        className
      )}>
        {/* Search Icon */}
        <div className={cn(
          'flex items-center justify-center',
          'text-muted-foreground group-focus-within:text-accent',
          'transition-colors duration-200',
          isRTL ? 'pr-3' : 'pl-3'
        )}>
          <Search className={cn('h-4 w-4', isCompact && 'h-3.5 w-3.5')} />
        </div>

        {/* Input */}
        <Input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            'border-0 bg-transparent px-0 focus-visible:ring-0',
            'placeholder:text-muted-foreground',
            isRTL ? 'pr-2' : 'pl-2',
            isCompact ? 'h-6 text-sm' : 'h-8',
            showClearButton && (isRTL ? 'pl-8' : 'pr-8'),
            !showShortcut && (isRTL ? 'pl-3' : 'pr-3'),
            showShortcut && !showClearButton && (isRTL ? 'pl-12' : 'pr-12')
          )}
          placeholder={props.placeholder || t('common.search')}
          {...props}
        />

        {/* Clear Button */}
        <AnimatePresence>
          {showClearButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                'absolute flex items-center',
                isRTL ? 'left-2' : 'right-2'
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0 hover:bg-muted"
                tabIndex={-1}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">{t('common.clear')}</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcut */}
        {showShortcut && !showClearButton && (
          <div className={cn(
            'absolute flex items-center gap-1',
            isRTL ? 'left-3' : 'right-3'
          )}>
            <Kbd>⌘K</Kbd>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-full z-50 w-full mt-1',
              'bg-background/95 backdrop-blur-md',
              'border border-border/50 rounded-lg shadow-lg',
              'max-h-80 overflow-y-auto',
              'focus:outline-none',
              isRTL && 'right-0'
            )}
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-2">
                <div className={cn(
                  'flex items-center justify-between px-2 py-1 text-xs font-medium text-muted-foreground',
                  isRTL && 'flex-row-reverse'
                )}>
                  <span>{t('search.recent')}</span>
                  {onClearRecent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearRecent}
                      className="h-auto p-0 text-xs hover:text-foreground"
                    >
                      {t('common.clear')}
                    </Button>
                  )}
                </div>
                
                <div className="space-y-0.5">
                  {recentSearches.map((recent, index) => (
                    <div
                      key={`recent-${index}`}
                      onClick={() => handleSuggestionClick({ 
                        id: `recent-${index}`, 
                        type: 'recent', 
                        text: recent 
                      })}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer',
                        'hover:bg-muted transition-colors',
                        'text-sm text-foreground',
                        highlightedIndex === index && 'bg-accent/10 text-accent',
                        isRTL && 'flex-row-reverse text-right'
                      )}
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{recent}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separator */}
            {recentSearches.length > 0 && suggestions.length > 0 && (
              <div className="border-t border-border/50" />
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="space-y-0.5">
                  {suggestions.map((suggestion, index) => {
                    const adjustedIndex = index + recentSearches.length;
                    return (
                      <div
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer',
                          'hover:bg-muted transition-colors',
                          'text-sm text-foreground',
                          highlightedIndex === adjustedIndex && 'bg-accent/10 text-accent',
                          isRTL && 'flex-row-reverse text-right'
                        )}
                      >
                        <div className="flex-shrink-0">
                          {getSuggestionIcon(suggestion)}
                        </div>
                        <span className="truncate flex-1">{suggestion.text}</span>
                        {suggestion.count && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              'text-xs px-1.5 py-0.5',
                              isRTL && 'ml-auto'
                            )}
                          >
                            {suggestion.count}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export { SearchBar };