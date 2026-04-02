import { EventsWsClient } from '@domains/notifications/services/events/events-ws.client';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';

describe('EventsWsClient', () => {
  let client: EventsWsClient;

  beforeEach(() => {
    client = new EventsWsClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('connect', () => {
    it('should warn and return early when userId is missing', async () => {
      const connectForEventsSpy = vi.spyOn(
        terminalWsClient,
        'connectForEvents',
      );

      await client.connect(undefined, 'org-123');

      expect(connectForEventsSpy).not.toHaveBeenCalled();
    });

    it('should warn and return early when organizationId is missing', async () => {
      const connectForEventsSpy = vi.spyOn(
        terminalWsClient,
        'connectForEvents',
      );

      await client.connect('user-123', undefined);

      expect(connectForEventsSpy).not.toHaveBeenCalled();
    });

    it('should warn and return early when both userId and organizationId are missing', async () => {
      const connectForEventsSpy = vi.spyOn(
        terminalWsClient,
        'connectForEvents',
      );

      await client.connect(undefined, undefined);

      expect(connectForEventsSpy).not.toHaveBeenCalled();
    });

    it('should warn and return early when called with no arguments', async () => {
      const connectForEventsSpy = vi.spyOn(
        terminalWsClient,
        'connectForEvents',
      );

      await client.connect();

      expect(connectForEventsSpy).not.toHaveBeenCalled();
    });

    it('should connect and subscribe when both userId and organizationId are provided', async () => {
      const connectForEventsSpy = vi
        .spyOn(terminalWsClient, 'connectForEvents')
        .mockResolvedValue(undefined);
      const subscribeToEventsSpy = vi
        .spyOn(terminalWsClient, 'subscribeToEvents')
        .mockImplementation(() => undefined);

      await client.connect('user-123', 'org-456');

      expect(connectForEventsSpy).toHaveBeenCalled();
      expect(subscribeToEventsSpy).toHaveBeenCalledWith('user-123', 'org-456');
    });
  });

  describe('disconnect', () => {
    it('should be callable without error', () => {
      // disconnect is a no-op to avoid disconnecting the shared client
      expect(() => client.disconnect()).not.toThrow();
    });
  });

  describe('onMessage', () => {
    it('should register a handler and return an unsubscribe function', () => {
      const terminalUnsubscribe = vi.fn();
      vi.spyOn(terminalWsClient, 'onMessage').mockReturnValue(
        terminalUnsubscribe,
      );

      const handler = vi.fn();
      const unsubscribe = client.onMessage('notification:changed', handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should call the handler when a valid message is received through the terminal client', () => {
      // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
      let capturedTerminalHandler: (msg: unknown) => void = () => {};
      const terminalUnsubscribe = vi.fn();

      vi.spyOn(terminalWsClient, 'onMessage').mockImplementation(
        (_type, handler) => {
          capturedTerminalHandler = handler as (msg: unknown) => void;
          return terminalUnsubscribe;
        },
      );

      const handler = vi.fn();
      client.onMessage('notification:changed', handler);

      // Simulate a valid message coming through the terminal client
      capturedTerminalHandler({ type: 'notification:changed' });

      expect(handler).toHaveBeenCalledWith({ type: 'notification:changed' });
    });

    it('should not call the handler when an invalid message is received', () => {
      // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
      let capturedTerminalHandler: (msg: unknown) => void = () => {};
      const terminalUnsubscribe = vi.fn();

      vi.spyOn(terminalWsClient, 'onMessage').mockImplementation(
        (_type, handler) => {
          capturedTerminalHandler = handler as (msg: unknown) => void;
          return terminalUnsubscribe;
        },
      );

      const handler = vi.fn();
      client.onMessage('notification:changed', handler);

      // Simulate an invalid message
      capturedTerminalHandler({ type: 'unknown:message' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not call handler for a different message type', () => {
      // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
      let capturedTerminalHandler: (msg: unknown) => void = () => {};
      const terminalUnsubscribe = vi.fn();

      vi.spyOn(terminalWsClient, 'onMessage').mockImplementation(
        (_type, handler) => {
          capturedTerminalHandler = handler as (msg: unknown) => void;
          return terminalUnsubscribe;
        },
      );

      const handler = vi.fn();
      client.onMessage('notification:changed', handler);

      // Send a valid events message but of a different type
      capturedTerminalHandler({ type: 'heartbeat:ping' });

      // The handler should not be called because it's registered for 'notification:changed'
      // but the message type is 'heartbeat:ping'
      expect(handler).not.toHaveBeenCalled();
    });

    it('should unsubscribe the handler when the returned function is called', () => {
      // biome-ignore lint/suspicious/noEmptyBlockStatements: noop in test
      let capturedTerminalHandler: (msg: unknown) => void = () => {};
      const terminalUnsubscribe = vi.fn();

      vi.spyOn(terminalWsClient, 'onMessage').mockImplementation(
        (_type, handler) => {
          capturedTerminalHandler = handler as (msg: unknown) => void;
          return terminalUnsubscribe;
        },
      );

      const handler = vi.fn();
      const unsubscribe = client.onMessage('notification:changed', handler);

      // Verify the handler works before unsubscribing
      capturedTerminalHandler({ type: 'notification:changed' });
      expect(handler).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      expect(terminalUnsubscribe).toHaveBeenCalled();

      // The handler should no longer be in the internal handlers map
      // Sending a message after unsubscribe should not call the handler
      handler.mockClear();
      capturedTerminalHandler({ type: 'notification:changed' });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should clean up the type entry from handlers map when last handler is removed', () => {
      const terminalUnsubscribe = vi.fn();
      vi.spyOn(terminalWsClient, 'onMessage').mockReturnValue(
        terminalUnsubscribe,
      );

      const handler1 = vi.fn();
      const unsubscribe1 = client.onMessage('notification:changed', handler1);

      // After unsubscribing the only handler, the type key should be removed
      unsubscribe1();

      expect(terminalUnsubscribe).toHaveBeenCalled();
    });

    it('should support multiple handlers for the same message type', () => {
      const capturedTerminalHandlers: Array<(msg: unknown) => void> = [];
      const terminalUnsubscribe = vi.fn();

      vi.spyOn(terminalWsClient, 'onMessage').mockImplementation(
        (_type, handler) => {
          capturedTerminalHandlers.push(handler as (msg: unknown) => void);
          return terminalUnsubscribe;
        },
      );

      const handler1 = vi.fn();
      const handler2 = vi.fn();
      client.onMessage('notification:changed', handler1);
      client.onMessage('notification:changed', handler2);

      // Trigger from first terminal handler - both handlers should be called
      const firstHandler = capturedTerminalHandlers[0] as (
        msg: unknown,
      ) => void;
      firstHandler({ type: 'notification:changed' });

      expect(handler1).toHaveBeenCalledWith({ type: 'notification:changed' });
      expect(handler2).toHaveBeenCalledWith({ type: 'notification:changed' });
    });

    it('should handle calling unsubscribe twice without error', () => {
      const terminalUnsubscribe = vi.fn();
      vi.spyOn(terminalWsClient, 'onMessage').mockReturnValue(
        terminalUnsubscribe,
      );

      const handler = vi.fn();
      const unsubscribe = client.onMessage('notification:changed', handler);

      // First unsubscribe removes the handler and the type entry
      unsubscribe();

      // Second unsubscribe should not throw — typeHandlers will be undefined
      expect(() => unsubscribe()).not.toThrow();
    });

    it('should not remove the type entry when other handlers remain after unsubscribing one', () => {
      const capturedTerminalHandlers: Array<(msg: unknown) => void> = [];
      const terminalUnsubscribe = vi.fn();

      vi.spyOn(terminalWsClient, 'onMessage').mockImplementation(
        (_type, handler) => {
          capturedTerminalHandlers.push(handler as (msg: unknown) => void);
          return terminalUnsubscribe;
        },
      );

      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const unsubscribe1 = client.onMessage('notification:changed', handler1);
      client.onMessage('notification:changed', handler2);

      // Unsubscribe handler1
      unsubscribe1();

      // handler2 should still work via the second terminal handler
      const secondTerminalHandler = capturedTerminalHandlers[1] as (
        msg: unknown,
      ) => void;
      secondTerminalHandler({ type: 'notification:changed' });
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith({ type: 'notification:changed' });
    });
  });

  describe('exported singleton', () => {
    it('should export a singleton instance', async () => {
      const { eventsWsClient } = await import(
        '@domains/notifications/services/events/events-ws.client'
      );
      expect(eventsWsClient).toBeInstanceOf(EventsWsClient);
    });
  });
});
