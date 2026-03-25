import { HomePage } from '@domains/org/pages/home.page';
import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React, { Suspense } from 'react';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type GetOrganizationStatsSuccessResponse =
  operations['getApiV1ByOrganizationIdOrganizationStats']['responses']['200']['content']['application/json'];

type ListDevicesSuccessResponse =
  operations['getApiV1ByOrganizationIdTeamsByTeamIdDevices']['responses']['200']['content']['application/json'];

type ListTerminalSessionsSuccessResponse =
  operations['getApiV1ByOrganizationIdTeamsByTeamIdTerminalSessions']['responses']['200']['content']['application/json'];

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

  it('should render device cards when devices exist', async () => {
    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Online Server')).toBeInTheDocument();
    });

    expect(screen.getByText('Offline Laptop')).toBeInTheDocument();
  });

  it('should render stat card values from API data', async () => {
    server.use(
      http.get<never, never, GetOrganizationStatsSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/organization/stats'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: {
                deviceCount: 5,
                recentCommandCount: 8,
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
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    expect(screen.getByText('Commands (24h)')).toBeInTheDocument();
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

  it('should sort problem devices to the top', async () => {
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [
                {
                  id: 1,
                  deviceName: 'Online Device',
                  platform: 'linux',
                  lastSeenAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                },
                {
                  id: 2,
                  deviceName: 'Offline Device',
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
    );

    renderWithProviders(
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByText('Offline Device')).toBeInTheDocument();
    });

    // Both devices should be rendered
    expect(screen.getByText('Online Device')).toBeInTheDocument();

    // Verify offline device appears first in the DOM
    const deviceNames = screen
      .getAllByText(/Online Device|Offline Device/)
      .map((el) => el.textContent);
    expect(deviceNames[0]).toBe('Offline Device');
    expect(deviceNames[1]).toBe('Online Device');
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
    // biome-ignore lint/style/noNonNullAssertion: test assertion — element is guaranteed by getAllByRole
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
    // biome-ignore lint/style/noNonNullAssertion: test assertion — element is guaranteed by getAllByRole
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
    // biome-ignore lint/style/noNonNullAssertion: test assertion — element is guaranteed by getAllByRole
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
    mockUseParams.mockReturnValue({ organizationSlug: 'test-org' });

    class ErrorBoundary extends React.Component<
      { children: React.ReactNode },
      { hasError: boolean }
    > {
      constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
      }

      static getDerivedStateFromError() {
        return { hasError: true };
      }

      render() {
        if (this.state.hasError) {
          return <div data-testid="error-caught">error</div>;
        }
        return this.props.children;
      }
    }

    // biome-ignore lint/suspicious/noConsole: suppressing expected error output from error boundary
    const originalError = globalThis.console.error;
    globalThis.console.error = vi.fn();

    renderWithProviders(
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <HomePage />
        </Suspense>
      </ErrorBoundary>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-caught')).toBeInTheDocument();
    });

    globalThis.console.error = originalError;
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
