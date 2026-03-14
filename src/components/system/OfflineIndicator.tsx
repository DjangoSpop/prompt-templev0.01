'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';

type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

export function OfflineIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const [reconnectingAttempts, setReconnectingAttempts] = useState(0);

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout | null = null;

    const handleOffline = () => {
      setStatus('offline');
      setReconnectingAttempts(0);

      toast.error('You Are Offline', {
        description: 'The temple gates are closed. Please check your internet connection.',
        duration: Infinity,
        icon: <WifiOff className="h-5 w-5" />,
        action: {
          label: 'Dismiss',
          onClick: () => {
            toast.dismiss();
          },
        },
      });
    };

    const handleOnline = () => {
      if (status === 'offline') {
        setStatus('reconnecting');
        setReconnectingAttempts(1);

        // Attempt to reconnect
        attemptReconnect();
      }
    };

    const attemptReconnect = async () => {
      try {
        // Try to fetch a small resource to verify connection
        await fetch('/api/health', { method: 'HEAD', cache: 'no-store' });
        setStatus('online');

        toast.dismiss();
        toast.success('Connection Restored', {
          description: 'The path to the oracle is clear once more.',
          icon: <Wifi className="h-5 w-5 text-green-500" />,
          duration: 4000,
        });
      } catch (error) {
        // Retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectingAttempts), 30000);
        setReconnectingAttempts((prev) => prev + 1);

        reconnectTimer = setTimeout(() => {
          attemptReconnect();
        }, delay);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Check initial status
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [status, reconnectingAttempts]);

  return (
    <>
      {/* Top banner for offline status */}
      <AnimatePresence mode="wait">
        {status === 'offline' && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-orange-900/95 via-orange-800/95 to-orange-900/95 backdrop-blur-sm border-b-2 border-pharaoh-gold/50 shadow-lg"
          >
            <div className="flex items-center justify-center gap-3 py-3 px-4">
              <WifiOff className="h-5 w-5 text-pharaoh-gold flex-shrink-0 animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  You Are Offline
                </span>
                <span className="text-xs text-white/70 hidden sm:inline">
                  — The temple gates are closed
                </span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="ml-4 px-3 py-1.5 bg-pharaoh-gold hover:bg-pharaoh-gold/90 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reconnect
              </button>
            </div>
          </motion.div>
        )}

        {status === 'reconnecting' && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-nile-teal/95 via-teal-600/95 to-nile-teal/95 backdrop-blur-sm border-b-2 border-pharaoh-gold/30 shadow-lg"
          >
            <div className="flex items-center justify-center gap-3 py-3 px-4">
              <RefreshCw className="h-5 w-5 text-pharaoh-gold flex-shrink-0 animate-spin" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  Restoring Connection...
                </span>
                <span className="text-xs text-white/70 hidden sm:inline">
                  Attempt {reconnectingAttempts}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection status badge (bottom right) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-4 right-4 z-[9998]"
      >
        <div
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm
            transition-all duration-300
            ${status === 'online'
              ? 'bg-green-900/90 border border-green-500/30 text-white'
              : status === 'reconnecting'
              ? 'bg-nile-teal/90 border border-nile-teal/30 text-white'
              : 'bg-orange-900/90 border border-orange-500/30 text-white'
            }
          `}
        >
          {status === 'online' && (
            <>
              <Wifi className="h-4 w-4 text-green-400" />
              <span className="text-xs font-semibold">Online</span>
            </>
          )}
          {status === 'reconnecting' && (
            <>
              <RefreshCw className="h-4 w-4 text-pharaoh-gold animate-spin" />
              <span className="text-xs font-semibold">Reconnecting...</span>
            </>
          )}
          {status === 'offline' && (
            <>
              <WifiOff className="h-4 w-4 text-orange-400" />
              <span className="text-xs font-semibold">Offline</span>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

// Hook to check connection status programmatically
export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('online');

  useEffect(() => {
    const updateStatus = () => {
      setStatus(navigator.onLine ? 'online' : 'offline');
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Initial check
    updateStatus();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return status;
}

// Hook to check if app is online (simplified)
export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
