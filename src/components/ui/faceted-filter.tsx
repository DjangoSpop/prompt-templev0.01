'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, X, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { Checkbox } from './checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Command, CommandEmpty, CommandGroup, CommandList } from './command';
import { useI18nStore } from '@/store/i18nStore';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  multiSelect?: boolean;
  searchable?: boolean;
  showCount?: boolean;
  maxVisible?: number;
}

export interface FacetedFilterProps {
  groups: FilterGroup[];
  selectedValues: Record<string, string[]>;
  onSelectionChange: (groupId: string, values: string[]) => void;
  onClearAll?: () => void;
  title?: string;
  className?: string;
  variant?: 'default' | 'compact';
  showClearAll?: boolean;
}

const FacetedFilter: React.FC<FacetedFilterProps> = ({
  groups,
  selectedValues,
  onSelectionChange,
  onClearAll,
  title,
  className,
  variant = 'default',
  showClearAll = true,
}) => {
  const { t, isRTL } = useI18nStore();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  // Calculate total selected filters
  const totalSelected = useMemo(() => {
    return Object.values(selectedValues).reduce((total, values) => total + values.length, 0);
  }, [selectedValues]);

  // Group popover state is controlled via onOpenChange above

  // Handle option selection
  const handleOptionSelect = (groupId: string, value: string, multiSelect: boolean = true) => {
    const currentValues = selectedValues[groupId] || [];
    
    if (multiSelect) {
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      onSelectionChange(groupId, newValues);
    } else {
      const newValues = currentValues.includes(value) ? [] : [value];
      onSelectionChange(groupId, newValues);
      // Close popover for single select
      setOpenGroups(prev => ({ ...prev, [groupId]: false }));
    }
  };

  // Clear group selection
  const clearGroup = (groupId: string) => {
    onSelectionChange(groupId, []);
  };

  // Get filtered options for a group
  const getFilteredOptions = (group: FilterGroup) => {
    const searchQuery = searchQueries[group.id]?.toLowerCase() || '';
    if (!searchQuery) return group.options;
    
    return group.options.filter(option =>
      option.label.toLowerCase().includes(searchQuery) ||
      option.value.toLowerCase().includes(searchQuery)
    );
  };

  // Get visible options (respecting maxVisible)
  const getVisibleOptions = (group: FilterGroup) => {
    const filtered = getFilteredOptions(group);
    if (group.maxVisible && filtered.length > group.maxVisible && !searchQueries[group.id]) {
      return filtered.slice(0, group.maxVisible);
    }
    return filtered;
  };

  // Check if group has more options than visible
  const hasMoreOptions = (group: FilterGroup) => {
    const filtered = getFilteredOptions(group);
    return group.maxVisible && filtered.length > group.maxVisible && !searchQueries[group.id];
  };

  const isCompact = variant === 'compact';

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Header */}
      {title && (
        <div className={cn(
          'flex items-center justify-between',
          isRTL && 'flex-row-reverse'
        )}>
          <div className={cn(
            'flex items-center gap-2',
            isRTL && 'flex-row-reverse'
          )}>
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{title}</span>
          </div>
          
          {showClearAll && totalSelected > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className={cn(
                'h-auto p-0 text-xs text-muted-foreground hover:text-foreground',
                isRTL && 'mr-auto'
              )}
            >
              {t('common.clear')} ({totalSelected})
            </Button>
          )}
        </div>
      )}

      {/* Filter Groups */}
      <div className={cn(
        'flex flex-wrap gap-2',
        isCompact && 'gap-1',
        isRTL && 'flex-row-reverse'
      )}>
        {groups.map((group) => {
          const selectedInGroup = selectedValues[group.id] || [];
          const hasSelection = selectedInGroup.length > 0;

          return (
            <Popover
              key={group.id}
              open={openGroups[group.id]}
              onOpenChange={(open) => setOpenGroups(prev => ({ ...prev, [group.id]: open }))}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size={isCompact ? "sm" : "default"}
                  className={cn(
                    'justify-between gap-2',
                    'hover:bg-muted/50',
                    hasSelection && 'border-accent bg-accent/5',
                    isCompact && 'h-7 px-2 text-xs',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {group.label}
                    {hasSelection && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          'h-4 px-1.5 text-xs',
                          isCompact && 'h-3.5 px-1 text-[10px]'
                        )}
                      >
                        {selectedInGroup.length}
                      </Badge>
                    )}
                  </span>
                  <ChevronDown className={cn(
                    'h-3.5 w-3.5 opacity-50 transition-transform',
                    openGroups[group.id] && 'rotate-180'
                  )} />
                </Button>
              </PopoverTrigger>
              
              <PopoverContent 
                className={cn(
                  'w-64 p-0',
                  isRTL && 'text-right'
                )} 
                align={isRTL ? 'end' : 'start'}
              >
                <Command>
                  {/* Search Input */}
                  {group.searchable && (
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className={cn(
                          'absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground',
                          isRTL ? 'right-2' : 'left-2'
                        )} />
                        <Input
                          value={searchQueries[group.id] || ''}
                          onChange={(e) => setSearchQueries(prev => ({
                            ...prev,
                            [group.id]: e.target.value
                          }))}
                          placeholder={`${t('common.search')} ${group.label.toLowerCase()}...`}
                          className={cn(
                            'h-7 text-xs border-0 focus-visible:ring-0',
                            isRTL ? 'pr-8' : 'pl-8'
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <CommandList className="max-h-64">
                    {/* Header with clear option */}
                    {hasSelection && (
                      <div className="p-2 border-b">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearGroup(group.id)}
                          className={cn(
                            'w-full justify-start h-7 px-2 text-xs text-muted-foreground',
                            isRTL && 'justify-end'
                          )}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          {t('common.clear')} {group.label}
                        </Button>
                      </div>
                    )}

                    <CommandEmpty>
                      {t('search.noResults')}
                    </CommandEmpty>

                    <CommandGroup>
                      <div className="p-1 space-y-0.5">
                        {getVisibleOptions(group).map((option) => {
                          const isSelected = selectedInGroup.includes(option.value);
                          
                          return (
                            <div
                              key={option.value}
                              onClick={() => handleOptionSelect(group.id, option.value, group.multiSelect)}
                              className={cn(
                                'flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer',
                                'hover:bg-muted transition-colors',
                                'text-sm',
                                option.disabled && 'opacity-50 cursor-not-allowed',
                                isSelected && 'bg-accent/10 text-accent-foreground',
                                isRTL && 'flex-row-reverse'
                              )}
                            >
                              {group.multiSelect && (
                                <Checkbox
                                  checked={isSelected}
                                  className="h-4 w-4"
                                  disabled={option.disabled}
                                />
                              )}
                              
                              {option.icon && (
                                <div className="flex-shrink-0">
                                  {option.icon}
                                </div>
                              )}
                              
                              <span className="flex-1 truncate">
                                {option.label}
                              </span>
                              
                              {group.showCount && option.count !== undefined && (
                                <Badge 
                                  variant="secondary" 
                                  className="h-4 px-1.5 text-[10px] flex-shrink-0"
                                >
                                  {option.count}
                                </Badge>
                              )}
                              
                              {!group.multiSelect && isSelected && (
                                <Check className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Show More Button */}
                        {hasMoreOptions(group) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchQueries(prev => ({
                              ...prev,
                              [group.id]: ''
                            }))}
                            className={cn(
                              'w-full h-7 px-2 text-xs text-muted-foreground',
                              isRTL && 'justify-end'
                            )}
                          >
                            {t('common.showMore')} (+{getFilteredOptions(group).length - group.maxVisible!})
                          </Button>
                        )}
                      </div>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>

      {/* Active Filters Summary */}
      <AnimatePresence>
        {totalSelected > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-1 pt-2 border-t border-border/50"
          >
            {Object.entries(selectedValues).map(([groupId, values]) => {
              const group = groups.find(g => g.id === groupId);
              if (!group || values.length === 0) return null;
              
              return values.map((value) => {
                const option = group.options.find(opt => opt.value === value);
                if (!option) return null;
                
                return (
                  <Badge
                    key={`${groupId}-${value}`}
                    variant="secondary"
                    className={cn(
                      'gap-1 px-2 py-0.5 text-xs',
                      'hover:bg-muted/80 cursor-pointer transition-colors',
                      option.color && `bg-${option.color}/10 text-${option.color}-700 dark:text-${option.color}-300`
                    )}
                    onClick={() => handleOptionSelect(groupId, value, group.multiSelect)}
                  >
                    <span>{option.label}</span>
                    <X className="h-2.5 w-2.5" />
                  </Badge>
                );
              });
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { FacetedFilter };
