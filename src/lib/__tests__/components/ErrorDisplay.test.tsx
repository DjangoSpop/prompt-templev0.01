import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay, InlineError } from '../../components/ErrorDisplay';
import { ApiError } from '../../api/base';
import React from 'react';

describe('ErrorDisplay', () => {
  it('should render nothing when no error', () => {
    const { container } = render(<ErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render basic error message', () => {
    const error = new Error('Test error message');
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render network error with specific styling', () => {
    const error = new ApiError('Network Error', 0);
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText('🌐')).toBeInTheDocument();
  });

  it('should render auth error with specific styling', () => {
    const error = new ApiError('Unauthorized', 401);
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  it('should render validation error with details', () => {
    const error = new ApiError('Validation failed', 400, {
      errors: {
        username: ['This field is required'],
        email: ['Invalid format'],
      },
    });
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Validation Error')).toBeInTheDocument();
    expect(screen.getByText('📝')).toBeInTheDocument();
    expect(screen.getByText('username:')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    const error = new Error('Test error');
    render(<ErrorDisplay error={error} onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('should show technical details when enabled', () => {
    const error = new Error('Test error');
    error.stack = 'Error stack trace';
    
    render(<ErrorDisplay error={error} showDetails={true} />);
    
    expect(screen.getByText('Technical Details')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const error = new Error('Test error');
    const { container } = render(<ErrorDisplay error={error} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('InlineError', () => {
  it('should render nothing when no error', () => {
    const { container } = render(<InlineError error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render error message inline', () => {
    const error = new Error('Inline error message');
    render(<InlineError error={error} />);
    
    expect(screen.getByText('Inline error message')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const error = new Error('Test error');
    render(<InlineError error={error} className="custom-inline" />);
    
    const errorElement = screen.getByText('Test error');
    expect(errorElement).toHaveClass('custom-inline');
  });
});