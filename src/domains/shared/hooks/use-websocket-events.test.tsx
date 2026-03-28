import { useWebSocketEvents } from '@domains/shared/hooks/use-websocket-events';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('@lib/env.utils', () => ({
  env: {
    BACKEND_BASE_URL: 'https://api.example.com',
  },
}));

type MessageHandler = (message: unknown) => void;

let messageHandlers: Map<string, MessageHandler>;

beforeEach(() => {
  messageHandlers = new Map();
});

vi.spyOn(terminalWsClient, 'connectForEvents').mockImplementation(
  () => undefined,
);
vi.spyOn(terminalWsClient, 'disconnect').mockImplementation(() => undefined);
vi.spyOn(terminalWsClient, 'onMessage').mockImplementation(
  // biome-ignore lint/suspicious/noExplicitAny: test mock needs loose typing
  (type: any, handler: any) => {
    messageHandlers.set(type as string, handler as MessageHandler);
    return () => {
      messageHandlers.delete(type as string);
    };
  },
);

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useWebSocketEvents', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  test('connects WebSocket on mount', () => {
    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    expect(terminalWsClient.connectForEvents).toHaveBeenCalledOnce();
  });

  test('disconnects WebSocket on unmount', () => {
    const { unmount } = renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    unmount();

    expect(terminalWsClient.disconnect).toHaveBeenCalled();
  });

  test('command:dispatch event invalidates command queries', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    const handler = messageHandlers.get('command:dispatch');
    handler?.({
      type: 'command:dispatch',
      payload: { commandId: 42, deviceId: 'dev-1', status: 'running' },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/commands'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/commands/{commandId}'],
    });
    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications'],
    });
  });

  test('command:dispatch with completed status invalidates notification queries', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    const handler = messageHandlers.get('command:dispatch');
    handler?.({
      type: 'command:dispatch',
      payload: { commandId: 42, deviceId: 'dev-1', status: 'completed' },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications'],
    });
  });

  test('command:dispatch with failed status invalidates notification queries', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    const handler = messageHandlers.get('command:dispatch');
    handler?.({
      type: 'command:dispatch',
      payload: { commandId: 7, deviceId: 'dev-2', status: 'failed' },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications'],
    });
  });

  test('session:status event invalidates session queries', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    const handler = messageHandlers.get('session:status');
    handler?.({
      type: 'session:status',
      sessionId: 'session-1',
      payload: { status: 'active', previousStatus: 'created' },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/terminal/sessions'],
    });
    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications'],
    });
  });

  test('session:status with created status invalidates notification queries', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    const handler = messageHandlers.get('session:status');
    handler?.({
      type: 'session:status',
      sessionId: 'session-2',
      payload: { status: 'created', previousStatus: 'terminated' },
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/notifications'],
    });
  });

  test('cleanup guards against redundant disconnect calls', () => {
    const disconnectSpy = vi.spyOn(terminalWsClient, 'disconnect');
    disconnectSpy.mockClear();

    const { unmount } = renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    disconnectSpy.mockClear();
    unmount();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  test('reconnection invalidates session queries', () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useWebSocketEvents(), {
      wrapper: createWrapper(queryClient),
    });

    invalidateSpy.mockClear();

    // Simulate reconnecting → connected transition
    useTerminalConnectionStore.setState({ connectionState: 'reconnecting' });
    useTerminalConnectionStore.setState({ connectionState: 'connected' });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['get', '/api/v1/{organizationId}/terminal/sessions'],
    });
  });
});
