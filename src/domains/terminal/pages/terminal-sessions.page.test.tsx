import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { TerminalSessionsPage } from '@domains/terminal/pages/terminal-sessions.page';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
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
  '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/index',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/index')
      >();
    return {
      ...actual,
      Route: {
        ...actual.Route,
        useSearch: vi.fn(() => mockSearchParams),
        useParams: vi.fn(() => ({
          organizationSlug: 'test-org',
          teamSlug: 'default',
        })),
      },
    };
  },
);

vi.mock('@domains/shared/hooks/use-current-team', () => ({
  useCurrentTeam: vi.fn(() => ({
    id: 'team-1',
    name: 'Default Team',
    slug: 'default',
    organizationId: 'org-1',
  })),
}));

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
  operations['getApiV1ByOrganizationIdTeamsByTeamIdTerminalSessions']['responses']['200']['content']['application/json'];

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
      buildBackendUrl(
        '/api/v1/{organizationId}/teams/{teamId}/terminal/sessions',
      ),
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
      buildBackendUrl(
        '/api/v1/{organizationId}/teams/{teamId}/terminal/sessions',
      ),
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
        screen.getByText(/No results match your filters/),
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
        to: '/$organizationSlug/t/$teamSlug/terminal/$sessionId',
        params: expect.objectContaining({
          sessionId: '2',
        }),
      }),
    );
  });

  it('should render status filter', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TerminalSessionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Filter'));

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
    it('should reset page to 1 when page size changes', async () => {
      const user = userEvent.setup();
      useMultiPageHandler({ page: 3, totalPages: 5, hasPrevious: true });
      mockSearchParams = { page: 3, size: 25 };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Page size')).toBeInTheDocument();
      });

      await clickTrigger(screen.getByLabelText('Page size'));

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

  describe('Status filter', () => {
    it('should call navigate with status filter when selecting a status', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Filter')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Filter'));

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
      });

      await clickTrigger(screen.getByLabelText('Filter by status'));

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
        expect(screen.getByText(/^Filter/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/^Filter/));

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
      });

      await clickTrigger(screen.getByLabelText('Filter by status'));

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
        expect(screen.getByText('Filter')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Filter'));

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by device')).toBeInTheDocument();
      });

      await clickTrigger(screen.getByLabelText('Filter by device'));

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
        expect(screen.getByText(/^Filter/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/^Filter/));

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by device')).toBeInTheDocument();
      });

      await clickTrigger(screen.getByLabelText('Filter by device'));

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
        expect(screen.getByText('Filter')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Filter'));

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by user')).toBeInTheDocument();
      });

      await clickTrigger(screen.getByLabelText('Filter by user'));

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
        expect(screen.getByText(/^Filter/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/^Filter/));

      await waitFor(() => {
        expect(screen.getByLabelText('Filter by user')).toBeInTheDocument();
      });

      await clickTrigger(screen.getByLabelText('Filter by user'));

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
        expect(screen.getByText('Filter')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Filter'));

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
      expect(result.dateFrom).toBe('2026-01-01');
    });

    it('should clear dateFrom when clearing from date input', async () => {
      const user = userEvent.setup();
      mockSearchParams = {
        page: 1,
        size: 25,
        dateFrom: '2026-01-01',
      };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/^Filter/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/^Filter/));

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
        dateFrom: '2026-01-01',
      });
      expect(result.dateFrom).toBeUndefined();
      expect(result.page).toBe(1);
    });

    it('should call navigate with dateTo when setting to date', async () => {
      const user = userEvent.setup();
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Filter')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Filter'));

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
      expect(result.dateTo).toBe('2026-12-31');
    });

    it('should clear dateTo when clearing to date input', async () => {
      const user = userEvent.setup();
      mockSearchParams = {
        page: 1,
        size: 25,
        dateTo: '2026-12-31',
      };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/^Filter/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/^Filter/));

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
        dateTo: '2026-12-31',
      });
      expect(result.dateTo).toBeUndefined();
      expect(result.page).toBe(1);
    });
  });

  describe('Export button', () => {
    it('should open export dialog when clicking Export button', async () => {
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Export/ }),
        ).toBeInTheDocument();
      });

      await clickTrigger(screen.getByRole('button', { name: /Export/ }));

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
          screen.getByText(/No results match your filters/),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Clear Filters' }));

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.any(Function),
        }),
      );

      const call = mockNavigate.mock.calls[0] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const result = call[0].search({ page: 2, size: 25, status: 'active' });
      expect(result).toEqual({ page: 1, size: 25 });
    });

    it('should show "Clear all" link in filter chips when filters are active and sessions exist', async () => {
      const user = userEvent.setup();
      mockSearchParams = { page: 1, size: 25, status: 'active' };

      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /clear all/i }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /clear all/i }));

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.any(Function),
        }),
      );

      const call = mockNavigate.mock.calls[0] as [
        { search: (prev: Record<string, unknown>) => Record<string, unknown> },
      ];
      const result = call[0].search({ page: 2, size: 25, status: 'active' });
      expect(result).toEqual({ page: 1, size: 25 });
    });
  });

  describe('Terminate session', () => {
    it('should open confirmation dialog when clicking terminate button', async () => {
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Production Server').length).toBeGreaterThan(
          0,
        );
      });

      const closeButtons = screen.getAllByRole('button', {
        name: 'Close session',
      });
      await clickTrigger(closeButtons[0] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('Close terminal session?')).toBeInTheDocument();
      });
    });

    it('should terminate session when confirming dialog', async () => {
      let deleteRequested = false;
      server.use(
        http.delete(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
          ),
          () => {
            deleteRequested = true;
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
      await clickTrigger(closeButtons[0] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('Close terminal session?')).toBeInTheDocument();
      });

      await clickTrigger(screen.getByRole('button', { name: 'Close Session' }));

      // Mutation should be triggered
      await waitFor(() => {
        expect(deleteRequested).toBe(true);
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
      await clickTrigger(closeButtons[0] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('Close terminal session?')).toBeInTheDocument();
      });

      mockNavigate.mockClear();

      await user.click(screen.getByText(/This will terminate the session on/));

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should cancel termination when clicking Cancel', async () => {
      renderWithProviders(<TerminalSessionsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Production Server').length).toBeGreaterThan(
          0,
        );
      });

      const closeButtons = screen.getAllByRole('button', {
        name: 'Close session',
      });
      await clickTrigger(closeButtons[0] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('Close terminal session?')).toBeInTheDocument();
      });

      await clickTrigger(screen.getByRole('button', { name: 'Cancel' }));

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
          to: '/$organizationSlug/t/$teamSlug/terminal/$sessionId',
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
          to: '/$organizationSlug/t/$teamSlug/terminal/$sessionId',
        }),
      );
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
    it('should handle responseData being null gracefully', async () => {
      server.use(
        http.get<never, never, ListTerminalSessionsSuccessResponse>(
          buildBackendUrl(
            '/api/v1/{organizationId}/teams/{teamId}/terminal/sessions',
          ),
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
      let deleteRequested = false;
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
            deleteRequested = true;
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
      await clickTrigger(closeButtons[0] as HTMLElement);

      await waitFor(() => {
        expect(screen.getByText('Close terminal session?')).toBeInTheDocument();
      });

      await clickTrigger(screen.getByRole('button', { name: 'Close Session' }));

      // Verify mutation was triggered
      await waitFor(() => {
        expect(deleteRequested).toBe(true);
      });

      // Close the dialog so the underlying table buttons become accessible
      await clickTrigger(screen.getByRole('button', { name: 'Cancel' }));

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
