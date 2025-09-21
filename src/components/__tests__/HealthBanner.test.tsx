import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HealthBanner } from '../HealthBanner';
import { apiClient } from '@/lib/api-client';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    getHealth: vi.fn(),
    getCoreHealth: vi.fn(),
  },
}));

const mockApiClient = apiClient as any;

describe('HealthBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when all systems are healthy', async () => {
    mockApiClient.getHealth.mockResolvedValue({
      status: 'healthy',
      checks: {},
      timestamp: '2024-01-01T00:00:00Z',
    });

    mockApiClient.getCoreHealth.mockResolvedValue({
      status: 'healthy',
      checks: {},
      timestamp: '2024-01-01T00:00:00Z',
    });

    render(<HealthBanner />);

    await waitFor(() => {
      expect(screen.queryByText(/system status/i)).not.toBeInTheDocument();
    });
  });

  it('should show degraded status when one service is unhealthy', async () => {
    mockApiClient.getHealth.mockResolvedValue({
      status: 'healthy',
      checks: {},
      timestamp: '2024-01-01T00:00:00Z',
    });

    mockApiClient.getCoreHealth.mockResolvedValue({
      status: 'degraded',
      checks: {
        database: { status: 'healthy', message: 'Connected' },
        redis: { status: 'unhealthy', message: 'Connection failed' },
      },
      timestamp: '2024-01-01T00:00:00Z',
    });

    render(<HealthBanner />);

    await waitFor(() => {
      expect(screen.getByText(/some services experiencing issues/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('banner')).toHaveClass('bg-yellow-50', 'border-yellow-200');
  });

  it('should show unhealthy status when both endpoints fail', async () => {
    mockApiClient.getHealth.mockRejectedValue(new Error('Service unavailable'));
    mockApiClient.getCoreHealth.mockRejectedValue(new Error('Service unavailable'));

    render(<HealthBanner />);

    await waitFor(() => {
      expect(screen.getByText(/service disruption detected/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('banner')).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('should show loading state initially', () => {
    mockApiClient.getHealth.mockImplementation(() => new Promise(() => {})); // Never resolves
    mockApiClient.getCoreHealth.mockImplementation(() => new Promise(() => {}));

    render(<HealthBanner />);

    expect(screen.getByText(/checking system status/i)).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('should show error state when health check fails', async () => {
    mockApiClient.getHealth.mockRejectedValue(new Error('Network error'));
    mockApiClient.getCoreHealth.mockRejectedValue(new Error('Network error'));

    render(<HealthBanner />);

    await waitFor(() => {
      expect(screen.getByText(/unable to check system status/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('banner')).toHaveClass('bg-gray-50', 'border-gray-200');
  });

  it('should refresh status when refresh button is clicked', async () => {
    mockApiClient.getHealth.mockResolvedValue({
      status: 'degraded',
      checks: {},
      timestamp: '2024-01-01T00:00:00Z',
    });

    mockApiClient.getCoreHealth.mockResolvedValue({
      status: 'degraded',
      checks: {},
      timestamp: '2024-01-01T00:00:00Z',
    });

    render(<HealthBanner />);

    await waitFor(() => {
      expect(screen.getByText(/some services experiencing issues/i)).toBeInTheDocument();
    });

    const refreshButton = screen.getByText(/refresh/i);
    fireEvent.click(refreshButton);

    expect(mockApiClient.getHealth).toHaveBeenCalledTimes(2);
    expect(mockApiClient.getCoreHealth).toHaveBeenCalledTimes(2);
  });

  it('should automatically refresh every 30 seconds', async () => {
    mockApiClient.getHealth.mockResolvedValue({
      status: 'healthy',
      checks: {},
      timestamp: '2024-01-01T00:00:00Z',
    });

    mockApiClient.getCoreHealth.mockResolvedValue({
      status: 'healthy',
      checks: {},
      timestamp: '2024-01-01T00:00:00Z',
    });

    render(<HealthBanner />);

    // Wait for initial load
    await waitFor(() => {
      expect(mockApiClient.getHealth).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 30 seconds
    vi.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(mockApiClient.getHealth).toHaveBeenCalledTimes(2);
    });
  });

  it('should show retry count on subsequent failures', async () => {
    mockApiClient.getHealth
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'));

    mockApiClient.getCoreHealth
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'));

    render(<HealthBanner />);

    await waitFor(() => {
      expect(screen.getByText(/unable to check system status/i)).toBeInTheDocument();
    });

    const refreshButton = screen.getByText(/refresh/i);
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText(/retry 1\/3/i)).toBeInTheDocument();
    });
  });

  it('should display last checked timestamp', async () => {
    mockApiClient.getHealth.mockResolvedValue({
      status: 'degraded',
      checks: {},
      timestamp: '2024-01-01T00:00:00Z',
    });

    mockApiClient.getCoreHealth.mockResolvedValue({
      status: 'degraded',
      checks: {},
      timestamp: '2024-01-01T00:00:00Z',
    });

    // Mock Date.now() to return a consistent time
    const mockDate = new Date('2024-01-01T12:30:00Z');
    vi.setSystemTime(mockDate);

    render(<HealthBanner />);

    await waitFor(() => {
      expect(screen.getByText(/last checked:/i)).toBeInTheDocument();
    });
  });
});