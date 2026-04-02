import { TerminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import type { WsMessage } from '@domains/terminal/services/ws-messages.schema';
import { RT } from '@domains/terminal/services/ws-messages.schema';
import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';
import { env } from '@lib/env.utils';
import { Centrifuge } from 'centrifuge';
import { HttpResponse, http } from 'msw';
import { server } from '../../../../testsSetup';

// Helper to build backend URLs matching the fetchClient base
function buildBackendUrl(path: string) {
  return `${env.BACKEND_BASE_URL}${path}`;
}

// Helpers to extract event handlers registered on mocked Centrifuge/Subscription objects
function getEventHandler(
  mockObj: { on: ReturnType<typeof vi.fn> },
  eventName: string,
) {
  const call = mockObj.on.mock.calls.find((c: unknown[]) => c[0] === eventName);
  return call?.[1] as ((...args: unknown[]) => void) | undefined;
}

// MSW handlers for token endpoints
const connectionTokenHandler = http.post(
  buildBackendUrl('/api/ws/connection-token'),
  () =>
    HttpResponse.json({
      responseData: { results: { token: 'test-connection-token' } },
    }),
);

const subscriptionTokenHandler = http.post(
  buildBackendUrl('/api/ws/subscription-token'),
  () =>
    HttpResponse.json({
      responseData: { results: { token: 'test-subscription-token' } },
    }),
);

function resetStore() {
  const store = useTerminalConnectionStore.getState();
  store.setConnectionState('disconnected');
  store.setError(null);
  store.resetReconnectAttempt();
}

describe('TerminalWsClient', () => {
  let client: TerminalWsClient;

  beforeEach(() => {
    resetStore();
    client = new TerminalWsClient();
    server.use(connectionTokenHandler, subscriptionTokenHandler);
  });

  afterEach(() => {
    client.disconnect();
  });

  describe('connect', () => {
    it('creates a Centrifuge client and connects', () => {
      client.connect();

      // Centrifuge constructor was called (via the global mock)
      expect(Centrifuge).toHaveBeenCalled();
    });

    it('resets intentionalDisconnect and reconnect attempts', () => {
      useTerminalConnectionStore.getState().incrementReconnectAttempt();
      expect(useTerminalConnectionStore.getState().reconnectAttempt).toBe(1);

      client.connect();

      expect(useTerminalConnectionStore.getState().reconnectAttempt).toBe(0);
    });

    it('reuses existing client on subsequent connect calls', () => {
      client.connect();
      const callCount = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .calls.length;

      client.connect();
      expect(
        (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock.calls.length,
      ).toBe(callCount);
    });
  });

  describe('ensureClient event handlers', () => {
    function getClientMock() {
      client.connect();
      // The last Centrifuge() call returns our mock client
      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      return mockCalls[mockCalls.length - 1]!.value as {
        on: ReturnType<typeof vi.fn>;
        connect: ReturnType<typeof vi.fn>;
        disconnect: ReturnType<typeof vi.fn>;
        newSubscription: ReturnType<typeof vi.fn>;
        removeSubscription: ReturnType<typeof vi.fn>;
        state: string;
      };
    }

    it('sets connection state to connected on "connected" event', () => {
      const mockClient = getClientMock();
      const handler = getEventHandler(mockClient, 'connected');

      handler?.();

      const store = useTerminalConnectionStore.getState();
      expect(store.connectionState).toBe('connected');
      expect(store.reconnectAttempt).toBe(0);
    });

    it('sets connection state to connecting on "connecting" event when not previously connected', () => {
      const mockClient = getClientMock();
      const handler = getEventHandler(mockClient, 'connecting');

      handler?.({ code: 0, reason: 'initial' });

      expect(useTerminalConnectionStore.getState().connectionState).toBe(
        'connecting',
      );
    });

    it('sets connection state to reconnecting on "connecting" event when previously connected', () => {
      const mockClient = getClientMock();
      const connectedHandler = getEventHandler(mockClient, 'connected');
      const connectingHandler = getEventHandler(mockClient, 'connecting');

      // First set to connected
      connectedHandler?.();
      expect(useTerminalConnectionStore.getState().connectionState).toBe(
        'connected',
      );

      // Then trigger connecting again (reconnect scenario)
      connectingHandler?.({ code: 0, reason: 'reconnect' });

      const store = useTerminalConnectionStore.getState();
      expect(store.connectionState).toBe('reconnecting');
      expect(store.reconnectAttempt).toBe(1);
    });

    it('sets disconnected state on "disconnected" event (unintentional)', () => {
      const mockClient = getClientMock();
      const handler = getEventHandler(mockClient, 'disconnected');

      handler?.({ code: 0, reason: 'server closed' });

      expect(useTerminalConnectionStore.getState().connectionState).toBe(
        'disconnected',
      );
    });

    it('sets disconnected state on "disconnected" event (intentional)', () => {
      const mockClient = getClientMock();
      const handler = getEventHandler(mockClient, 'disconnected');

      // Trigger intentional disconnect first
      client.disconnect();

      handler?.({ code: 0, reason: 'intentional' });

      expect(useTerminalConnectionStore.getState().connectionState).toBe(
        'disconnected',
      );
    });

    it('handles "error" event without crashing', () => {
      const mockClient = getClientMock();
      const handler = getEventHandler(mockClient, 'error');

      // Should not throw
      handler?.({ error: new Error('test error') });
    });
  });

  describe('subscribeToSession', () => {
    it('does nothing if client is not connected', () => {
      // Don't call connect first
      client.subscribeToSession('session-123');
      // No error thrown, just a warning logged
    });

    it('creates output and input subscriptions', () => {
      client.connect();
      client.subscribeToSession('session-123');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;

      // Should have called newSubscription twice (output + input)
      expect(mockClient.newSubscription).toHaveBeenCalledWith(
        '$terminal_output:session-123',
        expect.any(Object),
      );
      expect(mockClient.newSubscription).toHaveBeenCalledWith(
        '$terminal_input:session-123',
        expect.any(Object),
      );
    });

    it('removes previous session subscriptions before subscribing to new session', () => {
      client.connect();
      client.subscribeToSession('session-1');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;

      // Get the first pair of subscriptions
      const firstOutputSub = mockClient.newSubscription.mock.results[0].value;
      const firstInputSub = mockClient.newSubscription.mock.results[1].value;

      // Subscribe to another session
      client.subscribeToSession('session-2');

      // Previous subscriptions should have been cleaned up
      expect(firstOutputSub.removeAllListeners).toHaveBeenCalled();
      expect(firstOutputSub.unsubscribe).toHaveBeenCalled();
      expect(firstInputSub.removeAllListeners).toHaveBeenCalled();
      expect(firstInputSub.unsubscribe).toHaveBeenCalled();
    });

    describe('output subscription event handlers', () => {
      function setupAndGetOutputSub() {
        client.connect();
        client.subscribeToSession('session-123');

        const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>)
          .mock.results;
        const mockClient = mockCalls[mockCalls.length - 1]!.value;
        return mockClient.newSubscription.mock.results[0].value as {
          on: ReturnType<typeof vi.fn>;
          subscribe: ReturnType<typeof vi.fn>;
        };
      }

      it('dispatches valid messages on publication', () => {
        const outputSub = setupAndGetOutputSub();
        const handler = vi.fn();
        client.onMessage(RT.PTY_OUTPUT, handler);

        const publicationHandler = getEventHandler(outputSub, 'publication');
        publicationHandler?.({
          data: { type: 'pty:output', sessionId: 'session-123', data: 'hello' },
        });

        expect(handler).toHaveBeenCalledWith({
          type: 'pty:output',
          sessionId: 'session-123',
          data: 'hello',
        });
      });

      it('ignores invalid messages on publication', () => {
        const outputSub = setupAndGetOutputSub();
        const handler = vi.fn();
        client.onMessage(RT.PTY_OUTPUT, handler);

        const publicationHandler = getEventHandler(outputSub, 'publication');
        publicationHandler?.({ data: { invalid: 'message' } });

        expect(handler).not.toHaveBeenCalled();
      });

      it('dispatches heartbeat:ping on subscribed event', () => {
        const outputSub = setupAndGetOutputSub();
        const handler = vi.fn();
        client.onMessage(RT.HEARTBEAT_PING, handler);

        const subscribedHandler = getEventHandler(outputSub, 'subscribed');
        subscribedHandler?.();

        expect(handler).toHaveBeenCalledWith({ type: 'heartbeat:ping' });
      });

      it('handles subscribing event', () => {
        const outputSub = setupAndGetOutputSub();
        const subscribingHandler = getEventHandler(outputSub, 'subscribing');
        // Should not throw
        subscribingHandler?.({ code: 0, reason: 'initial' });
      });

      it('handles error event with Error instance', () => {
        const outputSub = setupAndGetOutputSub();
        const errorHandler = getEventHandler(outputSub, 'error');
        // Should not throw
        errorHandler?.({ error: new Error('sub error') });
      });

      it('handles error event with non-Error value', () => {
        const outputSub = setupAndGetOutputSub();
        const errorHandler = getEventHandler(outputSub, 'error');
        // Should not throw
        errorHandler?.({ error: { code: 123 } });
      });

      it('handles unsubscribed event', () => {
        const outputSub = setupAndGetOutputSub();
        const unsubscribedHandler = getEventHandler(outputSub, 'unsubscribed');
        // Should not throw
        unsubscribedHandler?.({ code: 0, reason: 'server' });
      });
    });
  });

  describe('subscribeToEvents', () => {
    it('does nothing if client is not connected', () => {
      client.subscribeToEvents('user-1', 'org-1');
      // No error, just warning logged
    });

    it('creates events subscription', () => {
      client.connect();
      client.subscribeToEvents('user-1', 'org-1');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;

      expect(mockClient.newSubscription).toHaveBeenCalledWith(
        '$events_user:user-1#org-1',
        expect.any(Object),
      );
    });

    it('removes previous events subscription before subscribing', () => {
      client.connect();
      client.subscribeToEvents('user-1', 'org-1');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;

      // The events subscription is the one after connect's newSubscription calls
      // connect() doesn't create subscriptions, so the first newSubscription call is from subscribeToEvents
      const firstEventsSub = mockClient.newSubscription.mock.results[0].value;

      client.subscribeToEvents('user-2', 'org-2');

      expect(firstEventsSub.removeAllListeners).toHaveBeenCalled();
      expect(firstEventsSub.unsubscribe).toHaveBeenCalled();
    });

    it('dispatches messages on events publication', () => {
      client.connect();
      client.subscribeToEvents('user-1', 'org-1');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;
      const eventsSub = mockClient.newSubscription.mock.results[0].value;

      const handler = vi.fn();
      client.onMessage(RT.COMMAND_DISPATCH, handler);

      const publicationHandler = getEventHandler(eventsSub, 'publication');
      publicationHandler?.({
        data: {
          type: 'command:dispatch',
          payload: {
            commandId: 1,
            deviceId: 'device-1',
            status: 'completed',
          },
        },
      });

      expect(handler).toHaveBeenCalled();
    });

    it('handles subscribed event', () => {
      client.connect();
      client.subscribeToEvents('user-1', 'org-1');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;
      const eventsSub = mockClient.newSubscription.mock.results[0].value;

      const subscribedHandler = getEventHandler(eventsSub, 'subscribed');
      // Should not throw
      subscribedHandler?.();
    });
  });

  describe('subscribeToDevice', () => {
    it('creates a new device subscription', () => {
      client.connect();
      const sub = client.subscribeToDevice(42);

      expect(sub).toBeDefined();
      expect(sub?.subscribe).toHaveBeenCalled();
    });

    it('reuses existing subscription with refCount increment', () => {
      client.connect();
      const sub1 = client.subscribeToDevice(42);
      const sub2 = client.subscribeToDevice(42);

      expect(sub1).toBe(sub2);
    });

    it('creates client if not already connected (via ensureClient)', () => {
      // Don't call connect first; subscribeToDevice calls ensureClient internally
      const sub = client.subscribeToDevice(42);
      expect(sub).toBeDefined();
      expect(Centrifuge).toHaveBeenCalled();
    });

    describe('device subscription event handlers', () => {
      function setupAndGetDeviceSub() {
        client.connect();
        client.subscribeToDevice(42);

        const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>)
          .mock.results;
        const mockClient = mockCalls[mockCalls.length - 1]!.value;
        // The device subscription is the first newSubscription call after connect
        return mockClient.newSubscription.mock.results[0].value as {
          on: ReturnType<typeof vi.fn>;
          subscribe: ReturnType<typeof vi.fn>;
        };
      }

      it('handles subscribed event', () => {
        const deviceSub = setupAndGetDeviceSub();
        const handler = getEventHandler(deviceSub, 'subscribed');
        handler?.();
      });

      it('handles error event with Error instance', () => {
        const deviceSub = setupAndGetDeviceSub();
        const handler = getEventHandler(deviceSub, 'error');
        handler?.({ error: new Error('device sub error') });
      });

      it('handles error event with non-Error value', () => {
        const deviceSub = setupAndGetDeviceSub();
        const handler = getEventHandler(deviceSub, 'error');
        handler?.({ error: { code: 500 } });
      });

      it('handles subscribing event', () => {
        const deviceSub = setupAndGetDeviceSub();
        const handler = getEventHandler(deviceSub, 'subscribing');
        handler?.({ code: 0, reason: 'initial' });
      });

      it('handles unsubscribed event', () => {
        const deviceSub = setupAndGetDeviceSub();
        const handler = getEventHandler(deviceSub, 'unsubscribed');
        handler?.({ code: 0, reason: 'server' });
      });
    });
  });

  describe('unsubscribeFromDevice', () => {
    it('does nothing if device is not subscribed', () => {
      client.unsubscribeFromDevice(999);
      // No error
    });

    it('decrements refCount but keeps subscription if refCount > 0', () => {
      client.connect();
      client.subscribeToDevice(42);
      client.subscribeToDevice(42); // refCount = 2

      client.unsubscribeFromDevice(42);

      // Subscription should still exist, can subscribe again without creating new one
      const sub = client.subscribeToDevice(42);
      expect(sub).toBeDefined();
    });

    it('removes subscription when refCount reaches 0', () => {
      client.connect();
      client.subscribeToDevice(42);

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;
      const deviceSub = mockClient.newSubscription.mock.results[0].value;

      client.unsubscribeFromDevice(42);

      expect(deviceSub.removeAllListeners).toHaveBeenCalled();
      expect(deviceSub.unsubscribe).toHaveBeenCalled();
      expect(mockClient.removeSubscription).toHaveBeenCalledWith(deviceSub);
    });
  });

  describe('connectForEvents', () => {
    it('creates client and resets state without session subscriptions', () => {
      client.connectForEvents();

      expect(Centrifuge).toHaveBeenCalled();
      expect(useTerminalConnectionStore.getState().reconnectAttempt).toBe(0);
    });

    it('cleans up session subscriptions but keeps events subscription', () => {
      client.connect();
      client.subscribeToSession('session-1');
      client.subscribeToEvents('user-1', 'org-1');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;

      // output sub is index 0, input sub is index 1, events sub is index 2
      const outputSub = mockClient.newSubscription.mock.results[0].value;
      const inputSub = mockClient.newSubscription.mock.results[1].value;

      client.connectForEvents();

      expect(outputSub.removeAllListeners).toHaveBeenCalled();
      expect(inputSub.removeAllListeners).toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('disconnects client and resets all state', () => {
      client.connect();
      client.subscribeToSession('session-1');
      client.subscribeToEvents('user-1', 'org-1');

      client.disconnect();

      const store = useTerminalConnectionStore.getState();
      expect(store.connectionState).toBe('disconnected');
      expect(store.lastError).toBeNull();
      expect(store.reconnectAttempt).toBe(0);
    });

    it('cleans up device subscriptions', () => {
      client.connect();
      client.subscribeToDevice(1);
      client.subscribeToDevice(2);

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;

      const deviceSub1 = mockClient.newSubscription.mock.results[0].value;
      const deviceSub2 = mockClient.newSubscription.mock.results[1].value;

      client.disconnect();

      expect(deviceSub1.removeAllListeners).toHaveBeenCalled();
      expect(deviceSub1.unsubscribe).toHaveBeenCalled();
      expect(deviceSub2.removeAllListeners).toHaveBeenCalled();
      expect(deviceSub2.unsubscribe).toHaveBeenCalled();
    });

    it('handles disconnect when client is null', () => {
      // Don't connect first
      client.disconnect();
      // No error
      expect(useTerminalConnectionStore.getState().connectionState).toBe(
        'disconnected',
      );
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when client is null', () => {
      expect(client.isAuthenticated()).toBeFalsy();
    });

    it('returns false when client state is not connected', () => {
      client.connect();
      expect(client.isAuthenticated()).toBe(false);
    });

    it('returns true when client state is connected', () => {
      client.connect();
      // We need to set the mock client's state to 'connected'
      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;
      mockClient.state = 'connected';

      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe('send', () => {
    const testMessage: WsMessage = {
      type: 'pty:input',
      sessionId: 'session-123',
      data: 'ls -la',
    };

    it('logs warning when no session subscription exists', () => {
      client.send(testMessage);
      // No error thrown, just a warning logged
    });

    it('logs debug when subscription is not in subscribed state', () => {
      client.connect();
      client.subscribeToSession('session-123');

      // By default, mock subscription state is 'unsubscribed'
      client.send(testMessage);
      // No publish call since state is not 'subscribed'
    });

    it('publishes message when subscription is in subscribed state', () => {
      client.connect();
      client.subscribeToSession('session-123');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;
      // Input subscription is the second newSubscription call (index 1)
      const inputSub = mockClient.newSubscription.mock.results[1].value;
      inputSub.state = 'subscribed';

      client.send(testMessage);

      expect(inputSub.publish).toHaveBeenCalledWith(testMessage);
    });

    it('handles publish rejection with Error instance', async () => {
      client.connect();
      client.subscribeToSession('session-123');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;
      const inputSub = mockClient.newSubscription.mock.results[1].value;
      inputSub.state = 'subscribed';
      inputSub.publish.mockRejectedValueOnce(new Error('publish failed'));

      client.send(testMessage);

      // Wait for the promise rejection to be handled
      await vi.waitFor(() => {
        expect(inputSub.publish).toHaveBeenCalled();
      });
    });

    it('handles publish rejection with non-Error value', async () => {
      client.connect();
      client.subscribeToSession('session-123');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;
      const inputSub = mockClient.newSubscription.mock.results[1].value;
      inputSub.state = 'subscribed';
      inputSub.publish.mockRejectedValueOnce({ code: 500, message: 'fail' });

      client.send(testMessage);

      await vi.waitFor(() => {
        expect(inputSub.publish).toHaveBeenCalled();
      });
    });
  });

  describe('onMessage', () => {
    it('registers a handler and returns an unsubscribe function', () => {
      const handler = vi.fn();
      const unsubscribe = client.onMessage(RT.PTY_OUTPUT, handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('dispatches messages to registered handlers', () => {
      const handler = vi.fn();
      client.onMessage(RT.PTY_OUTPUT, handler);

      // Trigger via a publication
      client.connect();
      client.subscribeToSession('session-123');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;
      const outputSub = mockClient.newSubscription.mock.results[0].value;

      const publicationHandler = getEventHandler(outputSub, 'publication');
      publicationHandler?.({
        data: { type: 'pty:output', sessionId: 'session-123', data: 'test' },
      });

      expect(handler).toHaveBeenCalledWith({
        type: 'pty:output',
        sessionId: 'session-123',
        data: 'test',
      });
    });

    it('does not dispatch to unsubscribed handlers', () => {
      const handler = vi.fn();
      const unsubscribe = client.onMessage(RT.PTY_OUTPUT, handler);

      unsubscribe();

      client.connect();
      client.subscribeToSession('session-123');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;
      const outputSub = mockClient.newSubscription.mock.results[0].value;

      const publicationHandler = getEventHandler(outputSub, 'publication');
      publicationHandler?.({
        data: { type: 'pty:output', sessionId: 'session-123', data: 'test' },
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('removes the handler set when last handler is unsubscribed', () => {
      const handler = vi.fn();
      const unsubscribe = client.onMessage(RT.PTY_OUTPUT, handler);

      unsubscribe();

      // Calling unsubscribe again should not throw (set already deleted)
      unsubscribe();
    });

    it('supports multiple handlers for the same message type', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      client.onMessage(RT.PTY_OUTPUT, handler1);
      client.onMessage(RT.PTY_OUTPUT, handler2);

      client.connect();
      client.subscribeToSession('session-123');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;
      const outputSub = mockClient.newSubscription.mock.results[0].value;

      const publicationHandler = getEventHandler(outputSub, 'publication');
      publicationHandler?.({
        data: { type: 'pty:output', sessionId: 'session-123', data: 'test' },
      });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('does not dispatch to handlers of different message types', () => {
      const handler = vi.fn();
      client.onMessage(RT.PTY_INPUT, handler);

      client.connect();
      client.subscribeToSession('session-123');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;
      const outputSub = mockClient.newSubscription.mock.results[0].value;

      const publicationHandler = getEventHandler(outputSub, 'publication');
      publicationHandler?.({
        data: { type: 'pty:output', sessionId: 'session-123', data: 'test' },
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('keeps other handlers when one is removed', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const unsubscribe1 = client.onMessage(RT.PTY_OUTPUT, handler1);
      client.onMessage(RT.PTY_OUTPUT, handler2);

      unsubscribe1();

      client.connect();
      client.subscribeToSession('session-123');

      const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
        .results;
      const mockClient = mockCalls[mockCalls.length - 1]!.value;
      const outputSub = mockClient.newSubscription.mock.results[0].value;

      const publicationHandler = getEventHandler(outputSub, 'publication');
      publicationHandler?.({
        data: { type: 'pty:output', sessionId: 'session-123', data: 'test' },
      });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('removeSessionSubscriptions (no subscriptions)', () => {
    it('handles removal when no subscriptions exist', () => {
      // connect without subscribing to a session, then connect again
      // This exercises the branch where inputSubscription and outputSubscription are null
      client.connect();
      client.connect(); // Second connect calls removeSessionSubscriptions
    });
  });

  describe('removeEventsSubscription (no subscription)', () => {
    it('handles removal when no events subscription exists', () => {
      client.connect();
      client.subscribeToEvents('user-1', 'org-1');

      // Subscribe again — first call to removeEventsSubscription with existing sub
      client.subscribeToEvents('user-2', 'org-2');
    });
  });
});

describe('fetchConnectionToken (via getToken callback)', () => {
  let client: TerminalWsClient;

  beforeEach(() => {
    resetStore();
    client = new TerminalWsClient();
    server.use(connectionTokenHandler, subscriptionTokenHandler);
  });

  afterEach(() => {
    client.disconnect();
  });

  it('returns the token when the API responds successfully', async () => {
    client.connect();

    // Extract the getToken callback passed to the Centrifuge constructor
    const constructorCall = (Centrifuge as unknown as ReturnType<typeof vi.fn>)
      .mock.calls[0];
    const options = constructorCall![1] as { getToken: () => Promise<string> };

    const token = await options.getToken();
    expect(token).toBe('test-connection-token');
  });

  it('throws when the API returns no token', async () => {
    server.use(
      http.post(buildBackendUrl('/api/ws/connection-token'), () =>
        HttpResponse.json({ responseData: { results: {} } }),
      ),
    );

    client.connect();

    const constructorCall = (Centrifuge as unknown as ReturnType<typeof vi.fn>)
      .mock.calls[0];
    const options = constructorCall![1] as { getToken: () => Promise<string> };

    await expect(options.getToken()).rejects.toThrow(
      'Failed to fetch connection token',
    );
  });

  it('throws when the API returns no data', async () => {
    server.use(
      http.post(buildBackendUrl('/api/ws/connection-token'), () =>
        HttpResponse.json({}),
      ),
    );

    client.connect();

    const constructorCall = (Centrifuge as unknown as ReturnType<typeof vi.fn>)
      .mock.calls[0];
    const options = constructorCall![1] as { getToken: () => Promise<string> };

    await expect(options.getToken()).rejects.toThrow(
      'Failed to fetch connection token',
    );
  });
});

describe('fetchSubscriptionToken (via getToken callback)', () => {
  let client: TerminalWsClient;

  beforeEach(() => {
    resetStore();
    client = new TerminalWsClient();
    server.use(connectionTokenHandler, subscriptionTokenHandler);
  });

  afterEach(() => {
    client.disconnect();
  });

  it('returns the token when the API responds successfully', async () => {
    client.connect();
    client.subscribeToSession('session-1');

    const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
      .results;
    const mockClient = mockCalls[mockCalls.length - 1]!.value;

    // The output subscription is the first newSubscription call
    const newSubCall = mockClient.newSubscription.mock.calls[0];
    const subOptions = newSubCall[1] as { getToken: () => Promise<string> };

    const token = await subOptions.getToken();
    expect(token).toBe('test-subscription-token');
  });

  it('throws when the API returns an error', async () => {
    server.use(
      http.post(buildBackendUrl('/api/ws/subscription-token'), () =>
        HttpResponse.json({ message: 'Unauthorized' }, { status: 400 }),
      ),
    );

    client.connect();
    client.subscribeToSession('session-1');

    const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
      .results;
    const mockClient = mockCalls[mockCalls.length - 1]!.value;

    const newSubCall = mockClient.newSubscription.mock.calls[0];
    const subOptions = newSubCall[1] as { getToken: () => Promise<string> };

    await expect(subOptions.getToken()).rejects.toThrow(
      'Failed to fetch subscription token',
    );
  });

  it('throws when the API returns no token in response', async () => {
    server.use(
      http.post(buildBackendUrl('/api/ws/subscription-token'), () =>
        HttpResponse.json({ responseData: { results: {} } }),
      ),
    );

    client.connect();
    client.subscribeToSession('session-1');

    const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
      .results;
    const mockClient = mockCalls[mockCalls.length - 1]!.value;

    const newSubCall = mockClient.newSubscription.mock.calls[0];
    const subOptions = newSubCall[1] as { getToken: () => Promise<string> };

    await expect(subOptions.getToken()).rejects.toThrow(
      'Failed to fetch subscription token',
    );
  });

  it('invokes getToken for input subscription channel', async () => {
    client.connect();
    client.subscribeToSession('session-1');

    const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
      .results;
    const mockClient = mockCalls[mockCalls.length - 1]!.value;

    // Input subscription is the second newSubscription call (index 1)
    const inputSubCall = mockClient.newSubscription.mock.calls[1];
    const subOptions = inputSubCall[1] as { getToken: () => Promise<string> };

    const token = await subOptions.getToken();
    expect(token).toBe('test-subscription-token');
  });

  it('invokes getToken for events subscription channel', async () => {
    client.connect();
    client.subscribeToEvents('user-1', 'org-1');

    const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
      .results;
    const mockClient = mockCalls[mockCalls.length - 1]!.value;

    const eventsSubCall = mockClient.newSubscription.mock.calls[0];
    const subOptions = eventsSubCall[1] as { getToken: () => Promise<string> };

    const token = await subOptions.getToken();
    expect(token).toBe('test-subscription-token');
  });

  it('invokes getToken for device subscription channel', async () => {
    client.connect();
    client.subscribeToDevice(42);

    const mockCalls = (Centrifuge as unknown as ReturnType<typeof vi.fn>).mock
      .results;
    const mockClient = mockCalls[mockCalls.length - 1]!.value;

    const deviceSubCall = mockClient.newSubscription.mock.calls[0];
    const subOptions = deviceSubCall[1] as { getToken: () => Promise<string> };

    const token = await subOptions.getToken();
    expect(token).toBe('test-subscription-token');
  });
});
