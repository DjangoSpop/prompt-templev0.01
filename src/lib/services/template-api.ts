import type { PromptTemplate } from '@/store/usePromptStore';

// API base URL for Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';

// Template API service for CRUD operations
export class TemplateApiService {
  // Get all templates with optional filters
  async getTemplates(params?: {
    search?: string;
    category?: string;
    is_public?: boolean;
    is_featured?: boolean;
    ordering?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.is_public !== undefined) queryParams.append('is_public', String(params.is_public));
      if (params?.is_featured !== undefined) queryParams.append('is_featured', String(params.is_featured));
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.offset) queryParams.append('offset', String(params.offset));

      const response = await fetch(`${API_BASE_URL}/api/v1/templates/?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle any 2xx response as success
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  }

  // Get template by ID
  async getTemplate(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/templates/${id}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch template:', error);
      throw error;
    }
  }

  // Create new template
  async createTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const templateData = {
        title: template.title,
        description: template.description,
        category: template.category,
        template_content: template.content,
        tags: template.tags,
        is_public: template.isPublic || false,
        fields_data: template.variables.map(v => ({
          name: v.name,
          label: v.label,
          field_type: v.type,
          is_required: v.required,
          default_value: v.default?.toString(),
          options: v.options?.join(','),
          placeholder: v.placeholder,
          description: v.description,
        })),
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/templates/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  // Update existing template
  async updateTemplate(id: string, updates: Partial<PromptTemplate>) {
    try {
      const templateData: Record<string, unknown> = {};
      
      if (updates.title) templateData.title = updates.title;
      if (updates.description) templateData.description = updates.description;
      if (updates.category) templateData.category = updates.category;
      if (updates.content) templateData.template_content = updates.content;
      if (updates.tags) templateData.tags = updates.tags;
      if (updates.isPublic !== undefined) templateData.is_public = updates.isPublic;
      if (updates.variables) {
        templateData.fields_data = updates.variables.map(v => ({
          name: v.name,
          label: v.label,
          field_type: v.type,
          is_required: v.required,
          default_value: v.default?.toString(),
          options: v.options?.join(','),
          placeholder: v.placeholder,
          description: v.description,
        }));
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/templates/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  // Delete template
  async deleteTemplate(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/templates/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      // Accept any 2xx status for deletion (200, 204, etc.)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      // Return empty object for successful deletion
      return {};
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }

  // Get template categories
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/templates/categories/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  // Track template usage
  async trackUsage(templateId: string, variables: Record<string, unknown>) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/templates/${templateId}/track-usage/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variables }),
      });

      // Don't throw on errors for usage tracking - it's not critical
      if (!response.ok) {
        console.warn('Failed to track template usage:', response.status);
      }

      return response.ok ? await response.json() : null;
    } catch (error) {
      console.warn('Failed to track template usage:', error);
      return null;
    }
  }
}

// Export singleton instance
export const templateApi = new TemplateApiService();
