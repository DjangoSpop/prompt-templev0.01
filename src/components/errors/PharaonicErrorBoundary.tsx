'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Sparkles, Coins, TimerCircle, ScrollText, Wifi, ArrowRight } from 'lucide-react';
import { errorLogger } from '@/lib/errors/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorType?: '402' | '429' | '500' | 'network' | 'default';
}

interface ErrorConfig {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  primaryAction: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

// Pharaonic Hieroglyphic SVG Border Component
function HieroglyphicBorder() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
    >
      {/* Top border */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A227" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#E9C25A" stopOpacity="1" />
          <stop offset="100%" stopColor="#C9A227" stopOpacity="0.8" />
        </linearGradient>
        <pattern id="hieroglyphPattern" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
          <rect width="40" height="20" fill="none" />
          {/* Simple hieroglyph-inspired patterns */}
          <circle cx="10" cy="10" r="3" fill="#C9A227" opacity="0.3" />
          <line x1="20" y1="5" x2="20" y2="15" stroke="#C9A227" opacity="0.3" strokeWidth="2" />
          <rect x="28" y="6" width="6" height="8" stroke="#C9A227" opacity="0.3" strokeWidth="1.5" fill="none" />
        </pattern>
      </defs>
      <rect
        x="0"
        y="0"
        width="400"
        height="8"
        fill="url(#goldGradient)"
      />
      <rect
        x="0"
        y="92"
        width="400"
        height="8"
        fill="url(#goldGradient)"
      />
    </svg>
  );
}

