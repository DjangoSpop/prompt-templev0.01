'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { AppConfig } from '@/lib/types';

interface ConfigContextType {
  config: AppConfig | null;
  isLoading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  getFeature: (featureName: string) => boolean;
  getLimit: (limitName: string) => number;
  getSetting: (settingPath: string) => any;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s
    
    try {
      setIsLoading(true);
      setError(null);
      const appConfig = await apiClient.getConfig();
      setConfig(appConfig);
    } catch (err) {
      console.error('Failed to load app config:', err);
      
      // Retry on failure
      if (retryCount < maxRetries) {
        console.log(`Retrying config load in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          loadConfig(retryCount + 1);
        }, retryDelay);
        return; // Don't set error state yet, we're retrying
      }
      
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      
      // Fallback to default config after all retries failed
      setConfig({
        features: {
          chat_analysis: true,
          template_ai_enhancement: true,
          gamification: true,
          advanced_analytics: false,
          real_time_collaboration: false,
        },
        limits: {
          max_templates_per_user: 50,
          max_prompt_length: 10000,
          max_file_upload_size: 10485760, // 10MB
          rate_limit_per_minute: 60,
        },
        ui_settings: {
          theme: 'light',
          default_language: 'en',
          show_onboarding: true,
          enable_notifications: true,
        },
      });
    } finally {
      if (retryCount === 0) setIsLoading(false); // Only stop loading on first attempt or success
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const refreshConfig = async () => {
    await loadConfig();
  };

  const getFeature = (featureName: string): boolean => {
    return config?.features?.[featureName] ?? false;
  };

  const getLimit = (limitName: string): number => {
    return config?.limits?.[limitName] ?? 0;
  };

  const getSetting = (settingPath: string): any => {
    if (!config?.ui_settings) return null;
    
    const keys = settingPath.split('.');
    let current = config.ui_settings;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return null;
      }
    }
    
    return current;
  };

  const value: ConfigContextType = {
    config,
    isLoading,
    error,
    refreshConfig,
    getFeature,
    getLimit,
    getSetting,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

// Hook for feature flags
export function useFeatureFlag(featureName: string): boolean {
  const { getFeature } = useConfig();
  return getFeature(featureName);
}

// Hook for limits
export function useLimit(limitName: string): number {
  const { getLimit } = useConfig();
  return getLimit(limitName);
}

// Hook for UI settings
export function useSetting(settingPath: string): any {
  const { getSetting } = useConfig();
  return getSetting(settingPath);
}

// Higher-order component for feature gating
export function withFeatureFlag(
  featureName: string,
  fallbackComponent?: React.ComponentType
) {
  return function <P extends object>(WrappedComponent: React.ComponentType<P>) {
    return function FeatureGatedComponent(props: P) {
      const isEnabled = useFeatureFlag(featureName);

      if (!isEnabled) {
        if (fallbackComponent) {
          const FallbackComponent = fallbackComponent;
          return <FallbackComponent />;
        }
        return null;
      }

      return <WrappedComponent {...props} />;
    };
  };
}