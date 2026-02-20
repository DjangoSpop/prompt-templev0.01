"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { TemplateDetail, TemplateList } from '@/lib/types';
import { normalizeTemplateDetail } from '@/lib/utils/template-normalizers';

// Simple in-memory caches to avoid refetching and to preserve variable edits
const templateDetailCache: Record<string, EnhancedTemplateDetail> = {};
const templateVariablesCache: Record<string, Record<string, any>> = {};

// Helper function to extract variables from template content if API doesn't provide them
const enhanceTemplateWithVariables = (template: EnhancedTemplateDetail): EnhancedTemplateDetail => {
  // If template already has variables, return as-is
  if (template.variables && Array.isArray(template.variables) && template.variables.length > 0) {
    return template;
  }

  // Extract variables from template content using regex
  const content = template.template_content || '';
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const matches = [...content.matchAll(variableRegex)];
  const uniqueVariables = new Set<string>();
  
  matches.forEach(match => {
    const variableKey = match[1].trim();
    // Skip conditional variables like #benefits, /benefits
    if (!variableKey.startsWith('#') && !variableKey.startsWith('/')) {
      uniqueVariables.add(variableKey);
    }
  });

  // Convert to Variable objects with sensible defaults
  const extractedVariables: Variable[] = Array.from(uniqueVariables).map(key => {
    const isRequired = ['subject_line', 'recipient_name', 'main_message'].includes(key);
    
    return {
      key,
      label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      type: key.includes('message') || key.includes('content') ? 'textarea' : 'text',
      required: isRequired,
      placeholder: `Enter ${key.replace(/_/g, ' ')}...`,
      description: `The ${key.replace(/_/g, ' ')} for this template`
    };
  });

  return {
    ...template,
    variables: extractedVariables
  };
};
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'react-hot-toast';
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Zap, 
  Star, 
  Users, 
  Clock,
  Check,
  Hash,
  Sparkles,
  Download,
  Save,
  Palette,
  Type,
  FileText,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  X,
  Paintbrush,
  Edit3,
  ArrowRight,
  Keyboard,
  ChevronLeft,
  Command,
  CornerDownLeft,
  Wand2,
  CircleDot,
  Target,
  Send,
  Rocket,
  RefreshCw
} from 'lucide-react';

// Smart suggestions for common variable types
const SMART_SUGGESTIONS: Record<string, string[]> = {
  'name': ['John', 'Sarah', 'Alex', 'Emma', 'Michael'],
  'company': ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Digital Dynamics'],
  'product': ['Premium Plan', 'Enterprise Suite', 'Starter Package', 'Pro Edition'],
  'topic': ['AI Technology', 'Digital Marketing', 'Business Growth', 'Innovation'],
  'industry': ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail'],
  'tone': ['Professional', 'Friendly', 'Casual', 'Formal', 'Enthusiastic'],
  'role': ['CEO', 'Marketing Manager', 'Developer', 'Designer', 'Analyst'],
  'email': ['hello@example.com', 'contact@company.com', 'info@business.com'],
};

interface Variable {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'boolean';
  required: boolean;
  description?: string;
  options?: string[];
  default_value?: any;
  placeholder?: string;
}

type EnhancedTemplateDetail = TemplateDetail & {
  variables?: Variable[];
  instructions?: string;
  examples?: Array<{
    name: string;
    inputs: Record<string, any>;
    output: string;
  }>;
};

interface EnhancedTemplateDetailModalProps {
  template: TemplateList;
  isOpen: boolean;
  onClose: () => void;
  onUse: (templateId: string) => void;
}

// Animated Progress Ring Component
const ProgressRing = ({ progress, size = 48, strokeWidth = 4 }: { progress: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-muted/30"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className="text-pharaoh-gold"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="text-xs font-bold text-pharaoh-gold"
          key={Math.round(progress)}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {Math.round(progress)}%
        </motion.span>
      </div>
    </div>
  );
};

