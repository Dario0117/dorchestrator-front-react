import { SessionLocked } from '@components/terminal/session-locked';
import { buildBackendUrl } from '@lib/test.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import type { TerminalSessionDetail } from '@services/terminal/get-terminal-session.http-service';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Link: ({
      children,
      to,
      ...props
    }: {
      children: React.ReactNode;
      to: string;
      params?: Record<string, string>;
    }) => (
      <a
        href={to}
        {...props}
      >
        {children}
      </a>
    ),
  };
});

const lockedSession: TerminalSessionDetail = {
  id: 1,
  deviceId: 1,
  deviceName: 'Production Server',
  userId: 'user-1',
  userName: 'Alice',
  status: 'locked',
  shell: '/bin/bash',
  workingDirectory: '/home/user',
  sessionToken: undefined,
  createdAt: '2026-01-15T10:00:00.000Z',
  lastActivityAt: '2026-01-15T12:00:00.000Z',
  inactivityTimeoutMs: 300000,
  terminatedAt: null,
  isShared: false,
};

describe('SessionLocked', () => {
  const mockOnUnlocked = vi.fn();

  beforeEach(() => {
    mockOnUnlocked.mockClear();
  });

  it('should render "Session locked" heading', () => {
    renderWithProviders(
      <SessionLocked
        session={lockedSession}
        organizationId="org-1"
        organizationSlug="test-org"
        teamSlug="default"
        onUnlocked={mockOnUnlocked}
      />,
    );

    // Use getByText instead of getByRole because Radix Dialog opens on mount
    // and marks background content as aria-hidden
    expect(screen.getByText('Session locked')).toBeInTheDocument();
  });

  it('should display device name and shell', () => {
    renderWithProviders(
      <SessionLocked
        session={lockedSession}
        organizationId="org-1"
        organizationSlug="test-org"
        teamSlug="default"
        onUnlocked={mockOnUnlocked}
      />,
    );

    expect(screen.getByText('Production Server')).toBeInTheDocument();
    expect(screen.getByText('/bin/bash')).toBeInTheDocument();
  });

  it('should display locked badge', () => {
    renderWithProviders(
      <SessionLocked
        session={lockedSession}
        organizationId="org-1"
        organizationSlug="test-org"
        teamSlug="default"
        onUnlocked={mockOnUnlocked}
      />,
    );

    expect(screen.getByText('locked')).toBeInTheDocument();
  });

  it('should show reauth modal on mount', async () => {
    renderWithProviders(
      <SessionLocked
        session={lockedSession}
        organizationId="org-1"
        organizationSlug="test-org"
        teamSlug="default"
        onUnlocked={mockOnUnlocked}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Terminal Authentication')).toBeInTheDocument();
    });
  });

  it('should render re-authenticate and back buttons', () => {
    renderWithProviders(
      <SessionLocked
        session={lockedSession}
        organizationId="org-1"
        organizationSlug="test-org"
        teamSlug="default"
        onUnlocked={mockOnUnlocked}
      />,
    );

    // Use getByText instead of getByRole because Radix Dialog opens on mount
    // and marks background content as aria-hidden
    expect(screen.getByText('Re-authenticate')).toBeInTheDocument();
    expect(screen.getByText('Back to sessions')).toBeInTheDocument();
  });

  it('should re-open reauth modal when Re-authenticate button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <SessionLocked
        session={lockedSession}
        organizationId="org-1"
        organizationSlug="test-org"
        teamSlug="default"
        onUnlocked={mockOnUnlocked}
      />,
    );

    // Modal opens on mount
    await waitFor(() => {
      expect(screen.getByText('Terminal Authentication')).toBeInTheDocument();
    });

    // Close the modal by clicking the close button
    await user.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(
        screen.queryByText('Terminal Authentication'),
      ).not.toBeInTheDocument();
    });

    // Click Re-authenticate to re-open
    await user.click(screen.getByText('Re-authenticate'));

    await waitFor(() => {
      expect(screen.getByText('Terminal Authentication')).toBeInTheDocument();
    });
  });

  it('should call onUnlocked after successful re-authentication', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <SessionLocked
        session={lockedSession}
        organizationId="org-1"
        organizationSlug="test-org"
        teamSlug="default"
        onUnlocked={mockOnUnlocked}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/Password/), 'correct-password');
    await user.click(screen.getByRole('button', { name: 'Authenticate' }));

    await waitFor(() => {
      expect(mockOnUnlocked).toHaveBeenCalledOnce();
    });
  });

  it('should display error message when unlock mutation fails', async () => {
    server.use(
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}/unlock',
        ),
        () => {
          return HttpResponse.json(
            { message: 'Unlock failed' },
            { status: 500 },
          );
        },
      ),
    );

    const user = userEvent.setup();

    renderWithProviders(
      <SessionLocked
        session={lockedSession}
        organizationId="org-1"
        organizationSlug="test-org"
        teamSlug="default"
        onUnlocked={mockOnUnlocked}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/Password/), 'correct-password');
    await user.click(screen.getByRole('button', { name: 'Authenticate' }));

    await waitFor(() => {
      expect(
        screen.getByText('Failed to unlock session. Please try again.'),
      ).toBeInTheDocument();
    });

    expect(mockOnUnlocked).not.toHaveBeenCalled();
  });
});
