'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, X, Wifi, WifiOff, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';

export interface ChatError {
  status: number;
  message: string;
  code?: string;
  retryable?: boolean;
  timestamp?: number;
}

interface ErrorToastProps {
  error: ChatError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDuration?: number;
  className?: string;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onRetry,
  onDismiss,
  autoHide = true,
  autoHideDuration = 5000,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);

      if (autoHide && !error.retryable) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onDismiss?.(), 300); // Wait for exit animation
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoHide, autoHideDuration, onDismiss]);

  const getErrorIcon = () => {
    if (!error) return <AlertTriangle className="w-5 h-5" />;

    switch (error.status) {
      case 429:
        return <Clock className="w-5 h-5" />;
      case 401:
      case 403:
        return <AlertTriangle className="w-5 h-5" />;
      case 500:
      case 502:
      case 503:
      case 504:
        return <WifiOff className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getErrorStyles = () => {
    if (!error) return 'bg-red-50 border-red-200 text-red-800';

    switch (error.status) {
      case 429:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 401:
      case 403:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getUserFriendlyMessage = () => {
    if (!error) return 'An error occurred';

    switch (error.status) {
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'You do not have permission to access this feature.';
      case 429:
        return 'Too many requests. Please wait a moment before trying again.';
      case 500:
        return 'Server error. Our team has been notified.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again in a few moments.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  const isRetryable = () => {
    if (!error) return false;
    return error.retryable || [429, 500, 502, 503, 504].includes(error.status);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  return (
    <AnimatePresence>
      {error && isVisible && (
        <motion.div
          className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className={`rounded-lg border p-4 shadow-lg backdrop-blur-sm ${getErrorStyles()}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getErrorIcon()}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium mb-1">
                  Connection Issue
                </h4>
                <p className="text-sm opacity-90">
                  {getUserFriendlyMessage()}
                </p>

                {error.status && (
                  <p className="text-xs opacity-70 mt-1">
                    Error Code: {error.status}
                    {error.code && ` (${error.code})`}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex items-center space-x-2 mt-3">
                  {isRetryable() && onRetry && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onRetry}
                      className="h-7 px-2 text-xs bg-white/50 hover:bg-white/80"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="h-7 px-2 text-xs hover:bg-white/30"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-md hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Connection status indicator
interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error?: ChatError | null;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isConnecting,
  error,
  className = ''
}) => {
  const getStatusIcon = () => {
    if (error) return <WifiOff className="w-4 h-4" />;
    if (isConnecting) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (isConnected) return <Wifi className="w-4 h-4" />;
    return <WifiOff className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (error) return 'Connection error';
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  const getStatusStyles = () => {
    if (error) return 'text-red-500 bg-red-50';
    if (isConnecting) return 'text-yellow-500 bg-yellow-50';
    if (isConnected) return 'text-green-500 bg-green-50';
    return 'text-gray-500 bg-gray-50';
  };

  return (
    <motion.div
      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles()} ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </motion.div>
  );
};