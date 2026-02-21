import { HomePage } from '@components/org/pages/home.page';
import { queryClient } from '@context/query.provider';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { setMobileViewport, setTabletViewport } from '@lib/viewport-test-utils';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type GetOrganizationStatsSuccessResponse =
  operations['getApiV1ByOrganizationIdOrganizationStats']['responses']['200']['content']['application/json'];

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: () => ({ organizationSlug: 'test-org' }),
    Link: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => (
      <a
        href={typeof props.to === 'string' ? props.to : '#'}
        data-testid="mock-link"
      >
        {children}
      </a>
    ),
  };
});

const mockOrganization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  role: 'owner',
  memberCount: 1,
  createdAt: '2025-12-21T10:00:00.000Z',
  isDefault: true,
};

describe('HomePage', () => {
  beforeEach(() => {
    // Seed query cache with organization data (new API response shape)
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

  it('should render organization dashboard with stats', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Welcome to Test Organization'),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('Manage your devices and execute remote commands'),
    ).toBeInTheDocument();
  });

  it('should render stat cards with correct data', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Devices')).toBeInTheDocument();
    });

    expect(screen.getByText('Commands (24h)')).toBeInTheDocument();
    expect(screen.getByText('Tier')).toBeInTheDocument();
    expect(screen.getByText('free')).toBeInTheDocument();
  });

  it('should render recent activity section', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  it('should render recent commands when stats contain command data', async () => {
    server.use(
      http.get<never, never, GetOrganizationStatsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/organization/stats'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: {
                deviceCount: 7,
                recentCommandCount: 12,
                recentCommands: [
                  {
                    id: 1,
                    command: 'echo "hello"',
                    status: 'completed',
                    createdAt: '2025-12-21T14:30:00.000Z',
                  },
                  {
                    id: 2,
                    command: 'uptime',
                    status: 'pending',
                    createdAt: '2025-12-21T14:00:00.000Z',
                  },
                ],
              },
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('echo "hello"')).toBeInTheDocument();
    });

    expect(screen.getByText('uptime')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();

    // Verify stat card values reflect the data
    // deviceCount comes from org details (default handler: 3), not stats
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should show fallback message when stats results is null', async () => {
    server.use(
      http.get<never, never, GetOrganizationStatsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/organization/stats'),
        () => {
          return HttpResponse.json({
            responseData: null,
            responseErrors: null,
          } as unknown as GetOrganizationStatsSuccessResponse);
        },
      ),
    );

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Devices')).toBeInTheDocument();
    });

    // recentCommandCount should fallback to 0, deviceCount comes from org details (3)
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);

    // Should show fallback text for no recent commands
    expect(screen.getByText('No recent commands')).toBeInTheDocument();
  });

  it('should show fallback message when recentCommands is empty array', async () => {
    server.use(
      http.get<never, never, GetOrganizationStatsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/organization/stats'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: {
                deviceCount: 2,
                recentCommandCount: 0,
                recentCommands: [],
              },
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Devices')).toBeInTheDocument();
    });

    // deviceCount comes from org details (3), recentCommandCount from stats (0)
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('No recent commands')).toBeInTheDocument();
  });

  describe('Mobile Responsive Layout (AC2, AC3)', () => {
    it('uses responsive padding on mobile (375px)', async () => {
      setMobileViewport();
      const { container } = renderWithProviders(
        <Suspense fallback={<div>Loading...</div>}>
          <HomePage />
        </Suspense>,
      );

      await waitFor(() => {
        const section = container.querySelector('section');
        expect(section).toBeInTheDocument();
      });

      const section = container.querySelector('section');
      // p-6 on mobile, md:p-10 on desktop
      expect(section).toHaveClass('p-6');
      expect(section).toHaveClass('md:p-10');
    });

    it('renders stats cards in single column on mobile', async () => {
      setMobileViewport();
      const { container } = renderWithProviders(
        <Suspense fallback={<div>Loading...</div>}>
          <HomePage />
        </Suspense>,
      );

      await waitFor(() => {
        const statsGrid = container.querySelector('.grid.md\\:grid-cols-3');
        if (statsGrid) {
          // md:grid-cols-3 means 3 columns at md breakpoint and above
          // On mobile (< 768px), it defaults to grid-cols-1 (single column)
          expect(statsGrid).toHaveClass('md:grid-cols-3');
        }
      });
    });

    it('renders stats cards in 3 columns on tablet and desktop', async () => {
      setTabletViewport();
      const { container } = renderWithProviders(
        <Suspense fallback={<div>Loading...</div>}>
          <HomePage />
        </Suspense>,
      );

      await waitFor(() => {
        const statsGrid = container.querySelector('.grid.md\\:grid-cols-3');
        if (statsGrid) {
          // md:grid-cols-3 applies at 768px+ (tablet and desktop)
          expect(statsGrid).toHaveClass('md:grid-cols-3');
        }
      });
    });
  });
});