export class PharaonicErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    let errorType: State['errorType'] = 'default';

    // Detect error type from error message or code
    if (error.message.includes('402') || error.message.includes('credit') || error.message.includes('Payment Required')) {
      errorType = '402';
    } else if (error.message.includes('429') || error.message.includes('rate limit') || error.message.includes('too many')) {
      errorType = '429';
    } else if (error.message.includes('500') || error.message.includes('server error') || error.message.includes('Internal Server Error')) {
      errorType = '500';
    } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('connection')) {
      errorType = 'network';
    }

    return { hasError: true, error, errorType };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to centralized error logger
    errorLogger.log({
      message: error.message,
      code: 'REACT_ERROR',
      statusCode: 500,
      context: {
        componentStack: errorInfo.componentStack,
        errorInfo: errorInfo,
        errorType: this.state.errorType,
      },
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private getErrorConfig(errorType: State['errorType']): ErrorConfig {
    switch (errorType) {
      case '402':
        return {
          icon: <Coins className="h-16 w-16" />,
          title: 'The Temple Requires Tribute',
          description: 'Your credits have been exhausted. Upgrade your plan to continue your journey.',
          action: 'Upgrade Now',
          primaryAction: () => {
            window.location.href = '/pricing';
          },
          secondaryAction: {
            label: 'Return to Dashboard',
            onClick: () => {
              window.location.href = '/dashboard';
            },
          },
        };

      case '429':
        return {
          icon: <TimerCircle className="h-16 w-16" />,
          title: 'The Temple Gates Are Busy',
          description: 'Many seekers are consulting the oracle. Please wait a moment before trying again.',
          action: 'Retry in 60s',
          primaryAction: () => {
            this.handleRetryWithCountdown();
          },
          secondaryAction: {
            label: 'Return to Dashboard',
            onClick: () => {
              window.location.href = '/dashboard';
            },
          },
        };

      case '500':
        return {
          icon: <ScrollText className="h-16 w-16" />,
          title: 'The Scrolls Are Being Restored',
          description: 'An ancient wisdom was momentarily lost. Our scribes are working to restore it.',
          action: 'Restore Connection',
          primaryAction: () => {
            this.handleRetry();
          },
        };

      case 'network':
        return {
          icon: <Wifi className="h-16 w-16" />,
          title: 'Connection to the Temple Lost',
          description: 'The path to the oracle has been obscured. Please check your connection.',
          action: 'Reconnect',
          primaryAction: () => {
            this.handleRetry();
          },
        };

      default:
        return {
          icon: <AlertTriangle className="h-16 w-16" />,
          title: 'The Oracle Encountered an Obstacle',
          description: 'An unexpected occurrence has interrupted your journey. The oracle will guide you forward.',
          action: 'Consult the Oracle Again',
          primaryAction: () => {
            this.handleRetry();
          },
          secondaryAction: {
            label: 'Return to Dashboard',
            onClick: () => {
              window.location.href = '/dashboard';
            },
          },
        };
    }
  }

  private handleRetry(): void {
    this.setState({ hasError: false, error: undefined, errorType: undefined });
    window.location.reload();
  }

  private handleRetryWithCountdown(): void {
    let countdown = 60;
    const button = document.querySelector('[data-countdown]') as HTMLButtonElement;

    const interval = setInterval(() => {
      countdown--;
      if (button) {
        button.textContent = `Retry in ${countdown}s`;
      }

      if (countdown <= 0) {
        clearInterval(interval);
        this.handleRetry();
      }
    }, 1000);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorConfig = this.getErrorConfig(this.state.errorType || 'default');

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-desert-sand/30 via-background to-nile-teal/20 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative max-w-md w-full"
          >
            {/* Card with Pharaonic styling */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-pyramid overflow-hidden">
              {/* Hieroglyphic borders */}
              <HieroglyphicBorder />

              {/* Content */}
              <div className="relative p-8 pt-12 pb-10">
                {/* Icon with animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 bg-pharaoh-gold/20 rounded-full blur-xl"
                    />
                    <div className="relative text-pharaoh-gold">
                      {errorConfig.icon}
                    </div>
                  </div>
                </motion.div>

                {/* Title and description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="space-y-3 text-center"
                >
                  <h1 className="text-2xl font-display-bold text-foreground">
                    {errorConfig.title}
                  </h1>
                  <p className="text-sm text-temple-stone leading-relaxed">
                    {errorConfig.description}
                  </p>

                  {/* Technical details (expandable) */}
                  {this.state.error && process.env.NODE_ENV === 'development' && (
                    <details className="text-left mt-4">
                      <summary className="cursor-pointer text-xs font-semibold text-foreground/60 hover:text-foreground transition-colors">
                        Technical Details
                      </summary>
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <pre className="text-xs text-foreground/80 whitespace-pre-wrap break-words">
                          {this.state.error.message}
                        </pre>
                      </div>
                    </details>
                  )}
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="mt-8 space-y-3"
                >
                  <Button
                    onClick={errorConfig.primaryAction}
                    data-countdown={this.state.errorType === '429'}
                    className="w-full bg-gradient-to-r from-pharaoh-gold to-royal-gold hover:from-pharaoh-gold/90 hover:to-royal-gold/90 text-white font-semibold shadow-pyramid transition-all duration-300 transform hover:scale-[1.02]"
                    size="lg"
                  >
                    {errorConfig.action}
                  </Button>

                  {errorConfig.secondaryAction && (
                    <Button
                      onClick={errorConfig.secondaryAction.onClick}
                      variant="ghost"
                      className="w-full text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                      size="lg"
                    >
                      {errorConfig.secondaryAction.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </motion.div>

                {/* Decorative corner ornaments */}
                <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-pharaoh-gold/30 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-pharaoh-gold/30 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-pharaoh-gold/30 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-pharaoh-gold/30 rounded-br-lg" />
              </div>

              {/* Bottom shimmer line */}
              <div className="h-1 bg-gradient-to-r from-transparent via-pharaoh-gold/50 to-transparent animate-papyrus-shimmer bg-[length:200%_100%]" />
            </div>

            {/* Floating sparkles */}
            <AnimatePresence>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    delay: 0.8 + i * 0.2,
                    duration: 0.5,
                  }}
                  className="absolute"
                  style={{
                    top: `${20 + i * 15}%`,
                    left: `${10 + i * 20}%`,
                  }}
                >
                  <Sparkles className="h-4 w-4 text-pharaoh-gold" />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for easier usage
export function withPharaonicErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorFallback?: ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <PharaonicErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </PharaonicErrorBoundary>
    );
  };
}
