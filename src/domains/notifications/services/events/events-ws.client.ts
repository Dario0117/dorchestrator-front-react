import type {
  EventsWsMessage,
  EventsWsMessageType,
} from '@domains/notifications/services/events/events-ws-messages.schema';
import { eventsWsMessageSchema } from '@domains/notifications/services/events/events-ws-messages.schema';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import type { WsMessageType } from '@domains/terminal/services/ws-messages.schema';
import { logInfo, logWarning } from '@lib/logger.utils';

type EventsWsMessageHandler<T extends EventsWsMessage = EventsWsMessage> = (
  message: T,
) => void;

/**
 * Events WS client — delegates to the shared realtime connection managed
 * by terminalWsClient. Subscribes to the user events channel for notifications.
 */
export class EventsWsClient {
  private handlers = new Map<
    EventsWsMessageType,
    Set<EventsWsMessageHandler>
  >();

  async connect(userId?: string, organizationId?: string) {
    if (!userId || !organizationId) {
      logWarning(
        {},
        'Events WS connect called without userId or organizationId',
      );
      return;
    }

    // Ensure the realtime client is connected
    await terminalWsClient.connectForEvents();

    // Subscribe to user events channel via the shared client
    terminalWsClient.subscribeToEvents(userId, organizationId);

    logInfo({}, 'Events WS connected via realtime');
  }

  disconnect() {
    // Don't disconnect the shared client — terminal may still need it
  }

  onMessage<T extends EventsWsMessageType>(
    type: T,
    handler: EventsWsMessageHandler<Extract<EventsWsMessage, { type: T }>>,
  ) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)?.add(handler as EventsWsMessageHandler);

    // Register on the terminal client's handler system since publications
    // from the events channel flow through the same realtime connection
    const unsubTerminal = terminalWsClient.onMessage(
      type as unknown as WsMessageType,
      (msg: unknown) => {
        const result = eventsWsMessageSchema.safeParse(msg);
        if (result.success) {
          const typeHandlers = this.handlers.get(result.data.type);
          if (typeHandlers) {
            for (const h of typeHandlers) {
              h(result.data);
            }
          }
        }
      },
    );

    return () => {
      unsubTerminal();
      const typeHandlers = this.handlers.get(type);
      if (typeHandlers) {
        typeHandlers.delete(handler as EventsWsMessageHandler);
        if (typeHandlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }
}

export const eventsWsClient = new EventsWsClient();
