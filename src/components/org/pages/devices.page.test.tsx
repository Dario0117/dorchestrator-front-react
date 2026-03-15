import { DevicesPage } from '@components/org/pages/devices.page';
import { queryClient } from '@context/query.provider';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
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
        useSearch: vi.fn(() => ({ page: 1, size: 10 })),
        useParams: vi.fn(() => ({
          organizationSlug: 'test-org',
          teamSlug: 'default',
        })),
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

describe('DevicesPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
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
      operations['getApiV1ByOrganizationIdDevices']['responses']['200']['content']['application/json'];
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/devices'),
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
      expect(screen.getByText(/No devices registered yet/)).toBeInTheDocument();
    });

    // Click the "Add Device" button inside the empty state
    const addButtons = screen.getAllByRole('button', { name: /Add Device/ });
    // The empty state action button is the second one (first is in the header)
    await user.click(addButtons[addButtons.length - 1] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Add New Device')).toBeInTheDocument();
    });
  });

  it('should show empty state when no devices exist', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdDevices']['responses']['200']['content']['application/json'];
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/devices'),
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
      expect(screen.getByText(/No devices registered yet/)).toBeInTheDocument();
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

  it('should render pagination when multiple pages exist', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdDevices']['responses']['200']['content']['application/json'];
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/devices'),
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

    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Device 1')).toBeInTheDocument();
    });

    // Should show pagination navigation
    expect(
      screen.getByRole('navigation', { name: 'pagination' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should navigate to next page when Next is clicked', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdDevices']['responses']['200']['content']['application/json'];
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/devices'),
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

  it('should navigate to previous page when Previous is clicked', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdDevices']['responses']['200']['content']['application/json'];
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/devices'),
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

  it('should navigate when clicking a page number', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdDevices']['responses']['200']['content']['application/json'];
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/devices'),
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

    // Click page 2 link
    const page2Link = screen.getByRole('button', { name: '2' });
    await user.click(page2Link);

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('should open execute command modal when Execute Command button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Click the first "Execute Command" button
    const executeButtons = screen.getAllByRole('button', {
      name: /Execute Command/,
    });
    const firstExecuteButton = executeButtons[0];
    expect(firstExecuteButton).toBeDefined();
    await user.click(firstExecuteButton as HTMLElement);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Execute Command' }),
      ).toBeInTheDocument();
    });
  });

  it('should open terminal reauth modal when Open Terminal button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    const terminalButtons = screen.getAllByRole('button', {
      name: /Open Terminal/,
    });
    expect(terminalButtons[0]).toBeDefined();
    await user.click(terminalButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText('Terminal Authentication')).toBeInTheDocument();
    });
  });

  it('should open config dialog when configure button is clicked (admin)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Settings button (configure) should be present since role is owner
    const configButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-settings'));
    expect(configButtons[0]).toBeDefined();
    await user.click(configButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(
        screen.getByText(/Device Configuration: Test Server/),
      ).toBeInTheDocument();
    });
  });

  it('should close config dialog when dismissed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Open config dialog
    const configButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-settings'));
    await user.click(configButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(
        screen.getByText(/Device Configuration: Test Server/),
      ).toBeInTheDocument();
    });

    // Close via close button
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/Device Configuration: Test Server/),
      ).not.toBeInTheDocument();
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
      name: /Open Terminal/,
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
      name: /Open Terminal/,
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
      name: /Open Terminal/,
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
      name: /Open Terminal/,
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

  it('should close execute command modal when dismissed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DevicesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    // Open execute command modal
    const executeButtons = screen.getAllByRole('button', {
      name: /Execute Command/,
    });
    await user.click(executeButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Execute Command' }),
      ).toBeInTheDocument();
    });

    // Close the modal via the close button
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'Execute Command' }),
      ).not.toBeInTheDocument();
    });
  });

  it('should handle responseData being null gracefully', async () => {
    type ListDevicesSuccessResponse =
      operations['getApiV1ByOrganizationIdDevices']['responses']['200']['content']['application/json'];
    server.use(
      http.get<never, never, ListDevicesSuccessResponse>(
        buildBackendUrl('/api/v1/{organizationId}/devices'),
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
      expect(screen.getByText(/No devices registered yet/)).toBeInTheDocument();
    });
  });

  // The else branches for onOpenChange handlers at L185, L198, L218, L243
  // cannot be feasibly covered via user interaction. These guards only act
  // when onOpenChange is called with open=true, which is an internal dialog
  // no-op path (the dialog is already open). There is no user action that
  // triggers this code path.
});
