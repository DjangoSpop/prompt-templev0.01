import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../api/auth';
import React from 'react';

// Mock the auth service
vi.mock('../../api/auth', () => ({
  authService: {
    getProfile: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    checkUsername: vi.fn(),
    checkEmail: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user data when authenticated', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
    };

    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getProfile).mockResolvedValue(mockUser as any);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoadingUser).toBe(false);
  });

  it('should not fetch user when not authenticated', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(authService.getProfile).not.toHaveBeenCalled();
  });

  it('should handle login mutation', async () => {
    const mockResponse = {
      access: 'access-token',
      refresh: 'refresh-token',
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      },
    };

    vi.mocked(authService.login).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    const credentials = { username: 'testuser', password: 'password' };
    
    result.current.login(credentials);

    expect(result.current.isLoggingIn).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoggingIn).toBe(false);
    });

    expect(authService.login).toHaveBeenCalledWith(credentials);
  });

  it('should handle registration mutation', async () => {
    const mockResponse = {
      user: {
        id: '1',
        username: 'newuser',
        email: 'new@example.com',
      },
      tokens: {
        access: 'access-token',
        refresh: 'refresh-token',
      },
    };

    vi.mocked(authService.register).mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    const userData = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password',
      password_confirm: 'password',
    };
    
    result.current.register(userData);

    expect(result.current.isRegistering).toBe(true);

    await waitFor(() => {
      expect(result.current.isRegistering).toBe(false);
    });

    expect(authService.register).toHaveBeenCalledWith(userData);
  });

  it('should handle logout mutation', async () => {
    vi.mocked(authService.logout).mockResolvedValue();

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });
    
    result.current.logout();

    expect(result.current.isLoggingOut).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoggingOut).toBe(false);
    });

    expect(authService.logout).toHaveBeenCalled();
  });

  it('should handle username validation', async () => {
    const mockResponse = { available: true };
    vi.mocked(authService.checkUsername).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });
    
    result.current.checkUsername('testuser');

    expect(result.current.isCheckingUsername).toBe(true);

    await waitFor(() => {
      expect(result.current.isCheckingUsername).toBe(false);
    });

    expect(authService.checkUsername).toHaveBeenCalledWith('testuser');
    expect(result.current.checkUsernameResult).toEqual(mockResponse);
  });
});