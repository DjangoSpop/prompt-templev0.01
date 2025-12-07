'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, Save, X, Search, Eye, EyeOff, Code, Type, Hash, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { TemplateDetail, TemplateCreateUpdate, TemplateCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { toast } from 'sonner';

interface TemplateEditorProps {
  onClose?: () => void;
  templateId?: string; // For editing existing template
  onSave?: (template: TemplateDetail) => void;
}

export default function TemplateEditor({ onClose, templateId, onSave }: TemplateEditorProps) {
  const [template, setTemplate] = useState<Partial<TemplateCreateUpdate>>({
    title: '',
    description: '',
    template_content: '',
    category: 0,
    version: '1.0',
    is_public: true,
    tags: [],
  });
  
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [variableHelperOpen, setVariableHelperOpen] = useState(false);

  // Common variable suggestions
  const commonVariables = [
    { name: 'name', description: 'User or recipient name' },
    { name: 'company', description: 'Company or organization name' },
    { name: 'product', description: 'Product or service name' },
    { name: 'date', description: 'Current date' },
    { name: 'email', description: 'Email address' },
    { name: 'topic', description: 'Main topic or subject' },
    { name: 'tone', description: 'Writing tone (formal, casual, etc.)' },
    { name: 'audience', description: 'Target audience' },
    { name: 'goal', description: 'Objective or goal' },
    { name: 'context', description: 'Additional context' },
  ];

  useEffect(() => {
    loadCategories();
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.getTemplateCategories();
      setCategories(response.results);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Failed to load categories');
    }
  };

  const loadTemplate = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const templateData = await apiClient.getTemplate(id);
      setTemplate({
        title: templateData.title,
        description: templateData.description,
        template_content: templateData.template_content,
        category: typeof templateData.category === 'object' ? templateData.category.id : templateData.category,
        version: templateData.version || '1.0',
        is_public: templateData.is_public,
        tags: templateData.tags || [],
      });
    } catch (error) {
      setError('Failed to load template');
      console.error('Failed to load template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!template.title?.trim() || !template.description?.trim() || !template.template_content?.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!template.category) {
      setError('Please select a category');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      let savedTemplate;
      if (templateId) {
        // Update existing template
        savedTemplate = await apiClient.updateTemplate(templateId, template);
        setSuccess('Template updated successfully!');
      } else {
        // Create new template
        savedTemplate = await apiClient.createTemplate(template as TemplateCreateUpdate);
        setSuccess('Template created successfully!');
      }

      onSave?.(savedTemplate);
      
      // Close after a brief delay to show success message
      setTimeout(() => {
        onClose?.();
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save template');
      console.error('Failed to save template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TemplateCreateUpdate, value: any) => {
    setTemplate(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const insertVariable = (variableName: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = template.template_content || '';
      const newContent = 
        currentContent.substring(0, start) + 
        `{{${variableName}}}` + 
        currentContent.substring(end);
      
      handleInputChange('template_content', newContent);
      
      // Restore cursor position after the inserted variable
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variableName.length + 4;
        textarea.focus();
      }, 0);
    }
    setVariableHelperOpen(false);
  };

  const renderPreview = () => {
    if (!template.template_content) return 'No content to preview';
    
    // Simple preview - replace variables with styled placeholder text
    let preview = template.template_content;
    const variableRegex = /\{\{([^}]+)\}\}/g;
    
    preview = preview.replace(variableRegex, (match, varName) => {
      return `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">[${varName.trim().toUpperCase()}]</span>`;
    });
    
    return preview;
  };

  const extractVariables = (): string[] => {
    if (!template.template_content) return [];
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variableRegex.exec(template.template_content)) !== null) {
      const varName = match[1].trim();
      if (!variables.includes(varName)) {
        variables.push(varName);
      }
    }
    
    return variables;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="bg-bg-primary p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
            <p className="text-text-secondary">Loading template...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-primary rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {templateId ? 'Edit Template' : 'Create New Template'}
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              {templateId ? 'Update your template details and content' : 'Create a reusable prompt template'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="border-border"
            >
              {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(95vh-140px)]">
          {/* Main Editor */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Status Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm flex items-center">
                <Save className="w-4 h-4 mr-2" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-primary font-medium mb-2">
                    <Type className="w-4 h-4 inline mr-1" />
                    Title *
                  </label>
                  <input
                    type="text"
                    value={template.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-brand focus:outline-none transition-colors"
                    placeholder="Enter a descriptive title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text-primary font-medium mb-2">
                    <Hash className="w-4 h-4 inline mr-1" />
                    Category *
                  </label>
                  <select
                    value={template.category || ''}
                    onChange={(e) => handleInputChange('category', parseInt(e.target.value))}
                    className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-brand focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-text-primary font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={template.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-brand focus:outline-none resize-vertical transition-colors"
                  placeholder="Describe what this template does and when to use it"
                  required
                />
              </div>

              {/* Template Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-text-primary font-medium">
                    <Code className="w-4 h-4 inline mr-1" />
                    Template Content *
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setVariableHelperOpen(!variableHelperOpen)}
                      className="border-border"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Variables
                    </Button>
                  </div>
                </div>
                
                {previewMode ? (
                  <div className="bg-bg-secondary border border-border rounded-lg p-4 min-h-[300px]">
                    <div 
                      className="whitespace-pre-wrap font-sans text-sm text-text-primary leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderPreview() }}
                    />
                  </div>
                ) : (
                  <textarea
                    id="template-content"
                    value={template.template_content || ''}
                    onChange={(e) => handleInputChange('template_content', e.target.value)}
                    rows={15}
                    className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-brand focus:outline-none resize-vertical font-mono text-sm transition-colors"
                    placeholder="Enter your template content. Use {{variable_name}} for dynamic content."
                    required
                  />
                )}
                
                <div className="flex justify-between items-center">
                  <p className="text-text-muted text-xs">
                    Use double curly braces for variables: {`{{variable_name}}`}
                  </p>
                  {template.template_content && (
                    <p className="text-text-muted text-xs">
                      {template.template_content.length} characters
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-text-primary font-medium mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Version
                  </label>
                  <input
                    type="text"
                    value={template.version || ''}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-brand focus:outline-none transition-colors"
                    placeholder="1.0"
                  />
                </div>

                <div>
                  <label className="block text-text-primary font-medium mb-2">
                    Visibility
                  </label>
                  <select
                    value={template.is_public ? 'public' : 'private'}
                    onChange={(e) => handleInputChange('is_public', e.target.value === 'public')}
                    className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-brand focus:outline-none transition-colors"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-primary font-medium mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(template.tags) ? template.tags.join(', ') : ''}
                    onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary focus:border-brand focus:outline-none transition-colors"
                    placeholder="marketing, business, email"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-border"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand hover:bg-brand-hover text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {templateId ? 'Update' : 'Create'} Template
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-border bg-bg-secondary p-4 overflow-y-auto">
            {/* Variable Helper */}
            {variableHelperOpen && (
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Variable Helper</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {commonVariables.map((variable) => (
                    <button
                      key={variable.name}
                      type="button"
                      onClick={() => insertVariable(variable.name)}
                      className="w-full text-left p-2 rounded hover:bg-bg-floating transition-colors border border-transparent hover:border-border"
                    >
                      <div className="font-mono text-sm text-brand">
                        {`{{${variable.name}}}`}
                      </div>
                      <div className="text-xs text-text-muted">
                        {variable.description}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Detected Variables */}
            {template.template_content && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Detected Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  {extractVariables().length > 0 ? (
                    <div className="space-y-2">
                      {extractVariables().map((variable, index) => (
                        <div
                          key={index}
                          className="p-2 bg-bg-floating rounded border border-border"
                        >
                          <div className="font-mono text-sm text-brand">
                            {`{{${variable}}}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted text-sm">
                      No variables detected. Add variables using {`{{variable_name}}`} syntax.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}