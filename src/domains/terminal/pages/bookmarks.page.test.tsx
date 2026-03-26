import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { BookmarksPage } from '@domains/terminal/pages/bookmarks.page';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
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

vi.mock(
  '@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/bookmarks',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/t/$teamSlug/terminal/bookmarks')
      >();
    return {
      ...actual,
      Route: {
        ...actual.Route,
        useSearch: vi.fn(() => ({ page: 1, size: 25 })),
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

type ListBookmarksResponse =
  operations['getApiV1ByOrganizationIdTerminalBookmarks']['responses']['200']['content']['application/json'];

function makeBookmark(
  overrides: Partial<ListBookmarksResponse['responseData']['results'][0]> = {},
) {
  return {
    id: 1,
    sessionId: 100,
    note: 'Test bookmark',
    createdAt: '2025-01-15T10:00:00.000Z',
    sessionStatus: 'terminated',
    sessionCreatedAt: '2025-01-15T09:00:00.000Z',
    sessionTerminatedAt: '2025-01-15T10:00:00.000Z',
    recordingSizeBytes: 1024,
    deviceName: 'test-device',
    ...overrides,
  };
}

function setupOrganization() {
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
}

function setupBookmarksHandler(
  bookmarks: ListBookmarksResponse['responseData']['results'] = [],
  pagination: Partial<ListBookmarksResponse['responseData']> = {},
) {
  server.use(
    http.get<never, never, ListBookmarksResponse>(
      buildBackendUrl('/api/v1/{organizationId}/terminal/bookmarks'),
      () => {
        return HttpResponse.json({
          responseData: {
            results: bookmarks,
            hasNext: pagination.hasNext ?? false,
            hasPrevious: pagination.hasPrevious ?? false,
            totalResults: pagination.totalResults ?? bookmarks.length,
            totalPages: pagination.totalPages ?? 1,
            page: pagination.page ?? 1,
            size: pagination.size ?? 25,
          },
          responseErrors: null,
        });
      },
    ),
  );
}

describe('BookmarksPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    setupOrganization();
  });

  it('should render the page title', async () => {
    setupBookmarksHandler();
    renderWithProviders(<BookmarksPage />);

    await waitFor(() => {
      expect(screen.getByText('Bookmarked Sessions')).toBeInTheDocument();
    });
  });

  it('should show empty state when no bookmarks', async () => {
    setupBookmarksHandler([]);
    renderWithProviders(<BookmarksPage />);

    await waitFor(() => {
      expect(screen.getByText('No bookmarked sessions')).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        'Bookmark sessions from the terminal page to quickly access them later.',
      ),
    ).toBeInTheDocument();
  });

  it('should render bookmarks in table', async () => {
    setupBookmarksHandler([
      makeBookmark({ id: 1, deviceName: 'device-alpha' }),
      makeBookmark({ id: 2, deviceName: 'device-beta', sessionId: 200 }),
    ]);
    renderWithProviders(<BookmarksPage />);

    await waitFor(() => {
      expect(screen.getByText('device-alpha')).toBeInTheDocument();
    });
    expect(screen.getByText('device-beta')).toBeInTheDocument();
  });

  it('should navigate to session when row is clicked', async () => {
    const user = userEvent.setup();
    setupBookmarksHandler([makeBookmark({ sessionId: 42 })]);
    renderWithProviders(<BookmarksPage />);

    await waitFor(() => {
      expect(screen.getByText('test-device')).toBeInTheDocument();
    });

    await user.click(screen.getByText('test-device'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/$organizationSlug/t/$teamSlug/terminal/$sessionId',
        params: expect.objectContaining({ sessionId: '42' }),
      }),
    );
  });

  it('should render pagination when bookmarks exist', async () => {
    setupBookmarksHandler([makeBookmark()], {
      totalResults: 50,
      totalPages: 2,
      hasNext: true,
    });
    renderWithProviders(<BookmarksPage />);

    await waitFor(() => {
      expect(screen.getByText('test-device')).toBeInTheDocument();
    });
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });
});
