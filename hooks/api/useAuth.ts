/**
 * Authentication hooks using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, UserProfile, LoginResponse, RegisterResponse } from '@/lib/api/typed-client';
import { useAuthStore } from '@/store/user';
import { components } from '@/lib/types/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  stats: () => [...authKeys.all, 'stats'] as const,
};

// Hooks
export function useProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => apiClient.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserStats() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: authKeys.stats(),
    queryFn: () => apiClient.getUserStats(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setProfile = useAuthStore((state) => state.setProfile);

  return useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      apiClient.login(data.username, data.password),
    onSuccess: async (data) => {
      // Fetch and set profile
      try {
        const profile = await apiClient.getProfile();
        setProfile(profile as any);

        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: authKeys.all });

        toast.success('Login successful!');
        router.push('/dashboard');
      } catch (error) {
        console.error('Failed to fetch profile after login:', error);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setProfile = useAuthStore((state) => state.setProfile);

  return useMutation({
    mutationFn: (data: components['schemas']['UserRegistration']) =>
      apiClient.register(data),
    onSuccess: async (data) => {
      // Fetch and set profile if tokens were returned
      if (data.access) {
        try {
          const profile = await apiClient.getProfile();
          setProfile(profile as any);

          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: authKeys.all });

          toast.success('Registration successful!');
          router.push('/dashboard');
        } catch (error) {
          console.error('Failed to fetch profile after registration:', error);
        }
      } else {
        toast.success('Registration successful! Please login.');
        router.push('/auth/login');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();

      toast.success('Logged out successfully');
      router.push('/auth/login');
    },
    onError: (error: Error) => {
      // Even if logout fails on server, clear local state
      useAuthStore.getState().logout();
      queryClient.clear();
      router.push('/auth/login');
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserProfile>) =>
      apiClient.updateProfile(data),
    onSuccess: (data) => {
      // Update cached profile
      queryClient.setQueryData(authKeys.profile(), data);
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });

      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      apiClient.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });
}