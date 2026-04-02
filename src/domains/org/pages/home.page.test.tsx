import { HomePage } from '@domains/org/pages/home.page';
import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import type React from 'react';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type GetOrganizationStatsSuccessResponse =
  operations['getApiV1ByOrganizationIdOrganizationStats']['responses']['200']['content']['application/json'];

type ListDevicesSuccessResponse =
  operations['getApiV1ByOrganizationIdTeamsByTeamIdDevices']['responses']['200']['content']['application/json'];

type ListTerminalSessionsSuccessResponse =
  operations['getApiV1ByOrganizationIdTeamsByTeamIdTerminalSessions']['responses']['200']['content']['application/json'];

const mockUseDevicesPresence = vi.fn((deviceIds: number[]) => ({
  presenceMap: new Map(deviceIds.map((id) => [id, true])),
  isLoading: false,
}));

vi.mock('@domains/devices/hooks/use-devices-presence', () => ({
  useDevicesPresence: (deviceIds: number[]) =>
    mockUseDevicesPresence(deviceIds),
}));

const mockNavigate = vi.fn();

const mockUseParams = vi.fn<() => Record<string, string>>(() => ({
  organizationSlug: 'test-org',
  teamSlug: 'my-team',
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useNavigate: () => mockNavigate,
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
  teams: [
    {
      id: 'team-1',
      name: 'My Team',
      slug: 'my-team',
      organizationId: 'org-1',
      createdAt: '2025-12-21T10:00:00.000Z',
    },
  ],
};

function setupDefaultHandlers() {
  server.use(
    http.get<never, never, ListDevicesSuccessResponse>(
      buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
      () => {
        return HttpResponse.json({
          responseData: {
            results: [
              {
                id: 1,
                deviceName: 'Online Server',
                platform: 'linux',
                lastSeenAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
              },
              {
                id: 2,
                deviceName: 'Offline Laptop',
                platform: 'macos',
                lastSeenAt: new Date(Date.now() - 60_000).toISOString(),
                createdAt: new Date().toISOString(),
              },
            ],
            hasNext: false,
            hasPrevious: false,
            totalResults: 2,
            totalPages: 1,
            page: 1,
            size: 50,
          },
          responseErrors: null,
        });
      },
    ),
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
            totalResults: 1,
            totalPages: 1,
            page: 1,
            size: 1,
          },
          responseErrors: null,
        });
      },
    ),
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseDevicesPresence.mockImplementation((deviceIds: number[]) => ({
      presenceMap: new Map(deviceIds.map((id) => [id, true])),
      isLoading: false,
    }));
    mockUseParams.mockReturnValue({
      organizationSlug: 'test-org',
      teamSlug: 'my-team',
    });
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
    setupDefaultHandlers();
  });

  it('should render dashboard with stat cards and device grid', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Devices Online')).toBeInTheDocument();
    expect(screen.getByText('Commands (24h)')).toBeInTheDocument();
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
  });

  it('should show empty state when no devices exist', async () => {
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [],
              hasNext: false,
              hasPrevious: false,
              totalResults: 0,
              totalPages: 0,
              page: 1,
              size: 50,
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
      expect(screen.getByText('Add Your First Device')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Try Cmd+K to search and navigate quickly'),
    ).toBeInTheDocument();
  });

  it('should navigate to devices when remove button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Online Server')).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByRole('button', {
      name: 'Remove device',
    });
    await user.click(removeButtons[0]!);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/$organizationSlug/t/$teamSlug/devices',
        params: { organizationSlug: 'test-org', teamSlug: 'my-team' },
      }),
    );
  });

  it('should navigate to commands when execute command button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Online Server')).toBeInTheDocument();
    });

    const commandButtons = screen.getAllByRole('button', { name: /Command/i });
    await user.click(commandButtons[0]!);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/$organizationSlug/t/$teamSlug/commands',
        params: { organizationSlug: 'test-org', teamSlug: 'my-team' },
      }),
    );
  });

  it('should navigate to terminal when terminal button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Online Server')).toBeInTheDocument();
    });

    // The first card is the offline device (sorted first), its terminal button is disabled.
    // Click the second card's terminal button (online device).
    const terminalButtons = screen.getAllByRole('button', {
      name: /Terminal/i,
    });
    // The online device's terminal button is the second one
    await user.click(terminalButtons[1]!);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/$organizationSlug/t/$teamSlug/terminal',
        params: { organizationSlug: 'test-org', teamSlug: 'my-team' },
      }),
    );
  });

  it('should handle stats with null results gracefully', async () => {
    server.use(
      http.get<never, never, GetOrganizationStatsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/organization/stats'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: null,
            },
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
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Commands (24h) should show 0 when results is null
    expect(screen.getByText('Commands (24h)')).toBeInTheDocument();
  });

  it('should use empty string as teamSlug fallback when teamSlug is not in params', async () => {
    // Track call count to return different values for useCurrentTeam vs HomePage
    let callCount = 0;
    const paramsWithTeam = {
      organizationSlug: 'test-org',
      teamSlug: 'my-team',
    };
    const paramsWithoutTeam = { organizationSlug: 'test-org' };

    // In React strict mode, hooks are called twice per render. The call order per render cycle:
    // useCurrentOrganization (needs orgSlug), useCurrentTeam->useCurrentOrganization (needs orgSlug),
    // useCurrentTeam->useParams (needs teamSlug), HomePage->useParams (should NOT have teamSlug).
    // We return teamSlug for all calls except every 4th call (HomePage's useParams).
    mockUseParams.mockImplementation(() => {
      callCount++;
      // Every 4th call in the sequence is HomePage's own useParams
      return callCount % 4 === 0 ? paramsWithoutTeam : paramsWithTeam;
    });

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // With no teamSlug in params, navigateToDevices should use empty string for teamSlug
    const user = userEvent.setup();
    const removeButtons = screen.getAllByRole('button', {
      name: 'Remove device',
    });
    await user.click(removeButtons[0]!);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { organizationSlug: 'test-org', teamSlug: '' },
      }),
    );
  });

  it('should count devices as offline when presenceMap has no entry for a device', async () => {
    mockUseDevicesPresence.mockImplementation(() => ({
      presenceMap: new Map(),
      isLoading: false,
    }));

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // With an empty presenceMap, presenceMap.get(d.id) returns undefined,
    // so the ?? false fallback kicks in and onlineCount should be 0.
    // The "Devices Online" stat card should show "0/2"
    expect(
      screen.getByText((_content, element) => {
        return (
          element?.tagName === 'H1' &&
          element.textContent?.replace(/\s/g, '') === '0/2'
        );
      }),
    ).toBeInTheDocument();
  });

  it('should handle null responseData gracefully', async () => {
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        () => {
          return HttpResponse.json({
            responseData: null,
            responseErrors: null,
          } as unknown as ListDevicesSuccessResponse);
        },
      ),
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
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // With null responseData, should show empty state (0 devices)
    expect(screen.getByText('Add Your First Device')).toBeInTheDocument();
  });
});
