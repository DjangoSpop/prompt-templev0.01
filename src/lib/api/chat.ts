import { BaseApiClient } from './base';
import type { ChatSession } from '../../types/chat';

interface SessionListResponse {
  sessions: ChatSession[];
  pagination?: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
}

interface TemplateResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usage_count?: number;
  created_at?: string;
}

interface CreditsPurchaseRequest {
  amount: number;
  package_id?: string;
}

interface CreditsPurchaseResponse {
  success: boolean;
  transaction_id?: string;
  new_balance?: number;
  error?: string;
}

export class ChatApiClient extends BaseApiClient {
  /**
   * Get user's chat sessions
   */
  async getSessions(page = 1, limit = 50): Promise<SessionListResponse> {
    try {
      const response = await this.request<SessionListResponse>('/api/v1/chat/sessions/', {
        method: 'GET',
        params: { page, limit },
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      // Return empty response on error
      return { sessions: [] };
    }
  }

  /**
   * Create a new chat session
   */
  async createSession(title?: string): Promise<ChatSession> {
    const response = await this.request<ChatSession>('/api/v1/chat/sessions/', {
      method: 'POST',
      data: { title: title || 'New Chat' },
    });
    return response;
  }

  /**
   * Update a chat session
   */
  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession> {
    const response = await this.request<ChatSession>(`/api/v1/chat/sessions/${sessionId}/`, {
      method: 'PATCH',
      data: updates,
    });
    return response;
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.request<void>(`/api/v1/chat/sessions/${sessionId}/`, {
      method: 'DELETE',
    });
  }

  /**
   * Get available templates
   */
  async getTemplates(category?: string, limit = 20): Promise<TemplateResponse[]> {
    try {
      const params: Record<string, unknown> = { limit };
      if (category) params.category = category;

      const response = await this.request<{ templates: TemplateResponse[] }>('/api/v1/templates/', {
        method: 'GET',
        params,
      });
      
      return response.templates || [];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  }

  /**
   * Get a specific template
   */
  async getTemplate(templateId: string): Promise<TemplateResponse | null> {
    try {
      const response = await this.request<TemplateResponse>(`/api/v1/templates/${templateId}/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch template:', error);
      return null;
    }
  }

  /**
   * Purchase credits (stub implementation)
   */
  async purchaseCredits(request: CreditsPurchaseRequest): Promise<CreditsPurchaseResponse> {
    try {
      const response = await this.request<CreditsPurchaseResponse>('/api/v1/credits/purchase/', {
        method: 'POST',
        data: request,
      });
      return response;
    } catch (error) {
      console.error('Failed to purchase credits:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Purchase failed' 
      };
    }
  }

  /**
   * Get user's current credit balance
   */
  async getCreditBalance(): Promise<number> {
    try {
      const response = await this.request<{ credits: number }>('/api/v1/me/credits/');
      return response.credits;
    } catch (error) {
      console.error('Failed to fetch credit balance:', error);
      return 0;
    }
  }

  /**
   * Get chat analytics/metrics
   */
  async getChatMetrics(): Promise<{
    totalSessions: number;
    totalMessages: number;
    avgResponseTime: number;
    creditsUsed: number;
  }> {
    try {
      const response = await this.request<{
        totalSessions: number;
        totalMessages: number;
        avgResponseTime: number;
        creditsUsed: number;
      }>('/api/v1/chat/metrics/');
      return response;
    } catch (error) {
      console.error('Failed to fetch chat metrics:', error);
      return {
        totalSessions: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        creditsUsed: 0,
      };
    }
  }
}

// Export singleton instance
export const chatApiClient = new ChatApiClient();
