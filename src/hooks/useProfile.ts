// 🏛️ Profile Page API Integration - Sprint 2 Supporting Files

// File: src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar?: File;
  theme_preference?: 'light' | 'dark' | 'system';
  language_preference?: string;
  ai_assistance_enabled?: boolean;
  analytics_enabled?: boolean;
}

interface PasswordChangeData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export const useProfile = () => {
  const queryClient = useQueryClient();

  // Get current user profile
  const profileQuery = useQuery({
    queryKey: ['profile', 'current'],
    queryFn: () => authService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get user statistics
  const statsQuery = useQuery({
    queryKey: ['profile', 'stats'],
    queryFn: () => authService.getUserStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileUpdateData) => authService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', 'current'], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile';
      toast.error(errorMessage);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordChangeData) => {
      if (data.new_password !== data.confirm_password) {
        throw new Error('New passwords do not match');
      }
      return authService.changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      });
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to change password';
      toast.error(errorMessage);
    },
  });

  return {
    profile: profileQuery.data,
    stats: statsQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    refetch: () => {
      profileQuery.refetch();
      statsQuery.refetch();
    },
  };
};
