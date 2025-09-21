'use client';

import React from 'react';
import { 
  formatApiError, 
  isNetworkError, 
  isAuthError, 
  isValidationError, 
  getValidationErrors 
} from '../utils/error-handling';

interface ErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  className = '',
  showDetails = false 
}) => {
  if (!error) return null;

  const errorMessage = formatApiError(error);
  const isNetwork = isNetworkError(error);
  const isAuth = isAuthError(error);
  const isValidation = isValidationError(error);
  const validationErrors = getValidationErrors(error);

  const getErrorIcon = () => {
    if (isNetwork) return '🌐';
    if (isAuth) return '🔒';
    if (isValidation) return '📝';
    return '⚠️';
  };

  const getErrorTitle = () => {
    if (isNetwork) return 'Connection Error';
    if (isAuth) return 'Authentication Error';
    if (isValidation) return 'Validation Error';
    return 'Error';
  };

  return (
    <div className={`p-4 rounded-lg border border-red-200 bg-red-50 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getErrorIcon()}</div>
        <div className="flex-1">
          <h3 className="text-red-800 font-medium mb-1">{getErrorTitle()}</h3>
          <p className="text-red-700 text-sm mb-2">{errorMessage}</p>
          
          {isValidation && Object.keys(validationErrors).length > 0 && (
            <div className="mb-3">
              <h4 className="text-red-800 text-xs font-medium mb-1">Details:</h4>
              <ul className="text-red-600 text-xs space-y-1">
                {Object.entries(validationErrors).map(([field, messages]) => (
                  <li key={field}>
                    <strong>{field}:</strong> {Array.isArray(messages) ? messages.join(', ') : messages}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showDetails && error instanceof Error && error.stack && (
            <details className="mt-2">
              <summary className="text-red-600 text-xs cursor-pointer hover:text-red-800">
                Technical Details
              </summary>
              <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap font-mono">
                {error.stack}
              </pre>
            </details>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const InlineError: React.FC<{ error: unknown; className?: string }> = ({ 
  error, 
  className = '' 
}) => {
  if (!error) return null;

  return (
    <div className={`text-red-600 text-sm ${className}`}>
      {formatApiError(error)}
    </div>
  );
};