import { apiClient } from '@/lib/api-client';
import {
  TemplateList,
  TemplateDetail,
  TemplateCreateUpdate,
  TemplateSearch,
  TemplateCategory,
  PaginatedResponse,
} from '@/lib/types';

export class TemplateService {
  // Get all templates with filtering and pagination
  static async getTemplates(filters?: TemplateSearch): Promise<PaginatedResponse<TemplateList>> {
    return apiClient.getTemplates(filters);
  }

  // Get a single template by ID
  static async getTemplate(id: string): Promise<TemplateDetail> {
    return apiClient.getTemplate(id);
  }

  // Create a new template
  static async createTemplate(templateData: TemplateCreateUpdate): Promise<TemplateDetail> {
    return apiClient.createTemplate(templateData);
  }

  // Update an existing template
  static async updateTemplate(id: string, templateData: Partial<TemplateCreateUpdate>): Promise<TemplateDetail> {
    return apiClient.updateTemplate(id, templateData);
  }

  // Delete a template
  static async deleteTemplate(id: string): Promise<void> {
    return apiClient.deleteTemplate(id);
  }

  // Get featured templates
  static async getFeaturedTemplates(): Promise<TemplateDetail[]> {
    return apiClient.getFeaturedTemplates();
  }

  // Get trending templates
  static async getTrendingTemplates(): Promise<TemplateDetail[]> {
    return apiClient.getTrendingTemplates();
  }

  // Get user's own templates
  static async getMyTemplates(): Promise<TemplateDetail[]> {
    return apiClient.getMyTemplates();
  }

  // Get search suggestions
  static async getSearchSuggestions(): Promise<string[]> {
    return apiClient.getSearchSuggestions();
  }

  // Duplicate a template
  static async duplicateTemplate(id: string): Promise<TemplateDetail> {
    return apiClient.duplicateTemplate(id);
  }

  // Rate a template
  static async rateTemplate(id: string, rating: number, review?: string): Promise<TemplateDetail> {
    return apiClient.rateTemplate(id, rating, review);
  }

  // Start template usage tracking
  static async startTemplateUsage(id: string): Promise<{ usage_session_id: string }> {
    return apiClient.startTemplateUsage(id);
  }

  // Complete template usage
  static async completeTemplateUsage(id: string, usageData: any): Promise<TemplateDetail> {
    return apiClient.completeTemplateUsage(id, usageData);
  }

  // Analyze template with AI
  static async analyzeTemplateWithAI(id: string): Promise<{ suggestions: string[]; score: number }> {
    return apiClient.analyzeTemplateWithAI(id);
  }

  // Get template analytics
  static async getTemplateAnalytics(id: string): Promise<any> {
    return apiClient.getTemplateAnalytics(id);
  }

  // Get template categories
  static async getCategories(): Promise<PaginatedResponse<TemplateCategory>> {
    return apiClient.getTemplateCategories();
  }

  // Get templates in a category
  static async getCategoryTemplates(categoryId: number): Promise<TemplateList[]> {
    return apiClient.getCategoryTemplates(categoryId);
  }

  // Search templates
  static async searchTemplates(query: string): Promise<TemplateList[]> {
    return apiClient.searchTemplates(query);
  }

  // Render a template with variables
  static async renderTemplate(templateId: string, variables: Record<string, string>): Promise<any> {
    return apiClient.renderTemplate(templateId, variables);
  }

  // Validate template syntax and variables
  static validateTemplate(content: string): {
    isValid: boolean;
    variables: string[];
    errors: string[];
  } {
    const variables: string[] = [];
    const errors: string[] = [];
    let isValid = true;

    try {
      // Extract variables using regex
      const variableRegex = /\{\{(\s*\w+\s*)\}\}/g;
      let match;
      
      while ((match = variableRegex.exec(content)) !== null) {
        const variable = match[1].trim();
        if (!variables.includes(variable)) {
          variables.push(variable);
        }
      }

      // Check for malformed variable syntax
      const malformedRegex = /\{[^{]|[^}]\}/g;
      if (malformedRegex.test(content)) {
        errors.push('Malformed variable syntax detected. Use {{variable}} format.');
        isValid = false;
      }

      // Check for unclosed variables
      const openBraces = (content.match(/\{\{/g) || []).length;
      const closeBraces = (content.match(/\}\}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        errors.push('Unclosed variable brackets detected.');
        isValid = false;
      }

    } catch (error) {
      errors.push('Template validation failed.');
      isValid = false;
    }

    return {
      isValid,
      variables,
      errors,
    };
  }

  // Generate template preview
  static generatePreview(content: string, variables: Record<string, string>): string {
    let preview = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      preview = preview.replace(regex, value || `{{${key}}}`);
    });

    return preview;
  }

  // Extract metadata from template content
  static extractMetadata(content: string): {
    wordCount: number;
    characterCount: number;
    variables: string[];
    complexity: 'simple' | 'moderate' | 'complex';
  } {
    const { variables } = this.validateTemplate(content);
    const wordCount = content.trim().split(/\s+/).length;
    const characterCount = content.length;
    
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (variables.length > 10 || wordCount > 500) {
      complexity = 'complex';
    } else if (variables.length > 5 || wordCount > 200) {
      complexity = 'moderate';
    }

    return {
      wordCount,
      characterCount,
      variables,
      complexity,
    };
  }
}

export default TemplateService;