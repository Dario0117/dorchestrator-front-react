import {
  SessionTableSkeleton,
  TerminalSessionsPage,
} from '@components/terminal/pages/terminal-sessions.page';
import { queryClient } from '@context/query.provider';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import {
  setDesktopViewport,
  setMobileViewport,
  setTabletViewport,
} from '@lib/viewport-test-utils';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
    useParams: () => ({ organizationSlug: 'test-org' }),
  };
});

let mockSearchParams: {
  page: number;
  size: number;
  status?: string;
  deviceId?: number;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
} = { page: 1, size: 25 };

vi.mock(
  '@routes/(authenticated)/$organizationSlug/terminal/index',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/terminal/index')
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

const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  role: 'owner',
  memberCount: 1,
  createdAt: '2025-12-21T10:00:00.000Z',
  isDefault: true,
};

type ListTerminalSessionsSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalSessions']['responses']['200']['content']['application/json'];

function useMultiPageHandler(options?: {
  page?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  totalResults?: number;
}) {
  const {
    page = 1,
    totalPages = 3,
    hasNext = true,
    hasPrevious = false,
    totalResults = 60,
  } = options ?? {};

  server.use(
    http.get<never, never, ListTerminalSessionsSuccessResponse>(
      buildBackendUrl('/api/v1/{organizationId}/terminal/sessions'),
      () => {
        return HttpResponse.json({
          responseData: {
            results: [
              {
                id: 1,
                deviceId: 1,
                deviceName: 'Production Server',
                userId: 'user-1',
                userName: 'Alice',
                userEmail: 'alice@example.com',
                status: 'active',
                shell: '/bin/bash',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                lastActivityAt: new Date(Date.now() - 60000).toISOString(),
                terminatedAt: null,
                durationSeconds: 3600,
                recordingSizeBytes: 102400,
              },
              {
                id: 2,
                deviceId: 2,
                deviceName: 'Dev Laptop',
                userId: 'user-2',
                userName: 'Bob',
                userEmail: 'bob@example.com',
                status: 'terminated',
                shell: '/bin/zsh',
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                lastActivityAt: new Date(Date.now() - 300000).toISOString(),
                terminatedAt: new Date(Date.now() - 300000).toISOString(),
                durationSeconds: 7200,
                recordingSizeBytes: 204800,
              },
            ],
            hasNext,
            hasPrevious,
            totalResults,
            totalPages,
            page,
            size: 25,
          },
          responseErrors: null,
        });
      },
    ),
  );
}

function useEmptyHandler() {
  server.use(
    http.get<never, never, ListTerminalSessionsSuccessResponse>(
      buildBackendUrl('/api/v1/{organizationId}/terminal/sessions'),
      () => {
        return HttpResponse.json({
          responseData: {
            results: [],
            hasNext: false,
            hasPrevious: false,
            totalResults: 0,
            totalPages: 0,
            page: 1,
            size: 25,
          },
          responseErrors: null,
        });
      },
    ),
  );
}

