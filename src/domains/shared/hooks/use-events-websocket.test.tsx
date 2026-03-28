import { eventsWsClient } from '@domains/notifications/services/events/events-ws.client';
import { profileQueryOptions } from '@domains/org/services/users/get-profile.http-service';
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

function createQueryClientWithProfile() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  queryClient.setQueryData(profileQueryOptions.queryKey, {
    responseData: { results: { id: 'user-123', name: 'Test User' } },
  });
  return queryClient;
}

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useEventsWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('does not connect when organizationId is undefined', () => {
    const queryClient = createQueryClientWithProfile();
    renderHook(() => useEventsWebSocket(undefined), {
      wrapper: createWrapper(queryClient),
    });

    expect(eventsWsClient.connect).not.toHaveBeenCalled();
  });

  test('connects and subscribes when organizationId is provided', () => {
    const queryClient = createQueryClientWithProfile();
    renderHook(() => useEventsWebSocket('org-123'), {
      wrapper: createWrapper(queryClient),
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

    const queryClient = createQueryClientWithProfile();
    const { unmount } = renderHook(() => useEventsWebSocket('org-123'), {
      wrapper: createWrapper(queryClient),
    });

    unmount();

    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(eventsWsClient.disconnect).toHaveBeenCalledOnce();
  });

  test('notification:changed handler invalidates unread count query', () => {
    const queryClient = createQueryClientWithProfile();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useEventsWebSocket('org-456'), {
      wrapper: createWrapper(queryClient),
    });

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

  test('does not connect when profile data is missing', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    renderHook(() => useEventsWebSocket('org-123'), {
      wrapper: createWrapper(queryClient),
    });

    expect(eventsWsClient.connect).not.toHaveBeenCalled();
  });
});
