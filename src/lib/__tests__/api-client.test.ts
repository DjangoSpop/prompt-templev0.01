import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient, ApiError } from '../api-client';
import { TokenPair } from '../types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiClient', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    apiClient = new ApiClient('http://localhost:8000');
  });

  describe('Authentication', () => {
    it('should login successfully and store tokens', async () => {
      const mockTokens: TokenPair = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokens,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await apiClient.login({
        username: 'testuser',
        password: 'testpass',
      });

      expect(result).toEqual(mockTokens);
      expect(localStorage.getItem('access_token')).toBe(mockTokens.access);
      expect(localStorage.getItem('refresh_token')).toBe(mockTokens.refresh);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/auth/login/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            username: 'testuser',
            password: 'testpass',
          }),
        })
      );
    });

    it('should throw ApiError on login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid credentials' }),
      });

      await expect(
        apiClient.login({
          username: 'wronguser',
          password: 'wrongpass',
        })
      ).rejects.toThrow(ApiError);
    });

    it('should refresh token when access token expires', async () => {
      // Set up expired access token
      localStorage.setItem('access_token', 'expired-token');
      localStorage.setItem('refresh_token', 'valid-refresh-token');

      // Mock 401 response for initial request
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
        })
        // Mock successful refresh
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access: 'new-access-token' }),
          headers: new Headers({ 'content-type': 'application/json' }),
        })
        // Mock successful retry with new token
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy' }),
          headers: new Headers({ 'content-type': 'application/json' }),
        });

      const result = await apiClient.getHealth();

      expect(result).toEqual({ status: 'healthy' });
      expect(localStorage.getItem('access_token')).toBe('new-access-token');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Template Operations', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'valid-token');
    });

    it('should fetch templates with filters', async () => {
      const mockResponse = {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: '1',
            title: 'Test Template',
            description: 'A test template',
            category: { id: 1, name: 'Test Category' },
            usage_count: 5,
            average_rating: 4.5,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await apiClient.getTemplates({
        search: 'test',
        category: 1,
        page: 1,
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/templates/?search=test&category=1&page=1',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        })
      );
    });

    it('should create a new template', async () => {
      const templateData = {
        title: 'New Template',
        description: 'A new template',
        category: 1,
        template_content: 'Hello {{name}}!',
        is_public: true,
      };

      const mockResponse = {
        id: 'new-template-id',
        ...templateData,
        author: { id: 'user-id', username: 'testuser' },
        created_at: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await apiClient.createTemplate(templateData);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/templates/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(templateData),
        })
      );
    });
  });

  describe('Health Checks', () => {
    it('should check basic health endpoint', async () => {
      const mockHealth = {
        status: 'healthy',
        checks: {},
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await apiClient.getHealth();

      expect(result).toEqual(mockHealth);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/health/',
        expect.any(Object)
      );
    });

    it('should check core health endpoint', async () => {
      const mockHealth = {
        status: 'degraded',
        checks: {
          database: { status: 'healthy', message: 'Connected' },
          redis: { status: 'unhealthy', message: 'Connection failed' },
        },
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await apiClient.getCoreHealth();

      expect(result).toEqual(mockHealth);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/core/health/',
        expect.any(Object)
      );
    });
  });

  describe('Analytics', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'valid-token');
    });

    it('should track analytics events', async () => {
      const event = {
        event_type: 'template_used',
        properties: {
          template_id: 'test-template',
          user_id: 'test-user',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '',
      });

      await apiClient.trackEvent(event);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/analytics/track/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(event),
        })
      );
    });

    it('should fetch dashboard data', async () => {
      const mockDashboard = {
        total_templates_used: 10,
        total_renders: 25,
        favorite_categories: ['Writing', 'Code'],
        recent_activity: [],
        gamification: {
          level: 3,
          experience_points: 150,
          daily_streak: 5,
          achievements_unlocked: 2,
          badges_earned: 1,
          rank: 'Novice',
          next_level_xp: 200,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboard,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await apiClient.getDashboard();

      expect(result).toEqual(mockDashboard);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/analytics/dashboard/',
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.getHealth()).rejects.toThrow('Network error');
    });

    it('should handle non-JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON');
        },
      });

      await expect(apiClient.getHealth()).rejects.toThrow(ApiError);
    });
  });
});