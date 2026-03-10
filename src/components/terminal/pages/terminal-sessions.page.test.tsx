import { TerminalSessionsPage } from '@components/terminal/pages/terminal-sessions.page';
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
                status: 'active',
                shell: '/bin/bash',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                lastActivityAt: new Date(Date.now() - 60000).toISOString(),
              },
              {
                id: 2,
                deviceId: 2,
                deviceName: 'Dev Laptop',
                userId: 'user-2',
                userName: 'Bob',
                status: 'terminated',
                shell: '/bin/zsh',
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                lastActivityAt: new Date(Date.now() - 300000).toISOString(),
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
      expect(screen.getByText('Device')).toBeInTheDocument();
      expect(screen.getByText('Owner')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Last Activity')).toBeInTheDocument();
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
        screen.getByText(/No sessions match your filter/),
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
});
