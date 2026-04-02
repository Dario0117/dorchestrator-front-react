import { eventsWsClient } from '@domains/notifications/services/events/events-ws.client';
import { profileQueryOptions } from '@domains/org/services/users/get-profile.http-service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode, Suspense } from 'react';
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
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>{children}</Suspense>
    </QueryClientProvider>
  );
}

describe('useEventsWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('does not connect when organizationId is undefined', async () => {
    const queryClient = createQueryClientWithProfile();
    await act(async () => {
      renderHook(() => useEventsWebSocket(undefined), {
        wrapper: createWrapper(queryClient),
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(eventsWsClient.connect).not.toHaveBeenCalled();
  });

  test('connects and subscribes when organizationId is provided', async () => {
    const queryClient = createQueryClientWithProfile();
    await act(async () => {
      renderHook(() => useEventsWebSocket('org-123'), {
        wrapper: createWrapper(queryClient),
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(eventsWsClient.connect).toHaveBeenCalledOnce();
    expect(eventsWsClient.onMessage).toHaveBeenCalledWith(
      'notification:changed',
      expect.any(Function),
    );
  });

  test('disconnects and unsubscribes on cleanup', async () => {
    const unsubscribe = vi.fn();
    vi.mocked(eventsWsClient.onMessage).mockReturnValue(unsubscribe);

    const queryClient = createQueryClientWithProfile();
    let result: ReturnType<typeof renderHook>;
    await act(async () => {
      result = renderHook(() => useEventsWebSocket('org-123'), {
        wrapper: createWrapper(queryClient),
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    result!.unmount();

    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(eventsWsClient.disconnect).toHaveBeenCalledOnce();
  });

  test('notification:changed handler invalidates unread count query', async () => {
    const queryClient = createQueryClientWithProfile();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      renderHook(() => useEventsWebSocket('org-456'), {
        wrapper: createWrapper(queryClient),
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
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

  test('does not connect when profile data is missing', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { unmount } = renderHook(() => useEventsWebSocket('org-123'), {
      wrapper: createWrapper(queryClient),
    });

    // Hook is suspended (no profile in cache), so connect should not be called
    expect(eventsWsClient.connect).not.toHaveBeenCalled();

    // Unmount before the suspended profile query resolves via MSW,
    // then flush the pending resolution within act() to avoid warnings
    unmount();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });
});
