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
  '@routes/(authenticated)/$organizationSlug/devices',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@routes/(authenticated)/$organizationSlug/devices')
      >();
    return {
      ...actual,
      Route: {
        ...actual.Route,
        useSearch: vi.fn(() => ({ page: 1, size: 10 })),
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

    expect(mockNavigate).toHaveBeenCalled();
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
});
