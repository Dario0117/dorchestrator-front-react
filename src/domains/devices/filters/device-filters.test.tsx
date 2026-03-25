import {
  DeviceFilterControls,
  useDeviceFilterState,
} from '@domains/devices/filters/device-filters';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

let mockSearchParams: Record<string, unknown> = { page: 1, size: 25 };

vi.mock(
  '@routes/(authenticated)/$organizationSlug/t/$teamSlug/devices',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/t/$teamSlug/devices')
      >();
    return {
      ...actual,
      Route: {
        ...actual.Route,
        useSearch: vi.fn(() => mockSearchParams),
      },
    };
  },
);

describe('useDeviceFilterState', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSearchParams = { page: 1, size: 25 };
  });

  it('should return zero active filters when none are set', () => {
    const { result } = renderHook(() => useDeviceFilterState());
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.chips).toHaveLength(0);
  });

  it('should count active filters for status and platform', () => {
    mockSearchParams = {
      page: 1,
      size: 25,
      status: 'online',
      platform: 'linux',
    };
    const { result } = renderHook(() => useDeviceFilterState());
    expect(result.current.activeFilterCount).toBe(2);
    expect(result.current.chips).toHaveLength(2);
  });

  it('should count only status as active filter', () => {
    mockSearchParams = { page: 1, size: 25, status: 'offline' };
    const { result } = renderHook(() => useDeviceFilterState());
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('should build status chip with correct label', () => {
    mockSearchParams = { page: 1, size: 25, status: 'online' };
    const { result } = renderHook(() => useDeviceFilterState());
    expect(result.current.chips[0]).toEqual({
      key: 'status',
      label: 'Status',
      value: 'Online',
    });
  });

  it('should build offline status chip with correct label', () => {
    mockSearchParams = { page: 1, size: 25, status: 'offline' };
    const { result } = renderHook(() => useDeviceFilterState());
    expect(result.current.chips[0]).toEqual({
      key: 'status',
      label: 'Status',
      value: 'Offline',
    });
  });

  it('should build platform chip with correct label', () => {
    mockSearchParams = { page: 1, size: 25, platform: 'macos' };
    const { result } = renderHook(() => useDeviceFilterState());
    expect(result.current.chips[0]).toEqual({
      key: 'platform',
      label: 'Platform',
      value: 'macOS',
    });
  });

  it('should fallback to raw value when status is unknown', () => {
    mockSearchParams = { page: 1, size: 25, status: 'unknown_status' };
    const { result } = renderHook(() => useDeviceFilterState());
    expect(result.current.chips[0]).toEqual({
      key: 'status',
      label: 'Status',
      value: 'unknown_status',
    });
  });

  it('should fallback to raw value when platform is unknown', () => {
    mockSearchParams = { page: 1, size: 25, platform: 'unknown_platform' };
    const { result } = renderHook(() => useDeviceFilterState());
    expect(result.current.chips[0]).toEqual({
      key: 'platform',
      label: 'Platform',
      value: 'unknown_platform',
    });
  });

  it('should navigate with filter update and reset page to 1', () => {
    const { result } = renderHook(() => useDeviceFilterState());
    result.current.navigateFilter({ status: 'online' });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const searchResult = call[0].search({ page: 3, size: 25 });
    expect(searchResult.status).toBe('online');
    expect(searchResult.page).toBe(1);
  });

  it('should clear all filters keeping only page and size', () => {
    mockSearchParams = {
      page: 2,
      size: 25,
      status: 'online',
      platform: 'linux',
    };
    const { result } = renderHook(() => useDeviceFilterState());
    result.current.clearFilters();

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const searchResult = call[0].search({
      page: 2,
      size: 50,
      status: 'online',
      platform: 'linux',
    });
    expect(searchResult).toEqual({ page: 1, size: 50 });
  });

  it('should remove a single filter by key', () => {
    mockSearchParams = {
      page: 1,
      size: 25,
      status: 'online',
      platform: 'linux',
    };
    const { result } = renderHook(() => useDeviceFilterState());
    result.current.removeFilter('status');

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const searchResult = call[0].search({
      page: 2,
      size: 25,
      status: 'online',
      platform: 'linux',
    });
    expect(searchResult.status).toBeUndefined();
    expect(searchResult.platform).toBe('linux');
    expect(searchResult.page).toBe(1);
  });
});

describe('DeviceFilterControls', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockNavigate.mockClear();
    mockSearchParams = { page: 1, size: 25 };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render status and platform filter controls', () => {
    renderWithProviders(<DeviceFilterControls />);
    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by platform')).toBeInTheDocument();
  });

  it('should allow selecting a status filter', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<DeviceFilterControls />);

    await user.click(screen.getByLabelText('Filter by status'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Online' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'Online' }));

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({ page: 3, size: 25 });
    expect(result.status).toBe('online');
    expect(result.page).toBe(1);
  });

  it('should allow selecting a platform filter', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<DeviceFilterControls />);

    await user.click(screen.getByLabelText('Filter by platform'));

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Linux' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'Linux' }));

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({ page: 3, size: 25 });
    expect(result.platform).toBe('linux');
    expect(result.page).toBe(1);
  });

  it('should allow clearing status filter by selecting "All Statuses"', async () => {
    mockSearchParams = { page: 1, size: 25, status: 'online' };
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<DeviceFilterControls />);

    await user.click(screen.getByLabelText('Filter by status'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'All Statuses' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'All Statuses' }));

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({ page: 3, size: 25, status: 'online' });
    expect(result.status).toBeUndefined();
    expect(result.page).toBe(1);
  });

  it('should allow clearing platform filter by selecting "All Platforms"', async () => {
    mockSearchParams = { page: 1, size: 25, platform: 'linux' };
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<DeviceFilterControls />);

    await user.click(screen.getByLabelText('Filter by platform'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'All Platforms' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'All Platforms' }));

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({ page: 3, size: 25, platform: 'linux' });
    expect(result.platform).toBeUndefined();
    expect(result.page).toBe(1);
  });
});
