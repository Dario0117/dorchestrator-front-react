import { useWebSocketEvents } from '@domains/shared/hooks/use-websocket-events';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

// Mock env module — external dependency
vi.mock('@lib/env.utils', () => ({
  env: {
    BACKEND_BASE_URL: 'https://api.example.com',
  },
}));

// Fake WebSocket implementation
class FakeWebSocket {
  static CONNECTING = 0 as const;
  static OPEN = 1 as const;
  static CLOSING = 2 as const;
  static CLOSED = 3 as const;

  readonly CONNECTING = 0 as const;
  readonly OPEN = 1 as const;
  readonly CLOSING = 2 as const;
  readonly CLOSED = 3 as const;

  url: string;
  readyState: number = FakeWebSocket.CONNECTING;
  onopen: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  sentMessages: string[] = [];

  constructor(url: string | URL) {
    this.url = typeof url === 'string' ? url : url.toString();
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close(_code?: number, _reason?: string) {
    this.readyState = FakeWebSocket.CLOSED;
  }

  // biome-ignore lint/suspicious/noEmptyBlockStatements: stub
  addEventListener() {}
  // biome-ignore lint/suspicious/noEmptyBlockStatements: stub
  removeEventListener() {}

  dispatchEvent() {
    return true;
  }

  get binaryType(): BinaryType {
    return 'blob';
  }
  get bufferedAmount() {
    return 0;
  }
  get extensions() {
    return '';
  }
  get protocol() {
    return '';
  }

  simulateOpen() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.(new Event('open'));
  }

  simulateMessage(data: unknown) {
    this.onmessage?.(
      new MessageEvent('message', { data: JSON.stringify(data) }),
    );
  }

  simulateClose(code = 1006, reason = '') {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close', { code, reason }));
  }

  static instances: FakeWebSocket[] = [];
  static clear() {
    FakeWebSocket.instances = [];
  }
  static latest() {
    const instance =
      FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
    if (!instance) {
      throw new Error('No FakeWebSocket instances');
    }
    return instance;
  }
}

beforeAll(() => {
  vi.stubGlobal('WebSocket', FakeWebSocket);
});
afterAll(() => {
  vi.unstubAllGlobals();
});

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useWebSocketEvents', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.useFakeTimers();
    terminalWsClient.disconnect();
    FakeWebSocket.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('connects WebSocket on mount', () => {
    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(FakeWebSocket.latest().url).toBe(
      'wss://api.example.com/ws/terminal',
    );
  });

  test('disconnects WebSocket on unmount', () => {
    const { unmount } = renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    FakeWebSocket.latest().simulateOpen();
    unmount();

    // After unmount, no reconnect should happen
    FakeWebSocket.latest().simulateClose(1006);
    vi.advanceTimersByTime(60_000);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('command:dispatch event invalidates command queries', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateMessage({
      type: 'command:dispatch',
      payload: {
        commandId: 42,
        deviceId: 'dev-1',
        status: 'running',
      },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/commands'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/commands/{commandId}'],
    });
    // Should NOT invalidate notifications for non-terminal status
    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications'],
    });
  });

  test('command:dispatch with completed status invalidates notification queries', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateMessage({
      type: 'command:dispatch',
      payload: {
        commandId: 42,
        deviceId: 'dev-1',
        status: 'completed',
      },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications/unread-count'],
    });
  });

  test('command:dispatch with failed status invalidates notification queries', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateMessage({
      type: 'command:dispatch',
      payload: {
        commandId: 7,
        deviceId: 'dev-2',
        status: 'failed',
      },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications/unread-count'],
    });
  });

  test('session:status event invalidates session queries', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateMessage({
      type: 'session:status',
      sessionId: 'session-1',
      payload: {
        status: 'active',
        previousStatus: 'created',
      },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/terminal/sessions'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [
        'get',
        '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
      ],
    });
    // Should NOT invalidate notifications for non-created status
    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications'],
    });
  });

  test('session:status with created status invalidates notification queries', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateMessage({
      type: 'session:status',
      sessionId: 'session-2',
      payload: {
        status: 'created',
        previousStatus: 'terminated',
      },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications/unread-count'],
    });
  });

  test('cleanup guards against redundant disconnect calls', () => {
    const disconnectSpy = vi.spyOn(terminalWsClient, 'disconnect');
    disconnectSpy.mockClear();

    const { unmount } = renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    FakeWebSocket.latest().simulateOpen();
    disconnectSpy.mockClear();

    unmount();

    // Cleanup calls disconnect exactly once due to the connectedRef guard
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  test('reconnection invalidates session queries', async () => {
    const { useTerminalConnectionStore } = await import(
      '@domains/terminal/stores/terminal-connection.store'
    );
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    FakeWebSocket.latest().simulateOpen();
    invalidateSpy.mockClear();

    // Simulate reconnecting → connected transition
    useTerminalConnectionStore.setState({ connectionState: 'reconnecting' });
    useTerminalConnectionStore.setState({ connectionState: 'connected' });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/terminal/sessions'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [
        'get',
        '/api/v1/{organizationId}/terminal/sessions/{sessionId}',
      ],
    });
  });
});
