import { useTerminalSessionLifecycle } from '@domains/terminal/hooks/use-terminal-session-lifecycle';
import { MSWSuccessHandlers } from '@lib/test.utils';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';

const server = setupServer(...MSWSuccessHandlers());

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@domains/terminal/services/terminal-ws.client', () => ({
  terminalWsClient: { send: vi.fn() },
}));

const defaultArgs = {
  organizationId: 'org-1',
  organizationSlug: 'test-org',
  teamSlug: 'team-1',
  sessionId: '123',
};

describe('useTerminalSessionLifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial state', () => {
    const { result } = renderHook(
      () => useTerminalSessionLifecycle(defaultArgs),
      { wrapper: createQueryThemeWrapper() },
    );

    expect(result.current.isClosing).toBe(false);
    expect(result.current.warningMessage).toBeNull();
    expect(result.current.showExtendReauth).toBe(false);
    expect(result.current.isExtendError).toBe(false);
  });

  it('handleCloseSession sets isClosing to true', () => {
    const { result } = renderHook(
      () => useTerminalSessionLifecycle(defaultArgs),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.handleCloseSession();
    });

    expect(result.current.isClosing).toBe(true);
  });

  it('navigates after close timeout expires', () => {
    const { result } = renderHook(
      () => useTerminalSessionLifecycle(defaultArgs),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.handleCloseSession();
    });

    expect(mockNavigate).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '..',
      replace: true,
    });
  });

  it('handleSessionWarning sets warningMessage for hard_cap_expiry', () => {
    const { result } = renderHook(
      () => useTerminalSessionLifecycle(defaultArgs),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.handleSessionWarning('hard_cap_expiry', 300_000);
    });

    expect(result.current.warningMessage).toBe(
      'This session will be terminated in ~5 min due to session duration limit.',
    );
  });

  it('handleSessionWarning sets warningMessage for absolute_max reason', () => {
    const { result } = renderHook(
      () => useTerminalSessionLifecycle(defaultArgs),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.handleSessionWarning('absolute_max', 120_000);
    });

    expect(result.current.warningMessage).toBe(
      'This session will be terminated in ~2 min due to absolute maximum lifetime.',
    );
  });

  it('handleSessionEnd navigates with deviceId', () => {
    const { result } = renderHook(
      () => useTerminalSessionLifecycle(defaultArgs),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.handleSessionEnd(42);
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/$organizationSlug/t/$teamSlug/devices',
      params: { organizationSlug: 'test-org', teamSlug: 'team-1' },
      search: { page: 1, size: 10 },
      replace: true,
    });
  });

  it('handleSessionEnd navigates without deviceId', () => {
    const { result } = renderHook(
      () => useTerminalSessionLifecycle(defaultArgs),
      { wrapper: createQueryThemeWrapper() },
    );

    act(() => {
      result.current.handleSessionEnd();
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '..',
      replace: true,
    });
  });

  it('handleExtendSuccess calls mutation and clears warning on success', async () => {
    vi.useRealTimers();

    const { result } = renderHook(
      () => useTerminalSessionLifecycle(defaultArgs),
      { wrapper: createQueryThemeWrapper() },
    );

    // Set a warning first so we can verify it gets cleared
    act(() => {
      result.current.handleSessionWarning('hard_cap_expiry', 300_000);
    });

    expect(result.current.warningMessage).not.toBeNull();

    // Show extend reauth so we can verify it gets cleared
    act(() => {
      result.current.setShowExtendReauth(true);
    });

    expect(result.current.showExtendReauth).toBe(true);

    // Call handleExtendSuccess
    act(() => {
      result.current.handleExtendSuccess('test-token');
    });

    // Wait for the mutation to succeed and the onSuccess callback to fire
    await waitFor(() => {
      expect(result.current.showExtendReauth).toBe(false);
    });

    expect(result.current.warningMessage).toBeNull();
  });
});
