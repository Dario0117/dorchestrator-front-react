import { useDevicesPresence } from '@domains/devices/hooks/use-devices-presence';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { act, renderHook } from '@testing-library/react';

vi.mock('@lib/env.utils', () => ({
  env: {
    BACKEND_BASE_URL: 'https://api.example.com',
    REALTIME_WS_URL: 'ws://localhost:8000',
  },
}));

type EventHandler = (...args: unknown[]) => void;

function createMockSubscription(initialState = 'subscribing') {
  const listeners = new Map<string, EventHandler[]>();
  return {
    state: initialState,
    on: vi.fn((event: string, handler: EventHandler) => {
      const existing = listeners.get(event) || [];
      existing.push(handler);
      listeners.set(event, existing);
    }),
    presence: vi.fn(),
    removeAllListeners: vi.fn(),
    unsubscribe: vi.fn(),
    subscribe: vi.fn(),
    _emit(event: string, ...args: unknown[]) {
      const handlers = listeners.get(event) || [];
      for (const h of handlers) {
        h(...args);
      }
    },
    _listeners: listeners,
  };
}

const subscribeSpy = vi.spyOn(terminalWsClient, 'subscribeToDevice');
const unsubscribeSpy = vi.spyOn(terminalWsClient, 'unsubscribeFromDevice');

beforeEach(() => {
  subscribeSpy.mockReset();
  unsubscribeSpy.mockReset().mockImplementation(() => undefined);
});

