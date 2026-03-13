import { AuditLogsListPage } from '@components/audit-logs/pages/audit-logs-list.page';
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
  action?: string;
  resourceType?: string;
  fromDate?: string;
  toDate?: string;
} = { page: 1, size: 25 };

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

const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  role: 'owner',
  memberCount: 1,
  createdAt: '2025-12-21T10:00:00.000Z',
  isDefault: true,
};

type ListAuditLogsSuccessResponse =
  operations['getApiV1ByOrganizationIdAudit-logs']['responses']['200']['content']['application/json'];

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
    http.get<never, never, ListAuditLogsSuccessResponse>(
      buildBackendUrl('/api/v1/{organizationId}/audit-logs'),
      () => {
        return HttpResponse.json({
          responseData: {
            results: [
              {
                id: 'al-1',
                organizationId: 'org-1',
                actorId: 'user-1',
                actorEmail: 'admin@org.com',
                action: 'created',
                resourceType: 'command',
                resourceId: 'cmd-1',
                metadata: {
                  after: { command: 'echo test' },
                },
                clientIp: '192.168.1.1',
                requestId: 'req-1',
                createdAt: new Date().toISOString(),
              },
              {
                id: 'al-2',
                organizationId: 'org-1',
                actorId: 'user-2',
                actorEmail: 'user@org.com',
                action: 'deleted',
                resourceType: 'device',
                resourceId: 'dev-1',
                metadata: {
                  before: { deviceId: 'dev-1' },
                },
                clientIp: '10.0.0.1',
                requestId: 'req-2',
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

function useNullResponseDataHandler() {
  server.use(
    http.get<never, never, ListAuditLogsSuccessResponse>(
      buildBackendUrl('/api/v1/{organizationId}/audit-logs'),
      () => {
        return HttpResponse.json({
          responseData: null,
          responseErrors: null,
        } as unknown as ListAuditLogsSuccessResponse);
      },
    ),
  );
}

function useEmptyHandler() {
  server.use(
    http.get<never, never, ListAuditLogsSuccessResponse>(
      buildBackendUrl('/api/v1/{organizationId}/audit-logs'),
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

describe('AuditLogsListPage', () => {
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
    renderWithProviders(<AuditLogsListPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Audit Logs' }),
      ).toBeInTheDocument();
    });
  });

  it('should render filter controls', async () => {
    renderWithProviders(<AuditLogsListPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by action')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Filter by resource type'),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by date range')).toBeInTheDocument();
    });
  });

  it('should render data table with column headers', async () => {
    renderWithProviders(<AuditLogsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Time')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Resource')).toBeInTheDocument();
      expect(screen.getByText('Actor')).toBeInTheDocument();
      expect(screen.getByText('Resource ID')).toBeInTheDocument();
      expect(screen.getByText('Request ID')).toBeInTheDocument();
    });
  });

  it('should render audit log rows with mock data', async () => {
    renderWithProviders(<AuditLogsListPage />);

    await waitFor(() => {
      expect(screen.getAllByText('admin@org.com').length).toBeGreaterThan(0);
      expect(screen.getAllByText('user@org.com').length).toBeGreaterThan(0);
    });
  });

  it('should render action badges in rows', async () => {
    renderWithProviders(<AuditLogsListPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Created').length).toBeGreaterThan(0);
    });
  });

  it('should show empty state when responseData is null', async () => {
    useNullResponseDataHandler();

    renderWithProviders(<AuditLogsListPage />);

    await waitFor(() => {
      expect(screen.getByText(/No audit logs yet/)).toBeInTheDocument();
    });
  });

  it('should show empty state when no audit logs exist', async () => {
    useEmptyHandler();

    renderWithProviders(<AuditLogsListPage />);

    await waitFor(() => {
      expect(screen.getByText(/No audit logs yet/)).toBeInTheDocument();
    });
  });

  it('should show filtered empty state when filters are active', async () => {
    useEmptyHandler();
    mockSearchParams = { page: 1, size: 25, action: 'created' };

    renderWithProviders(<AuditLogsListPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/No audit logs match your filters/),
      ).toBeInTheDocument();
    });
  });

  it('should show helpful message in filtered empty state', async () => {
    useEmptyHandler();
    mockSearchParams = { page: 1, size: 25, action: 'created' };

    renderWithProviders(<AuditLogsListPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Use the filters above to adjust your search/),
      ).toBeInTheDocument();
    });
  });

  it('should clear filters when clicking "Clear Filters" in filtered empty state', async () => {
    const user = userEvent.setup();
    useEmptyHandler();
    mockSearchParams = { page: 1, size: 25, action: 'created' };

    renderWithProviders(<AuditLogsListPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/No audit logs match your filters/),
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
    const result = call[0].search({
      page: 2,
      size: 25,
      action: 'created',
    });
    expect(result).toEqual({ page: 1, size: 25 });
  });

  it('should display singular "entry" when totalResults is 1', async () => {
    useMultiPageHandler({ totalResults: 1, totalPages: 1, hasNext: false });

    renderWithProviders(<AuditLogsListPage />);

    await waitFor(() => {
      expect(screen.getByText('1 total entry')).toBeInTheDocument();
    });
  });

  it('should display plural "entries" when totalResults is more than 1', async () => {
    useMultiPageHandler({ totalResults: 60 });

    renderWithProviders(<AuditLogsListPage />);

    await waitFor(() => {
      expect(screen.getByText('60 total entries')).toBeInTheDocument();
    });
  });

  describe('Page Size Selector', () => {
    it('should render page size selector', async () => {
      renderWithProviders(<AuditLogsListPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Page size')).toBeInTheDocument();
      });
    });

    it('should have current size selected', async () => {
      renderWithProviders(<AuditLogsListPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Page size')).toHaveTextContent('25');
      });
    });

    it('should render all page size options', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AuditLogsListPage />);

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

      renderWithProviders(<AuditLogsListPage />);

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

      renderWithProviders(<AuditLogsListPage />);

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

      renderWithProviders(<AuditLogsListPage />);

      await waitFor(() => {
        const nextButton = screen.getByLabelText('Go to next page');
        expect(nextButton).toBeDisabled();
      });
    });

    it('should display "Page X of Y" indicator', async () => {
      useMultiPageHandler({ page: 2, totalPages: 5 });
      mockSearchParams = { page: 2, size: 25 };

      renderWithProviders(<AuditLogsListPage />);

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

      renderWithProviders(<AuditLogsListPage />);

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

      renderWithProviders(<AuditLogsListPage />);

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
      renderWithProviders(<AuditLogsListPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Audit Logs' }),
        ).toBeInTheDocument();
      });
    });

    it('should render table with data', async () => {
      renderWithProviders(<AuditLogsListPage />);

      await waitFor(() => {
        expect(screen.getAllByText('admin@org.com').length).toBeGreaterThan(0);
      });
    });

    it('should render pagination controls', async () => {
      useMultiPageHandler({ page: 1, totalPages: 3, hasNext: true });

      renderWithProviders(<AuditLogsListPage />);

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

      renderWithProviders(<AuditLogsListPage />);

      await waitFor(() => {
        expect(screen.getByText(/No audit logs yet/)).toBeInTheDocument();
      });
    });
  });

  describe('Tablet viewport', () => {
    beforeEach(() => setTabletViewport());

    it('should render page title', async () => {
      renderWithProviders(<AuditLogsListPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Audit Logs' }),
        ).toBeInTheDocument();
      });
    });

    it('should render table with data', async () => {
      renderWithProviders(<AuditLogsListPage />);

      await waitFor(() => {
        expect(screen.getAllByText('admin@org.com').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Desktop viewport', () => {
    beforeEach(() => setDesktopViewport());

    it('should render page title', async () => {
      renderWithProviders(<AuditLogsListPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Audit Logs' }),
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

      renderWithProviders(<AuditLogsListPage />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
        expect(screen.getByText('60 total entries')).toBeInTheDocument();
        expect(screen.getByLabelText('Page size')).toBeInTheDocument();
      });
    });

    it('should render empty state on desktop', async () => {
      useEmptyHandler();

      renderWithProviders(<AuditLogsListPage />);

      await waitFor(() => {
        expect(screen.getByText(/No audit logs yet/)).toBeInTheDocument();
      });
    });
  });
});
