import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  is_premium: boolean;
  discord_id?: string;
  created_at: string;
  updated_at: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: boolean;
  };
}

export interface AuthState {
  accessToken?: string;
  profile?: UserProfile;
  isPremium: boolean;
  isAuthenticated: boolean;
  setToken: (token?: string) => void;
  setProfile: (profile: UserProfile) => void;
  logout: () => void;
  checkPremiumStatus: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      accessToken: undefined,
      profile: undefined,
      isPremium: false,
      isAuthenticated: false,
      
      setToken: (token?: string) => {
        set({ 
          accessToken: token, 
          isAuthenticated: !!token 
        });
      },
      
      setProfile: (profile: UserProfile) => {
        set({ 
          profile, 
          isPremium: profile.is_premium,
          isAuthenticated: true 
        });
      },
      
      logout: () => {
        set({ 
          accessToken: undefined, 
          profile: undefined, 
          isPremium: false,
          isAuthenticated: false 
        });
      },
      
      checkPremiumStatus: () => {
        const state = get();
        return state.isPremium || state.profile?.is_premium || false;
      },
    }),
    { name: 'auth-store' }
  )
);