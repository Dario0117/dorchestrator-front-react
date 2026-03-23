import { CommandsListPage } from '@domains/commands/pages/commands-list.page';
import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import {
  setDesktopViewport,
  setMobileViewport,
  setTabletViewport,
} from '@lib/viewport-test-utils';
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
  executeModal?: string;
  deviceId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
} = { page: 1, size: 25 };

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

type ListCommandsSuccessResponse =
  operations['getApiV1ByOrganizationIdTeamsByTeamIdCommands']['responses']['200']['content']['application/json'];

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
    http.get<never, never, ListCommandsSuccessResponse>(
      buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/commands'),
      () => {
        return HttpResponse.json({
          responseData: {
            results: [
              {
                id: 1,
                command: 'echo "hello"',
                status: 'completed',
                deviceName: 'Test Server',
                userEmail: 'admin@example.com',
                platform: 'linux',
                duration: '5s',
                createdAt: new Date().toISOString(),
              },
              {
                id: 2,
                command: 'ls -la',
                status: 'running',
                deviceName: 'Dev Laptop',
                userEmail: 'dev@example.com',
                platform: 'linux',
                duration: null,
                createdAt: new Date().toISOString(),
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

describe('CommandsListPage', () => {
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

  it('should render commands page with command cards', async () => {
    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Command History')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
    });
  });

  it('should render execute command button', async () => {
    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Execute New Command')).toBeInTheDocument();
    });
  });

  it('should show empty state when no commands exist', async () => {
    server.use(
      http.get<never, never, ListCommandsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/commands'),
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

    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText(/No commands yet/)).toBeInTheDocument();
    });
  });

  it('should show filtered empty state with "Clear Filters" when filters are active', async () => {
    const user = userEvent.setup();
    mockSearchParams = { page: 1, size: 25, status: 'completed' };

    server.use(
      http.get<never, never, ListCommandsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/commands'),
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

    renderWithProviders(<CommandsListPage />);

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
    const result = call[0].search({ page: 2, size: 25, status: 'completed' });
    expect(result).toEqual({ page: 1, size: 25 });
  });

  it('should open modal from empty state Execute button', async () => {
    const user = userEvent.setup();

    server.use(
      http.get<never, never, ListCommandsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/commands'),
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

    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText(/No commands yet/)).toBeInTheDocument();
    });

    const executeButton = screen.getByRole('button', {
      name: /Execute Command/,
    });
    await user.click(executeButton);

    await waitFor(() => {
      expect(
        screen.getByText('Select a device and enter the command to execute.'),
      ).toBeInTheDocument();
    });
  });

  it('should open execute command modal when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Execute New Command')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Execute New Command'));

    await waitFor(() => {
      expect(
        screen.getByText('Select a device and enter the command to execute.'),
      ).toBeInTheDocument();
    });
  });

  it('should display command status badges', async () => {
    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  it('should display device names on command cards', async () => {
    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Test Server').length).toBeGreaterThanOrEqual(
        1,
      );
      expect(screen.getByText('Dev Laptop')).toBeInTheDocument();
      expect(screen.getByText('Build Agent')).toBeInTheDocument();
    });
  });

  it('should open modal when executeModal search param is "open"', async () => {
    mockSearchParams = { page: 1, size: 25, executeModal: 'open' };

    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Select a device and enter the command to execute.'),
      ).toBeInTheDocument();
    });
  });

  it('should not navigate when modal is closed without executeModal search param', async () => {
    const user = userEvent.setup();
    mockSearchParams = { page: 1, size: 25 };

    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Execute New Command')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Execute New Command'));

    await waitFor(() => {
      expect(
        screen.getByText('Select a device and enter the command to execute.'),
      ).toBeInTheDocument();
    });

    mockNavigate.mockClear();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        screen.queryByText('Select a device and enter the command to execute.'),
      ).not.toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle null responseData gracefully', async () => {
    server.use(
      http.get<never, never, ListCommandsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/commands'),
        () => {
          return HttpResponse.json({
            responseData: null,
            responseErrors: null,
          } as unknown as ListCommandsSuccessResponse);
        },
      ),
    );

    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText(/No commands yet/)).toBeInTheDocument();
    });
  });

  it('should clear executeModal param when modal is closed via search param', async () => {
    const user = userEvent.setup();
    mockSearchParams = { page: 1, size: 25, executeModal: 'open' };

    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Select a device and enter the command to execute.'),
      ).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.any(Function),
        }),
      );
    });

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const searchFn = call[0].search;
    const result = searchFn({ page: 1, size: 25, executeModal: 'open' });
    expect(result.executeModal).toBeUndefined();
  });

  it('should display singular "result" when totalResults is 1', async () => {
    useMultiPageHandler({ totalResults: 1, totalPages: 1, hasNext: false });

    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText('1 total result')).toBeInTheDocument();
    });
  });

  it('should navigate to command detail when card is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommandsListPage />);

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    await user.click(screen.getByText('#1'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Page Size Selector', () => {
    it('should render page size selector with correct options', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CommandsListPage />);

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

    it('should have current size selected', async () => {
      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Page size')).toBeInTheDocument();
        expect(screen.getByLabelText('Page size')).toHaveTextContent('25');
      });
    });

    it('should reset page to 1 and update size when page size changes', async () => {
      const user = userEvent.setup();
      useMultiPageHandler({ page: 3, totalPages: 5, hasPrevious: true });
      mockSearchParams = { page: 3, size: 25 };

      renderWithProviders(<CommandsListPage />);

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
      const result = searchFn({ page: 3, size: 25, executeModal: undefined });
      expect(result).toEqual({
        page: 1,
        size: 50,
        executeModal: undefined,
      });
    });
  });

  describe('Pagination Controls', () => {
    it('should disable Previous button on first page', async () => {
      useMultiPageHandler({ page: 1, hasPrevious: false, hasNext: true });

      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        const prevButton = screen.getByLabelText('Go to previous page');
        expect(prevButton).toHaveAttribute('aria-disabled', 'true');
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

      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        const nextButton = screen.getByLabelText('Go to next page');
        expect(nextButton).toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('should display "Page X of Y" indicator', async () => {
      useMultiPageHandler({ page: 2, totalPages: 5 });
      mockSearchParams = { page: 2, size: 25 };

      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
      });
    });

    it('should display total results count', async () => {
      useMultiPageHandler({ totalResults: 60 });

      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(screen.getByText('60 total results')).toBeInTheDocument();
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

      renderWithProviders(<CommandsListPage />);

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

      renderWithProviders(<CommandsListPage />);

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
      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Command History' }),
        ).toBeInTheDocument();
      });
    });

    it('should render execute button', async () => {
      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(screen.getByText('Execute New Command')).toBeInTheDocument();
      });
    });

    it('should render command cards', async () => {
      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
      });
    });

    it('should render pagination controls stacked', async () => {
      useMultiPageHandler({ page: 1, totalPages: 3, hasNext: true });

      renderWithProviders(<CommandsListPage />);

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
      server.use(
        http.get<never, never, ListCommandsSuccessResponse>(
          buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/commands'),
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

      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(screen.getByText(/No commands yet/)).toBeInTheDocument();
      });
    });
  });

  describe('Tablet viewport', () => {
    beforeEach(() => setTabletViewport());

    it('should render page title and button', async () => {
      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Command History' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Execute New Command')).toBeInTheDocument();
      });
    });

    it('should render command cards', async () => {
      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
      });
    });

    it('should render pagination controls', async () => {
      useMultiPageHandler({ page: 2, totalPages: 5, hasPrevious: true });
      mockSearchParams = { page: 2, size: 25 };

      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
      });
    });
  });

  describe('Desktop viewport', () => {
    beforeEach(() => setDesktopViewport());

    it('should render page title and button', async () => {
      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Command History' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Execute New Command')).toBeInTheDocument();
      });
    });

    it('should render command cards', async () => {
      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
      });
    });

    it('should render pagination inline', async () => {
      useMultiPageHandler({
        page: 1,
        totalPages: 3,
        hasNext: true,
        totalResults: 60,
      });

      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
        expect(screen.getByText('60 total results')).toBeInTheDocument();
        expect(screen.getByLabelText('Page size')).toBeInTheDocument();
      });
    });

    it('should render empty state on desktop', async () => {
      server.use(
        http.get<never, never, ListCommandsSuccessResponse>(
          buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/commands'),
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

      renderWithProviders(<CommandsListPage />);

      await waitFor(() => {
        expect(screen.getByText(/No commands yet/)).toBeInTheDocument();
      });
    });
  });
});
