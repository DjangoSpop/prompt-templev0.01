import { toast } from 'sonner';
import { useCreditsStore } from '@/store/credits';

export interface ApiError extends Error {
  status: number;
  code?: string;
}

/**
 * Central handler for API errors across all mutations.
 * Pass this to useMutation onError callbacks.
 *
 * @param error - The error thrown by the API client
 * @param feature - Which feature threw the error (used for upgrade modal context)
 * @param options - Extra options: suppress = skip toast, onRetry = retry callback
 */
export function handleApiError(
  error: unknown,
  feature: string,
  options?: {
    suppress?: boolean;
    onRetry?: () => void;
  }
): void {
  const err = error as ApiError;
  const status = err?.status ?? 0;

  if (status === 401) {
    // Auth expired — redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return;
  }

  if (status === 402 || err?.code === 'INSUFFICIENT_CREDITS') {
    useCreditsStore.getState().openUpgradeModal(feature);
    return;
  }

  if (options?.suppress) return;

  if (status >= 500) {
    toast.error('Something went wrong on our end. Please try again.', {
      action: options?.onRetry
        ? { label: 'Retry', onClick: options.onRetry }
        : undefined,
    });
    return;
  }

  if (status === 429) {
    toast.error('Too many requests. Please slow down a moment.');
    return;
  }

  if (status === 0 || !status) {
    toast.error('Network error — check your connection and try again.', {
      action: options?.onRetry
        ? { label: 'Retry', onClick: options.onRetry }
        : undefined,
    });
    return;
  }

  // Fallback: show error message from API
  const message = err?.message || 'An unexpected error occurred.';
  toast.error(message);
}