// Quick Suggestion Chips Component  
const QuickSuggestions = ({ 
  variableKey, 
  onSelect,
  currentValue 
}: { 
  variableKey: string; 
  onSelect: (value: string) => void;
  currentValue: string;
}) => {
  // Find matching suggestions based on variable key patterns
  const getSuggestions = (): string[] => {
    const key = variableKey.toLowerCase();
    for (const [pattern, suggestions] of Object.entries(SMART_SUGGESTIONS)) {
      if (key.includes(pattern)) {
        return suggestions.filter(s => s !== currentValue);
      }
    }
    return [];
  };
  
  const suggestions = getSuggestions();
  if (suggestions.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Quick fill:</span>
      {suggestions.slice(0, 4).map((suggestion) => (
        <motion.button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          className="px-2 py-0.5 text-xs bg-pharaoh-gold/10 hover:bg-pharaoh-gold/20 text-pharaoh-gold border border-pharaoh-gold/20 rounded-full transition-all hover:scale-105"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.95 }}
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  );
};

// Inline Variable Editor - Optimized for rapid input (60 second prompt completion)
const InlineVariableEditor = ({
  variable,
  value,
  onChange,
  onNext,
  onPrevious,
  isActive,
  setActive,
  index,
  total,
  isLast,
  inputRef: externalInputRef
}: {
  variable: Variable;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isActive: boolean;
  setActive: () => void;
  index: number;
  total: number;
  isLast: boolean;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasValue = value && value !== '';
  
  // Sync external ref with internal ref
  useEffect(() => {
    if (externalInputRef && inputRef.current) {
      (externalInputRef as React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = inputRef.current;
    }
  });
  
  // Focus input when becoming active
  useEffect(() => {
    if (isActive && inputRef.current) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      // Small delay to ensure scroll completes, then focus
      setTimeout(() => {
        inputRef.current?.focus();
        if (inputRef.current && 'select' in inputRef.current) {
          (inputRef.current as HTMLInputElement).select();
        }
      }, 50);
    }
  }, [isActive]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        onPrevious();
      } else {
        onNext();
      }
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onNext();
    }
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isActive ? 1 : 0.98,
      }}
      transition={{ duration: 0.2 }}
      className={`relative group ${isActive ? 'z-10' : 'z-0'}`}
      onClick={setActive}
    >
      <Card 
        ref={cardRef}
        className={`
          p-3 transition-all duration-300 cursor-pointer overflow-hidden
          ${isActive 
            ? 'ring-2 ring-pharaoh-gold shadow-pyramid-lg border-pharaoh-gold/50' 
            : hasValue 
              ? 'border-green-500/30 bg-green-50/30 dark:bg-green-900/10 hover:border-pharaoh-gold/30' 
              : variable.required 
                ? 'border-amber-300/50 bg-amber-50/20 dark:bg-amber-900/10 hover:border-pharaoh-gold/30'
                : 'border-border hover:border-pharaoh-gold/30'
          }
        `}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`
              flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold
              ${hasValue ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}
            `}>
              {hasValue ? <Check className="w-3 h-3" /> : index + 1}
            </span>
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              {variable.required && <span className="text-red-500">*</span>}
              {variable.label}
            </label>
          </div>
          <div className="flex items-center gap-1">
            {variable.type === 'text' && <Type className="w-3 h-3 text-muted-foreground" />}
            {variable.type === 'textarea' && <FileText className="w-3 h-3 text-muted-foreground" />}
            {isActive && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-pharaoh-gold/30 text-pharaoh-gold">
                {index + 1}/{total}
              </Badge>
            )}
          </div>
        </div>
        
        {/* ALWAYS VISIBLE Input Field - key for instant Tab navigation */}
        {/* When active: full visibility. When not active: compact inline display */}
        <div className="mt-2">
          {variable.type === 'textarea' ? (
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => !isActive && setActive()}
              placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}...`}
              rows={isActive ? 3 : 1}
              tabIndex={0}
              aria-label={variable.label}
              autoComplete="off"
              className={`variable-input-field text-base sm:text-sm transition-all duration-200 ${
                isActive
                  ? 'border-pharaoh-gold focus:border-pharaoh-gold focus:ring-pharaoh-gold/30 focus:ring-2'
                  : 'border-muted hover:border-pharaoh-gold/50'
              } ${hasValue ? 'bg-green-50/30 dark:bg-green-900/10' : ''} resize-none`}
            />
          ) : variable.type === 'select' && variable.options ? (
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => !isActive && setActive()}
              tabIndex={0}
              aria-label={variable.label}
              className={`variable-input-field w-full p-2 text-base sm:text-sm border rounded-lg bg-background transition-all duration-200 ${
                isActive
                  ? 'border-pharaoh-gold focus:border-pharaoh-gold focus:ring-2 focus:ring-pharaoh-gold/30'
                  : 'border-muted hover:border-pharaoh-gold/50'
              }`}
            >
              <option value="">Select...</option>
              {variable.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={variable.type === 'number' ? 'number' : 'text'}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => !isActive && setActive()}
              placeholder={variable.placeholder || `Enter ${variable.label.toLowerCase()}...`}
              tabIndex={0}
              aria-label={variable.label}
              autoComplete="off"
              className={`variable-input-field text-base sm:text-sm transition-all duration-200 ${
                isActive
                  ? 'border-pharaoh-gold focus:border-pharaoh-gold focus:ring-pharaoh-gold/30 focus:ring-2'
                  : 'border-muted hover:border-pharaoh-gold/50'
              } ${hasValue ? 'bg-green-50/30 dark:bg-green-900/10' : ''}`}
            />
          )}
          
          {/* Quick Suggestions & Hints - only show when active */}
          {isActive && (
            <div className="mt-2 space-y-2">
              <QuickSuggestions 
                variableKey={variable.key} 
                onSelect={onChange}
                currentValue={value || ''}
              />
              
              {/* Keyboard hints */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-mono font-semibold">Tab</kbd>
                    <span>Next</span>
                  </span>
                  <span className="flex items-center gap-1 opacity-80">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-mono">⇧Tab</kbd>
                    <span>Back</span>
                  </span>
                </div>
                <Button
                  size="sm"
                  tabIndex={-1}
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  className={`h-7 px-3 text-xs font-medium transition-all ${isLast 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-pharaoh-gold hover:bg-pharaoh-gold/90 text-white'}`}
                >
                  {isLast ? (
                    <><Check className="w-3 h-3 mr-1" /> Done</>
                  ) : (
                    <>Next <ArrowRight className="w-3 h-3 ml-1" /></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Connection line to next */}
      {!isLast && (
        <div className="absolute left-4 top-full w-0.5 h-2 bg-border" />
      )}
    </motion.div>
  );
};

