import { SessionTerminated } from '@domains/terminal/components/session-terminated';
import type { TerminalSessionDetail } from '@domains/terminal/services/get-terminal-session.http-service';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen } from '@testing-library/react';

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

const terminatedSession: TerminalSessionDetail = {
  id: 1,
  deviceId: 1,
  deviceName: 'Production Server',
  userId: 'user-1',
  userName: 'Alice',
  status: 'terminated',
  shell: '/bin/bash',
  workingDirectory: '/home/user',
  sessionToken: undefined,
  createdAt: '2026-01-15T10:00:00.000Z',
  lastActivityAt: '2026-01-15T12:00:00.000Z',
  inactivityTimeoutMs: 300000,
  terminatedAt: '2026-01-15T14:00:00.000Z',
  isShared: false,
};

describe('SessionTerminated', () => {
  it('should render "Session terminated" heading', () => {
    renderWithProviders(
      <SessionTerminated
        session={terminatedSession}
        organizationSlug="test-org"
        teamSlug="default"
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
        teamSlug="default"
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
        teamSlug="default"
      />,
    );

    expect(screen.getByText('terminated')).toBeInTheDocument();
  });

  it('should display terminated timestamp', () => {
    renderWithProviders(
      <SessionTerminated
        session={terminatedSession}
        organizationSlug="test-org"
        teamSlug="default"
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
        teamSlug="default"
      />,
    );

    expect(screen.queryByText(/Terminated at/)).not.toBeInTheDocument();
  });

  it('should render link back to sessions list', () => {
    renderWithProviders(
      <SessionTerminated
        session={terminatedSession}
        organizationSlug="test-org"
        teamSlug="default"
      />,
    );

    expect(screen.getByText('Back to sessions')).toBeInTheDocument();
  });

  it('should render view recording link with correct href', () => {
    renderWithProviders(
      <SessionTerminated
        session={terminatedSession}
        organizationSlug="test-org"
        teamSlug="default"
      />,
    );

    const recordingLink = screen.getByText('View Recording').closest('a');
    expect(recordingLink).toHaveAttribute(
      'href',
      '/$organizationSlug/t/$teamSlug/terminal/sessions/$sessionId/recording',
    );
  });
});
