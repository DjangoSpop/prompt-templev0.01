'use client';

import { useState, useEffect } from 'react';
import { useConfig } from '@/providers/ConfigProvider';

export type ChatTransport = 'sse' | 'ws';

export interface UseChatTransportReturn {
  transport: ChatTransport;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to determine chat transport method based on backend config.
 * Checks /api/v2/core/config for chat_transport feature flag.
 * Defaults to 'ws' for fallback compatibility.
 */
export function useChatTransport(): UseChatTransportReturn {
  const { config, isLoading: configLoading, error: configError } = useConfig();
  const [transport, setTransport] = useState<ChatTransport>('ws');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (configLoading) {
      setIsLoading(true);
      setError(null);
      return;
    }

    if (configError) {
      setError(configError);
      setIsLoading(false);
      // Fallback to WebSocket on config error
      setTransport('ws');
      return;
    }

    if (config) {
      try {
        // Check for chat_transport feature flag or ui_settings
        const sseEnabled = config.features?.enable_sse_chat || config.features?.chat_sse;
        const wsEnabled = config.features?.enable_ws_chat || config.features?.chat_ws;
        
        // Check ui_settings for transport preference
        const transportSetting = config.ui_settings?.chat_transport as string;
        
        if (transportSetting === 'sse' || (sseEnabled && !wsEnabled)) {
          setTransport('sse');
        } else if (transportSetting === 'ws' || wsEnabled || (!transportSetting && !sseEnabled)) {
          setTransport('ws');
        } else {
          // Default fallback to WebSocket
          setTransport('ws');
        }
        
        setError(null);
      } catch (err) {
        console.warn('Error parsing chat transport config:', err);
        setError('Failed to parse transport config');
        setTransport('ws'); // Fallback
      }
    }
    
    setIsLoading(false);
  }, [config, configLoading, configError]);

  return {
    transport,
    isLoading,
    error,
  };
}
