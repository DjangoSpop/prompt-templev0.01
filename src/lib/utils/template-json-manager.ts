import { TemplateDetail, PromptField } from '@/lib/types';

export interface TemplateExportData {
  template: {
    id: string;
    title: string;
    description: string;
    content: string;
    category?: string;
    fields: PromptField[];
    tags?: string[];
    author?: string;
    version?: string;
  };
  variables?: Record<string, string>;
  renderedPrompt?: string;
  exportedAt: string;
  appVersion: string;
}

export interface TemplateImportData {
  template?: {
    title?: string;
    description?: string;
    content?: string;
    category?: string;
    fields?: PromptField[];
    tags?: string[];
    version?: string;
  };
  variables?: Record<string, string>;
  metadata?: {
    exportedAt?: string;
    appVersion?: string;
  };
}

export class TemplateJsonManager {
  static exportTemplate(
    template: TemplateDetail, 
    variables?: Record<string, string>, 
    renderedPrompt?: string
  ): TemplateExportData {
    return {
      template: {
        id: template.id,
        title: template.title,
        description: template.description,
        content: template.template_content,
        category: template.category?.name,
        fields: template.fields || [],
        tags: Array.isArray(template.tags) ? template.tags : [],
        author: template.author?.username,
        version: template.version || '1.0.0',
      },
      variables: variables || {},
      renderedPrompt: renderedPrompt || '',
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
    };
  }

  static validateImportData(jsonData: unknown): TemplateImportData | null {
    try {
      // Basic validation
      if (!jsonData || typeof jsonData !== 'object') {
        throw new Error('Invalid JSON structure');
      }

      const data = jsonData as Record<string, unknown>;
      const validatedData: TemplateImportData = {};

      // Validate template data
      if (data.template && typeof data.template === 'object') {
        const template = data.template as Record<string, unknown>;
        validatedData.template = {};
        
        if (template.title && typeof template.title === 'string') {
          validatedData.template.title = template.title;
        }
        
        if (template.description && typeof template.description === 'string') {
          validatedData.template.description = template.description;
        }
        
        if (template.content && typeof template.content === 'string') {
          validatedData.template.content = template.content;
        }
        
        if (template.category && typeof template.category === 'string') {
          validatedData.template.category = template.category;
        }
        
        if (template.version && typeof template.version === 'string') {
          validatedData.template.version = template.version;
        }
        
        if (Array.isArray(template.fields)) {
          validatedData.template.fields = template.fields.filter((field: unknown) => 
            field && 
            typeof field === 'object' && 
            field !== null &&
            'label' in field &&
            'field_type' in field &&
            typeof (field as Record<string, unknown>).label === 'string' &&
            typeof (field as Record<string, unknown>).field_type === 'string'
          ) as PromptField[];
        }
        
        if (Array.isArray(template.tags)) {
          validatedData.template.tags = template.tags.filter((tag: unknown) => 
            typeof tag === 'string'
          ) as string[];
        }
      }

      // Validate variables
      if (data.variables && typeof data.variables === 'object') {
        const variables = data.variables as Record<string, unknown>;
        validatedData.variables = {};
        Object.entries(variables).forEach(([key, value]) => {
          if (typeof key === 'string' && typeof value === 'string') {
            validatedData.variables![key] = value;
          }
        });
      }

      // Validate metadata
      if (data.exportedAt || data.appVersion) {
        validatedData.metadata = {
          exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : undefined,
          appVersion: typeof data.appVersion === 'string' ? data.appVersion : undefined,
        };
      }

      return validatedData;
    } catch (error) {
      console.error('JSON validation error:', error);
      return null;
    }
  }

  static generateImportSummary(importData: TemplateImportData): string {
    const summary: string[] = [];
    
    if (importData.template) {
      if (importData.template.title) {
        summary.push(`Template: ${importData.template.title}`);
      }
      if (importData.template.fields && importData.template.fields.length > 0) {
        summary.push(`Fields: ${importData.template.fields.length} variables`);
      }
      if (importData.template.tags && importData.template.tags.length > 0) {
        summary.push(`Tags: ${importData.template.tags.join(', ')}`);
      }
    }
    
    if (importData.variables) {
      const varCount = Object.keys(importData.variables).length;
      if (varCount > 0) {
        summary.push(`Variables: ${varCount} pre-filled values`);
      }
    }
    
    if (importData.metadata?.exportedAt) {
      const exportDate = new Date(importData.metadata.exportedAt).toLocaleDateString();
      summary.push(`Exported: ${exportDate}`);
    }
    
    return summary.length > 0 ? summary.join(' • ') : 'No data to import';
  }

  static createTemplateFromImport(
    importData: TemplateImportData,
    currentTemplate?: TemplateDetail
  ): Partial<TemplateDetail> {
    const newTemplate: Partial<TemplateDetail> = {};
    
    if (currentTemplate) {
      // Start with current template as base
      Object.assign(newTemplate, currentTemplate);
    }
    
    // Override with imported data
    if (importData.template) {
      if (importData.template.title) {
        newTemplate.title = importData.template.title;
      }
      if (importData.template.description) {
        newTemplate.description = importData.template.description;
      }
      if (importData.template.content) {
        newTemplate.template_content = importData.template.content;
      }
      if (importData.template.fields) {
        newTemplate.fields = importData.template.fields;
      }
      if (importData.template.tags) {
        newTemplate.tags = importData.template.tags;
      }
      if (importData.template.version) {
        newTemplate.version = importData.template.version;
      }
    }
    
    return newTemplate;
  }

  static async copyToClipboard(data: TemplateExportData): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  static downloadAsFile(data: TemplateExportData, filename?: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `template-${data.template.title.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default TemplateJsonManager;