describe('useDevicesPresence', () => {
  test('returns empty map and not loading for empty device list', () => {
    const ids: number[] = [];
    const { result } = renderHook(() => useDevicesPresence(ids));

    expect(result.current.presenceMap.size).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  test('subscribes to each device and detects online presence via subscribed event', async () => {
    const sub = createMockSubscription('subscribing');
    sub.presence.mockResolvedValue({
      clients: {
        client1: { chanInfo: { subscriberType: 'agent' } },
      },
    });
    subscribeSpy.mockReturnValue(sub as never);

    const ids = [1];
    const { result } = renderHook(() => useDevicesPresence(ids));

    expect(subscribeSpy).toHaveBeenCalledWith(1);
    expect(result.current.isLoading).toBe(true);

    // biome-ignore lint/suspicious/useAwait: act needs async for state flush
    await act(async () => {
      sub._emit('subscribed');
    });

    expect(sub.presence).toHaveBeenCalled();
    expect(result.current.presenceMap.get(1)).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  test('detects offline when no agent clients are present', async () => {
    const sub = createMockSubscription('subscribing');
    sub.presence.mockResolvedValue({
      clients: {
        client1: { chanInfo: { subscriberType: 'browser' } },
      },
    });
    subscribeSpy.mockReturnValue(sub as never);

    const ids = [2];
    const { result } = renderHook(() => useDevicesPresence(ids));

    // biome-ignore lint/suspicious/useAwait: act needs async for state flush
    await act(async () => {
      sub._emit('subscribed');
    });

    expect(result.current.presenceMap.get(2)).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  test('handles presence check failure gracefully', async () => {
    const sub = createMockSubscription('subscribing');
    sub.presence.mockRejectedValue(new Error('timeout'));
    subscribeSpy.mockReturnValue(sub as never);

    const ids = [3];
    const { result } = renderHook(() => useDevicesPresence(ids));

    // biome-ignore lint/suspicious/useAwait: act needs async for state flush
    await act(async () => {
      sub._emit('subscribed');
    });

    expect(result.current.presenceMap.get(3)).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  test('checks presence immediately when subscription is already subscribed', async () => {
    const sub = createMockSubscription('subscribed');
    sub.presence.mockResolvedValue({
      clients: {
        client1: { chanInfo: { subscriberType: 'agent' } },
      },
    });
    subscribeSpy.mockReturnValue(sub as never);

    const ids = [4];
    const { result } = renderHook(() => useDevicesPresence(ids));

    // The hook checks presence immediately for already-subscribed state
    // We need to flush the microtask queue
    await act(async () => {
      await Promise.resolve();
    });

    expect(sub.presence).toHaveBeenCalled();
    expect(result.current.presenceMap.get(4)).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  test('sets device online on join event', async () => {
    const sub = createMockSubscription('subscribing');
    sub.presence.mockResolvedValue({ clients: {} });
    subscribeSpy.mockReturnValue(sub as never);

    const ids = [5];
    const { result } = renderHook(() => useDevicesPresence(ids));

    // First, resolve initial presence as offline
    // biome-ignore lint/suspicious/useAwait: act needs async for state flush
    await act(async () => {
      sub._emit('subscribed');
    });

    expect(result.current.presenceMap.get(5)).toBe(false);

    // Now fire join event
    act(() => {
      sub._emit('join');
    });

    expect(result.current.presenceMap.get(5)).toBe(true);
  });

  test('rechecks presence on leave event', async () => {
    const sub = createMockSubscription('subscribing');
    sub.presence
      .mockResolvedValueOnce({
        clients: {
          client1: { chanInfo: { subscriberType: 'agent' } },
        },
      })
      .mockResolvedValueOnce({ clients: {} });
    subscribeSpy.mockReturnValue(sub as never);

    const ids = [6];
    const { result } = renderHook(() => useDevicesPresence(ids));

    // Initial presence: online
    // biome-ignore lint/suspicious/useAwait: act needs async for state flush
    await act(async () => {
      sub._emit('subscribed');
    });

    expect(result.current.presenceMap.get(6)).toBe(true);

    // Fire leave event => rechecks presence
    // biome-ignore lint/suspicious/useAwait: act needs async for state flush
    await act(async () => {
      sub._emit('leave');
    });

    expect(sub.presence).toHaveBeenCalledTimes(2);
    expect(result.current.presenceMap.get(6)).toBe(false);
  });

  test('unsubscribes from all devices on unmount', () => {
    const sub = createMockSubscription('subscribing');
    subscribeSpy.mockReturnValue(sub as never);

    const ids = [10, 11];
    const { unmount } = renderHook(() => useDevicesPresence(ids));

    unmount();

    expect(unsubscribeSpy).toHaveBeenCalledWith(10);
    expect(unsubscribeSpy).toHaveBeenCalledWith(11);
  });

  test('unsubscribes from removed devices when ids change', () => {
    const sub = createMockSubscription('subscribing');
    subscribeSpy.mockReturnValue(sub as never);

    const { rerender } = renderHook(({ ids }) => useDevicesPresence(ids), {
      initialProps: { ids: [20, 21] },
    });

    rerender({ ids: [21] });

    // Device 20 should have been unsubscribed (no longer in the list)
    expect(unsubscribeSpy).toHaveBeenCalledWith(20);
  });

  test('handles multiple devices with mixed presence results', async () => {
    const sub1 = createMockSubscription('subscribing');
    sub1.presence.mockResolvedValue({
      clients: {
        client1: { chanInfo: { subscriberType: 'agent' } },
      },
    });

    const sub2 = createMockSubscription('subscribing');
    sub2.presence.mockResolvedValue({ clients: {} });

    subscribeSpy
      .mockReturnValueOnce(sub1 as never)
      .mockReturnValueOnce(sub2 as never);

    const ids = [30, 31];
    const { result } = renderHook(() => useDevicesPresence(ids));

    // biome-ignore lint/suspicious/useAwait: act needs async for state flush
    await act(async () => {
      sub1._emit('subscribed');
      sub2._emit('subscribed');
    });

    expect(result.current.presenceMap.get(30)).toBe(true);
    expect(result.current.presenceMap.get(31)).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  test('handles presence with empty clients object', async () => {
    const sub = createMockSubscription('subscribing');
    sub.presence.mockResolvedValue({ clients: {} });
    subscribeSpy.mockReturnValue(sub as never);

    const ids = [40];
    const { result } = renderHook(() => useDevicesPresence(ids));

    // biome-ignore lint/suspicious/useAwait: act needs async for state flush
    await act(async () => {
      sub._emit('subscribed');
    });

    expect(result.current.presenceMap.get(40)).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  test('handles presence error with non-Error object', async () => {
    const sub = createMockSubscription('subscribing');
    sub.presence.mockRejectedValue({ code: 500, message: 'server error' });
    subscribeSpy.mockReturnValue(sub as never);

    const ids = [50];
    const { result } = renderHook(() => useDevicesPresence(ids));

    // biome-ignore lint/suspicious/useAwait: act needs async for state flush
    await act(async () => {
      sub._emit('subscribed');
    });

    expect(result.current.presenceMap.get(50)).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  test('transitions from loaded to empty list correctly', () => {
    const sub = createMockSubscription('subscribing');
    subscribeSpy.mockReturnValue(sub as never);

    const { result, rerender } = renderHook(
      ({ ids }) => useDevicesPresence(ids),
      { initialProps: { ids: [60] } },
    );

    rerender({ ids: [] });

    expect(result.current.presenceMap.size).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  test('multiple clients but only agent type counts as online', async () => {
    const sub = createMockSubscription('subscribing');
    sub.presence.mockResolvedValue({
      clients: {
        client1: { chanInfo: { subscriberType: 'browser' } },
        client2: { chanInfo: { subscriberType: 'user' } },
        client3: { chanInfo: {} },
      },
    });
    subscribeSpy.mockReturnValue(sub as never);

    const ids = [70];
    const { result } = renderHook(() => useDevicesPresence(ids));

    // biome-ignore lint/suspicious/useAwait: act needs async for state flush
    await act(async () => {
      sub._emit('subscribed');
    });

    expect(result.current.presenceMap.get(70)).toBe(false);
  });
});
