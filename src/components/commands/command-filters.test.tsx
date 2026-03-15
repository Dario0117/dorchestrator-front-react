import { CommandFilters } from '@components/commands/command-filters';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useDevicesSuspenseQuery } from '@services/devices/list-devices.http-service';
import { screen, waitFor } from '@testing-library/react';
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

vi.mock('@hooks/use-current-organization', () => ({
  useCurrentOrganization: vi.fn(() => ({
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
  })),
}));

vi.mock('@hooks/use-current-team', () => ({
  useCurrentTeam: vi.fn(() => ({
    id: 'team-1',
    name: 'Default Team',
    slug: 'default',
    organizationId: 'org-1',
  })),
}));

vi.mock('@services/devices/list-devices.http-service', () => ({
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

describe('CommandFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockNavigate.mockClear();
    mockSearchParams = { page: 1, size: 25 };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render all filter controls', () => {
    renderWithProviders(<CommandFilters />);

    expect(
      screen.getByPlaceholderText('Search commands...'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by device')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by date range')).toBeInTheDocument();
  });

  it('should not show clear filters button when no filters are active', () => {
    renderWithProviders(<CommandFilters />);

    expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
  });

  it('should show clear filters button with badge when status filter is active', () => {
    mockSearchParams = { page: 1, size: 25, status: 'completed' };
    renderWithProviders(<CommandFilters />);

    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should show correct count for multiple active filters', () => {
    mockSearchParams = {
      page: 1,
      size: 25,
      status: 'completed',
      deviceId: 1,
      search: 'docker',
    };
    renderWithProviders(<CommandFilters />);

    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should clear all filters on clear button click', async () => {
    mockSearchParams = {
      page: 2,
      size: 50,
      status: 'completed',
      deviceId: 1,
      search: 'docker',
      startDate: '2026-01-01T00:00:00.000Z',
    };
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<CommandFilters />);

    await user.click(screen.getByText('Clear Filters'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.any(Function),
      }),
    );

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({
      page: 2,
      size: 50,
      status: 'completed',
      deviceId: 1,
      search: 'docker',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-15T00:00:00.000Z',
    });
    expect(result.page).toBe(1);
    expect(result.size).toBe(50);
    expect(result.status).toBeUndefined();
    expect(result.deviceId).toBeUndefined();
    expect(result.search).toBeUndefined();
    expect(result.startDate).toBeUndefined();
    expect(result.endDate).toBeUndefined();
  });

  it('should allow selecting a status filter', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<CommandFilters />);

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

  it('should allow typing in search input', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<CommandFilters />);

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

  it('should allow selecting a device filter', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<CommandFilters />);

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
    renderWithProviders(<CommandFilters />);

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
    renderWithProviders(<CommandFilters />);

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

    renderWithProviders(<CommandFilters />);

    expect(screen.getByLabelText('Filter by device')).toBeInTheDocument();
  });

  it('should count startDate as an active filter', () => {
    mockSearchParams = {
      page: 1,
      size: 25,
      startDate: '2026-01-01T00:00:00.000Z',
    };
    renderWithProviders(<CommandFilters />);

    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
