import { SharedSessionPage } from '@domains/terminal/pages/shared-session.page';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { buildBackendUrl } from '@lib/test-backend-url.utils';
import { renderWithProviders } from '@lib/test-wrappers.utils';
import { screen, waitFor } from '@testing-library/react';
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
    useParams: () => ({ teamSlug: 'my-team' }),
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

vi.spyOn(terminalWsClient, 'connect').mockImplementation(() => undefined);
vi.spyOn(terminalWsClient, 'onMessage').mockReturnValue(() => undefined);
const sendSpy = vi
  .spyOn(terminalWsClient, 'send')
  .mockImplementation(() => undefined);

function renderPage() {
  return renderWithProviders(
    <SharedSessionPage
      shareToken="mock-share-token"
      organizationSlug="test-org"
      organizationId="org-1"
    />,
  );
}

describe('SharedSessionPage', () => {
  it('shows loading skeleton initially', () => {
    renderPage();

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error view when share link is invalid', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/shared/{shareToken}',
        ),
        () => {
          return HttpResponse.json({ message: 'Not found' }, { status: 404 });
        },
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Session not available')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "This share link is invalid, expired, or you don't have access.",
      ),
    ).toBeInTheDocument();
  });

  it('renders session ended view when server returns 410 Gone', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/shared/{shareToken}',
        ),
        () => {
          return HttpResponse.json(
            { message: 'Session terminated', status: 410 },
            { status: 410 },
          );
        },
      ),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Session ended')).toBeInTheDocument();
    });

    expect(
      screen.getByText('This shared terminal session has been terminated.'),
    ).toBeInTheDocument();

    expect(screen.getByText('Back to sessions')).toBeInTheDocument();
  });

  it('renders the terminal UI on successful share link resolution', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Viewing')).toBeInTheDocument();
    });
  });

  it('sends viewer:leave on unmount when session is resolved', async () => {
    const { unmount } = renderPage();

    await waitFor(() => {
      expect(screen.getByText('Viewing')).toBeInTheDocument();
    });

    unmount();

    expect(sendSpy).toHaveBeenCalledWith({
      type: 'viewer:leave',
      sessionId: '100',
    });
  });

  it('does not send viewer:leave on unmount when no session is resolved', async () => {
    server.use(
      http.get(
        buildBackendUrl(
          '/api/v1/{organizationId}/terminal/shared/{shareToken}',
        ),
        () => {
          return HttpResponse.json({ message: 'Not found' }, { status: 404 });
        },
      ),
    );

    const { unmount } = renderPage();

    await waitFor(() => {
      expect(screen.getByText('Session not available')).toBeInTheDocument();
    });

    sendSpy.mockClear();
    unmount();

    expect(sendSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'viewer:leave' }),
    );
  });
});
