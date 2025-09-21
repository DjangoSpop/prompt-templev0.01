import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseApiClient, ApiError } from '../../api/base';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('BaseApiClient', () => {
  let client: BaseApiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.create to return a mock instance
    const mockAxiosInstance = {
      defaults: { baseURL: 'http://test.com' },
      request: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
    mockedAxios.post.mockResolvedValue({ data: { access: 'new-token' } });
    
    client = new BaseApiClient('http://test.com/api/v1');
  });

  afterEach(() => {
    // Clean up localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('constructor', () => {
    it('should create instance with default URL', () => {
      const defaultClient = new BaseApiClient();
      expect(mockedAxios.create).toHaveBeenCalled();
    });

    it('should create instance with custom URL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://test.com/api/v1',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('token management', () => {
    it('should save tokens to localStorage', () => {
      const tokens = { access: 'access-token', refresh: 'refresh-token' };
      client.saveTokensToStorage(tokens);

      if (typeof window !== 'undefined') {
        expect(localStorage.getItem('access_token')).toBe('access-token');
        expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
      }
    });

    it('should clear tokens from localStorage', () => {
      const tokens = { access: 'access-token', refresh: 'refresh-token' };
      client.saveTokensToStorage(tokens);
      client.clearTokens();

      if (typeof window !== 'undefined') {
        expect(localStorage.getItem('access_token')).toBeNull();
        expect(localStorage.getItem('refresh_token')).toBeNull();
      }
    });

    it('should check if user is authenticated', () => {
      expect(client.isAuthenticated()).toBe(false);
      
      // Mock a valid token (not expired)
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const validToken = `header.${btoa(JSON.stringify({ exp: futureTime }))}.signature`;
      client.saveTokensToStorage({ access: validToken, refresh: 'refresh' });
      
      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe('event listeners', () => {
    it('should add and remove event listeners', () => {
      const listener = vi.fn();
      client.addEventListener('login', listener);
      
      // Emit event (through token save which triggers login event)
      client.saveTokensToStorage({ access: 'token', refresh: 'refresh' });
      
      expect(listener).toHaveBeenCalled();
      
      client.removeEventListener('login', listener);
      client.saveTokensToStorage({ access: 'token2', refresh: 'refresh2' });
      
      // Listener should not be called again
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('request method', () => {
    it('should make successful request', async () => {
      const mockResponse = { data: { success: true } };
      client['axiosInstance'].request = vi.fn().mockResolvedValue(mockResponse);

      const result = await client['request']('/test');
      
      expect(result).toEqual({ success: true });
      expect(client['axiosInstance'].request).toHaveBeenCalledWith({
        url: '/test',
      });
    });

    it('should throw ApiError on request failure', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: { message: 'Invalid request' },
        },
      };
      
      mockedAxios.isAxiosError.mockReturnValue(true);
      client['axiosInstance'].request = vi.fn().mockRejectedValue(mockError);

      await expect(client['request']('/test')).rejects.toThrow(ApiError);
    });
  });
});