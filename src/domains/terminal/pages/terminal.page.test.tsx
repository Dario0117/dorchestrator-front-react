import { TerminalPage } from '@domains/terminal/pages/terminal.page';
import { listShortcutsHandler } from '@domains/terminal/services/list-shortcuts.http-service.handlers';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { server } from '@/../testsSetup';

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
      sessionId: '42',
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

// Capture onMessage handlers so we can manually trigger WS events
type WsHandler = (...args: unknown[]) => void;
const wsHandlers = new Map<string, WsHandler>();

vi.spyOn(terminalWsClient, 'onMessage').mockImplementation(
  // @ts-expect-error -- mock captures all message types generically
  (type: string, handler: WsHandler) => {
    wsHandlers.set(type, handler);
    return vi.fn();
  },
);
vi.spyOn(terminalWsClient, 'connect').mockImplementation(() => undefined);
vi.spyOn(terminalWsClient, 'connectForEvents').mockImplementation(
  () => undefined,
);
vi.spyOn(terminalWsClient, 'send').mockImplementation(() => undefined);

const defaultProps: {
  organizationId: string;
  sessionId: number;
  isShared: boolean;
  shareToken: string | null;
} = {
  organizationId: 'org-123',
  sessionId: 42,
  isShared: false,
  shareToken: null,
};

function renderPage(overrides: Partial<typeof defaultProps> = {}) {
  return renderWithProviders(
    <TerminalPage {...{ ...defaultProps, ...overrides }} />,
  );
}

describe('TerminalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    wsHandlers.clear();
    server.use(listShortcutsHandler);
    useTerminalConnectionStore.setState({
      connectionState: 'connected',
      lastConnectedAt: null,
      lastError: null,
      reconnectAttempt: 0,
    });
  });

  it('renders the toolbar with End Session button', () => {
    renderPage();

    expect(
      screen.getByRole('toolbar', { name: /terminal session controls/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('End Session')).toBeInTheDocument();
  });

  it('renders preset shortcut buttons from the shortcut panel', () => {
    renderPage();

    expect(
      screen.getByRole('button', { name: /send interrupt signal/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send end of file/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /tab completion/i }),
    ).toBeInTheDocument();
  });

  it('renders share and bookmark buttons', () => {
    renderPage();

    expect(
      screen.getByRole('button', { name: /share session/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /bookmark session/i }),
    ).toBeInTheDocument();
  });

  it('renders connection overlay when disconnected and not closing', () => {
    useTerminalConnectionStore.setState({ connectionState: 'disconnected' });
    renderPage();

    expect(screen.getByText('Connection lost')).toBeInTheDocument();
  });

  it('does not render connection overlay when connected', () => {
    useTerminalConnectionStore.setState({ connectionState: 'connected' });
    renderPage();

    expect(screen.queryByText('Connection lost')).not.toBeInTheDocument();
  });

  it('passes onSessionLocked and onSessionTerminated callbacks without errors', () => {
    const onSessionLocked = vi.fn();
    const onSessionTerminated = vi.fn();

    renderWithProviders(
      <TerminalPage
        {...defaultProps}
        onSessionLocked={onSessionLocked}
        onSessionTerminated={onSessionTerminated}
      />,
    );

    expect(
      screen.getByRole('toolbar', { name: /terminal session controls/i }),
    ).toBeInTheDocument();
  });

  it('renders with shared session props and shows copy share link button', () => {
    renderPage({ isShared: true, shareToken: 'abc-123' });

    expect(
      screen.getByRole('button', { name: /copy share link/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /stop sharing/i }),
    ).toBeInTheDocument();
  });

  it('shows the closing overlay after confirming End Session', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('End Session'));

    await waitFor(() => {
      expect(screen.getByText('End terminal session?')).toBeInTheDocument();
    });

    const buttons = screen.getAllByText('End Session');
    await user.click(buttons[buttons.length - 1] as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText(/closing session/i)).toBeInTheDocument();
    });

    // Connection overlay should not render when closing
    expect(screen.queryByText('Connection lost')).not.toBeInTheDocument();
  });

  it('does not show warning banner when there is no warning message', () => {
    renderPage();

    expect(
      screen.queryByRole('button', { name: /extend session/i }),
    ).not.toBeInTheDocument();
  });

  it('shows warning banner when a session warning is received', async () => {
    renderPage();

    // Trigger the session warning via captured WS handler
    const warningHandler = wsHandlers.get('session:warning');
    expect(warningHandler).toBeDefined();

    act(() => {
      warningHandler?.({
        type: 'session:warning',
        sessionId: '42',
        payload: { reason: 'hard_cap_expiry', remainingMs: 300000 },
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /will be terminated in ~5 min due to session duration limit/i,
        ),
      ).toBeInTheDocument();
    });

    // Extend session button should appear in toolbar
    expect(
      screen.getByRole('button', { name: /extend session/i }),
    ).toBeInTheDocument();
  });

  it('shows extend button in toolbar and opens reauth modal on click', async () => {
    const user = userEvent.setup();
    renderPage();

    // Trigger warning to make extend button visible
    const warningHandler = wsHandlers.get('session:warning');
    act(() => {
      warningHandler?.({
        type: 'session:warning',
        sessionId: '42',
        payload: { reason: 'absolute_max_lifetime', remainingMs: 120000 },
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /will be terminated in ~2 min due to absolute maximum lifetime/i,
        ),
      ).toBeInTheDocument();
    });

    // Click extend session to open reauth modal
    await user.click(screen.getByRole('button', { name: /extend session/i }));

    // The reauth modal should open with Terminal Authentication title
    await waitFor(() => {
      expect(screen.getByText('Terminal Authentication')).toBeInTheDocument();
    });
  });

  it('shows extend error message when extend mutation fails', async () => {
    // Override extend handler to return error
    server.use(
      http.post(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/sessions/{sessionId}/extend',
        ),
        () => HttpResponse.json({ message: 'Extend failed' }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderPage();

    // Trigger warning to show the banner and extend button
    const warningHandler = wsHandlers.get('session:warning');
    act(() => {
      warningHandler?.({
        type: 'session:warning',
        sessionId: '42',
        payload: { reason: 'hard_cap_expiry', remainingMs: 300000 },
      });
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /extend session/i }),
      ).toBeInTheDocument();
    });

    // Click extend session to open reauth modal
    await user.click(screen.getByRole('button', { name: /extend session/i }));

    await waitFor(() => {
      expect(screen.getByText('Terminal Authentication')).toBeInTheDocument();
    });

    // Fill password and submit
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'test-password');
    await user.click(screen.getByRole('button', { name: /authenticate/i }));

    // The auth mutation succeeds (default handler), then extend mutation fails (overridden handler)
    // This should set isExtendError to true, showing the error message in the warning banner
    await waitFor(() => {
      expect(screen.getByText(/failed to extend session/i)).toBeInTheDocument();
    });
  });
});
