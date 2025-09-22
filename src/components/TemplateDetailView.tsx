'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/api-client';
import { TemplateDetail, PromptField } from '@/lib/types';
import { 
  Star, 
  User, 
  Calendar, 
  Eye, 
  Copy, 
  Play,
  Upload,
  Edit,
  FileJson,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TemplateDetailViewProps {
  templateId: string;
}

export default function TemplateDetailView({ templateId }: TemplateDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsing, setIsUsing] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [renderedPrompt, setRenderedPrompt] = useState<string>('');
  const [userRating, setUserRating] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showVariables, setShowVariables] = useState(true);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplateData = async () => {
      if (!templateId || templateId === 'undefined') {
        console.warn('Template ID is undefined or invalid:', templateId);
        setError('Invalid template ID. Please check the URL and try again.');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        console.log('Loading template with ID:', templateId);
        const templateData = await apiClient.getTemplate(templateId);
        setTemplate(templateData);
        
        // Initialize variables with default values
        const initialVars: Record<string, string> = {};
        templateData.fields?.forEach((field: PromptField) => {
          initialVars[field.label] = field.default_value || '';
        });
        setVariables(initialVars);
      } catch (error) {
        console.error('Failed to load template:', error);
        setError('Failed to load template. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTemplateData();
  }, [templateId]);

  useEffect(() => {
    const renderPromptContent = () => {
      if (!template) return;
      
      let rendered = template.template_content;
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        rendered = rendered.replace(regex, value);
      });
      setRenderedPrompt(rendered);
    };
    
    renderPromptContent();
  }, [template, variables]);

  const handleVariableChange = (fieldLabel: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
      
      // Track copy event (optional)
      try {
        await apiClient.trackEvent({
          event_type: 'content_copied',
          data: {
            template_id: template?.id,
            content_type: type,
            content_length: text.length,
          },
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setError('Failed to copy to clipboard');
    }
  };

  const exportAsJson = () => {
    if (!template) return;
    
    const exportData = {
      template: {
        id: template.id,
        title: template.title,
        description: template.description,
        content: template.template_content,
        category: template.category?.name,
        fields: template.fields,
        tags: template.tags,
      },
      variables: variables,
      renderedPrompt: renderedPrompt,
      exportedAt: new Date().toISOString(),
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    copyToClipboard(jsonString, 'JSON export');
  };

  const importFromJson = () => {
    try {
      const importData = JSON.parse(jsonInput);
      
      if (importData.variables) {
        setVariables(importData.variables);
      }
      
      if (importData.template && importData.template.content && template) {
        // If importing a different template content, ask for confirmation
        if (importData.template.content !== template.template_content) {
          const confirmed = confirm('This will replace the current template content. Continue?');
          if (confirmed) {
            setTemplate({
              ...template,
              template_content: importData.template.content,
              fields: importData.template.fields || template.fields,
            });
          }
        }
      }
      
      setShowJsonImport(false);
      setJsonInput('');
      setError(null);
      
      // Track import event (optional)
      try {
        apiClient.trackEvent({
          event_type: 'json_imported',
          data: {
            template_id: template?.id,
            has_variables: !!importData.variables,
            has_content: !!importData.template?.content,
          },
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
    } catch {
      setError('Invalid JSON format. Please check your input and try again.');
    }
  };

  const handleUseTemplate = async () => {
    if (!template) return;
    
    setIsUsing(true);
    try {
      try {
        await apiClient.trackEvent({
          event_type: 'template_used',
          data: {
            template_id: template.id,
            template_title: template.title,
            variables_filled: Object.keys(variables).filter(key => variables[key]).length,
            total_variables: Object.keys(variables).length,
          },
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
      
      await copyToClipboard(renderedPrompt, 'rendered prompt');
    } catch (error) {
      console.error('Failed to use template:', error);
      setError('Failed to process template');
    } finally {
      setIsUsing(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!template) return;
    
    try {
      await apiClient.rateTemplate(template.id, rating);
      setUserRating(rating);
      
      try {
        await apiClient.trackEvent({
          event_type: 'template_rated',
          data: {
            template_id: template.id,
            rating: rating,
          },
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
    } catch (error) {
      console.error('Failed to rate template:', error);
      setError('Failed to submit rating');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Template not found</h2>
        <p className="text-muted-foreground">The template you&apos;re looking for doesn&apos;t exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6 pb-[max(16px,env(safe-area-inset-bottom))]">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {copySuccess && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {copySuccess} copied to clipboard!
          </AlertDescription>
        </Alert>
      )}

      {/* Header Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold mb-2">{template.title}</CardTitle>
              <p className="text-muted-foreground mb-4">{template.description}</p>
              
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{template.author?.username || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(template.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{template.usage_count || 0} uses</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 min-w-0">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 cursor-pointer transition-colors ${
                      star <= (userRating || template.average_rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                    onClick={() => handleRating(star)}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  ({template.average_rating?.toFixed(1) || '0.0'})
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={exportAsJson}>
                  <FileJson className="h-4 w-4 mr-1" />
                  Export JSON
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowJsonImport(!showJsonImport)}>
                  <Upload className="h-4 w-4 mr-1" />
                  Import JSON
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* JSON Import Section */}
      {showJsonImport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Import from JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-32 p-3 border rounded-md resize-none font-mono text-sm"
              placeholder="Paste your JSON data here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <Button onClick={importFromJson} disabled={!jsonInput.trim()}>
                Import
              </Button>
              <Button variant="outline" onClick={() => setShowJsonImport(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Variables Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Template Variables</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVariables(!showVariables)}
              >
                {showVariables ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {showVariables && (
            <CardContent className="space-y-4">
              {template.fields && template.fields.length > 0 ? (
                template.fields.map((field: PromptField) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium">
                      {field.label}
                      {field.is_required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.field_type === 'textarea' ? (
                      <textarea
                        className="w-full p-3 border rounded-md resize-none"
                        rows={3}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        value={variables[field.label] || ''}
                        onChange={(e) => handleVariableChange(field.label, e.target.value)}
                      />
                    ) : field.field_type === 'dropdown' ? (
                      <select
                        className="w-full p-3 border rounded-md"
                        value={variables[field.label] || ''}
                        onChange={(e) => handleVariableChange(field.label, e.target.value)}
                      >
                        <option value="">Select {field.label.toLowerCase()}...</option>
                        {field.options && typeof field.options === 'object' && Array.isArray(field.options) && 
                          field.options.map((option: string, idx: number) => (
                            <option key={idx} value={option}>{option}</option>
                          ))
                        }
                      </select>
                    ) : (
                      <input
                        type={field.field_type === 'number' ? 'number' : 'text'}
                        className="w-full p-3 border rounded-md"
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        value={variables[field.label] || ''}
                        onChange={(e) => handleVariableChange(field.label, e.target.value)}
                      />
                    )}
                    {field.help_text && (
                      <p className="text-sm text-muted-foreground">{field.help_text}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No variables required for this template.
                </p>
              )}
            </CardContent>
          )}
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Rendered Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-slate-800 dark:text-slate-50 border rounded-md p-4 min-h-[200px] max-h-[400px] overflow-y-auto font-mono text-sm whitespace-pre-wrap">
              {renderedPrompt || 'Enter variables to see the rendered prompt...'}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                onClick={handleUseTemplate}
                disabled={isUsing || !renderedPrompt}
                className="flex-1 min-h-[44px] px-4 py-3"
              >
                {isUsing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Use Template
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(renderedPrompt, 'rendered prompt')}
                disabled={!renderedPrompt}
                className="min-h-[44px] min-w-[44px] px-4 py-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Content Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-slate-800 dark:text-slate-50 border rounded-md p-4 max-h-[300px] overflow-y-auto font-mono text-sm whitespace-pre-wrap">
            {template.template_content}
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(template.template_content, 'template content')}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Template
            </Button>
            {user && (
              <Button variant="outline" onClick={() => router.push(`/templates/${template.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category and Tags */}
      {(template.category || template.tags) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2 md:gap-4">
              {template.category && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Category: </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {template.category.name}
                  </span>
                </div>
              )}
              {template.tags && Array.isArray(template.tags) && template.tags.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Tags: </span>
                  <div className="inline-flex flex-wrap gap-1 max-w-full">
                    {template.tags.map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
