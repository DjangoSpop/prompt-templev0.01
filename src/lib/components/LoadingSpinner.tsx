'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  className = '', 
  text 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <div
          className={`${sizeClasses[size]} border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
        />
        {text && <div className="text-sm text-gray-500">{text}</div>}
      </div>
    </div>
  );
};

export const LoadingOverlay: React.FC<{ isLoading: boolean; children: React.ReactNode }> = ({
  isLoading,
  children,
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-50">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/50">
        <LoadingSpinner />
      </div>
    </div>
  );
};

export const LoadingPage: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="large" text={text} />
    </div>
  );
};