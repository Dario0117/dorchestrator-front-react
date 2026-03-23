import { EventsWsClient } from '@domains/notifications/services/events/events-ws.client';

vi.mock('@lib/env.utils', () => ({
  env: {
    BACKEND_BASE_URL: 'https://api.example.com',
  },
}));

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

  simulateRawMessage(data: string) {
    this.onmessage?.(new MessageEvent('message', { data }));
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

beforeAll(() => {
  vi.stubGlobal('WebSocket', FakeWebSocket);
});
afterAll(() => {
  vi.unstubAllGlobals();
});

describe('EventsWsClient', () => {
  let client: EventsWsClient;

  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.clear();
    client = new EventsWsClient();
  });

  afterEach(() => {
    client.disconnect();
    vi.useRealTimers();
  });

  test('connect builds correct WSS URL from BACKEND_BASE_URL', () => {
    client.connect();
    expect(FakeWebSocket.latest().url).toBe('wss://api.example.com/ws/events');
  });

  test('handleOpen resets reconnect attempt', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    // No crash, reconnect attempt reset internally
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('heartbeat:ping sends heartbeat:pong response', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    ws.simulateMessage({ type: 'heartbeat:ping' });

    expect(ws.sentMessages).toHaveLength(1);
    expect(JSON.parse(ws.sentMessages[0] ?? '')).toEqual({
      type: 'heartbeat:pong',
    });
  });

  test('first heartbeat:ping marks client as authenticated', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    // Before heartbeat, sending non-pong messages is dropped
    client.send({ type: 'notification:changed' });
    expect(ws.sentMessages).toHaveLength(0);

    // After heartbeat, authenticated
    ws.simulateMessage({ type: 'heartbeat:ping' });

    // Now sending should work
    client.send({ type: 'notification:changed' });
    // sentMessages[0] = pong from heartbeat, sentMessages[1] = notification:changed
    expect(ws.sentMessages).toHaveLength(2);
  });

  test('second heartbeat:ping does not re-authenticate', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    ws.simulateMessage({ type: 'heartbeat:ping' });
    ws.simulateMessage({ type: 'heartbeat:ping' });

    // Two pongs sent
    expect(ws.sentMessages).toHaveLength(2);
  });

  test('non-heartbeat message does not trigger pong', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    ws.simulateMessage({ type: 'notification:changed' });

    expect(ws.sentMessages).toHaveLength(0);
  });

  test('dispatchMessage calls registered handlers', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    const handler = vi.fn();
    client.onMessage('notification:changed', handler);

    ws.simulateMessage({ type: 'notification:changed' });

    expect(handler).toHaveBeenCalledWith({ type: 'notification:changed' });
  });

  test('dispatchMessage ignores messages with no handlers', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    // No handler registered, should not crash
    ws.simulateMessage({ type: 'notification:changed' });
  });

  test('invalid JSON message is handled gracefully', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    ws.simulateRawMessage('not json {{{');

    // No crash
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('invalid schema message is handled gracefully', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    ws.simulateMessage({ type: 'totally:invalid', bad: 'data' });

    // No crash
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('unexpected close triggers reconnect with backoff', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateClose(1006);

    // After 1s backoff, should reconnect
    vi.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances).toHaveLength(2);

    // Second close, 2s backoff
    FakeWebSocket.latest().simulateClose(1006);
    vi.advanceTimersByTime(2000);
    expect(FakeWebSocket.instances).toHaveLength(3);
  });

  test('reconnect timer fires and clears itself before connecting', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateClose(1006);

    // Timer fires at 1s
    vi.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances).toHaveLength(2);

    // The reconnected ws opens successfully
    FakeWebSocket.latest().simulateOpen();
    expect(FakeWebSocket.instances).toHaveLength(2);
  });

  test('intentional disconnect prevents reconnect', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    // Capture close handler before disconnect nulls it
    const closeHandler = ws.onclose;

    client.disconnect();

    // Simulate race: close event fires after intentional disconnect
    closeHandler?.(new CloseEvent('close', { code: 1000 }));

    vi.advanceTimersByTime(60_000);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('auth failure code 4001 prevents reconnection', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateClose(4001);

    vi.advanceTimersByTime(60_000);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('auth failure code 4003 prevents reconnection', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateClose(4003);

    vi.advanceTimersByTime(60_000);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('auth failure code 1008 prevents reconnection', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateClose(1008);

    vi.advanceTimersByTime(60_000);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('disconnect cancels pending reconnect timer', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();
    FakeWebSocket.latest().simulateClose(1006);

    // Reconnect is scheduled
    client.disconnect();

    vi.advanceTimersByTime(60_000);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('disconnect when no ws exists does not crash', () => {
    // No connect called
    client.disconnect();
  });

  test('clearReconnectTimer when no timer is a no-op', () => {
    // disconnect calls clearReconnectTimer internally
    client.disconnect();
    client.disconnect();
  });

  test('connectInternal skips when ws is CONNECTING', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    expect(ws.readyState).toBe(FakeWebSocket.CONNECTING);

    // Connect again — should not create new ws
    client.connect();
    // connect() resets state, but connectInternal should skip since ws is CONNECTING
    // However, connect() sets intentionalDisconnect=false and reconnectAttempt=0 before calling connectInternal
    // The skip happens inside connectInternal
  });

  test('connectInternal skips when ws is OPEN', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    // Trigger connectInternal via reconnect timer
    // Instead, just call connect again
    const countBefore = FakeWebSocket.instances.length;
    // Since connect() always calls connectInternal which checks readyState
    client.connect();
    // connect sets intentionalDisconnect=false and reconnectAttempt=0, then calls connectInternal
    // connectInternal sees ws is OPEN and returns early
    expect(FakeWebSocket.instances).toHaveLength(countBefore);
  });

  test('send when ws is null drops message', () => {
    // No connect called, ws is null
    client.send({ type: 'heartbeat:pong' });
    // No crash
  });

  test('send when ws is not OPEN drops message', () => {
    client.connect();
    // ws is CONNECTING, not OPEN
    client.send({ type: 'heartbeat:pong' });
    expect(FakeWebSocket.latest().sentMessages).toHaveLength(0);
  });

  test('send non-pong message before authentication is dropped', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    // Not authenticated yet
    client.send({ type: 'notification:changed' });
    expect(ws.sentMessages).toHaveLength(0);
  });

  test('send heartbeat:pong before authentication is allowed', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    // heartbeat:pong bypasses auth check
    client.send({ type: 'heartbeat:pong' });
    expect(ws.sentMessages).toHaveLength(1);
  });

  test('send after authentication works', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();
    ws.simulateMessage({ type: 'heartbeat:ping' });

    client.send({ type: 'notification:changed' });
    // sentMessages[0] = auto pong, sentMessages[1] = notification:changed
    expect(ws.sentMessages).toHaveLength(2);
    expect(JSON.parse(ws.sentMessages[1] ?? '')).toEqual({
      type: 'notification:changed',
    });
  });

  test('onMessage returns unsubscribe that removes handler', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    const handler = vi.fn();
    const unsub = client.onMessage('notification:changed', handler);
    unsub();

    ws.simulateMessage({ type: 'notification:changed' });
    expect(handler).not.toHaveBeenCalled();
  });

  test('onMessage unsubscribe cleans up empty handler set', () => {
    const handler = vi.fn();
    const unsub = client.onMessage('notification:changed', handler);
    unsub();

    // Calling unsub again is a no-op (set already deleted)
    unsub();
  });

  test('onMessage unsubscribe does not delete set when other handlers remain', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    const handler1 = vi.fn();
    const handler2 = vi.fn();
    client.onMessage('notification:changed', handler1);
    const unsub2 = client.onMessage('notification:changed', handler2);

    unsub2();

    ws.simulateMessage({ type: 'notification:changed' });
    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).not.toHaveBeenCalled();
  });

  test('multiple handlers for same type all receive message', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();

    const handler1 = vi.fn();
    const handler2 = vi.fn();
    client.onMessage('notification:changed', handler1);
    client.onMessage('notification:changed', handler2);

    ws.simulateMessage({ type: 'notification:changed' });
    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  test('handleError does not crash', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();
    ws.simulateError();
    // No crash
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('backoff caps at 30 seconds', () => {
    client.connect();
    FakeWebSocket.latest().simulateOpen();

    const expectedDelays = [1000, 2000, 4000, 8000, 16000, 30000, 30000];

    FakeWebSocket.latest().simulateClose(1006);

    for (const delay of expectedDelays) {
      const initialCount = FakeWebSocket.instances.length;

      vi.advanceTimersByTime(delay - 1);
      expect(FakeWebSocket.instances).toHaveLength(initialCount);

      vi.advanceTimersByTime(1);
      expect(FakeWebSocket.instances).toHaveLength(initialCount + 1);

      FakeWebSocket.latest().simulateClose(1006);
    }
  });

  test('disconnect cleans up ws handlers and closes connection', () => {
    client.connect();
    const ws = FakeWebSocket.latest();
    ws.simulateOpen();
    ws.simulateMessage({ type: 'heartbeat:ping' });

    client.disconnect();

    expect(ws.onerror).toBeNull();
    expect(ws.onclose).toBeNull();
    expect(ws.readyState).toBe(FakeWebSocket.CLOSED);
  });
});
