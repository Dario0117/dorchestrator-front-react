import { eventsWsClient } from '@domains/notifications/services/events/events-ws.client';
import { createQueryThemeWrapper } from '@lib/test-wrappers.utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useEventsWebSocket } from './use-events-websocket';

vi.mock('@domains/notifications/services/events/events-ws.client', () => ({
  eventsWsClient: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    onMessage: vi.fn(() => vi.fn()),
  },
}));

vi.mock(
  '@domains/notifications/services/get-unread-count.http-service',
  () => ({
    getUnreadCountQueryOptions: (orgId: string) => ({
      queryKey: ['notifications', 'unread-count', orgId],
    }),
  }),
);

describe('useEventsWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('does not connect when organizationId is undefined', () => {
    renderHook(() => useEventsWebSocket(undefined), {
      wrapper: createQueryThemeWrapper(),
    });

    expect(eventsWsClient.connect).not.toHaveBeenCalled();
  });

  test('connects and subscribes when organizationId is provided', () => {
    renderHook(() => useEventsWebSocket('org-123'), {
      wrapper: createQueryThemeWrapper(),
    });

    expect(eventsWsClient.connect).toHaveBeenCalledOnce();
    expect(eventsWsClient.onMessage).toHaveBeenCalledWith(
      'notification:changed',
      expect.any(Function),
    );
  });

  test('disconnects and unsubscribes on cleanup', () => {
    const unsubscribe = vi.fn();
    vi.mocked(eventsWsClient.onMessage).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useEventsWebSocket('org-123'), {
      wrapper: createQueryThemeWrapper(),
    });

    unmount();

    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(eventsWsClient.disconnect).toHaveBeenCalledOnce();
  });

  test('notification:changed handler invalidates unread count query', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useEventsWebSocket('org-456'), { wrapper });

    const onMessageCall = vi
      .mocked(eventsWsClient.onMessage)
      .mock.calls.find((call) => call[0] === 'notification:changed');
    expect(onMessageCall).toBeTruthy();

    const handler = onMessageCall?.[1];
    handler?.({ type: 'notification:changed' });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['notifications', 'unread-count', 'org-456'],
    });
  });
});
