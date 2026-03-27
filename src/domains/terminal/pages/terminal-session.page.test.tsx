import { TerminalSessionPage } from '@domains/terminal/pages/terminal-session.page';
import { listShortcutsHandler } from '@domains/terminal/services/list-shortcuts.http-service.handlers';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Suspense } from 'react';
import { server } from '@/../testsSetup';
import type { operations } from '@/types/api.generated.types';

// Mock external xterm modules (external dependencies, not internal modules)
vi.mock('@xterm/xterm', () => {
  function MockTerminal() {
    return {
      open: vi.fn(),
      write: vi.fn(),
      dispose: vi.fn(),
      reset: vi.fn(),
      onData: vi.fn().mockReturnValue({ dispose: vi.fn() }),
      loadAddon: vi.fn(),
      focus: vi.fn(),
      options: { fontSize: 14 },
      cols: 80,
      rows: 24,
    };
  }
  return { Terminal: MockTerminal };
});

vi.mock('@xterm/addon-fit', () => ({
  FitAddon: function MockFitAddon() {
    return { fit: vi.fn(), dispose: vi.fn() };
  },
}));

vi.mock('@xterm/addon-webgl', () => ({
  WebglAddon: function MockWebglAddon() {
    return { dispose: vi.fn() };
  },
}));

vi.mock('@xterm/addon-web-links', () => ({
  WebLinksAddon: function MockWebLinksAddon() {
    return { dispose: vi.fn() };
  },
}));

vi.spyOn(terminalWsClient, 'onMessage').mockImplementation(() => vi.fn());
vi.spyOn(terminalWsClient, 'connect').mockImplementation(() => undefined);
vi.spyOn(terminalWsClient, 'connectForEvents').mockImplementation(
  () => undefined,
);
vi.spyOn(terminalWsClient, 'send').mockImplementation(() => undefined);

interface LinkProps {
  children: React.ReactNode;
  to: string;
  params?: Record<string, string>;
  [key: string]: unknown;
}

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useParams: () => ({
      sessionId: '1',
      organizationSlug: 'test-org',
      teamSlug: 'my-team',
    }),
    useNavigate: () => vi.fn(),
    Link: ({ children, to, ...props }: LinkProps) => (
      <a
        href={to}
        {...props}
      >
        {children}
      </a>
    ),
  };
});

vi.mock('@domains/shared/hooks/use-current-organization', () => ({
  useCurrentOrganization: () => ({
    id: 'org-1',
    name: 'Test Org',
    slug: 'test-org',
    role: 'owner',
  }),
}));

type GetTerminalSessionSuccessResponse =
  operations['getApiV1ByOrganizationIdTerminalSessionsBySessionId']['responses']['200']['content']['application/json'];

function renderPage() {
  return renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <TerminalSessionPage />
    </Suspense>,
  );
}

