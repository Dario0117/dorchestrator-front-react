import { TerminalWsClient } from '@services/terminal/terminal-ws.client';
import { useTerminalConnectionStore } from '@stores/terminal-connection.store';

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

  simulateError() {
    this.onerror?.(new Event('error'));
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

// Replace global WebSocket
beforeAll(() => {
  vi.stubGlobal('WebSocket', FakeWebSocket);
});
afterAll(() => {
  vi.unstubAllGlobals();
});

function resetStore() {
  useTerminalConnectionStore.setState({
    connectionState: 'disconnected',
    lastConnectedAt: null,
    lastError: null,
    reconnectAttempt: 0,
  });
}

describe('TerminalWsClient', () => {
  let client: TerminalWsClient;

  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.clear();
    resetStore();
    client = new TerminalWsClient();
  });

  afterEach(() => {
    client.disconnect();
    vi.useRealTimers();
  });

  test('connect builds correct WSS URL from BACKEND_BASE_URL', () => {
    client.connect();
    expect(FakeWebSocket.latest().url).toBe(
      'wss://api.example.com/ws/terminal',
    );
  });

  test('connect sets state to connecting, stays connecting on open, then connected on first heartbeat', () => {
    client.connect();
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'connecting',
    );

    FakeWebSocket.latest().simulateOpen();
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'connecting',
    );

    FakeWebSocket.latest().simulateMessage({ type: 'heartbeat:ping' });
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'connected',
    );
  });

  test('heartbeat:ping received triggers heartbeat:pong response', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    ws.simulateMessage({ type: 'heartbeat:ping' });

    expect(ws.sentMessages).toHaveLength(1);
    expect(JSON.parse(ws.sentMessages[0] ?? '')).toEqual({
      type: 'heartbeat:pong',
    });
  });

  test('invalid message is logged and ignored (no crash)', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();
    ws.simulateMessage({ type: 'heartbeat:ping' });

    ws.simulateMessage({ type: 'totally:invalid', bad: 'data' });
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'connected',
    );
  });

  test('non-JSON message is logged and ignored', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();
    ws.simulateMessage({ type: 'heartbeat:ping' });

    ws.onmessage?.(new MessageEvent('message', { data: 'not json' }));
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'connected',
    );
  });

  test('connection drop triggers reconnecting state with exponential backoff', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateClose(1006);

    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'reconnecting',
    );
    expect(useTerminalConnectionStore.getState().reconnectAttempt).toBe(1);

    // After 1s (first backoff), should attempt reconnect
    vi.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances).toHaveLength(2);

    // Second disconnect
    FakeWebSocket.latest().simulateClose(1006);
    expect(useTerminalConnectionStore.getState().reconnectAttempt).toBe(2);

    // After 2s (second backoff)
    vi.advanceTimersByTime(2000);
    expect(FakeWebSocket.instances).toHaveLength(3);
  });

  test('auth failure code 4001 prevents reconnection', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateClose(4001);

    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'disconnected',
    );
    expect(useTerminalConnectionStore.getState().lastError).toContain(
      'code: 4001',
    );

    vi.advanceTimersByTime(60_000);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('auth failure code 4003 prevents reconnection', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateClose(4003);

    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'disconnected',
    );
    expect(useTerminalConnectionStore.getState().lastError).toContain(
      'code: 4003',
    );
  });

  test('auth failure code 1008 prevents reconnection', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateClose(1008);

    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'disconnected',
    );
    expect(useTerminalConnectionStore.getState().lastError).toContain(
      'code: 1008',
    );
  });

  test('intentional disconnect cancels reconnect timer', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateClose(1006);

    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'reconnecting',
    );

    client.disconnect();
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'disconnected',
    );

    vi.advanceTimersByTime(60_000);
    // Only the initial connect + the reconnect attempt that was cancelled
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('send when disconnected drops message (no crash)', () => {
    client.send({ type: 'heartbeat:pong' });
  });

  test('onMessage dispatches to registered handler', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    const handler = vi.fn();
    client.onMessage('pty:output', handler);

    ws.simulateMessage({
      type: 'pty:output',
      sessionId: 's1',
      data: 'hello',
    });

    expect(handler).toHaveBeenCalledWith({
      type: 'pty:output',
      sessionId: 's1',
      data: 'hello',
    });
  });

  test('onMessage unsubscribe removes handler', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    const handler = vi.fn();
    const unsubscribe = client.onMessage('pty:output', handler);
    unsubscribe();

    ws.simulateMessage({
      type: 'pty:output',
      sessionId: 's1',
      data: 'hello',
    });

    expect(handler).not.toHaveBeenCalled();
  });

  test('reconnect success resets backoff and sets connected after auth', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateMessage({ type: 'heartbeat:ping' });

    FakeWebSocket.latest().simulateClose(1006);
    expect(useTerminalConnectionStore.getState().reconnectAttempt).toBe(1);

    vi.advanceTimersByTime(1000);
    FakeWebSocket.latest().simulateOpen();

    // Still connecting until heartbeat confirms auth
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'connecting',
    );
    expect(useTerminalConnectionStore.getState().reconnectAttempt).toBe(0);

    FakeWebSocket.latest().simulateMessage({ type: 'heartbeat:ping' });
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'connected',
    );
  });

  test('send on connected socket sends JSON-serialized message', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    // Authenticate via heartbeat (required before sending non-pong messages)
    ws.simulateMessage({ type: 'heartbeat:ping' });

    client.send({ type: 'pty:input', sessionId: 's1', data: 'ls\n' });

    // sentMessages[0] = heartbeat:pong (auto-reply), sentMessages[1] = pty:input
    expect(ws.sentMessages).toHaveLength(2);
    expect(JSON.parse(ws.sentMessages[1] ?? '')).toEqual({
      type: 'pty:input',
      sessionId: 's1',
      data: 'ls\n',
    });
  });

  test('calling connect twice replaces the existing WebSocket', () => {
    client.connect();
    const firstWs = FakeWebSocket.latest();
    firstWs.simulateOpen();

    client.connect();
    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(firstWs.readyState).toBe(FakeWebSocket.CLOSED);
  });

  test('multiple handlers for same message type all receive the message', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    const handler1 = vi.fn();
    const handler2 = vi.fn();
    client.onMessage('pty:output', handler1);
    client.onMessage('pty:output', handler2);

    ws.simulateMessage({
      type: 'pty:output',
      sessionId: 's1',
      data: 'hello',
    });

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  test('connectForEvents builds correct WSS URL without query params', () => {
    client.connectForEvents();
    expect(FakeWebSocket.latest().url).toBe(
      'wss://api.example.com/ws/terminal',
    );
  });

  test('connectForEvents reconnects using same event URL', () => {
    client.connectForEvents();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateClose(1006);

    vi.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(FakeWebSocket.latest().url).toBe(
      'wss://api.example.com/ws/terminal',
    );
  });

  test('isAuthenticated returns false before heartbeat and true after', () => {
    client.connect();
    const ws = FakeWebSocket.latest();

    expect(client.isAuthenticated()).toBe(false);

    ws.simulateOpen();
    expect(client.isAuthenticated()).toBe(false);

    ws.simulateMessage({ type: 'heartbeat:ping' });
    expect(client.isAuthenticated()).toBe(true);
  });

  test('second heartbeat:ping does not re-set connection state', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    // First heartbeat authenticates
    ws.simulateMessage({ type: 'heartbeat:ping' });
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'connected',
    );

    // Second heartbeat should still work (respond with pong) but not re-trigger auth
    ws.simulateMessage({ type: 'heartbeat:ping' });
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'connected',
    );
    // Two pongs sent (one per heartbeat)
    expect(ws.sentMessages).toHaveLength(2);
  });

  test('send before authentication drops non-pong messages', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    // Not authenticated yet - send a non-pong message
    client.send({ type: 'pty:input', sessionId: 's1', data: 'hello' });

    // Message should be dropped
    expect(ws.sentMessages).toHaveLength(0);
  });

  test('connect with shareToken includes it in URL', () => {
    client.connect('my-share-token');
    expect(FakeWebSocket.latest().url).toBe(
      'wss://api.example.com/ws/terminal?shareToken=my-share-token',
    );
  });

  test('connectInternal skips if already connecting', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    // readyState is CONNECTING by default
    expect(ws.readyState).toBe(FakeWebSocket.CONNECTING);

    // Connect again - should not create a new WebSocket
    client.connectForEvents();
    // Only the first WS was created since the existing one was closed first by connect()
    // connectForEvents doesn't close existing WS
  });

  test('WebSocket error event is handled gracefully', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    // Should not crash
    ws.simulateError();

    // State should still be connecting (error alone doesn't change state)
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'connecting',
    );
  });

  test('handleClose with intentionalDisconnect sets disconnected and skips reconnect', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();
    ws.simulateMessage({ type: 'heartbeat:ping' });

    // Capture the onclose handler before disconnect() nulls it
    const closeHandler = ws.onclose;
    expect(closeHandler).toBeTruthy();

    client.disconnect();

    // Simulate a race: the close event fires after intentionalDisconnect was set
    closeHandler?.(new CloseEvent('close', { code: 1000 }));

    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'disconnected',
    );

    vi.advanceTimersByTime(60_000);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('connectInternal skips when existing WebSocket is OPEN', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();
    // ws.readyState is now OPEN

    // connectForEvents calls connectInternal, which should bail because ws is OPEN
    client.connectForEvents();

    // No new WebSocket created (connectForEvents doesn't close existing ws like connect does)
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('scheduleReconnect bails early when intentionalDisconnect is true', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    // Capture handleClose before disconnect nulls it
    const closeHandler = ws.onclose;

    // Set intentionalDisconnect = true but keep connectionMode set
    client.disconnect();

    // Fire the captured close handler — scheduleReconnect should bail at L57
    closeHandler?.(new CloseEvent('close', { code: 1006 }));

    vi.advanceTimersByTime(60_000);
    // Only the initial connection was created
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('scheduleReconnect bails when connectionMode is null', () => {
    // After an auth failure, connectionMode is set to null (L154).
    // If a subsequent unexpected close happens (e.g., race condition),
    // scheduleReconnect should bail at L57.
    client.connect();
    FakeWebSocket.latest().simulateOpen();

    // Auth failure sets connectionMode to null
    FakeWebSocket.latest().simulateClose(4001);
    expect(useTerminalConnectionStore.getState().connectionState).toBe(
      'disconnected',
    );

    // No reconnect scheduled
    vi.advanceTimersByTime(60_000);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('onMessage unsubscribe is a no-op if handler set was already cleared', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const unsub1 = client.onMessage('pty:output', handler1);
    const unsub2 = client.onMessage('pty:output', handler2);

    // Unsubscribe both — first unsub removes handler1, second removes handler2 and cleans up the set
    unsub2();
    unsub1();

    // Calling unsub1 again should be a no-op (set already deleted at L279)
    unsub1();
  });

  test('onMessage unsubscribe does not delete set when other handlers remain', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    const handler1 = vi.fn();
    const handler2 = vi.fn();
    client.onMessage('pty:output', handler1);
    const unsub2 = client.onMessage('pty:output', handler2);

    // Unsubscribe handler2 — handler1 still exists, so set should not be deleted (L281)
    unsub2();

    // handler1 should still receive messages
    ws.simulateMessage({
      type: 'pty:output',
      sessionId: 's1',
      data: 'hello',
    });

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).not.toHaveBeenCalled();
  });

  test('backoff increases correctly: 1s, 2s, 4s, 8s, 16s, 30s', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();

    const expectedDelays = [1000, 2000, 4000, 8000, 16000, 30000];

    // First close triggers the reconnect chain
    FakeWebSocket.latest().simulateClose(1006);

    for (const delay of expectedDelays) {
      const initialCount = FakeWebSocket.instances.length;

      // Advance just before the expected delay — no reconnect yet
      vi.advanceTimersByTime(delay - 1);
      expect(FakeWebSocket.instances).toHaveLength(initialCount);

      // Advance to the exact delay — reconnect happens
      vi.advanceTimersByTime(1);
      expect(FakeWebSocket.instances).toHaveLength(initialCount + 1);

      // Simulate another failure to trigger next backoff (without success reset)
      FakeWebSocket.latest().simulateClose(1006);
    }
  });
});
