import Cookies from 'js-cookie';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AnalyticsStats {
  total_prompts: number;
  successful_executions: number;
  failed_executions: number;
  average_response_time: number;
  monthly_usage: Array<{
    month: string;
    prompts: number;
    executions: number;
  }>;
  top_templates: Array<{
    id: string;
    name: string;
    usage_count: number;
  }>;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: string[];
  category: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
  author: User;
}

export interface TemplateSearchParams {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface BillingUsage {
  current_plan: string;
  usage: {
    prompts_used: number;
    prompts_limit: number;
    api_calls_used: number;
    api_calls_limit: number;
    storage_used: number;
    storage_limit: number;
  };
  billing_cycle: {
    start_date: string;
    end_date: string;
    days_remaining: number;
  };
  next_invoice: {
    amount: number;
    date: string;
  };
}

export interface TeamMember {
  id: string;
  user: User;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  permissions: string[];
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.prompt-temple.com/api';
    this.loadTokensFromCookies();
  }

  private loadTokensFromCookies() {
    if (typeof window !== 'undefined') {
      this.accessToken = Cookies.get('access_token') || null;
      this.refreshToken = Cookies.get('refresh_token') || null;
    }
  }

  private saveTokensToCookies(tokens: AuthTokens) {
    const cookieOptions = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      expires: 7, // 7 days
    };
    
    Cookies.set('access_token', tokens.access, cookieOptions);
    Cookies.set('refresh_token', tokens.refresh, cookieOptions);
    this.accessToken = tokens.access;
    this.refreshToken = tokens.refresh;
  }

  private removeTokensFromCookies() {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    this.accessToken = null;
    this.refreshToken = null;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.saveTokensToCookies({
          access: data.access,
          refresh: this.refreshToken,
        });
        return true;
      } else {
        // Refresh token is invalid, clear all tokens
        this.removeTokensFromCookies();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.removeTokensFromCookies();
      return false;
    }
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add authorization header if we have an access token
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // If we get a 401 and have a refresh token, try to refresh
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the request with the new access token
          headers.Authorization = `Bearer ${this.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        }
      }

      const data = await response.json();

      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.message || data.error || 'An error occurred',
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthTokens>> {
    const response = await this.makeRequest<AuthTokens>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.saveTokensToCookies(response.data);
    }

    return response;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      try {
        await this.makeRequest('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh: this.refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.removeTokensFromCookies();
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/user/');
  }

  // Analytics methods
  async getAnalyticsStats(): Promise<ApiResponse<AnalyticsStats>> {
    return this.makeRequest<AnalyticsStats>('/analytics/stats/');
  }

  // Library methods
  async getTemplates(page = 1, limit = 20): Promise<ApiResponse<{ results: Template[]; count: number }>> {
    return this.makeRequest<{ results: Template[]; count: number }>(
      `/library/template/?page=${page}&limit=${limit}`
    );
  }

  async searchTemplates(params: TemplateSearchParams): Promise<ApiResponse<{ results: Template[]; count: number }>> {
    return this.makeRequest<{ results: Template[]; count: number }>('/library/search/', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getTemplate(id: string): Promise<ApiResponse<Template>> {
    return this.makeRequest<Template>(`/library/template/${id}/`);
  }

  async createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'author'>): Promise<ApiResponse<Template>> {
    return this.makeRequest<Template>('/library/template/', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateTemplate(id: string, template: Partial<Template>): Promise<ApiResponse<Template>> {
    return this.makeRequest<Template>(`/library/template/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(template),
    });
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/library/template/${id}/`, {
      method: 'DELETE',
    });
  }

  // Billing methods
  async getBillingUsage(): Promise<ApiResponse<BillingUsage>> {
    return this.makeRequest<BillingUsage>('/billing/usage/');
  }

  // Team methods
  async getTeamMembers(): Promise<ApiResponse<TeamMember[]>> {
    return this.makeRequest<TeamMember[]>('/teams/members/');
  }

  async inviteTeamMember(email: string, role: string): Promise<ApiResponse<TeamMember>> {
    return this.makeRequest<TeamMember>('/teams/invite/', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async updateTeamMemberRole(memberId: string, role: string): Promise<ApiResponse<TeamMember>> {
    return this.makeRequest<TeamMember>(`/teams/members/${memberId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async removeTeamMember(memberId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/teams/members/${memberId}/`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const apiClient = new ApiClient();
export default apiClient;