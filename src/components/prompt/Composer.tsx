'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Wand2, 
  Eye, 
  EyeOff,
  Copy,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import { usePromptStore } from '@/store/usePromptStore';
import { useSavedPromptsStore } from '@/store/saved-prompts';
import { TemplateGallery } from './TemplateGallery';
import { VariablesPanel } from './VariablesPanel';
import { cn } from '@/lib/utils';

interface ComposerProps {
  onSend?: (prompt: string, templateId?: string, variables?: Record<string, string | number | boolean>) => void;
  isLoading?: boolean;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

export function Composer({ 
  onSend, 
  isLoading = false, 
  className,
  layout = 'horizontal' 
}: ComposerProps) {
  const {
    templates,
    selectedTemplateId,
    variables,
    render,
    reset,
  } = usePromptStore();

  const [showPreview, setShowPreview] = useState(true);
  const [previewText, setPreviewText] = useState('');
  const [isValid, setIsValid] = useState(false);

  const selectedTemplate = selectedTemplateId 
    ? templates.find(t => t.id === selectedTemplateId) 
    : null;

  // Update preview when template or variables change
  useEffect(() => {
    if (selectedTemplate) {
      const rendered = render();
      setPreviewText(rendered);
      
      // Check if all required variables are filled
      const requiredVars = selectedTemplate.variables.filter(v => v.required);
      const hasAllRequired = requiredVars.every(v => 
        variables[v.name] !== undefined && 
        variables[v.name] !== '' && 
        variables[v.name] !== null
      );
      setIsValid(hasAllRequired);
    } else {
      setPreviewText('');
      setIsValid(false);
    }
  }, [selectedTemplate, variables, render]);

  const handleSend = () => {
    if (!selectedTemplate || !isValid || !previewText.trim()) return;
    
    onSend?.(previewText, selectedTemplateId || undefined, variables);
  };

  const handleCopyPreview = () => {
    if (previewText) {
      navigator.clipboard.writeText(previewText);
      // Could add toast notification here
    }
  };

  const handleSaveToLibrary = () => {
    if (!previewText.trim() || !selectedTemplate) return;
    
    const { openSaveModal } = useSavedPromptsStore.getState();
    openSaveModal({
      mode: 'save-from-template',
      sourceTemplateId: selectedTemplate.id,
      sourceTemplateName: selectedTemplate.title,
      initialData: {
        title: `${selectedTemplate.title} — filled`,
        content: previewText,
        description: `Generated from template "${selectedTemplate.title}"`,
        category: selectedTemplate.category || 'General',
        tags: selectedTemplate.tags || [],
        source: 'template',
        source_template_id: selectedTemplate.id,
        variables_snapshot: variables,
      },
    });
  };

  const handleTemplateSelect = (_templateId: string) => {
    // The store selectTemplate method will handle setting the template and resetting variables
    // No need to do anything here since TemplateGallery already calls selectTemplate
  };

  const renderPreviewPanel = () => (
    <Card className="pharaoh-card h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display font-semibold text-hieroglyph flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Prompt Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            {isValid ? (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Incomplete
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-8 w-8 p-0"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {showPreview && (
        <CardContent className="space-y-4">
          {!selectedTemplate ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wand2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">No Template Selected</p>
              <p className="text-sm">Choose a template to see the preview</p>
            </div>
          ) : (
            <>
              {/* Template Info */}
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <h4 className="font-medium text-sm">{selectedTemplate.title}</h4>
                  <p className="text-xs text-muted-foreground">{selectedTemplate.category}</p>
                </div>
                <div className="flex items-center gap-1">
                  {selectedTemplate.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Preview Content */}
              <div className="space-y-3">
                <div className="relative">
                  <div 
                    className={cn(
                      "min-h-[200px] p-3 border rounded-md bg-muted/30 text-sm font-mono whitespace-pre-wrap",
                      !isValid && "border-red-200 bg-red-50/50"
                    )}
                  >
                    {previewText || (
                      <span className="text-muted-foreground italic">
                        Configure variables to see preview...
                      </span>
                    )}
                  </div>
                  
                  {previewText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyPreview}
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Variable Status */}
                {selectedTemplate.variables.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center justify-between mb-1">
                      <span>Variables Status</span>
                      <span>
                        {selectedTemplate.variables.filter(v => variables[v.name] && variables[v.name] !== '').length} / {selectedTemplate.variables.length} completed
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className={cn(
                          "h-1 rounded-full transition-all duration-300",
                          isValid ? "bg-green-500" : "bg-pharaoh"
                        )}
                        style={{
                          width: `${(selectedTemplate.variables.filter(v => variables[v.name] && variables[v.name] !== '').length / selectedTemplate.variables.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Reset
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveToLibrary}
                      disabled={!isValid || !previewText.trim()}
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Save to Library
                    </Button>
                    
                    <Button
                      onClick={handleSend}
                      disabled={!isValid || isLoading || !previewText.trim()}
                      className="flex items-center gap-2 pharaoh-button"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Prompt
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );

  if (layout === 'vertical') {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Template Gallery */}
        <TemplateGallery 
          onSelectTemplate={handleTemplateSelect}
          selectedTemplateId={selectedTemplateId}
        />
        
        <Separator />
        
        {/* Variables Panel */}
        <VariablesPanel />
        
        <Separator />
        
        {/* Preview Panel */}
        {renderPreviewPanel()}
      </div>
    );
  }

  // Horizontal layout (default)
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      {/* Left Side: Template Selection & Variables */}
      <div className="space-y-6">
        <TemplateGallery 
          onSelectTemplate={handleTemplateSelect}
          selectedTemplateId={selectedTemplateId}
        />
        <VariablesPanel />
      </div>
      
      {/* Right Side: Preview */}
      <div className="space-y-6">
        {renderPreviewPanel()}
      </div>
    </div>
  );
}