describe('TerminalSessionPage', () => {
  it('renders terminated session view when session is terminated', async () => {
    server.use(
      http.get<
        { organizationId: string; sessionId: string },
        never,
        GetTerminalSessionSuccessResponse
      >(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
        ),
        () => {
          return HttpResponse.json({
            responseData: {
              results: {
                id: 1,
                deviceId: 1,
                deviceName: 'Production Server',
                userId: 'user-1',
                userName: 'Alice',
                status: 'terminated',
                shell: '/bin/bash',
                workingDirectory: '/home/user',
                sessionToken: 'mock-session-token',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                lastActivityAt: new Date(Date.now() - 60000).toISOString(),
                inactivityTimeoutMs: 300000,
                terminatedAt: new Date().toISOString(),
                isShared: false,
              },
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Session terminated')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'This terminal session has been terminated and cannot be reconnected.',
      ),
    ).toBeInTheDocument();
  });

  it('renders locked session view when session is locked', async () => {
    server.use(
      http.get<
        { organizationId: string; sessionId: string },
        never,
        GetTerminalSessionSuccessResponse
      >(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
        ),
        () => {
          return HttpResponse.json({
            responseData: {
              results: {
                id: 1,
                deviceId: 1,
                deviceName: 'Production Server',
                userId: 'user-1',
                userName: 'Alice',
                status: 'locked',
                shell: '/bin/bash',
                workingDirectory: '/home/user',
                sessionToken: 'mock-session-token',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                lastActivityAt: new Date(Date.now() - 60000).toISOString(),
                inactivityTimeoutMs: 300000,
                terminatedAt: null,
                isShared: false,
              },
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Session locked')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'This session has been locked due to inactivity. Re-authenticate to resume.',
      ),
    ).toBeInTheDocument();
  });

  describe('active session', () => {
    beforeEach(() => {
      server.use(listShortcutsHandler);
      useTerminalConnectionStore.setState({
        connectionState: 'connected',
        lastConnectedAt: null,
        lastError: null,
        reconnectAttempt: 0,
      });
    });

    it('renders terminal toolbar when session is active', async () => {
      server.use(
        http.get<
          { organizationId: string; sessionId: string },
          never,
          GetTerminalSessionSuccessResponse
        >(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
          ),
          () => {
            return HttpResponse.json({
              responseData: {
                results: {
                  id: 1,
                  deviceId: 1,
                  deviceName: 'Production Server',
                  userId: 'user-1',
                  userName: 'Alice',
                  status: 'active',
                  shell: '/bin/bash',
                  workingDirectory: '/home/user',
                  sessionToken: 'mock-session-token',
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                  lastActivityAt: new Date(Date.now() - 60000).toISOString(),
                  inactivityTimeoutMs: 300000,
                  terminatedAt: null,
                  isShared: false,
                  shareToken: null,
                },
              },
              responseErrors: null,
            });
          },
        ),
      );

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByRole('toolbar', { name: /terminal session controls/i }),
        ).toBeInTheDocument();
      });
    });

    it('renders terminal toolbar when session is created', async () => {
      server.use(
        http.get<
          { organizationId: string; sessionId: string },
          never,
          GetTerminalSessionSuccessResponse
        >(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
          ),
          () => {
            return HttpResponse.json({
              responseData: {
                results: {
                  id: 1,
                  deviceId: 1,
                  deviceName: 'Production Server',
                  userId: 'user-1',
                  userName: 'Alice',
                  status: 'created',
                  shell: '/bin/bash',
                  workingDirectory: '/home/user',
                  sessionToken: 'mock-session-token',
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                  lastActivityAt: new Date(Date.now() - 60000).toISOString(),
                  inactivityTimeoutMs: 300000,
                  terminatedAt: null,
                  isShared: false,
                  shareToken: null,
                },
              },
              responseErrors: null,
            });
          },
        ),
      );

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByRole('toolbar', { name: /terminal session controls/i }),
        ).toBeInTheDocument();
      });
    });

    it('triggers refetch when onSessionLocked callback fires', async () => {
      // Capture the session:lock handler so we can invoke it
      const messageHandlers = new Map<string, (...args: unknown[]) => void>();
      vi.mocked(terminalWsClient.onMessage).mockImplementation(
        // @ts-expect-error -- mock captures all message types generically
        (type: string, handler: (...args: unknown[]) => void) => {
          messageHandlers.set(type, handler);
          return vi.fn();
        },
      );

      let fetchCount = 0;
      server.use(
        http.get<
          { organizationId: string; sessionId: string },
          never,
          GetTerminalSessionSuccessResponse
        >(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
          ),
          () => {
            fetchCount++;
            return HttpResponse.json({
              responseData: {
                results: {
                  id: 1,
                  deviceId: 1,
                  deviceName: 'Production Server',
                  userId: 'user-1',
                  userName: 'Alice',
                  status: 'active',
                  shell: '/bin/bash',
                  workingDirectory: '/home/user',
                  sessionToken: 'mock-session-token',
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                  lastActivityAt: new Date(Date.now() - 60000).toISOString(),
                  inactivityTimeoutMs: 300000,
                  terminatedAt: null,
                  isShared: false,
                  shareToken: null,
                },
              },
              responseErrors: null,
            });
          },
        ),
      );

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByRole('toolbar', { name: /terminal session controls/i }),
        ).toBeInTheDocument();
      });

      const initialFetchCount = fetchCount;

      // Simulate a session:lock WS message
      const lockHandler = messageHandlers.get('session:lock');
      if (lockHandler) {
        await act(() => {
          lockHandler({ sessionId: '1' });
        });
      }

      await waitFor(() => {
        expect(fetchCount).toBeGreaterThan(initialFetchCount);
      });
    });

    it('triggers refetch when onSessionTerminated callback fires', async () => {
      // Capture the session:close handler so we can invoke it
      const messageHandlers = new Map<string, (...args: unknown[]) => void>();
      vi.mocked(terminalWsClient.onMessage).mockImplementation(
        // @ts-expect-error -- mock captures all message types generically
        (type: string, handler: (...args: unknown[]) => void) => {
          messageHandlers.set(type, handler);
          return vi.fn();
        },
      );

      let fetchCount = 0;
      server.use(
        http.get<
          { organizationId: string; sessionId: string },
          never,
          GetTerminalSessionSuccessResponse
        >(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
          ),
          () => {
            fetchCount++;
            return HttpResponse.json({
              responseData: {
                results: {
                  id: 1,
                  deviceId: 1,
                  deviceName: 'Production Server',
                  userId: 'user-1',
                  userName: 'Alice',
                  status: 'active',
                  shell: '/bin/bash',
                  workingDirectory: '/home/user',
                  sessionToken: 'mock-session-token',
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                  lastActivityAt: new Date(Date.now() - 60000).toISOString(),
                  inactivityTimeoutMs: 300000,
                  terminatedAt: null,
                  isShared: false,
                  shareToken: null,
                },
              },
              responseErrors: null,
            });
          },
        ),
      );

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByRole('toolbar', { name: /terminal session controls/i }),
        ).toBeInTheDocument();
      });

      const initialFetchCount = fetchCount;

      // Simulate a session:close WS message
      const closeHandler = messageHandlers.get('session:close');
      if (closeHandler) {
        await act(() => {
          closeHandler({ sessionId: '1', deviceId: 1 });
        });
      }

      await waitFor(() => {
        expect(fetchCount).toBeGreaterThan(initialFetchCount);
      });
    });

    it('passes shareToken to TerminalPage when session has a share token', async () => {
      server.use(
        http.get<
          { organizationId: string; sessionId: string },
          never,
          GetTerminalSessionSuccessResponse
        >(
          buildBackendUrl(
            '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
          ),
          () => {
            return HttpResponse.json({
              responseData: {
                results: {
                  id: 1,
                  deviceId: 1,
                  deviceName: 'Production Server',
                  userId: 'user-1',
                  userName: 'Alice',
                  status: 'active',
                  shell: '/bin/bash',
                  workingDirectory: '/home/user',
                  sessionToken: 'mock-session-token',
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                  lastActivityAt: new Date(Date.now() - 60000).toISOString(),
                  inactivityTimeoutMs: 300000,
                  terminatedAt: null,
                  isShared: true,
                  shareToken: 'share-abc-123',
                },
              },
              responseErrors: null,
            });
          },
        ),
      );

      renderPage();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /copy share link/i }),
        ).toBeInTheDocument();
      });
    });
  });

  it('triggers refetch via onUnlocked after successful unlock', async () => {
    let fetchCount = 0;
    server.use(
      http.get<
        { organizationId: string; sessionId: string },
        never,
        GetTerminalSessionSuccessResponse
      >(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
        ),
        () => {
          fetchCount++;
          return HttpResponse.json({
            responseData: {
              results: {
                id: 1,
                deviceId: 1,
                deviceName: 'Production Server',
                userId: 'user-1',
                userName: 'Alice',
                status: 'locked',
                shell: '/bin/bash',
                workingDirectory: '/home/user',
                sessionToken: 'mock-session-token',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                lastActivityAt: new Date(Date.now() - 60000).toISOString(),
                inactivityTimeoutMs: 300000,
                terminatedAt: null,
                isShared: false,
              },
            },
            responseErrors: null,
          });
        },
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Session locked')).toBeInTheDocument();
    });

    // The reauth modal opens by default (showReauth starts as true in SessionLocked)
    const passwordInput = await screen.findByPlaceholderText(
      'Enter your password',
    );
    const user = userEvent.setup();
    await user.type(passwordInput, 'my-password');

    const authenticateButton = screen.getByRole('button', {
      name: 'Authenticate',
    });
    await user.click(authenticateButton);

    // After successful auth + unlock, refetch is called (onUnlocked -> refetch)
    await waitFor(() => {
      expect(fetchCount).toBeGreaterThanOrEqual(2);
    });
  });
});
