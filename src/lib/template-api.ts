import { PromptTemplate } from '../types/prompt';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com';

/**
 * Template API service for managing prompt templates
 */
export class TemplateAPI {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Get auth token from localStorage
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    // Handle successful 2xx responses
    if (response.status >= 200 && response.status < 300) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text() as T;
    }

    throw new Error(`Unexpected response status: ${response.status}`);
  }

  /**
   * Fetch all available templates
   */
  static async getTemplates(): Promise<PromptTemplate[]> {
    try {
      const response = await this.request<{ templates: PromptTemplate[] }>('/templates/');
      return response.templates || [];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      // Return mock data for development
      return this.getMockTemplates();
    }
  }

  /**
   * Get a specific template by ID
   */
  static async getTemplate(id: string): Promise<PromptTemplate> {
    try {
      return await this.request<PromptTemplate>(`/templates/${id}/`);
    } catch (error) {
      console.error(`Failed to fetch template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new template
   */
  static async createTemplate(template: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<PromptTemplate> {
    try {
      return await this.request<PromptTemplate>('/templates/', {
        method: 'POST',
        body: JSON.stringify(template),
      });
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  /**
   * Update an existing template
   */
  static async updateTemplate(id: string, updates: Partial<PromptTemplate>): Promise<PromptTemplate> {
    try {
      return await this.request<PromptTemplate>(`/templates/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error(`Failed to update template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(id: string): Promise<void> {
    try {
      await this.request<void>(`/templates/${id}/`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Failed to delete template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search templates
   */
  static async searchTemplates(query: string): Promise<PromptTemplate[]> {
    try {
      const response = await this.request<{ templates: PromptTemplate[] }>(`/templates/search/?q=${encodeURIComponent(query)}`);
      return response.templates || [];
    } catch (error) {
      console.error('Failed to search templates:', error);
      return [];
    }
  }

  /**
   * Get templates by category
   */
  static async getTemplatesByCategory(category: string): Promise<PromptTemplate[]> {
    try {
      const response = await this.request<{ templates: PromptTemplate[] }>(`/templates/category/${encodeURIComponent(category)}/`);
      return response.templates || [];
    } catch (error) {
      console.error(`Failed to fetch templates for category ${category}:`, error);
      return [];
    }
  }

  /**
   * Mock templates for development
   */
  private static getMockTemplates(): PromptTemplate[] {
    return [
      {
        id: 'mock-1',
        name: 'Code Review Assistant',
        description: 'Provides comprehensive code reviews with suggestions for improvements',
        content: 'Please review the following code and provide detailed feedback:\n\n```{{language}}\n{{code}}\n```\n\nFocus on:\n- Code quality and best practices\n- Performance optimizations\n- Security considerations\n- Maintainability\n\nProvide specific suggestions for improvement.',
        category: 'Development',
        tags: ['code-review', 'development', 'quality'],
        variables: [
          { name: 'language', type: 'text', description: 'Programming language', required: true },
          { name: 'code', type: 'textarea', description: 'Code to review', required: true }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'System',
        usage_count: 42,
        is_public: true,
        is_pinned: false
      },
      {
        id: 'mock-2', 
        name: 'Creative Writing Helper',
        description: 'Helps with creative writing projects and story development',
        content: 'Help me develop a {{genre}} story with the following elements:\n\n**Setting:** {{setting}}\n**Main Character:** {{character}}\n**Conflict:** {{conflict}}\n\nPlease provide:\n1. A compelling opening paragraph\n2. Character development suggestions\n3. Plot outline with 5 key scenes\n4. Themes to explore\n\nMake it engaging and original.',
        category: 'Creative Writing',
        tags: ['writing', 'creative', 'story', 'fiction'],
        variables: [
          { name: 'genre', type: 'select', description: 'Story genre', required: true, options: ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Thriller'] },
          { name: 'setting', type: 'text', description: 'Story setting/location', required: true },
          { name: 'character', type: 'text', description: 'Main character description', required: true },
          { name: 'conflict', type: 'textarea', description: 'Central conflict or challenge', required: false }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'System',
        usage_count: 28,
        is_public: true,
        is_pinned: true
      },
      {
        id: 'mock-3',
        name: 'Technical Documentation',
        description: 'Creates comprehensive technical documentation',
        content: '# {{title}}\n\n## Overview\n{{overview}}\n\n## Features\n{{features}}\n\n## Installation\n```bash\n{{installation_commands}}\n```\n\n## Usage\n{{usage_examples}}\n\n## API Reference\n{{api_details}}\n\n## Contributing\n{{contributing_guidelines}}\n\n## License\n{{license}}',
        category: 'Documentation',
        tags: ['documentation', 'technical', 'api', 'reference'],
        variables: [
          { name: 'title', type: 'text', description: 'Document title', required: true },
          { name: 'overview', type: 'textarea', description: 'Project overview', required: true },
          { name: 'features', type: 'textarea', description: 'Key features list', required: true },
          { name: 'installation_commands', type: 'textarea', description: 'Installation commands', required: false },
          { name: 'usage_examples', type: 'textarea', description: 'Usage examples', required: false },
          { name: 'api_details', type: 'textarea', description: 'API reference details', required: false },
          { name: 'contributing_guidelines', type: 'textarea', description: 'How to contribute', required: false },
          { name: 'license', type: 'text', description: 'License type', required: false }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: 'System',
        usage_count: 15,
        is_public: true,
        is_pinned: false
      }
    ];
  }
}

export default TemplateAPI;
