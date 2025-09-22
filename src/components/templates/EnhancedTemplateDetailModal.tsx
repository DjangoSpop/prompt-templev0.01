"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Edit3
} from 'lucide-react';

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

// Smart syntax highlighter for template content
const TemplateHighlighter = ({ 
  content, 
  variables, 
  onVariableClick 
}: { 
  content: string;
  variables: Record<string, any>;
  onVariableClick: (key: string) => void;
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
      const index = match.index || 0;
      
      const replacement = `<span 
        class="template-variable ${hasValue ? 'has-value' : 'needs-value'}" 
        data-variable-key="${variableKey}"
        title="Click to edit ${variableKey}"
      >
        ${hasValue ? variables[variableKey] : fullMatch}
      </span>`;
      
      highlighted = highlighted.slice(0, index) + replacement + highlighted.slice(index + fullMatch.length);
    });
    
    return highlighted;
  }, [content, variables]);

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
        }
        
        .template-variable:hover {
          background: linear-gradient(135deg, #E9C25A 0%, #CBA135 100%);
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(203, 161, 53, 0.3);
        }
        
        .template-variable.needs-value {
          background: linear-gradient(135deg, #E74C3C 0%, #C0392B 100%);
          animation: pulse-glow 2s infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(231, 76, 60, 0.5); }
          50% { box-shadow: 0 0 15px rgba(231, 76, 60, 0.8); }
        }
      `}</style>
    </div>
  );
};

// Quick input modal for variables
const QuickVariableInput = ({ 
  variable, 
  value, 
  isOpen, 
  onClose, 
  onSave 
}: {
  variable: Variable;
  value: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: any) => void;
}) => {
  const [inputValue, setInputValue] = useState(value || variable.default_value || '');

  useEffect(() => {
    setInputValue(value || variable.default_value || '');
  }, [value, variable.default_value]);

  const handleSave = () => {
    onSave(inputValue);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && variable.type !== 'textarea') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className={[
              "p-0 overflow-hidden",
              isFullscreen
                  ? "fixed inset-0 !max-w-none !w-screen !h-[100dvh] rounded-none"
                  : [
                      "w-[100vw] max-w-[100vw] sm:w-auto",
                      "h-[88dvh] sm:h-[90dvh]",
                      "sm:max-w-full md:max-w-3xl lg:max-w-5xl xl:max-w-7xl",
                  ].join(" "),
          ].join(" ")}
          >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-pharaoh-gold" />
            <span>Edit {variable.label}</span>
          </DialogTitle>
          <DialogDescription>
            {variable.description || `Configure the value for ${variable.label}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {variable.description && (
            <p className="text-sm text-muted-foreground">{variable.description}</p>
          )}
          
          {variable.type === 'text' && (
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={variable.placeholder}
              className="focus:border-pharaoh-gold/50"
              autoFocus
            />
          )}
          
          {variable.type === 'textarea' && (
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={variable.placeholder}
              rows={4}
              className="focus:border-pharaoh-gold/50"
              autoFocus
            />
          )}
          
          {variable.type === 'select' && (
            <select
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-background focus:border-pharaoh-gold/50"
              autoFocus
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
                className="flex items-center"
              >
                {inputValue ? (
                  <ToggleRight className="w-8 h-8 text-pharaoh-gold" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                )}
                <span className="ml-2">{inputValue ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-pharaoh-gold hover:bg-pharaoh-gold/90 text-white"
            >
              Save
            </Button>
          </div>
        </div>
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
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Load template details
  useEffect(() => {
    if (isOpen && template.id) {
      loadTemplateDetail();
    }
  }, [isOpen, template.id]);

  const loadTemplateDetail = async () => {
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
            // Do not overwrite user's live variable edits in cache
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
  };

  const handleVariableChange = useCallback((key: string, value: any) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleVariableClick = useCallback((key: string) => {
    setActiveVariableEdit(key);
  }, []);

  const handleQuickSave = useCallback((key: string, value: any) => {
    handleVariableChange(key, value);
    const variableLabel = templateDetail?.variables?.find(v => v.key === key)?.label || key;
    toast.success(`${variableLabel} updated!`, {
      icon: '✨',
      duration: 2000,
    });
    // Persist the change to the in-memory cache so it survives modal close/open
    if (template && template.id) {
      templateVariablesCache[template.id] = {
        ...(templateVariablesCache[template.id] || {}),
        [key]: value,
      };
    }
  }, [handleVariableChange, templateDetail]);

  // Generate final prompt with variables filled in
  const finalPrompt = useMemo(() => {
    if (!templateDetail) return '';

    let prompt = templateDetail.template_content || '';
    
    // Handle conditional blocks (e.g., {{#benefits}}...{{/benefits}})
    // For now, we'll remove them since we don't have logic to handle them properly
    prompt = prompt.replace(/\{\{#[^}]+\}\}[\s\S]*?\{\{\/[^}]+\}\}/g, '');
    
    // Replace regular variables
    const varsArr = Array.isArray((templateDetail as any).variables) ? (templateDetail as any).variables : [];
    varsArr.forEach((variable: any) => {
      const value = variables[variable.key] ?? variable.default_value ?? `{{${variable.key}}}`;
      const regex = new RegExp(`\\{\\{${variable.key}\\}\\}`, 'g');
      prompt = prompt.replace(regex, String(value));
    });

    return prompt;
  }, [templateDetail, variables]);

  // Validation
  const validation = useMemo(() => {
    if (!templateDetail || !Array.isArray(templateDetail.variables)) return { isValid: false, errors: [], missingCount: 0 };
    
    const errors: string[] = [];
    const requiredFields = templateDetail.variables.filter(v => v.required);
    
    requiredFields.forEach(field => {
      if (!variables[field.key] || variables[field.key] === '') {
        errors.push(field.label);
      }
    });
    
    return { 
      isValid: errors.length === 0, 
      errors, 
      missingCount: errors.length,
      totalRequired: requiredFields.length 
    };
  }, [templateDetail, variables]);

  // Token count estimation
  const tokenCount = useMemo(() => {
    return Math.ceil(finalPrompt.length / 4);
  }, [finalPrompt]);

  const handleCopy = async () => {
    console.log('🔥 Copy button clicked!', { finalPrompt: finalPrompt.substring(0, 100) + '...' });
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(finalPrompt);
      toast.success('Prompt copied to clipboard!', {
        icon: '📋',
        duration: 3000,
      });
      console.log('✅ Copy successful');
    } catch (err) {
      console.error('❌ Copy failed:', err);
      toast.error('Failed to copy prompt');
    } finally {
      setIsCopying(false);
    }
  };

  const handleUse = () => {
    onUse(template.id);
    onClose();
  };

  const activeVariable = templateDetail?.variables?.find(v => v.key === activeVariableEdit);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-7xl ${isFullscreen ? 'w-screen h-screen max-w-none' : 'max-h-[90vh]'} p-0 overflow-hidden`}>
        <DialogHeader className="sr-only">
          <DialogTitle>{templateDetail?.title || 'Template Details'}</DialogTitle>
          <DialogDescription>
            {templateDetail?.description || 'Configure and preview template variables'}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-pharaoh-gold mx-auto mb-4" />
              <p className="text-muted-foreground">Loading template details...</p>
            </div>
          </div>
        ) : templateDetail ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-pharaoh-gold/5 to-nile-teal/5">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pharaoh-gold to-nile-teal rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{templateDetail.title}</h2>
                    <p className="text-sm text-muted-foreground">{templateDetail.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-pharaoh-gold fill-current" />
                    <span>{templateDetail.average_rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-nile-teal" />
                    <span>{templateDetail.usage_count.toLocaleString()}</span>
                  </div>
                  <Badge variant="outline" className="border-pharaoh-gold/30 text-pharaoh-gold">
                    {templateDetail.category.name}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Validation Status */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        {validation.isValid ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <span className="text-sm text-amber-600 font-medium">
                              {validation.missingCount}/{validation.totalRequired}
                            </span>
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {validation.isValid ? 'All required fields completed' : `${validation.missingCount} required fields missing`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Separator orientation="vertical" className="h-6" />
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        disabled={isCopying}
                        className="hover:bg-pharaoh-gold/10"
                      >
                        {isCopying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Copy generated prompt to clipboard
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="flex h-full">
                {/* Left Panel - Variables */}
                <div className="w-1/3 border-r border-border overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-foreground">Template Variables</h3>
                      <Badge variant={validation.isValid ? 'default' : 'secondary'} className="text-xs">
                        {templateDetail.variables?.length || 0} fields
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      {(templateDetail.variables || []).map((variable, index) => {
                        const hasValue = variables[variable.key] && variables[variable.key] !== '';
                        const isRequired = variable.required;
                        
                        return (
                          <motion.div
                            key={variable.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <Card className={`p-4 cursor-pointer transition-all hover:shadow-pyramid ${hasValue ? 'border-pharaoh-gold/30 bg-pharaoh-gold/5' : isRequired ? 'border-red-300/50 bg-red-50/30' : 'border-border'}`}>
                              <div 
                                className="space-y-3"
                                onClick={() => handleVariableClick(variable.key)}
                              >
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium text-foreground flex items-center">
                                    {isRequired && <span className="text-red-500 mr-1">*</span>}
                                    {variable.label}
                                  </label>
                                  <div className="flex items-center space-x-1">
                                    {variable.type === 'text' && <Type className="w-3 h-3 text-muted-foreground" />}
                                    {variable.type === 'textarea' && <FileText className="w-3 h-3 text-muted-foreground" />}
                                    {variable.type === 'select' && <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                                    {hasValue && <Check className="w-4 h-4 text-green-500" />}
                                  </div>
                                </div>
                                
                                {variable.description && (
                                  <p className="text-xs text-muted-foreground">{variable.description}</p>
                                )}
                                
                                <div className={`text-sm p-2 rounded bg-muted/30 border ${hasValue ? 'text-foreground border-pharaoh-gold/20' : 'text-muted-foreground border-dashed'}`}>
                                  {hasValue ? variables[variable.key] : (variable.placeholder || `Click to set ${variable.label.toLowerCase()}`)}
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Panel - Preview */}
                {showPreview && (
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
                          <Badge variant="outline" className="text-xs">
                            ~{tokenCount} tokens
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleCopy}
                            disabled={isCopying}
                            variant="ghost"
                            className="hover:bg-pharaoh-gold/10"
                          >
                            {isCopying ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Copy className="w-4 h-4 mr-2" />
                            )}
                            Copy
                          </Button>
                          
                          <Button
                            onClick={handleUse}
                            disabled={!validation.isValid}
                            variant="outline"
                            className="border-nile-teal text-nile-teal hover:bg-nile-teal hover:text-white disabled:opacity-50"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Use Template
                          </Button>
                        </div>
                      </div>

                      <TemplateHighlighter
                        content={templateDetail.template_content || ''}
                        variables={variables}
                        onVariableClick={handleVariableClick}
                      />
                      
                      {!validation.isValid && (
                        <motion.div
                          className="mt-4 p-4 border border-amber-200 bg-amber-50/50 rounded-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-amber-800 mb-1">
                                Missing Required Fields
                              </h4>
                              <p className="text-sm text-amber-700">
                                Please fill in: {validation.errors.join(', ')}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Quick Variable Input Modal */}
        {activeVariable && (
          <QuickVariableInput
            variable={activeVariable}
            value={variables[activeVariable.key]}
            isOpen={!!activeVariableEdit}
            onClose={() => setActiveVariableEdit(null)}
            onSave={(value) => handleQuickSave(activeVariable.key, value)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
