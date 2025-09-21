'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '@/lib/hooks';
import type { components } from '../types/api';

type UserProfile = components['schemas']['UserProfile'];

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
  const auth = useAuthHook();

  const login = async (username: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      auth.login(
        { username, password },
        {
          onSuccess: () => {
            console.log('🎉 AuthProvider: Login successful');
            resolve();
          },
          onError: (error: any) => {
            console.error('❌ AuthProvider: Login failed:', error);
            reject(error);
          },
        }
      );
    });
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => {
    return new Promise<void>((resolve, reject) => {
      auth.register(
        userData,
        {
          onSuccess: () => {
            console.log('🎉 AuthProvider: Registration successful');
            resolve();
          },
          onError: (error: any) => {
            console.error('❌ AuthProvider: Registration failed:', error);
            reject(error);
          },
        }
      );
    });
  };

  const logout = async () => {
    return new Promise<void>((resolve) => {
      auth.logout(undefined, {
        onSuccess: () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          resolve();
        },
        onError: () => {
          // Still redirect on logout error
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          resolve();
        },
      });
    });
  };

  const refreshUser = async () => {
    auth.refetchUser();
  };

  const socialLogin = async (provider: 'google' | 'github') => {
    // TODO: Implement social login with your Django backend
    console.log(`Social login with ${provider} not implemented yet`);
    throw new Error(`${provider} login not implemented yet`);
  };

  const value: AuthContextType = {
    user: auth.user || null,
    isLoading: auth.isLoadingUser || auth.isLoggingIn || auth.isRegistering || auth.isLoggingOut,
    isAuthenticated: auth.isAuthenticated,
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
