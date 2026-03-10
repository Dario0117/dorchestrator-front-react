import {
  SessionLoadingSkeleton,
  SessionLocked,
  SessionNotFound,
  SessionTerminated,
} from '@components/terminal/session-state-views';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import type { TerminalSessionDetail } from '@services/terminal/get-terminal-session.http-service';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

const activeSession: TerminalSessionDetail = {
  id: 1,
  deviceId: 1,
  deviceName: 'Production Server',
  userId: 'user-1',
  userName: 'Alice',
  status: 'active',
  shell: '/bin/bash',
  workingDirectory: '/home/user',
  sessionToken: 'mock-token',
  createdAt: '2026-01-15T10:00:00.000Z',
  lastActivityAt: '2026-01-15T12:00:00.000Z',
  inactivityTimeoutMs: 300000,
  terminatedAt: null,
  isShared: false,
};

const terminatedSession: TerminalSessionDetail = {
  ...activeSession,
  status: 'terminated',
  sessionToken: undefined,
  terminatedAt: '2026-01-15T14:00:00.000Z',
};

const lockedSession: TerminalSessionDetail = {
  ...activeSession,
  status: 'locked',
  sessionToken: undefined,
};

describe('SessionLoadingSkeleton', () => {
  it('should render loading skeleton elements', () => {
    const { container } = renderWithProviders(<SessionLoadingSkeleton />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });
});

describe('SessionNotFound', () => {
  it('should render "Session not found" heading', () => {
    renderWithProviders(<SessionNotFound organizationSlug="test-org" />);

    expect(
      screen.getByRole('heading', { name: 'Session not found' }),
    ).toBeInTheDocument();
  });

  it('should render description text', () => {
    renderWithProviders(<SessionNotFound organizationSlug="test-org" />);

    expect(
      screen.getByText(/does not exist or you don't have access/),
    ).toBeInTheDocument();
  });

  it('should render link back to sessions list', () => {
    renderWithProviders(<SessionNotFound organizationSlug="test-org" />);

    expect(screen.getByText('Back to sessions')).toBeInTheDocument();
  });
});

describe('SessionTerminated', () => {
  it('should render "Session terminated" heading', () => {
    renderWithProviders(
      <SessionTerminated
        session={terminatedSession}
        organizationSlug="test-org"
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Session terminated' }),
    ).toBeInTheDocument();
  });

  it('should display device name and shell', () => {
    renderWithProviders(
      <SessionTerminated
        session={terminatedSession}
        organizationSlug="test-org"
      />,
    );

    expect(screen.getByText('Production Server')).toBeInTheDocument();
    expect(screen.getByText('/bin/bash')).toBeInTheDocument();
  });

  it('should display terminated badge', () => {
    renderWithProviders(
      <SessionTerminated
        session={terminatedSession}
        organizationSlug="test-org"
      />,
    );

    expect(screen.getByText('terminated')).toBeInTheDocument();
  });

  it('should display terminated timestamp', () => {
    renderWithProviders(
      <SessionTerminated
        session={terminatedSession}
        organizationSlug="test-org"
      />,
    );

    expect(screen.getByText(/Terminated at/)).toBeInTheDocument();
  });

  it('should not display timestamp when terminatedAt is null', () => {
    const sessionWithoutTerminatedAt = {
      ...terminatedSession,
      terminatedAt: null,
    };

    renderWithProviders(
      <SessionTerminated
        session={sessionWithoutTerminatedAt}
        organizationSlug="test-org"
      />,
    );

    expect(screen.queryByText(/Terminated at/)).not.toBeInTheDocument();
  });

  it('should render link back to sessions list', () => {
    renderWithProviders(
      <SessionTerminated
        session={terminatedSession}
        organizationSlug="test-org"
      />,
    );

    expect(screen.getByText('Back to sessions')).toBeInTheDocument();
  });

  it('should render view recording link with correct href', () => {
    renderWithProviders(
      <SessionTerminated
        session={terminatedSession}
        organizationSlug="test-org"
      />,
    );

    const recordingLink = screen.getByText('View Recording').closest('a');
    expect(recordingLink).toHaveAttribute(
      'href',
      '/$organizationSlug/terminal/sessions/$sessionId/recording',
    );
  });
});

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
        onUnlocked={mockOnUnlocked}
      />,
    );

    // Use getByText instead of getByRole because Radix Dialog opens on mount
    // and marks background content as aria-hidden
    expect(screen.getByText('Re-authenticate')).toBeInTheDocument();
    expect(screen.getByText('Back to sessions')).toBeInTheDocument();
  });

  it('should call onUnlocked after successful re-authentication', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <SessionLocked
        session={lockedSession}
        organizationId="org-1"
        organizationSlug="test-org"
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
});
