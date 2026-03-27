import { DevicesPage } from '@domains/org/pages/devices.page';
import { useUserOrganizationsQueryOptions } from '@domains/org/services/organizations/list-user-organizations.http-service';
import { queryClient } from '@domains/shared/context/query.provider';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { Route } from '@routes/(authenticated)/$organizationSlug/t/$teamSlug/devices';
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
  '@routes/(authenticated)/$organizationSlug/t/$teamSlug/devices',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/t/$teamSlug/devices')
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

describe('DevicesPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.mocked(Route.useSearch).mockReturnValue({ page: 1, size: 25 });
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

  it('should render devices page with device cards', async () => {
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Devices')).toBeInTheDocument();
    });

    // MSW handler returns 5 devices, check for one of them
    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });
  });

  it('should render add device button', async () => {
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Add Device')).toBeInTheDocument();
    });
  });

  it('should open add device modal when Add Device button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Add Device')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Device'));

    await waitFor(() => {
      expect(screen.getByText('Add New Device')).toBeInTheDocument();
    });
  });

  it('should open add device modal from empty state action button', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdTeamsByTeamIdDevices']['responses']['200']['content']['application/json'];
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
              size: 10,
            },
            responseErrors: null,
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText(/No devices yet/)).toBeInTheDocument();
    });

    // Click the "Add Your First Device" button inside the empty state
    const addButton = screen.getByRole('button', {
      name: /Add Your First Device/,
    });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Device')).toBeInTheDocument();
    });
  });

  it('should show empty state when no devices exist', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdTeamsByTeamIdDevices']['responses']['200']['content']['application/json'];
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
              size: 10,
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText(/No devices yet/)).toBeInTheDocument();
    });
  });

  it('should show confirm dialog when remove button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Click the first remove button (Trash icon)
    const removeButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-trash-2'));
    expect(removeButtons[0]).toBeDefined();
    await user.click(removeButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Remove Device')).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to remove Test Server/),
      ).toBeInTheDocument();
    });
  });

  it('should navigate to next page when Next is clicked', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdTeamsByTeamIdDevices']['responses']['200']['content']['application/json'];
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [
                {
                  id: 1,
                  deviceName: 'Device 1',
                  platform: 'linux',
                  lastSeenAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                },
              ],
              hasNext: true,
              hasPrevious: false,
              totalResults: 20,
              totalPages: 2,
              page: 1,
              size: 10,
            },
            responseErrors: null,
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Go to next page' }));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.any(Function),
      }),
    );

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const searchFn = call[0].search;
    const result = searchFn({ page: 1, size: 10 });
    expect(result.page).toBe(2);
  });

  it('should confirm delete and remove device when Remove button is clicked in dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Click the trash button on the first device to open confirm dialog
    const removeButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-trash-2'));
    const firstRemoveButton = removeButtons[0];
    expect(firstRemoveButton).toBeDefined();
    await user.click(firstRemoveButton as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Remove Device')).toBeInTheDocument();
    });

    // Click the confirm "Remove" button
    const confirmButton = screen.getByRole('button', { name: 'Remove' });
    await user.click(confirmButton);

    // Dialog should close (confirmDelete set to null)
    await waitFor(() => {
      expect(screen.queryByText('Remove Device')).not.toBeInTheDocument();
    });
  });

  it('should close confirm dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Click the trash button on the first device to open confirm dialog
    const removeButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-trash-2'));
    const firstRemoveButton = removeButtons[0];
    expect(firstRemoveButton).toBeDefined();
    await user.click(firstRemoveButton as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Remove Device')).toBeInTheDocument();
    });

    // Click Cancel button
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    // Dialog should close (onOpenChange sets confirmDelete to null)
    await waitFor(() => {
      expect(screen.queryByText('Remove Device')).not.toBeInTheDocument();
    });
  });

  it('should navigate with size reset to page 1 when page size is changed', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdTeamsByTeamIdDevices']['responses']['200']['content']['application/json'];
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [
                {
                  id: 1,
                  deviceName: 'Device 1',
                  platform: 'linux',
                  lastSeenAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                },
              ],
              hasNext: true,
              hasPrevious: false,
              totalResults: 50,
              totalPages: 2,
              page: 1,
              size: 25,
            },
            responseErrors: null,
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
    });

    // Open the page size selector and change to 50
    const trigger = screen.getByLabelText('Page size');
    await clickTrigger(trigger);

    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    });

    const option50 = screen.getByRole('option', { name: '50 per page' });
    await user.click(option50);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.any(Function),
      }),
    );

    const call = mockNavigate.mock.calls[0] as [
      { search: (prev: Record<string, unknown>) => Record<string, unknown> },
    ];
    const searchFn = call[0].search;
    const result = searchFn({ page: 2, size: 25 });
    expect(result.page).toBe(1);
    expect(result.size).toBe(50);
  });

  it('should navigate to previous page when Previous is clicked', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdTeamsByTeamIdDevices']['responses']['200']['content']['application/json'];
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [
                {
                  id: 1,
                  deviceName: 'Device 1',
                  platform: 'linux',
                  lastSeenAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                },
              ],
              hasNext: false,
              hasPrevious: true,
              totalResults: 20,
              totalPages: 2,
              page: 2,
              size: 10,
            },
            responseErrors: null,
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: 'Go to previous page' }),
    );

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('should open terminal reauth modal when Open Terminal button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    const terminalButtons = screen.getAllByRole('button', {
      name: /^Terminal$/,
    });
    expect(terminalButtons[0]).toBeDefined();
    await user.click(terminalButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Terminal Authentication')).toBeInTheDocument();
    });
  });

  it('should close terminal reauth modal when dismissed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Open terminal modal
    const terminalButtons = screen.getAllByRole('button', {
      name: /^Terminal$/,
    });
    await user.click(terminalButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Terminal Authentication')).toBeInTheDocument();
    });

    // Close via close button
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Terminal Authentication'),
      ).not.toBeInTheDocument();
    });
  });

  it('should open create terminal session dialog after successful terminal auth', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Open terminal reauth modal
    const terminalButtons = screen.getAllByRole('button', {
      name: /^Terminal$/,
    });
    await user.click(terminalButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Terminal Authentication')).toBeInTheDocument();
    });

    // Fill in password and submit
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'test-password');

    const authenticateButton = screen.getByRole('button', {
      name: 'Authenticate',
    });
    await user.click(authenticateButton);

    // After successful auth, the CreateTerminalSessionDialog should open
    await waitFor(() => {
      expect(screen.getByText('New Terminal Session')).toBeInTheDocument();
    });

    // Terminal reauth modal should be closed
    expect(
      screen.queryByText('Terminal Authentication'),
    ).not.toBeInTheDocument();
  });

  it('should close create terminal session dialog when dismissed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Open terminal reauth modal and authenticate
    const terminalButtons = screen.getAllByRole('button', {
      name: /^Terminal$/,
    });
    await user.click(terminalButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Terminal Authentication')).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'test-password');

    const authenticateButton = screen.getByRole('button', {
      name: 'Authenticate',
    });
    await user.click(authenticateButton);

    await waitFor(() => {
      expect(screen.getByText('New Terminal Session')).toBeInTheDocument();
    });

    // Close the session config dialog via Cancel button
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByText('New Terminal Session'),
      ).not.toBeInTheDocument();
    });
  });

  it('should navigate to terminal session after session is created', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Open terminal reauth modal and authenticate
    const terminalButtons = screen.getAllByRole('button', {
      name: /^Terminal$/,
    });
    await user.click(terminalButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Terminal Authentication')).toBeInTheDocument();
    });

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'test-password');

    const authenticateButton = screen.getByRole('button', {
      name: 'Authenticate',
    });
    await user.click(authenticateButton);

    await waitFor(() => {
      expect(screen.getByText('New Terminal Session')).toBeInTheDocument();
    });

    // Click "Start Session" to create the terminal session
    const startButton = screen.getByRole('button', { name: 'Start Session' });
    await user.click(startButton);

    // Should navigate to the terminal session page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/$organizationSlug/t/$teamSlug/terminal/$sessionId',
          params: expect.objectContaining({
            organizationSlug: 'test-org',
            sessionId: '1',
          }),
        }),
      );
    });

    // Session config dialog should be closed
    expect(screen.queryByText('New Terminal Session')).not.toBeInTheDocument();
  });

  it('should not show configure button for non-admin users', async () => {
    queryClient.setQueryData(useUserOrganizationsQueryOptions.queryKey, {
      responseData: {
        results: [{ ...mockOrganization, role: 'member' }],
        hasNext: false,
        hasPrevious: false,
        totalResults: 1,
        totalPages: 1,
        page: 1,
        size: 100,
      },
      responseErrors: null,
    });

    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Settings button (configure) should NOT be present for member role
    const configButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-settings'));
    expect(configButtons).toHaveLength(0);
  });

  it('should handle responseData being null gracefully', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdTeamsByTeamIdDevices']['responses']['200']['content']['application/json'];
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
    );

    renderWithProviders(<DevicesPage />);

    // When responseData is null, devices defaults to [] and empty state is shown
    await waitFor(() => {
      expect(screen.getByText(/No devices yet/)).toBeInTheDocument();
    });
  });

  it('should filter devices by status=online', async () => {
    vi.mocked(Route.useSearch).mockReturnValue({
      page: 1,
      size: 25,
      status: 'online',
    });

    renderWithProviders(<DevicesPage />);

    // Test Server has lastSeenAt = now, so it should be online
    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Build Agent has lastSeenAt = null so it should NOT appear when filtering online
    expect(screen.queryByText('Build Agent')).not.toBeInTheDocument();
  });

  it('should filter devices by status=offline', async () => {
    vi.mocked(Route.useSearch).mockReturnValue({
      page: 1,
      size: 25,
      status: 'offline',
    });

    renderWithProviders(<DevicesPage />);

    // Build Agent has lastSeenAt = null, should be offline
    await waitFor(() => {
      expect(screen.getByText('Build Agent')).toBeInTheDocument();
    });

    // Test Server has lastSeenAt = now, so it should NOT appear when filtering offline
    expect(screen.queryByText('Test Server')).not.toBeInTheDocument();
  });

  it('should filter devices by platform', async () => {
    vi.mocked(Route.useSearch).mockReturnValue({
      page: 1,
      size: 25,
      platform: 'linux',
    });

    renderWithProviders(<DevicesPage />);

    // Test Server and Test Device 4 are linux
    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });
    expect(screen.getByText('Test Device 4')).toBeInTheDocument();

    // Dev Laptop is macos, should not appear
    expect(screen.queryByText('Dev Laptop')).not.toBeInTheDocument();
    // Build Agent is windows, should not appear
    expect(screen.queryByText('Build Agent')).not.toBeInTheDocument();
  });

  it('should show filtered empty state when filters yield no results', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdTeamsByTeamIdDevices']['responses']['200']['content']['application/json'];
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/teams/{teamId}/devices'),
        () => {
          return HttpResponse.json({
            responseData: {
              results: [
                {
                  id: 1,
                  deviceName: 'Only Linux Device',
                  platform: 'linux',
                  lastSeenAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
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

    // Filter by windows platform - the only device is linux, so filtered list is empty
    vi.mocked(Route.useSearch).mockReturnValue({
      page: 1,
      size: 25,
      platform: 'windows',
    });

    renderWithProviders(<DevicesPage />);

    // Should show the filtered empty state (variant="filtered")
    await waitFor(() => {
      expect(
        screen.getByText('No results match your filters'),
      ).toBeInTheDocument();
    });
  });

  it('should open execute command modal when Command button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    const commandButtons = screen.getAllByRole('button', { name: 'Command' });
    expect(commandButtons[0]).toBeDefined();
    await user.click(commandButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Execute Command' }),
      ).toBeInTheDocument();
    });
  });

  it('should close execute command modal when dismissed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    const commandButtons = screen.getAllByRole('button', { name: 'Command' });
    await user.click(commandButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Execute Command' }),
      ).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Execute Command' }),
      ).not.toBeInTheDocument();
    });
  });

  it('should open device config dialog when Configure button is clicked by admin', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    const configButtons = screen.getAllByLabelText('Configure device');
    expect(configButtons[0]).toBeDefined();
    await user.click(configButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Device Configuration/ }),
      ).toBeInTheDocument();
    });
  });

  it('should close device config dialog when dismissed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    const configButtons = screen.getAllByLabelText('Configure device');
    await user.click(configButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Device Configuration/ }),
      ).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /Device Configuration/ }),
      ).not.toBeInTheDocument();
    });
  });
});
