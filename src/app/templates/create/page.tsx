'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Save, 
  Plus,
  Trash2,
  AlertCircle 
} from 'lucide-react';

interface PromptField {
  id?: string;
  label: string;
  field_type: 'text' | 'textarea' | 'number' | 'dropdown';
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  default_value?: string;
  options?: string[];
}

export default function CreateTemplatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    template_content: '',
    category_id: null as number | null,
    tags: [] as string[],
    is_public: true,
    is_featured: false,
  });

  const [fields, setFields] = useState<PromptField[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Load categories on component mount
  useState(() => {
    const loadCategories = async () => {
      try {
        const response = await apiClient.getCategories();
        setCategories(response.results || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addField = () => {
    const newField: PromptField = {
      id: crypto.randomUUID(),
      label: '',
      field_type: 'text',
      placeholder: '',
      help_text: '',
      is_required: false,
      default_value: '',
    };
    setFields(prev => [...prev, newField]);
  };

  const updateField = (index: number, field: string, value: any) => {
    setFields(prev => prev.map((f, i) => 
      i === index ? { ...f, [field]: value } : f
    ));
  };

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create templates');
      return;
    }

    if (!formData.title.trim() || !formData.template_content.trim()) {
      setError('Title and template content are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert fields to the expected API format
      const fieldsData = fields.filter(f => f.label.trim()).map((field, index) => ({
        label: field.label,
        placeholder: field.placeholder || '',
        field_type: field.field_type,
        is_required: field.is_required,
        default_value: field.default_value || '',
        validation_pattern: '',
        help_text: field.help_text || '',
        options: field.options ? JSON.stringify(field.options) : '',
        order: index
      }));

      const templateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        template_content: formData.template_content.trim(),
        category: formData.category_id || 1, // Default to category 1 if none selected
        tags: JSON.stringify(formData.tags), // Convert tags array to JSON string
        is_public: formData.is_public,
        fields_data: fieldsData, // Use correct field name
      };

      const createdTemplate = await apiClient.createTemplate(templateData);
      
      console.log('Template created successfully:', createdTemplate);
      setSuccessMessage('Template created successfully!');
      
      // Track the creation event
      try {
        await apiClient.trackEvent({
          event_type: 'template_created',
          data: {
            template_id: createdTemplate.id,
            template_title: createdTemplate.title,
            fields_count: fields.length,
            tags_count: formData.tags.length,
          },
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }

      // Ensure we have a valid template ID before redirecting
      if (createdTemplate.id) {
        console.log('Redirecting to template:', createdTemplate.id);
        // Redirect to the new template after a short delay
        setTimeout(() => {
          router.push(`/templates/${createdTemplate.id}`);
        }, 1500);
      } else {
        console.error('Template created but no ID returned:', createdTemplate);
        setError('Template created but unable to redirect. Please check your templates list.');
        // Fallback redirect to templates list
        setTimeout(() => {
          router.push('/templates');
        }, 2000);
      }

    } catch (error: any) {
      console.error('Failed to create template:', error);
      
      // Provide more detailed error information
      let errorMessage = 'Failed to create template. Please try again.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors.join(', ') 
            : errorData.non_field_errors;
        } else {
          // Check for field-specific errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.join(', ')}`;
              }
              return `${field}: ${errors}`;
            })
            .join('; ');
          
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to create templates. Please log in and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen temple-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header Section with Egyptian Elements */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 pharaoh-badge rounded-full flex items-center justify-center pyramid-elevation-lg">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-hieroglyph text-glow-lg">
                The Sacred Forge
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Craft new wisdom • Forge eternal templates
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2 border-primary/30 hover:border-primary hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Archives
          </Button>
          <h2 className="text-2xl font-bold text-hieroglyph text-glow">Forge New Sacred Template</h2>
        </div>

        {error && (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="bg-primary/10 border-primary/30">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-hieroglyph">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-md"
                placeholder="Enter template title..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="w-full p-3 border rounded-md resize-none"
                rows={3}
                placeholder="Describe what this template does..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                className="w-full p-3 border rounded-md"
                value={formData.category_id || ''}
                onChange={(e) => handleInputChange('category_id', e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Select a category...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => handleInputChange('is_public', e.target.checked)}
                />
                <span className="text-sm">Make this template public</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                />
                <span className="text-sm">Feature this template</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Template Content */}
        <Card>
          <CardHeader>
            <CardTitle>Template Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium mb-2">
                Template Content <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full p-3 border rounded-md resize-none font-mono"
                rows={8}
                placeholder="Enter your template content... Use {{variable_name}} for dynamic fields."
                value={formData.template_content}
                onChange={(e) => handleInputChange('template_content', e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground mt-2">
                Use double curly braces like {"{{variable_name}}"} to create dynamic fields.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Fields */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Template Fields</CardTitle>
              <Button type="button" variant="outline" onClick={addField}>
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No fields added yet. Add fields to make your template dynamic.
              </p>
            ) : (
              fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Field {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Label</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md"
                        placeholder="Field label..."
                        value={field.label}
                        onChange={(e) => updateField(index, 'label', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={field.field_type}
                        onChange={(e) => updateField(index, 'field_type', e.target.value)}
                      >
                        <option value="text">Text</option>
                        <option value="textarea">Textarea</option>
                        <option value="number">Number</option>
                        <option value="dropdown">Dropdown</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Placeholder</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="Placeholder text..."
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Help Text</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="Help text..."
                      value={field.help_text || ''}
                      onChange={(e) => updateField(index, 'help_text', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.is_required}
                        onChange={(e) => updateField(index, 'is_required', e.target.checked)}
                      />
                      <span className="text-sm">Required</span>
                    </label>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 p-3 border rounded-md"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} disabled={!tagInput.trim()}>
                Add
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Template
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  </div>
  );
}