// Smart syntax highlighter for template content with enhanced interactivity
const TemplateHighlighter = ({ 
  content, 
  variables, 
  onVariableClick,
  activeVariable
}: { 
  content: string;
  variables: Record<string, any>;
  onVariableClick: (key: string) => void;
  activeVariable?: string;
}) => {
  const highlightedContent = useMemo(() => {
    let highlighted = content;
    
    // Find all template variables {{variable}}
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [...content.matchAll(variableRegex)];
    
    // Sort by position to replace from end to start (prevents index shifting)
    const sortedMatches = matches.sort((a, b) => (b.index || 0) - (a.index || 0));
    
    sortedMatches.forEach((match) => {
      const fullMatch = match[0];
      const variableKey = match[1].trim();
      const hasValue = variables[variableKey] && variables[variableKey] !== '';
      const isActive = activeVariable === variableKey;
      const index = match.index || 0;
      
      const replacement = `<span 
        class="template-variable ${hasValue ? 'has-value' : 'needs-value'} ${isActive ? 'is-active' : ''}" 
        data-variable-key="${variableKey}"
        title="Click to edit ${variableKey}"
      >
        ${hasValue ? variables[variableKey] : fullMatch}
      </span>`;
      
      highlighted = highlighted.slice(0, index) + replacement + highlighted.slice(index + fullMatch.length);
    });
    
    return highlighted;
  }, [content, variables, activeVariable]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const variableKey = target.getAttribute('data-variable-key');
    if (variableKey) {
      onVariableClick(variableKey);
    }
  };

  return (
    <div 
      className="relative bg-gradient-to-br from-desert-sand/10 to-pharaoh-gold/5 border border-pharaoh-gold/20 rounded-temple p-6 font-mono text-sm leading-relaxed cursor-pointer"
      onClick={handleClick}
    >
      <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />
      
      <style jsx>{`
        .template-variable {
          background: linear-gradient(135deg, #CBA135 0%, #A58129 100%);
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(203, 161, 53, 0.3);
          box-shadow: 0 1px 3px rgba(203, 161, 53, 0.2);
          display: inline-block;
        }
        
        .template-variable:hover {
          background: linear-gradient(135deg, #E9C25A 0%, #CBA135 100%);
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 2px 6px rgba(203, 161, 53, 0.3);
        }
        
        .template-variable.needs-value {
          background: linear-gradient(135deg, #E74C3C 0%, #C0392B 100%);
          animation: pulse-glow 2s infinite;
        }
        
        .template-variable.is-active {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
          animation: active-pulse 1s infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(231, 76, 60, 0.5); }
          50% { box-shadow: 0 0 15px rgba(231, 76, 60, 0.8); }
        }
        
        @keyframes active-pulse {
          0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 25px rgba(16, 185, 129, 0.7); }
        }
      `}</style>
    </div>
  );
};

