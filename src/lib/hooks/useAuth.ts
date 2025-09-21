import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { authService } from '../api/auth';
import type { components } from '../../types/api';

type UserProfile = components['schemas']['UserProfile'];
type UserRegistration = components['schemas']['UserRegistrationRequest'];
type UserUpdate = components['schemas']['UserUpdateRequest'];

interface LoginCredentials {
  username: string;
  password: string;
}

interface PasswordChangeData {
  old_password: string;
  new_password: string;
}

export const useAuth = () => {
  const queryClient = useQueryClient();
  
  // Reactive authentication state that triggers re-renders
  const [authState, setAuthState] = useState(() => ({
    isAuthenticated: authService.isAuthenticated(),
    lastCheck: Date.now()
  }));

  // Listen for auth state changes
  useEffect(() => {
    const checkAuthState = () => {
      const newAuthState = authService.isAuthenticated();
      if (newAuthState !== authState.isAuthenticated) {
        console.log('🔄 Auth state changed:', { from: authState.isAuthenticated, to: newAuthState });
        setAuthState({
          isAuthenticated: newAuthState,
          lastCheck: Date.now()
        });
      }
    };

    // Check auth state periodically
    const interval = setInterval(checkAuthState, 500); // Check every 500ms for more responsiveness
    
    // Also check on storage events (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'refresh_token') {
        checkAuthState();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [authState.isAuthenticated]);

  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () => authService.getProfile(),
    enabled: authState.isAuthenticated,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (reduced for more responsive updates)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      console.log('🎉 Login mutation success, updating query cache with user:', data.user.username);
      
      // Immediately update the auth profile cache
      queryClient.setQueryData(['auth', 'profile'], data.user);
      
      // Force auth state update immediately
      setAuthState({
        isAuthenticated: true,
        lastCheck: Date.now()
      });
      
      // Ensure all auth-related queries are invalidated and refetched
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      // Trigger a small delay to ensure proper state propagation
      setTimeout(() => {
        refetchUser();
      }, 50);
    },
    onError: (error) => {
      console.error('❌ Login failed:', error);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: UserRegistration) => authService.register(userData),
    onSuccess: (data) => {
      console.log('🎉 Registration mutation success, updating query cache with user:', data.user.username);
      
      // Immediately update the auth profile cache
      queryClient.setQueryData(['auth', 'profile'], data.user);
      
      // Force auth state update immediately
      setAuthState({
        isAuthenticated: true,
        lastCheck: Date.now()
      });
      
      // Ensure all auth-related queries are invalidated and refetched
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      // Trigger a small delay to ensure proper state propagation
      setTimeout(() => {
        refetchUser();
      }, 50);
    },
    onError: (error) => {
      console.error('❌ Registration failed:', error);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      console.log('🚪 Logout successful, clearing query cache');
      
      // Force auth state update immediately
      setAuthState({
        isAuthenticated: false,
        lastCheck: Date.now()
      });
      
      // Clear all cached data
      queryClient.clear();
      
      // Remove user from cache explicitly
      queryClient.removeQueries({ queryKey: ['auth'] });
    },
    onError: (error) => {
      console.error('❌ Logout failed:', error);
      // Clear cache anyway on logout failure
      queryClient.clear();
      
      // Force auth state update even on error
      setAuthState({
        isAuthenticated: false,
        lastCheck: Date.now()
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: Partial<UserUpdate>) => authService.updateProfile(profileData),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['auth', 'profile'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordChangeData) => authService.changePassword(data),
    onError: (error) => {
      console.error('Password change failed:', error);
    },
  });

  const checkUsernameMutation = useMutation({
    mutationFn: (username: string) => authService.checkUsername(username),
  });

  const checkEmailMutation = useMutation({
    mutationFn: (email: string) => authService.checkEmail(email),
  });

  return {
    // Data
    user,
    isAuthenticated: authState.isAuthenticated && !!user,
    
    // Loading states
    isLoadingUser,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isCheckingUsername: checkUsernameMutation.isPending,
    isCheckingEmail: checkEmailMutation.isPending,
    
    // Error states
    userError,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
    updateProfileError: updateProfileMutation.error,
    changePasswordError: changePasswordMutation.error,
    checkUsernameError: checkUsernameMutation.error,
    checkEmailError: checkEmailMutation.error,
    
    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    checkUsername: checkUsernameMutation.mutate,
    checkEmail: checkEmailMutation.mutate,
    refetchUser,
    
    // Success data
    checkUsernameResult: checkUsernameMutation.data,
    checkEmailResult: checkEmailMutation.data,
  };
};