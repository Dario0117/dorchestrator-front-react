import { NotificationPanel } from '@components/layout/notification-panel';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockNavigate = vi.fn();
const mockUseParams = vi.fn<() => Record<string, string>>(() => ({
  organizationSlug: 'test-org',
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

describe('NotificationPanel', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseParams.mockReturnValue({ organizationSlug: 'test-org' });
  });

  it('should render bell icon button', async () => {
    renderWithProviders(<NotificationPanel />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /notifications/i }),
      ).toBeInTheDocument();
    });
  });

  it('should show unread badge count from count endpoint', async () => {
    renderWithProviders(<NotificationPanel />);

    await waitFor(() => {
      // Mock unread count handler returns 3
      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
    });
  });

  it('should open dropdown panel on click and load notifications', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationPanel />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /notifications/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('should display notification items with message and severity', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationPanel />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /notifications/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /notifications/i }));

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
    const user = userEvent.setup();
    renderWithProviders(<NotificationPanel />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /notifications/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Success').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Error').length).toBeGreaterThan(0);
    });
  });

  it('should show mark all read button when unread notifications exist', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationPanel />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /notifications/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /mark all read/i }),
      ).toBeInTheDocument();
    });
  });

  it('should navigate to command detail on notification click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationPanel />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /notifications/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Command failed on Staging Server'),
      ).toBeInTheDocument();
    });

    // Click the unique "Staging Server" notification (resourceId=102)
    await user.click(screen.getByText('Command failed on Staging Server'));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/$organizationSlug/commands/$commandId',
        params: expect.objectContaining({
          organizationSlug: 'test-org',
          commandId: '102',
        }),
      }),
    );
  });
});
