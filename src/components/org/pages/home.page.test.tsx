import { HomePage } from '@components/org/pages/home.page';
import { queryClient } from '@context/query.provider';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { useUserOrganizationsQueryOptions } from '@services/organizations/list-user-organizations.http-service';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type GetOrganizationStatsSuccessResponse =
  operations['getApiV1ByOrganizationIdOrganizationStats']['responses']['200']['content']['application/json'];

type GetOrganizationDetailsSuccessResponse =
  operations['getApiV1ByOrganizationIdOrganization']['responses']['200']['content']['application/json'];

const mockUseParams = vi.fn<() => Record<string, string>>(() => ({
  organizationSlug: 'test-org',
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: () => mockUseParams(),
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
    mockUseParams.mockReturnValue({ organizationSlug: 'test-org' });
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
                    deviceName: 'server-1',
                    createdAt: '2025-12-21T14:30:00.000Z',
                  },
                  {
                    id: 2,
                    command: 'uptime',
                    status: 'pending',
                    deviceName: 'server-2',
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
    expect(screen.getByText('7')).toBeInTheDocument();
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

    // deviceCount and recentCommandCount should fallback to 0
    const zeroValues = screen.getAllByText('0');
    expect(zeroValues.length).toBeGreaterThanOrEqual(2);

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

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('No recent commands')).toBeInTheDocument();
  });

  it('should fallback tier to free when org details tier is undefined', async () => {
    server.use(
      http.get<never, never, GetOrganizationDetailsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/organization'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: {
                id: 'org-1',
                name: 'Test Organization',
                createdAt: '2025-12-21T10:00:00.000Z',
                memberCount: 1,
                tier: undefined,
                deviceLimit: null,
              },
            },
            responseErrors: null,
          } as unknown as GetOrganizationDetailsSuccessResponse);
        },
      ),
    );

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Tier')).toBeInTheDocument();
    });

    expect(screen.getByText('free')).toBeInTheDocument();
  });

  it('should use teamSlug from params when available', async () => {
    mockUseParams.mockReturnValue({
      organizationSlug: 'test-org',
      teamSlug: 'my-team',
    });

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
  });
});
