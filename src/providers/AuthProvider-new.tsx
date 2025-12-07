'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  socialLogin: (provider: 'google' | 'github') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = apiClient.isAuthenticated() && !!user;

  // Load user profile on mount if authenticated
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        if (apiClient.isAuthenticated()) {
          const userProfile = await apiClient.getProfile();
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        // Clear invalid session
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Listen for OAuth success events to refresh user
    const handleAuthSuccess = () => {
      console.log('🔄 AuthProvider: Received auth success event, refreshing user...');
      loadUser();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:success', handleAuthSuccess);
      return () => window.removeEventListener('auth:success', handleAuthSuccess);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(username, password);
      // Get user profile after successful login
      const userProfile = await apiClient.getProfile();
      setUser(userProfile);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await apiClient.register(userData);
      // Get user profile after successful registration
      const userProfile = await apiClient.getProfile();
      setUser(userProfile);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  const refreshUser = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        const userProfile = await apiClient.getProfile();
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const socialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      // TODO: Implement social login with your Django backend
      console.log(`Social login with ${provider} not implemented yet`);
      throw new Error(`${provider} login not implemented yet`);
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    socialLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