// Quick input modal for variables - Enhanced with animations
const QuickVariableInput = ({ 
  variable, 
  value, 
  isOpen, 
  onClose, 
  onSave,
  onNext,
  hasNext
}: {
  variable: Variable;
  value: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: any) => void;
  onNext?: () => void;
  hasNext?: boolean;
}) => {
  const [inputValue, setInputValue] = useState(value || variable.default_value || '');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setInputValue(value || variable.default_value || '');
  }, [value, variable.default_value]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(inputValue);
    onClose();
  };

  const handleSaveAndNext = () => {
    onSave(inputValue);
    if (onNext && hasNext) {
      onNext();
    } else {
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && variable.type !== 'textarea') {
      e.preventDefault();
      handleSaveAndNext();
    } else if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSaveAndNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader className="p-4 pb-2 bg-gradient-to-r from-pharaoh-gold/10 to-nile-teal/10">
            <DialogTitle className="flex items-center gap-2 text-base">
              <motion.div
                className="w-8 h-8 rounded-lg bg-pharaoh-gold/20 flex items-center justify-center"
                whileHover={{ rotate: 10 }}
              >
                <Edit3 className="w-4 h-4 text-pharaoh-gold" />
              </motion.div>
              <span>{variable.label}</span>
              {variable.required && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Required</Badge>
              )}
            </DialogTitle>
            {variable.description && (
              <DialogDescription className="text-xs mt-1">
                {variable.description}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="p-4 space-y-3">
            {variable.type === 'text' && (
              <Input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={variable.placeholder}
                className="focus:border-pharaoh-gold focus:ring-pharaoh-gold/20 text-base"
              />
            )}
            
            {variable.type === 'textarea' && (
              <Textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={variable.placeholder}
                rows={4}
                className="focus:border-pharaoh-gold focus:ring-pharaoh-gold/20 resize-none"
              />
            )}
            
            {variable.type === 'select' && (
              <select
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-background focus:border-pharaoh-gold focus:ring-1 focus:ring-pharaoh-gold/20"
              >
                <option value="">Select an option...</option>
                {variable.options?.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
            
            {variable.type === 'boolean' && (
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setInputValue(!inputValue)}
                  className="flex items-center group"
                >
                  <motion.div whileTap={{ scale: 0.9 }}>
                    {inputValue ? (
                      <ToggleRight className="w-10 h-10 text-pharaoh-gold" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-muted-foreground group-hover:text-pharaoh-gold/50" />
                    )}
                  </motion.div>
                  <span className="ml-2 font-medium">{inputValue ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>
            )}
            
            {/* Quick Suggestions */}
            <QuickSuggestions 
              variableKey={variable.key} 
              onSelect={setInputValue}
              currentValue={inputValue}
            />
            
            {/* Keyboard shortcut hint */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-2 border-t border-border/50">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px]">Enter</kbd>
              <span>{hasNext ? 'Save & Next' : 'Save'}</span>
              <span className="mx-1">•</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px]">Esc</kbd>
              <span>Cancel</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 pt-2 bg-muted/30">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleSave}
                className="border-pharaoh-gold/30 hover:bg-pharaoh-gold/10"
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              {hasNext && (
                <Button 
                  size="sm"
                  onClick={handleSaveAndNext}
                  className="bg-pharaoh-gold hover:bg-pharaoh-gold/90 text-white"
                >
                  Next
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export function EnhancedTemplateDetailModal({
  template,
  isOpen,
  onClose,
  onUse
}: EnhancedTemplateDetailModalProps) {
  const [templateDetail, setTemplateDetail] = useState<EnhancedTemplateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [activeVariableEdit, setActiveVariableEdit] = useState<string | null>(null);
  const [activeVariableIndex, setActiveVariableIndex] = useState<number>(0);
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [viewMode, setViewMode] = useState<'flow' | 'list'>('flow');
  const [showCelebration, setShowCelebration] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [mobileTab, setMobileTab] = useState<'fill' | 'preview'>('fill');
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate final prompt with ALL variables properly replaced - ROBUST version
  const finalPrompt = useMemo(() => {
    if (!templateDetail) return '';

    let prompt = templateDetail.template_content || '';
    
    // Handle conditional blocks (e.g., {{#benefits}}...{{/benefits}}) - remove them
    prompt = prompt.replace(/\{\{#[^}]+\}\}[\s\S]*?\{\{\/[^}]+\}\}/g, '');
    
    // Get all variables - both from API and extracted
    const varsArr = Array.isArray((templateDetail as any).variables) ? (templateDetail as any).variables : [];
    
    // Create a combined map of all variable values
    const allVariableValues: Record<string, string> = {};
    
    // First, add default values from variable definitions
    varsArr.forEach((variable: any) => {
      if (variable.default_value) {
        allVariableValues[variable.key] = String(variable.default_value);
      }
    });
    
    // Then override with actual user-entered values (this takes priority)
    Object.keys(variables).forEach(key => {
      if (variables[key] && variables[key] !== '') {
        allVariableValues[key] = String(variables[key]);
      }
    });
    
    // Replace ALL {{variable}} patterns with their values
    // Handle multiple formats: {{var}}, {{ var }}, {{var }}, {{ var}}
    Object.keys(allVariableValues).forEach(key => {
      const value = allVariableValues[key];
      // Create regex that matches the exact variable name with optional whitespace
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      prompt = prompt.replace(regex, value);
    });
    
    // Also do a second pass with generic regex to catch any remaining variables
    prompt = prompt.replace(/\{\{\s*([^}#/\s]+)\s*\}\}/g, (match, varKey) => {
      const key = varKey.trim();
      const value = allVariableValues[key];
      return value || match; // Keep placeholder if no value
    });

    // Clean up any extra whitespace
    prompt = prompt.replace(/\n{3,}/g, '\n\n').trim();

    return prompt;
  }, [templateDetail, variables]);

  // Validation with progress - MUST be declared before hooks that use it
  const validation = useMemo(() => {
    if (!templateDetail || !Array.isArray(templateDetail.variables)) {
      return { isValid: false, errors: [], missingCount: 0, totalRequired: 0, progress: 0, filledCount: 0 };
    }
    
    const errors: string[] = [];
    const requiredFields = templateDetail.variables.filter(v => v.required);
    const allFields = templateDetail.variables;
    
    let filledCount = 0;
    allFields.forEach(field => {
      if (variables[field.key] && variables[field.key] !== '') {
        filledCount++;
      }
    });
    
    requiredFields.forEach(field => {
      if (!variables[field.key] || variables[field.key] === '') {
        errors.push(field.label);
      }
    });
    
    const progress = allFields.length > 0 ? (filledCount / allFields.length) * 100 : 0;
    
    return { 
      isValid: errors.length === 0, 
      errors, 
      missingCount: errors.length,
      totalRequired: requiredFields.length,
      progress,
      filledCount
    };
  }, [templateDetail, variables]);

  // Token count estimation
  const tokenCount = useMemo(() => {
    return Math.ceil(finalPrompt.length / 4);
  }, [finalPrompt]);

  // Memoized load function
  const loadTemplateDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear previous detail while fetching fresh data
      setTemplateDetail(null);
      setVariables({});

      // Use cached detail if available
      const cached = templateDetailCache[template.id];
      if (cached) {
        // Ensure cached template has variables (enhance if needed)
        const enhancedCached = enhanceTemplateWithVariables(cached);
        setTemplateDetail(enhancedCached);

        // Use cached variables if present, otherwise initialize from cached detail
        const cachedVars = templateVariablesCache[template.id];
        if (cachedVars) {
          setVariables(cachedVars);
        } else {
          const initialVariables: Record<string, any> = {};
          (enhancedCached.variables || []).forEach((variable: any) => {
            initialVariables[variable.key] = variable.default_value ?? '';
          });
          setVariables(initialVariables);
        }

        // Revalidate in background (non-blocking)
        (async () => {
          try {
            const fresh = normalizeTemplateDetail(await apiClient.getTemplate(template.id));
            const enhancedFresh = enhanceTemplateWithVariables(fresh);
            templateDetailCache[template.id] = enhancedFresh;
          } catch (e) {
            // ignore background refresh errors
          }
        })();
        return;
      }

      // Fetch template detail from API
      const data = normalizeTemplateDetail(await apiClient.getTemplate(template.id));
      if (!data) throw new Error('Template not found');

      // Enhance the template detail with extracted variables if API doesn't provide them
      const enhancedData = enhanceTemplateWithVariables(data);
      
      templateDetailCache[template.id] = enhancedData;
      setTemplateDetail(enhancedData);

      // Initialize variables with defaults from API response or cached values
      const initialVariables: Record<string, any> = {};
      (enhancedData.variables || []).forEach((variable: any) => {
        initialVariables[variable.key] = variable.default_value ?? '';
      });
      // If we have previously stored user edits for this template, prefer them
      const prevVars = templateVariablesCache[template.id];
      setVariables(prevVars ?? initialVariables);
      
    } catch (error) {
      console.error('Failed to load template detail:', error);
      toast.error('Failed to load template details');
    } finally {
      setIsLoading(false);
    }
  }, [template.id]);

  // Load template details
  useEffect(() => {
    if (isOpen && template.id) {
      loadTemplateDetail();
    }
  }, [isOpen, template.id, loadTemplateDetail]);

  // Auto-focus first empty variable ONLY when template first loads (not on every keystroke)
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    // Only run once when template loads, not on subsequent variable changes
    if (templateDetail?.variables && viewMode === 'flow' && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const firstEmptyIndex = templateDetail.variables.findIndex(
        v => !variables[v.key] || variables[v.key] === ''
      );
      setActiveVariableIndex(firstEmptyIndex >= 0 ? firstEmptyIndex : 0);
    }
  }, [templateDetail, viewMode]); // Removed 'variables' dependency - this is the key fix!

  // Reset initialization flag when modal closes; reset mobile tab when it opens
  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
    } else {
      setMobileTab('fill');
    }
  }, [isOpen]);

  // Memoized handlers - Enhanced copy with visual feedback
  const handleCopy = useCallback(async () => {
    if (!finalPrompt || finalPrompt.trim() === '') {
      toast.error('No prompt content to copy');
      return;
    }
    
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(finalPrompt);
      setCopySuccess(true);
      
      // Count how many variables were filled vs remaining placeholders
      const remainingPlaceholders = (finalPrompt.match(/\{\{[^}]+\}\}/g) || []).length;
      const filledCount = validation.filledCount;
      
      if (remainingPlaceholders > 0) {
        toast.success(`Prompt copied! (${remainingPlaceholders} placeholder${remainingPlaceholders > 1 ? 's' : ''} remaining)`, {
          icon: '📋',
          duration: 3000,
        });
      } else {
        toast.success('Complete prompt copied to clipboard! 🎉', {
          icon: '✅',
          duration: 3000,
        });
      }
      
      // Reset success state after animation
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = finalPrompt;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        toast.success('Prompt copied to clipboard!', { icon: '📋', duration: 3000 });
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        toast.error('Failed to copy prompt. Please select and copy manually.');
      }
    } finally {
      setIsCopying(false);
    }
  }, [finalPrompt, validation.filledCount]);

  const handleUse = useCallback(() => {
    onUse(template.id);
    onClose();
  }, [onUse, template.id, onClose]);

  const handleResetAll = useCallback(() => {
    const resetVars: Record<string, any> = {};
    templateDetail?.variables?.forEach(v => {
      resetVars[v.key] = v.default_value ?? '';
    });
    setVariables(resetVars);
    if (template?.id) {
      templateVariablesCache[template.id] = resetVars;
    }
    setActiveVariableIndex(0);
    toast.success('All variables reset!', { icon: '🔄' });
  }, [templateDetail, template?.id]);

  // Create refs for all variable inputs - enables direct Tab navigation
  const inputRefsMap = useRef<Map<number, React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>>>(new Map());
  
  // Get or create ref for a specific index
  const getInputRef = useCallback((index: number) => {
    if (!inputRefsMap.current.has(index)) {
      inputRefsMap.current.set(index, { current: null });
    }
    return inputRefsMap.current.get(index)!;
  }, []);

  // Focus specific variable input by index
  const focusVariableInput = useCallback((index: number) => {
    const ref = inputRefsMap.current.get(index);
    if (ref?.current) {
      ref.current.focus();
      if ('select' in ref.current) {
        (ref.current as HTMLInputElement).select();
      }
    }
  }, []);

  // Enhanced navigation that directly focuses the input
  const navigateAndFocus = useCallback((direction: 'next' | 'prev') => {
    if (!templateDetail?.variables) return;
    
    const newIndex = direction === 'next' 
      ? Math.min(activeVariableIndex + 1, templateDetail.variables.length - 1)
      : Math.max(activeVariableIndex - 1, 0);
    
    if (newIndex !== activeVariableIndex || direction === 'next') {
      setActiveVariableIndex(newIndex);
      // Direct focus after state update
      requestAnimationFrame(() => {
        focusVariableInput(newIndex);
      });
    }
    
    // Check completion on last item
    if (direction === 'next' && activeVariableIndex === templateDetail.variables.length - 1) {
      if (validation.isValid) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
        toast.success('All variables filled! Ready to use! 🎉', { duration: 3000 });
      }
    }
  }, [activeVariableIndex, templateDetail, validation.isValid, focusVariableInput]);

  // Keyboard shortcuts - enhanced with global Tab navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Ctrl/Cmd + Enter to copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCopy();
      }
      // Ctrl/Cmd + Shift + Enter to use template
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        if (validation.isValid) handleUse();
      }
      
      // Global Tab navigation when in flow mode - catch Tab even from outside inputs
      if (viewMode === 'flow' && e.key === 'Tab') {
        const target = e.target as HTMLElement;
        const isInVariableInput = target.closest('.variable-input-field');
        
        // If Tab pressed but not in a variable input, still navigate
        if (!isInVariableInput && containerRef.current?.contains(target)) {
          e.preventDefault();
          if (e.shiftKey) {
            navigateAndFocus('prev');
          } else {
            navigateAndFocus('next');
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, validation.isValid, handleCopy, handleUse, viewMode, navigateAndFocus]);

  const handleVariableChange = useCallback((key: string, value: any) => {
    setVariables(prev => {
      const newVars = { ...prev, [key]: value };
      // Persist to cache
      if (template?.id) {
        templateVariablesCache[template.id] = newVars;
      }
      return newVars;
    });
  }, [template?.id]);

  const handleVariableClick = useCallback((key: string) => {
    const index = templateDetail?.variables?.findIndex(v => v.key === key) ?? -1;
    if (index >= 0) {
      setActiveVariableIndex(index);
      if (viewMode === 'list') {
        setActiveVariableEdit(key);
      }
      // Immediate focus for click navigation too
      queueMicrotask(() => {
        const ref = inputRefsMap.current.get(index);
        ref?.current?.focus();
      });
    }
  }, [templateDetail, viewMode]);

  const handleQuickSave = useCallback((key: string, value: any) => {
    handleVariableChange(key, value);
    const variableLabel = templateDetail?.variables?.find(v => v.key === key)?.label || key;
    toast.success(`${variableLabel} updated!`, {
      icon: '✨',
      duration: 2000,
    });
  }, [handleVariableChange, templateDetail]);

  // Navigate to next variable with INSTANT focus - key for professional UX
  const navigateToNextVariable = useCallback(() => {
    if (!templateDetail?.variables) return;
    const nextIndex = activeVariableIndex + 1;
    if (nextIndex < templateDetail.variables.length) {
      setActiveVariableIndex(nextIndex);
      // Use queueMicrotask for the fastest possible focus after state update
      queueMicrotask(() => {
        const ref = inputRefsMap.current.get(nextIndex);
        if (ref?.current) {
          ref.current.focus();
          if (typeof ref.current.select === 'function') {
            ref.current.select();
          }
        }
      });
    } else {
      // All filled - show celebration if all required are done
      if (validation.isValid) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
        toast.success('All variables filled! Ready to use! 🎉', { duration: 3000 });
      }
    }
  }, [activeVariableIndex, templateDetail, validation.isValid]);

  // Navigate to previous variable with INSTANT focus
  const navigateToPreviousVariable = useCallback(() => {
    if (activeVariableIndex > 0) {
      const prevIndex = activeVariableIndex - 1;
      setActiveVariableIndex(prevIndex);
      // Use queueMicrotask for the fastest possible focus after state update
      queueMicrotask(() => {
        const ref = inputRefsMap.current.get(prevIndex);
        if (ref?.current) {
          ref.current.focus();
          if (typeof ref.current.select === 'function') {
            ref.current.select();
          }
        }
      });
    }
  }, [activeVariableIndex]);

  const handleNextFromModal = useCallback(() => {
    const currentVar = templateDetail?.variables?.[activeVariableIndex];
    if (currentVar) {
      const nextIndex = activeVariableIndex + 1;
      if (nextIndex < (templateDetail?.variables?.length || 0)) {
        setActiveVariableEdit(templateDetail?.variables?.[nextIndex]?.key || null);
        setActiveVariableIndex(nextIndex);
      } else {
        setActiveVariableEdit(null);
      }
    }
  }, [activeVariableIndex, templateDetail]);

  const activeVariable = templateDetail?.variables?.find(v => v.key === activeVariableEdit);
  const currentFlowVariable = templateDetail?.variables?.[activeVariableIndex];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'w-screen h-screen max-w-none rounded-none' : 'w-full h-[100dvh] max-w-none rounded-none sm:max-w-3xl sm:h-auto sm:max-h-[85vh] sm:rounded-lg'} p-0 overflow-hidden flex flex-col`}>
        <DialogHeader className="sr-only">
          <DialogTitle>{templateDetail?.title || 'Template Details'}</DialogTitle>
          <DialogDescription>
            {templateDetail?.description || 'Configure and preview template variables'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', damping: 10 }}
                className="bg-gradient-to-br from-pharaoh-gold to-nile-teal p-8 rounded-3xl shadow-2xl"
              >
                <Sparkles className="w-16 h-16 text-white mx-auto mb-2" />
                <p className="text-white text-xl font-bold">All Set!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-10 h-10 text-pharaoh-gold mx-auto mb-4" />
              </motion.div>
              <p className="text-muted-foreground">Loading template...</p>
            </motion.div>
          </div>
        ) : templateDetail ? (
          <div className="flex flex-col h-full">
            {/* Enhanced Header with Progress */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-pharaoh-gold/5 via-transparent to-nile-teal/5">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <motion.div
                  className="w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br from-pharaoh-gold to-nile-teal rounded-lg sm:rounded-xl flex items-center justify-center shadow-pyramid"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-foreground line-clamp-1">{templateDetail.title}</h2>
                  <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-pharaoh-gold fill-current" />
                      {templateDetail.average_rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {templateDetail.usage_count.toLocaleString()}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {templateDetail.category.name}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {/* Progress Ring */}
                <ProgressRing progress={validation.progress} size={40} strokeWidth={3} />

                <Separator orientation="vertical" className="hidden sm:block h-8" />

                {/* View Mode Toggle — desktop only */}
                <div className="hidden sm:flex items-center bg-muted/50 rounded-lg p-0.5">
                  <Button
                    variant={viewMode === 'flow' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('flow')}
                    className={`h-7 px-2 text-xs ${viewMode === 'flow' ? 'bg-pharaoh-gold text-white' : ''}`}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Flow
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-7 px-2 text-xs ${viewMode === 'list' ? 'bg-pharaoh-gold text-white' : ''}`}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    List
                  </Button>
                </div>

                <Separator orientation="vertical" className="hidden sm:block h-8" />

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleResetAll}
                          className="h-9 w-9 sm:h-8 sm:w-8 p-0"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reset all fields</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Eye & Fullscreen — desktop only (mobile uses tab bar instead) */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="hidden sm:inline-flex h-8 w-8 p-0"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="hidden sm:inline-flex h-8 w-8 p-0"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>

                  <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 sm:h-8 sm:w-8 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Tab Bar — hidden on sm+ (desktop uses side-by-side panels) */}
            <div className="flex sm:hidden border-b border-border flex-shrink-0">
              <button
                onClick={() => setMobileTab('fill')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  mobileTab === 'fill'
                    ? 'text-pharaoh-gold border-b-2 border-pharaoh-gold'
                    : 'text-muted-foreground'
                }`}
              >
                Fill Variables
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  mobileTab === 'preview'
                    ? 'text-pharaoh-gold border-b-2 border-pharaoh-gold'
                    : 'text-muted-foreground'
                }`}
              >
                Preview
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Left Panel - Variable Input */}
              <div
                className={`
                  w-full border-r border-border overflow-y-auto
                  ${mobileTab === 'fill' ? 'block' : 'hidden'}
                  sm:block ${showPreview ? 'sm:w-2/5' : 'sm:w-full'}
                `}
                ref={containerRef}
              >
                <div className="p-4">
                  {/* Quick Stats Bar - Shows progress prominently */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-pharaoh-gold/5 to-nile-teal/5 rounded-lg border border-pharaoh-gold/10">
                    <div className="flex items-center gap-4">
                      {/* Progress indicator */}
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-pharaoh-gold to-nile-teal rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${validation.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <span className="text-sm font-bold text-pharaoh-gold">{Math.round(validation.progress)}%</span>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500" />
                          {validation.filledCount} filled
                        </span>
                        {validation.missingCount > 0 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertCircle className="w-3 h-3" />
                            {validation.missingCount} required
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {validation.isValid && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-1 text-xs text-green-600 font-medium"
                        >
                          <Sparkles className="w-3 h-3" />
                          Ready!
                        </motion.div>
                      )}
                      <Badge 
                        variant={validation.isValid ? 'default' : 'secondary'} 
                        className={`text-[10px] ${validation.isValid ? 'bg-green-500 hover:bg-green-600' : ''}`}
                      >
                        {validation.isValid ? '✓ Complete' : `${validation.filledCount}/${templateDetail.variables?.length || 0}`}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Variables List - Tab-navigable with rapid iteration */}
                  <div className="space-y-2" role="list" aria-label="Template variables">
                    {(templateDetail.variables || []).map((variable, index) => (
                      <InlineVariableEditor
                        key={variable.key}
                        variable={variable}
                        value={variables[variable.key]}
                        onChange={(value) => handleVariableChange(variable.key, value)}
                        onNext={navigateToNextVariable}
                        onPrevious={navigateToPreviousVariable}
                        isActive={viewMode === 'flow' && index === activeVariableIndex}
                        setActive={() => {
                          setActiveVariableIndex(index);
                          // Focus when clicking on a card
                          requestAnimationFrame(() => {
                            const ref = inputRefsMap.current.get(index);
                            ref?.current?.focus();
                          });
                        }}
                        index={index}
                        total={templateDetail.variables?.length || 0}
                        isLast={index === (templateDetail.variables?.length || 0) - 1}
                        inputRef={getInputRef(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel - Preview */}
              {(showPreview || mobileTab === 'preview') && (
                <div
                  className={`
                    w-full overflow-y-auto bg-muted/10
                    ${mobileTab === 'preview' ? 'block' : 'hidden'}
                    ${showPreview ? 'sm:block sm:flex-1' : 'sm:hidden'}
                  `}
                >
                  <div className="p-4 space-y-4">
                    {/* Final Prompt Preview - What will be copied */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">📋 Final Prompt</h3>
                          <Badge variant="outline" className="text-[10px]">
                            ~{tokenCount} tokens
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant={copySuccess ? "default" : "outline"}
                          onClick={handleCopy}
                          disabled={isCopying}
                          className={`h-7 text-xs transition-all ${
                            copySuccess 
                              ? 'bg-green-500 hover:bg-green-600 text-white' 
                              : 'border-pharaoh-gold/30 hover:bg-pharaoh-gold/10'
                          }`}
                        >
                          {isCopying ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : copySuccess ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            <Copy className="w-3 h-3 mr-1" />
                          )}
                          {copySuccess ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      
                      {/* Actual final prompt text - this is what gets copied */}
                      <div 
                        className="relative bg-background border border-border rounded-lg p-4 font-mono text-sm leading-relaxed max-h-[300px] overflow-y-auto cursor-text select-text"
                        onClick={(e) => {
                          // Select all text on click for easy manual copy
                          const selection = window.getSelection();
                          const range = document.createRange();
                          range.selectNodeContents(e.currentTarget);
                          selection?.removeAllRanges();
                          selection?.addRange(range);
                        }}
                      >
                        <pre className="whitespace-pre-wrap break-words text-foreground">
                          {finalPrompt || 'Fill in the variables to generate your prompt...'}
                        </pre>
                        
                        {/* Copy hint overlay */}
                        {!copySuccess && finalPrompt && (
                          <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-muted-foreground bg-background/90 px-2 py-1 rounded">
                              Click to select all
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Template Structure - Shows variable highlighting */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-xs font-medium text-muted-foreground">Template Structure</h4>
                      </div>
                      <TemplateHighlighter
                        content={templateDetail.template_content || ''}
                        variables={variables}
                        onVariableClick={handleVariableClick}
                        activeVariable={currentFlowVariable?.key}
                      />
                    </div>
                    
                    {/* Missing Fields Warning */}
                    {!validation.isValid && (
                      <motion.div
                        className="p-3 border border-amber-200/50 bg-amber-50/30 dark:bg-amber-900/10 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <span className="font-medium text-amber-700 dark:text-amber-400">Missing required: </span>
                            <span className="text-amber-600 dark:text-amber-500">{validation.errors.join(', ')}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Success indicator when all filled */}
                    {validation.isValid && (
                      <motion.div
                        className="p-3 border border-green-200/50 bg-green-50/30 dark:bg-green-900/10 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs font-medium text-green-700 dark:text-green-400">
                            All variables filled! Ready to copy.
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Floating Action Bar */}
            <motion.div 
              className="sticky bottom-0 p-3 border-t border-border bg-background/95 backdrop-blur-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                {/* Keyboard Shortcuts Hint */}
                <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">⌘/Ctrl + Enter</kbd>
                    Copy
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">Tab</kbd>
                    Next field
                  </span>
                </div>
                
                {/* Main Actions */}
                <div className="flex flex-wrap items-center gap-2 ml-auto">
                  <Button
                    variant={copySuccess ? "default" : "outline"}
                    onClick={handleCopy}
                    disabled={isCopying}
                    className={`min-h-[44px] sm:min-h-0 transition-all duration-300 ${
                      copySuccess
                        ? 'bg-green-500 hover:bg-green-600 text-white border-green-500'
                        : 'border-pharaoh-gold/30 hover:bg-pharaoh-gold/10 hover:border-pharaoh-gold'
                    }`}
                  >
                    {isCopying ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : copySuccess ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copySuccess ? 'Copied!' : 'Copy Prompt'}
                  </Button>

                  {/* Copy & Close - Most common action after filling variables */}
                  {validation.isValid && (
                    <Button
                      onClick={async () => {
                        await handleCopy();
                        setTimeout(() => onClose(), 500);
                      }}
                      className="min-h-[44px] sm:min-h-0 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Copy & Done
                    </Button>
                  )}

                  <Button
                    onClick={handleUse}
                    disabled={!validation.isValid}
                    className="min-h-[44px] sm:min-h-0 bg-gradient-to-r from-pharaoh-gold to-nile-teal hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Use Template
                    {validation.isValid && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-2"
                      >
                        ✓
                      </motion.span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}

        {/* Quick Variable Input Modal (for list mode) */}
        {activeVariable && viewMode === 'list' && (
          <QuickVariableInput
            variable={activeVariable}
            value={variables[activeVariable.key]}
            isOpen={!!activeVariableEdit}
            onClose={() => setActiveVariableEdit(null)}
            onSave={(value) => handleQuickSave(activeVariable.key, value)}
            onNext={handleNextFromModal}
            hasNext={activeVariableIndex < (templateDetail?.variables?.length || 0) - 1}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
