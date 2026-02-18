import { AuditLogFilters } from '@components/audit-logs/audit-log-filters';
import { renderWithProviders } from '@lib/test-wrappers.utils';
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
  '@routes/(authenticated)/$organizationSlug/audit-logs/index',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/audit-logs/index')
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

describe('AuditLogFilters', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSearchParams = { page: 1, size: 25 };
  });

  it('should render all filter controls', () => {
    renderWithProviders(<AuditLogFilters />);

    expect(screen.getByLabelText('Filter by action')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Filter by resource type'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by date range')).toBeInTheDocument();
  });

  it('should not show clear filters button when no filters are active', () => {
    renderWithProviders(<AuditLogFilters />);

    expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
  });

  it('should show clear filters button with badge when action filter is active', () => {
    mockSearchParams = { page: 1, size: 25, action: 'created' };
    renderWithProviders(<AuditLogFilters />);

    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should show correct count for multiple active filters', () => {
    mockSearchParams = {
      page: 1,
      size: 25,
      action: 'created',
      resourceType: 'device',
      fromDate: '2026-01-01T00:00:00.000Z',
    };
    renderWithProviders(<AuditLogFilters />);

    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should clear all filters on clear button click', async () => {
    mockSearchParams = {
      page: 2,
      size: 50,
      action: 'deleted',
      resourceType: 'command',
      fromDate: '2026-01-01T00:00:00.000Z',
    };
    const user = userEvent.setup();
    renderWithProviders(<AuditLogFilters />);

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
      action: 'deleted',
      resourceType: 'command',
      fromDate: '2026-01-01T00:00:00.000Z',
      toDate: '2026-01-15T00:00:00.000Z',
    });
    expect(result.page).toBe(1);
    expect(result.size).toBe(50);
    expect(result.action).toBeUndefined();
    expect(result.resourceType).toBeUndefined();
    expect(result.fromDate).toBeUndefined();
    expect(result.toDate).toBeUndefined();
  });

  it('should allow selecting an action filter', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuditLogFilters />);

    await user.click(screen.getByLabelText('Filter by action'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Deleted' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'Deleted' }));

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({ page: 3, size: 25 });
    expect(result.action).toBe('deleted');
    expect(result.page).toBe(1);
  });

  it('should allow selecting a resource type filter', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuditLogFilters />);

    await user.click(screen.getByLabelText('Filter by resource type'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Device' }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('option', { name: 'Device' }));

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const result = call[0].search({ page: 2, size: 25 });
    expect(result.resourceType).toBe('device');
    expect(result.page).toBe(1);
  });
});
