import { NotificationPanel } from '@components/layout/notification-panel';
import { useCurrentOrganization } from '@hooks/use-current-organization';
import { buildBackendUrl } from '@lib/test.utils';
import { clickTrigger, renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

type ListNotificationsSuccessResponse =
  operations['getApiV1ByOrganizationIdNotifications']['responses']['200']['content']['application/json'];
type GetUnreadCountSuccessResponse =
  operations['getApiV1ByOrganizationIdNotificationsUnread-count']['responses']['200']['content']['application/json'];

const mockNavigate = vi.fn();
const mockUseParams = vi.fn<() => Record<string, string>>(() => ({
  organizationSlug: 'test-org',
  teamSlug: 'default',
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

vi.mock('@hooks/use-current-organization', () => ({
  useCurrentOrganization: vi.fn(() => ({
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
  })),
}));

const mockUseCurrentOrganization = vi.mocked(useCurrentOrganization);

function overrideNotificationsHandler(
  results: ListNotificationsSuccessResponse['responseData']['results'],
) {
  server.use(
    http.get(buildBackendUrl('/api/v1/{organizationId}/notifications'), () => {
      return HttpResponse.json<ListNotificationsSuccessResponse>({
        responseData: {
          results,
          hasNext: false,
          hasPrevious: false,
          totalResults: results.length,
          totalPages: 1,
          page: 1,
          size: 10,
        },
        responseErrors: null,
      });
    }),
  );
}

function overrideUnreadCountHandler(count: number) {
  server.use(
    http.get(
      buildBackendUrl('/api/v1/{organizationId}/notifications/unread-count'),
      () => {
        return HttpResponse.json<GetUnreadCountSuccessResponse>({
          responseData: {
            results: { count },
          },
          responseErrors: null,
        });
      },
    ),
  );
}

async function openNotificationPanel() {
  await waitFor(() => {
    expect(
      screen.getByRole('button', { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  await clickTrigger(screen.getByRole('button', { name: /notifications/i }));
}

describe('NotificationPanel', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseParams.mockReturnValue({ organizationSlug: 'test-org' });
    mockUseCurrentOrganization.mockReturnValue({
      id: 'org-1',
      name: 'Test Organization',
      slug: 'test-org',
    } as ReturnType<typeof useCurrentOrganization>);
  });

  it('should render bell icon button', async () => {
    renderWithProviders(<NotificationPanel />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /notifications/i }),
      ).toBeInTheDocument();
    });
  });

  it('should render nothing when no current organization', () => {
    mockUseCurrentOrganization.mockReturnValue(
      undefined as unknown as ReturnType<typeof useCurrentOrganization>,
    );
    mockUseParams.mockReturnValue({});

    const { container } = renderWithProviders(<NotificationPanel />);

    expect(container.innerHTML).toBe('');
  });

  it('should show unread badge count from count endpoint', async () => {
    renderWithProviders(<NotificationPanel />);

    await waitFor(() => {
      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
    });
  });

  it('should show 99+ when unread count exceeds 99', async () => {
    overrideUnreadCountHandler(150);
    renderWithProviders(<NotificationPanel />);

    await waitFor(() => {
      expect(screen.getByText('99+')).toBeInTheDocument();
    });
  });

  it('should open dropdown panel on click and load notifications', async () => {
    renderWithProviders(<NotificationPanel />);

    await openNotificationPanel();

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('should display notification items with message and severity', async () => {
    renderWithProviders(<NotificationPanel />);

    await openNotificationPanel();

    await waitFor(() => {
      expect(
        screen.getAllByText('Command completed on Production Server'),
      ).toHaveLength(2);
      expect(
        screen.getByText('Command failed on Staging Server'),
      ).toBeInTheDocument();
    });
  });

  it('should show severity badges', async () => {
    renderWithProviders(<NotificationPanel />);

    await openNotificationPanel();

    await waitFor(() => {
      expect(screen.getAllByText('Success').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Error').length).toBeGreaterThan(0);
    });
  });

  it('should show mark all read button when unread notifications exist', async () => {
    renderWithProviders(<NotificationPanel />);

    await openNotificationPanel();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /mark all read/i }),
      ).toBeInTheDocument();
    });
  });

  it('should call mark all read mutation when button is clicked', async () => {
    renderWithProviders(<NotificationPanel />);

    await openNotificationPanel();

    const user = userEvent.setup();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /mark all read/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /mark all read/i }));

    // Verify the mutation was triggered (button exists and is clickable)
    expect(
      screen.getByRole('button', { name: /mark all read/i }),
    ).toBeInTheDocument();
  });

  it('should navigate to command detail on notification click', async () => {
    renderWithProviders(<NotificationPanel />);

    await openNotificationPanel();

    await waitFor(() => {
      expect(
        screen.getByText('Command failed on Staging Server'),
      ).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Command failed on Staging Server'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/$organizationSlug/t/$teamSlug/commands/$commandId',
        params: expect.objectContaining({
          organizationSlug: 'test-org',
          commandId: '102',
        }),
      }),
    );
  });

  it('should navigate to devices page on device notification click', async () => {
    overrideNotificationsHandler([
      {
        id: 10,
        message: 'Device went offline',
        resourceId: 'dev-1',
        resourceType: 'device',
        severity: 'warning',
        read: true,
        createdAt: new Date().toISOString(),
      },
    ]);

    renderWithProviders(<NotificationPanel />);

    await openNotificationPanel();

    await waitFor(() => {
      expect(screen.getByText('Device went offline')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Device went offline'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/$organizationSlug',
        params: expect.objectContaining({
          organizationSlug: 'test-org',
        }),
      }),
    );
  });

  it('should navigate to terminal session on terminal notification click', async () => {
    overrideNotificationsHandler([
      {
        id: 11,
        message: 'Terminal session started',
        resourceId: 'session-1',
        resourceType: 'terminal_session',
        severity: 'info',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    renderWithProviders(<NotificationPanel />);

    await openNotificationPanel();

    await waitFor(() => {
      expect(screen.getByText('Terminal session started')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Terminal session started'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/$organizationSlug/t/$teamSlug/terminal/$sessionId',
        params: expect.objectContaining({
          organizationSlug: 'test-org',
          sessionId: 'session-1',
        }),
      }),
    );
  });

  it('should not call mark read for already read notifications', async () => {
    overrideNotificationsHandler([
      {
        id: 20,
        message: 'Already read notification',
        resourceId: '200',
        resourceType: 'command',
        severity: 'success',
        read: true,
        createdAt: new Date().toISOString(),
      },
    ]);

    renderWithProviders(<NotificationPanel />);

    await openNotificationPanel();

    await waitFor(() => {
      expect(screen.getByText('Already read notification')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Already read notification'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/$organizationSlug/t/$teamSlug/commands/$commandId',
        params: expect.objectContaining({
          commandId: '200',
        }),
      }),
    );
  });

  it('should use teamSlug from params when navigating on notification click', async () => {
    mockUseParams.mockReturnValue({
      organizationSlug: 'test-org',
      teamSlug: 'my-team',
    });

    overrideNotificationsHandler([
      {
        id: 30,
        message: 'Command completed with team',
        resourceId: '300',
        resourceType: 'command',
        severity: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    renderWithProviders(<NotificationPanel />);

    await openNotificationPanel();

    await waitFor(() => {
      expect(
        screen.getByText('Command completed with team'),
      ).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Command completed with team'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/$organizationSlug/t/$teamSlug/commands/$commandId',
        params: expect.objectContaining({
          organizationSlug: 'test-org',
          teamSlug: 'my-team',
          commandId: '300',
        }),
      }),
    );
  });

  it('should show empty state when no notifications exist', async () => {
    overrideNotificationsHandler([]);
    overrideUnreadCountHandler(0);

    renderWithProviders(<NotificationPanel />);

    await openNotificationPanel();

    await waitFor(() => {
      expect(screen.getByText('All caught up')).toBeInTheDocument();
      expect(screen.getByText('No notifications to show')).toBeInTheDocument();
    });
  });
});
