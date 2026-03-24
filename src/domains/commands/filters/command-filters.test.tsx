import {
  CommandFilterControls,
  CommandSearchInput,
} from '@domains/commands/filters/command-filters';
import { useCommandFilterState } from '@domains/commands/hooks/use-command-filter-state';
import { useDevicesSuspenseQuery } from '@domains/devices/services/list-devices.http-service';
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
  '@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/index',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/t/$teamSlug/commands/index')
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

vi.mock('@domains/shared/hooks/use-current-organization', () => ({
  useCurrentOrganization: vi.fn(() => ({
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
  })),
}));

vi.mock('@domains/shared/hooks/use-current-team', () => ({
  useCurrentTeam: vi.fn(() => ({
    id: 'team-1',
    name: 'Default Team',
    slug: 'default',
    organizationId: 'org-1',
  })),
}));

vi.mock('@domains/devices/services/list-devices.http-service', () => ({
  useDevicesSuspenseQuery: vi.fn(() => ({
    data: {
      responseData: {
        results: [
          {
            id: 1,
            deviceName: 'Server Alpha',
            platform: 'linux' as const,
            lastSeenAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
        hasNext: false,
        hasPrevious: false,
        totalResults: 1,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    },
  })),
}));

describe('CommandFilterControls', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockNavigate.mockClear();
    mockSearchParams = { page: 1, size: 25 };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render filter controls (status, device, date range)', () => {
    renderWithProviders(<CommandFilterControls />);

    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by device')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by date range')).toBeInTheDocument();
  });

  it('should allow selecting a status filter', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<CommandFilterControls />);

    await user.click(screen.getByLabelText('Filter by status'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Failed' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'Failed' }));

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({ page: 3, size: 25 });
    expect(result.status).toBe('failed');
    expect(result.page).toBe(1);
  });

  it('should allow selecting a device filter', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<CommandFilterControls />);

    await user.click(screen.getByLabelText('Filter by device'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Server Alpha' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'Server Alpha' }));

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({ page: 3, size: 25 });
    expect(result.deviceId).toBe(1);
    expect(result.page).toBe(1);
  });

  it('should allow clearing device filter by selecting "All Devices"', async () => {
    mockSearchParams = { page: 1, size: 25, deviceId: 1 };
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<CommandFilterControls />);

    await user.click(screen.getByLabelText('Filter by device'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'All Devices' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'All Devices' }));

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({ page: 3, size: 25, deviceId: 1 });
    expect(result.deviceId).toBeUndefined();
    expect(result.page).toBe(1);
  });

  it('should navigate with date range when selecting a date preset', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<CommandFilterControls />);

    await user.click(screen.getByLabelText('Filter by date range'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Last 24 hours' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'Last 24 hours' }));

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({ page: 3, size: 25 });
    expect(result.startDate).toBeDefined();
    expect(result.endDate).toBeDefined();
    expect(result.page).toBe(1);
  });

  it('should handle devices query returning no responseData', () => {
    vi.mocked(useDevicesSuspenseQuery).mockReturnValueOnce({
      data: {
        responseData: null,
        responseErrors: null,
      },
    } as unknown as ReturnType<typeof useDevicesSuspenseQuery>);

    renderWithProviders(<CommandFilterControls />);

    expect(screen.getByLabelText('Filter by device')).toBeInTheDocument();
  });
});

describe('CommandSearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockNavigate.mockClear();
    mockSearchParams = { page: 1, size: 25 };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render search input', () => {
    renderWithProviders(<CommandSearchInput />);
    expect(
      screen.getByPlaceholderText('Search commands...'),
    ).toBeInTheDocument();
  });

  it('should navigate with search value after debounce', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<CommandSearchInput />);

    await user.type(
      screen.getByPlaceholderText('Search commands...'),
      'docker',
    );

    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({ page: 1, size: 25 });
    expect(result.search).toBe('docker');
  });
});

describe('useCommandFilterState', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSearchParams = { page: 1, size: 25 };
  });

  it('should return zero active filters when none are set', () => {
    const { result } = renderHook(() => useCommandFilterState());
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.chips).toHaveLength(0);
  });

  it('should count active filters', () => {
    mockSearchParams = {
      page: 1,
      size: 25,
      status: 'completed',
      deviceId: 1,
      search: 'docker',
    };
    const { result } = renderHook(() => useCommandFilterState());
    expect(result.current.activeFilterCount).toBe(3);
    expect(result.current.chips).toHaveLength(3);
  });

  it('should count startDate as an active filter', () => {
    mockSearchParams = {
      page: 1,
      size: 25,
      startDate: '2026-01-01T00:00:00.000Z',
    };
    const { result } = renderHook(() => useCommandFilterState());
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('should build chips with correct labels', () => {
    mockSearchParams = {
      page: 1,
      size: 25,
      status: 'completed',
    };
    const { result } = renderHook(() => useCommandFilterState());
    expect(result.current.chips[0]).toEqual({
      key: 'status',
      label: 'Status',
      value: 'Completed',
    });
  });
});
