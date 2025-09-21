import { BaseApiClient } from './base';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    storage: 'healthy' | 'unhealthy';
    external_services: 'healthy' | 'unhealthy';
  };
  version: string;
  uptime: number;
}

interface AppConfig {
  version: string;
  environment: string;
  features: {
    ai_enabled: boolean;
    billing_enabled: boolean;
    analytics_enabled: boolean;
    gamification_enabled: boolean;
  };
  limits: {
    max_templates_per_user: number;
    max_file_size: number;
    api_rate_limit: number;
  };
  contact: {
    support_email: string;
    documentation_url: string;
  };
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  action_text?: string;
}

interface NotificationMarkReadRequest {
  notification_id: string;
}

export class CoreService extends BaseApiClient {
  async getHealth(): Promise<HealthStatus> {
    // Health endpoint is at the root level, not under /api/v1
    const baseUrl = this.axiosInstance.defaults.baseURL?.replace('/api/v1', '') || 'http://127.0.0.1:8000';
    const response = await this.axiosInstance.get(`${baseUrl}/health/`);
    return response.data;
  }

  async getCoreHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/api/v2/core/health/');
  }

  async getConfig(): Promise<AppConfig> {
    return this.request<AppConfig>('/api/v2/core/config/');
  }

  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/api/v2/core/notifications/');
  }

  async markNotificationRead(request: NotificationMarkReadRequest): Promise<void> {
    return this.request<void>('/api/v2/core/notifications/', {
      method: 'POST',
      data: request,
    });
  }
}

export const coreService = new CoreService();