describe('TerminalSessionsPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSearchParams = { page: 1, size: 25 };
    queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
      responseData: {
        results: [mockOrganization],
        hasNext: false,
        hasPrevious: false,
        totalResults: 1,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    });
  });

  it('should render page title', async () => {
    renderWithProviders(<TerminalSessionsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Terminal Sessions' }),
      ).toBeInTheDocument();
    });
  });

  it('should render data table with column headers', async () => {
    renderWithProviders(<TerminalSessionsPage />);

    await waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Device')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Last Activity')).toBeInTheDocument();
      expect(screen.getByText('Terminated')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('Recording')).toBeInTheDocument();
    });
  });

  it('should render session rows with mock data', async () => {
    renderWithProviders(<TerminalSessionsPage />);

    await waitFor(() => {
      expect(
        screen.getAllByText('Production Server').length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Dev Laptop')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('should render status badges', async () => {
    renderWithProviders(<TerminalSessionsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('active').length).toBeGreaterThan(0);
    });
  });

  it('should show empty state when no sessions exist', async () => {
    useEmptyHandler();

    renderWithProviders(<TerminalSessionsPage />);

    await waitFor(() => {
      expect(screen.getByText(/No terminal sessions/)).toBeInTheDocument();
    });
  });

  it('should show filtered empty state when status filter is active', async () => {
    useEmptyHandler();
    mockSearchParams = { page: 1, size: 25, status: 'active' };

    renderWithProviders(<TerminalSessionsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/No sessions match your filters/),
      ).toBeInTheDocument();
    });
  });

  it('should navigate to session on row click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TerminalSessionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dev Laptop')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Dev Laptop'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/$organizationSlug/terminal/$sessionId',
        params: expect.objectContaining({
          sessionId: '2',
        }),
      }),
    );
  });

  it('should render status filter', async () => {
    renderWithProviders(<TerminalSessionsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    });
  });

  it('should display singular "session" when totalResults is 1', async () => {
    useMultiPageHandler({ totalResults: 1, totalPages: 1, hasNext: false });

    renderWithProviders(<TerminalSessionsPage />);

    await waitFor(() => {
      expect(screen.getByText('1 total session')).toBeInTheDocument();
    });
  });

  it('should display plural "sessions" when totalResults is more than 1', async () => {
    useMultiPageHandler({ totalResults: 60 });

    renderWithProviders(<TerminalSessionsPage />);

    await waitFor(() => {
      expect(screen.getByText('60 total sessions')).toBeInTheDocument();
    });
  });

  describe('Page Size Selector', () => {
    it('should render page size selector', async () => {
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Page size')).toBeInTheDocument();
      });
    });

    it('should have current size selected', async () => {
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Page size')).toHaveTextContent('25');
      });
    });

    it('should render all page size options', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Page size')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Page size'));

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: '10 per page' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: '25 per page' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: '50 per page' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: '100 per page' }),
        ).toBeInTheDocument();
      });
    });

    it('should reset page to 1 when page size changes', async () => {
      const user = userEvent.setup();
      useMultiPageHandler({ page: 3, totalPages: 5, hasPrevious: true });
      mockSearchParams = { page: 3, size: 25 };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Page size')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Page size'));

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: '50 per page' }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: '50 per page' }));

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.any(Function),
        }),
      );

      const call = mockNavigate.mock.calls[0] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const searchFn = call[0].search;
      const result = searchFn({ page: 3, size: 25 });
      expect(result).toEqual({ page: 1, size: 50 });
    });
  });

  describe('Pagination Controls', () => {
    it('should disable Previous button on first page', async () => {
      useMultiPageHandler({ page: 1, hasPrevious: false, hasNext: true });

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        const prevButton = screen.getByLabelText('Go to previous page');
        expect(prevButton).toBeDisabled();
      });
    });

    it('should disable Next button on last page', async () => {
      useMultiPageHandler({
        page: 3,
        totalPages: 3,
        hasPrevious: true,
        hasNext: false,
      });
      mockSearchParams = { page: 3, size: 25 };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        const nextButton = screen.getByLabelText('Go to next page');
        expect(nextButton).toBeDisabled();
      });
    });

    it('should display "Page X of Y" indicator', async () => {
      useMultiPageHandler({ page: 2, totalPages: 5 });
      mockSearchParams = { page: 2, size: 25 };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
      });
    });

    it('should navigate to previous page when Previous is clicked', async () => {
      const user = userEvent.setup();
      useMultiPageHandler({
        page: 2,
        hasPrevious: true,
        hasNext: true,
      });
      mockSearchParams = { page: 2, size: 25 };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Go to previous page')).not.toBeDisabled();
      });

      await user.click(screen.getByLabelText('Go to previous page'));

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.any(Function),
        }),
      );

      const prevCall = mockNavigate.mock.calls[0] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const prevSearchFn = prevCall[0].search;
      const prevResult = prevSearchFn({ page: 2, size: 25 });
      expect(prevResult.page).toBe(1);
    });

    it('should navigate to next page when Next is clicked', async () => {
      const user = userEvent.setup();
      useMultiPageHandler({
        page: 1,
        hasPrevious: false,
        hasNext: true,
      });

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Go to next page')).not.toBeDisabled();
      });

      await user.click(screen.getByLabelText('Go to next page'));

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.any(Function),
        }),
      );

      const nextCall = mockNavigate.mock.calls[0] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const nextSearchFn = nextCall[0].search;
      const nextResult = nextSearchFn({ page: 1, size: 25 });
      expect(nextResult.page).toBe(2);
    });
  });

  describe('Mobile viewport', () => {
    beforeEach(() => setMobileViewport());

    it('should render page title', async () => {
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Terminal Sessions' }),
        ).toBeInTheDocument();
      });
    });

    it('should render table with data', async () => {
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Dev Laptop')).toBeInTheDocument();
      });
    });

    it('should render pagination controls', async () => {
      useMultiPageHandler({ page: 1, totalPages: 3, hasNext: true });

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
        expect(
          screen.getByLabelText('Go to previous page'),
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
        expect(screen.getByLabelText('Page size')).toBeInTheDocument();
      });
    });

    it('should render empty state on mobile', async () => {
      useEmptyHandler();

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/No terminal sessions/)).toBeInTheDocument();
      });
    });
  });

  describe('Tablet viewport', () => {
    beforeEach(() => setTabletViewport());

    it('should render page title', async () => {
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Terminal Sessions' }),
        ).toBeInTheDocument();
      });
    });

    it('should render table with data', async () => {
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Dev Laptop')).toBeInTheDocument();
      });
    });
  });

  describe('Desktop viewport', () => {
    beforeEach(() => setDesktopViewport());

    it('should render page title', async () => {
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Terminal Sessions' }),
        ).toBeInTheDocument();
      });
    });

    it('should render pagination inline', async () => {
      useMultiPageHandler({
        page: 1,
        totalPages: 3,
        hasNext: true,
        totalResults: 60,
      });

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
        expect(screen.getByText('60 total sessions')).toBeInTheDocument();
        expect(screen.getByLabelText('Page size')).toBeInTheDocument();
      });
    });

    it('should render empty state on desktop', async () => {
      useEmptyHandler();

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/No terminal sessions/)).toBeInTheDocument();
      });
    });
  });

  describe('Status filter', () => {
    it('should call navigate with status filter when selecting a status', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Filter by status'));

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'Active' }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: 'Active' }));

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.any(Function),
        }),
      );

      const call = mockNavigate.mock.calls[0] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const result = call[0].search({ page: 2, size: 25 });
      expect(result).toEqual({ page: 1, status: 'active', size: 25 });
    });

    it('should clear status filter when selecting "All statuses"', async () => {
      const user = userEvent.setup();
      mockSearchParams = { page: 1, size: 25, status: 'active' };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Filter by status'));

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'All statuses' }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: 'All statuses' }));

      const call = mockNavigate.mock.calls[0] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const result = call[0].search({ page: 2, size: 25, status: 'active' });
      expect(result.status).toBeUndefined();
      expect(result.page).toBe(1);
    });
  });

  describe('Device filter', () => {
    it('should call navigate with deviceId when selecting a device', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by device')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Filter by device'));

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'Test Server' }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: 'Test Server' }));

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.any(Function),
        }),
      );

      const call = mockNavigate.mock.calls[0] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const result = call[0].search({ page: 2, size: 25 });
      expect(result).toEqual({ page: 1, size: 25, deviceId: 1 });
    });

    it('should clear deviceId when selecting "All devices"', async () => {
      const user = userEvent.setup();
      mockSearchParams = { page: 1, size: 25, deviceId: 1 };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by device')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Filter by device'));

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'All devices' }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: 'All devices' }));

      const call = mockNavigate.mock.calls[0] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const result = call[0].search({ page: 2, size: 25, deviceId: 1 });
      expect(result.deviceId).toBeUndefined();
      expect(result.page).toBe(1);
    });
  });

  describe('User filter', () => {
    it('should call navigate with userId when selecting a user', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by user')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Filter by user'));

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'Alice Owner' }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: 'Alice Owner' }));

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.any(Function),
        }),
      );

      const call = mockNavigate.mock.calls[0] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const result = call[0].search({ page: 2, size: 25 });
      expect(result).toEqual({ page: 1, size: 25, userId: 'user-1' });
    });

    it('should clear userId when selecting "All users"', async () => {
      const user = userEvent.setup();
      mockSearchParams = { page: 1, size: 25, userId: 'user-1' };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by user')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Filter by user'));

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'All users' }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: 'All users' }));

      const call = mockNavigate.mock.calls[0] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const result = call[0].search({ page: 2, size: 25, userId: 'user-1' });
      expect(result.userId).toBeUndefined();
      expect(result.page).toBe(1);
    });
  });

  describe('Date filters', () => {
    it('should call navigate with dateFrom when setting from date', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('From date')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('From date'), '2026-01-01');

      expect(mockNavigate).toHaveBeenCalled();

      const calls = mockNavigate.mock.calls;
      const lastCall = calls[calls.length - 1] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const result = lastCall[0].search({ page: 2, size: 25 });
      expect(result.page).toBe(1);
      expect(result.dateFrom).toBe('2026-01-01T00:00:00.000Z');
    });

    it('should clear dateFrom when clearing from date input', async () => {
      mockSearchParams = {
        page: 1,
        size: 25,
        dateFrom: '2026-01-01T00:00:00.000Z',
      };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('From date')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('From date') as HTMLInputElement;
      input.focus();
      await userEvent.clear(input);

      expect(mockNavigate).toHaveBeenCalled();

      const calls = mockNavigate.mock.calls;
      const lastCall = calls[calls.length - 1] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const result = lastCall[0].search({
        page: 2,
        size: 25,
        dateFrom: '2026-01-01T00:00:00.000Z',
      });
      expect(result.dateFrom).toBeUndefined();
      expect(result.page).toBe(1);
    });

    it('should call navigate with dateTo when setting to date', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('To date')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText('To date'), '2026-12-31');

      expect(mockNavigate).toHaveBeenCalled();

      const calls = mockNavigate.mock.calls;
      const lastCall = calls[calls.length - 1] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const result = lastCall[0].search({ page: 2, size: 25 });
      expect(result.page).toBe(1);
      expect(result.dateTo).toBe('2026-12-31T23:59:59.999Z');
    });

    it('should clear dateTo when clearing to date input', async () => {
      mockSearchParams = {
        page: 1,
        size: 25,
        dateTo: '2026-12-31T23:59:59.999Z',
      };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('To date')).toBeInTheDocument();
      });

      const input = screen.getByLabelText('To date') as HTMLInputElement;
      input.focus();
      await userEvent.clear(input);

      expect(mockNavigate).toHaveBeenCalled();

      const calls = mockNavigate.mock.calls;
      const lastCall = calls[calls.length - 1] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const result = lastCall[0].search({
        page: 2,
        size: 25,
        dateTo: '2026-12-31T23:59:59.999Z',
      });
      expect(result.dateTo).toBeUndefined();
      expect(result.page).toBe(1);
    });
  });

  describe('Export button', () => {
    it('should open export dialog when clicking Export button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Export/ }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Export/ }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Clear filter button', () => {
    it('should clear status filter when clicking "Clear Filters"', async () => {
      const user = userEvent.setup();
      useEmptyHandler();
      mockSearchParams = { page: 1, size: 25, status: 'active' };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/No sessions match your filters/),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Clear Filters' }));

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: { page: 1, size: 25 },
        }),
      );
    });
  });

  describe('Terminate session', () => {
    it('should show terminate button for non-terminated sessions', async () => {
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Production Server').length).toBeGreaterThan(
          0,
        );
      });

      const closeButtons = screen.getAllByRole('button', {
        name: 'Close session',
      });
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('should open confirmation dialog when clicking terminate button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Production Server').length).toBeGreaterThan(
          0,
        );
      });

      const closeButtons = screen.getAllByRole('button', {
        name: 'Close session',
      });
      await user.click(closeButtons[0] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('Close terminal session?')).toBeInTheDocument();
      });
    });

    it('should terminate session when confirming dialog', async () => {
      const user = userEvent.setup();

      server.use(
        http.delete(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
          ),
          () => {
            return HttpResponse.json({
              responseData: { results: ['Session terminated'] },
              responseErrors: null,
            });
          },
        ),
      );

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Production Server').length).toBeGreaterThan(
          0,
        );
      });

      const closeButtons = screen.getAllByRole('button', {
        name: 'Close session',
      });
      await user.click(closeButtons[0] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('Close terminal session?')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Close Session' }));

      // Dialog should close
      await waitFor(() => {
        expect(
          screen.queryByText('Close terminal session?'),
        ).not.toBeInTheDocument();
      });
    });

    it('should not navigate when clicking inside the confirmation dialog', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Production Server').length).toBeGreaterThan(
          0,
        );
      });

      const closeButtons = screen.getAllByRole('button', {
        name: 'Close session',
      });
      await user.click(closeButtons[0] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('Close terminal session?')).toBeInTheDocument();
      });

      mockNavigate.mockClear();

      await user.click(screen.getByText(/This will terminate the session on/));

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should cancel termination when clicking Cancel', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Production Server').length).toBeGreaterThan(
          0,
        );
      });

      const closeButtons = screen.getAllByRole('button', {
        name: 'Close session',
      });
      await user.click(closeButtons[0] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('Close terminal session?')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(
          screen.queryByText('Close terminal session?'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard navigation', () => {
    it('should navigate to session on Enter key', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Dev Laptop')).toBeInTheDocument();
      });

      const row = screen.getByText('Dev Laptop').closest('tr') as HTMLElement;
      row.focus();
      await user.keyboard('{Enter}');

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/$organizationSlug/terminal/$sessionId',
        }),
      );
    });

    it('should navigate to session on Space key', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Dev Laptop')).toBeInTheDocument();
      });

      const row = screen.getByText('Dev Laptop').closest('tr') as HTMLElement;
      row.focus();
      await user.keyboard(' ');

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/$organizationSlug/terminal/$sessionId',
        }),
      );
    });
  });

  describe('SessionTableSkeleton', () => {
    it('should render skeleton rows', () => {
      renderWithProviders(<SessionTableSkeleton />);

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Device')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('Keyboard navigation edge cases', () => {
    it('should not navigate when pressing a non-interactive key on a row', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Dev Laptop')).toBeInTheDocument();
      });

      const row = screen.getByText('Dev Laptop').closest('tr') as HTMLElement;
      row.focus();
      await user.keyboard('a');

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Session data edge cases', () => {
    it('should display "Never" when createdAt or lastActivityAt is null', async () => {
      server.use(
        http.get<never, never, ListTerminalSessionsSuccessResponse>(
          buildBackendUrl('/api/v1/{organizationId}/terminal/sessions'),
          () => {
            return HttpResponse.json({
              responseData: {
                results: [
                  {
                    id: 10,
                    deviceId: 1,
                    deviceName: 'Null Dates Device',
                    userId: 'user-1',
                    userName: 'Charlie',
                    userEmail: 'charlie@example.com',
                    status: 'created',
                    shell: '/bin/bash',
                    createdAt: '',
                    lastActivityAt: '',
                    terminatedAt: null,
                    durationSeconds: 0,
                    recordingSizeBytes: null,
                  },
                ],
                hasNext: false,
                hasPrevious: false,
                totalResults: 1,
                totalPages: 1,
                page: 1,
                size: 25,
              },
              responseErrors: null,
            });
          },
        ),
      );

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Null Dates Device')).toBeInTheDocument();
      });

      const neverCells = screen.getAllByText('Never');
      expect(neverCells.length).toBe(2);
    });

    it('should not show terminate button for terminated sessions', async () => {
      server.use(
        http.get<never, never, ListTerminalSessionsSuccessResponse>(
          buildBackendUrl('/api/v1/{organizationId}/terminal/sessions'),
          () => {
            return HttpResponse.json({
              responseData: {
                results: [
                  {
                    id: 3,
                    deviceId: 1,
                    deviceName: 'Terminated Device',
                    userId: 'user-1',
                    userName: 'Eve',
                    userEmail: 'eve@example.com',
                    status: 'terminated',
                    shell: '/bin/bash',
                    createdAt: new Date().toISOString(),
                    lastActivityAt: new Date().toISOString(),
                    terminatedAt: new Date().toISOString(),
                    durationSeconds: 3600,
                    recordingSizeBytes: 0,
                  },
                ],
                hasNext: false,
                hasPrevious: false,
                totalResults: 1,
                totalPages: 1,
                page: 1,
                size: 25,
              },
              responseErrors: null,
            });
          },
        ),
      );

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Terminated Device')).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: 'Close session' }),
      ).not.toBeInTheDocument();
    });

    it('should handle responseData being null gracefully', async () => {
      server.use(
        http.get<never, never, ListTerminalSessionsSuccessResponse>(
          buildBackendUrl('/api/v1/{organizationId}/terminal/sessions'),
          () => {
            return HttpResponse.json({
              responseData: null,
              responseErrors: null,
            } as unknown as ListTerminalSessionsSuccessResponse);
          },
        ),
      );

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/No terminal sessions/)).toBeInTheDocument();
      });
    });

    it('should stop propagation on keydown on terminate button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Production Server').length).toBeGreaterThan(
          0,
        );
      });

      const closeButtons = screen.getAllByRole('button', {
        name: 'Close session',
      });
      const closeButton = closeButtons[0] as HTMLElement;
      closeButton.focus();
      await user.keyboard('{Enter}');

      // The keydown handler calls stopPropagation, so the row click handler should not fire
      // The dialog should open because Enter on the button activates it
      await waitFor(() => {
        expect(screen.getByText('Close terminal session?')).toBeInTheDocument();
      });
    });

    it('should show disabled terminate button when mutation is pending', async () => {
      const user = userEvent.setup();

      let resolveTerminate!: () => void;
      const terminatePromise = new Promise<void>((resolve) => {
        resolveTerminate = resolve;
      });

      server.use(
        http.delete(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
          ),
          async () => {
            await terminatePromise;
            return HttpResponse.json({
              responseData: { results: ['Session terminated'] },
              responseErrors: null,
            });
          },
        ),
      );

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Production Server').length).toBeGreaterThan(
          0,
        );
      });

      // Open dialog and confirm termination
      const closeButtons = screen.getAllByRole('button', {
        name: 'Close session',
      });
      await user.click(closeButtons[0] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('Close terminal session?')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Close Session' }));

      // While mutation is pending, the button should be disabled
      await waitFor(() => {
        const updatedCloseButtons = screen.getAllByRole('button', {
          name: 'Close session',
        });
        const activeSessionButton = updatedCloseButtons[0] as HTMLButtonElement;
        expect(activeSessionButton).toBeDisabled();
      });

      // Resolve the mutation
      resolveTerminate();
    });
  });
});
