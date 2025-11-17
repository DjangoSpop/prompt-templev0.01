/**
 * Egyptian-themed loading animation
 */

import React from "react";

export const EgyptianLoading: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center space-x-2 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="relative w-12 h-12">
        {/* Ankh symbol loading animation */}
        <svg
          className="animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <span className="text-sm text-muted-foreground animate-pulse">
        Optimizing your prompt...
      </span>
    </div>
  );
};

/**
 * Typing indicator with Egyptian flair
 */
export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="text-xs text-muted-foreground">Generating...</span>
    </div>
  );
};
