import type { WsMessageHandler } from '@domains/terminal/services/terminal-ws.client.types';
import type {
  WsMessage,
  WsMessageType,
} from '@domains/terminal/services/ws-messages.schema';
import {
  RT,
  wsMessageSchema,
} from '@domains/terminal/services/ws-messages.schema';
import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';
import { env } from '@lib/env.utils';
import { logDebug, logError, logInfo, logWarning } from '@lib/logger.utils';
import {
  Centrifuge,
  type PublicationContext,
  type Subscription,
} from 'centrifuge';
import { fetchClient } from '@/http-service-setup';

function getStore() {
  return useTerminalConnectionStore.getState();
}

async function fetchConnectionToken() {
  const { data } = await fetchClient.POST('/api/ws/connection-token');
  const token = data?.responseData?.results?.token;
  if (!token) {
    throw new Error('Failed to fetch connection token');
  }
  return token;
}

async function fetchSubscriptionToken(channel: string) {
  logDebug({ channel }, 'Fetching subscription token');
  const { data, error } = await fetchClient.POST('/api/ws/subscription-token', {
    body: { channel },
  });
  if (error) {
    logError(
      { channel, error: JSON.stringify(error) },
      'Subscription token request failed',
    );
    throw new Error('Failed to fetch subscription token');
  }
  const token = data?.responseData?.results?.token;
  if (!token) {
    logError({ channel }, 'Subscription token response missing token');
    throw new Error('Failed to fetch subscription token');
  }
  logDebug({ channel }, 'Subscription token fetched');
  return token;
}

export class TerminalWsClient {
  private client: Centrifuge | null = null;
  private inputSubscription: Subscription | null = null;
  private outputSubscription: Subscription | null = null;
  private eventsSubscription: Subscription | null = null;
  private intentionalDisconnect = false;

  private removeSessionSubscriptions() {
    if (this.inputSubscription) {
      this.inputSubscription.removeAllListeners();
      this.inputSubscription.unsubscribe();
      this.client?.removeSubscription(this.inputSubscription);
      this.inputSubscription = null;
    }
    if (this.outputSubscription) {
      this.outputSubscription.removeAllListeners();
      this.outputSubscription.unsubscribe();
      this.client?.removeSubscription(this.outputSubscription);
      this.outputSubscription = null;
    }
  }

  private removeEventsSubscription() {
    if (this.eventsSubscription) {
      this.eventsSubscription.removeAllListeners();
      this.eventsSubscription.unsubscribe();
      this.client?.removeSubscription(this.eventsSubscription);
      this.eventsSubscription = null;
    }
  }
  private handlers = new Map<WsMessageType, Set<WsMessageHandler>>();

  private dispatchMessage(message: WsMessage) {
    const typeHandlers = this.handlers.get(message.type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        handler(message);
      }
    }
  }

  private handlePublication = (ctx: PublicationContext) => {
    const result = wsMessageSchema.safeParse(ctx.data);
    if (!result.success) {
      logWarning(
        { rawData: ctx.data, error: result.error },
        'Received invalid realtime message',
      );
      return;
    }
    this.dispatchMessage(result.data);
  };

  private ensureClient() {
    if (this.client) {
      return this.client;
    }

    this.client = new Centrifuge(env.REALTIME_WS_URL, {
      getToken: fetchConnectionToken,
    });

    this.client.on('connected', () => {
      getStore().setConnectionState('connected');
      getStore().resetReconnectAttempt();
      logInfo({}, 'Realtime connected');
    });

    this.client.on('connecting', (ctx) => {
      const store = getStore();
      if (store.connectionState === 'connected') {
        store.setConnectionState('reconnecting');
        store.incrementReconnectAttempt();
      } else {
        store.setConnectionState('connecting');
      }
      logDebug({ code: ctx.code, reason: ctx.reason }, 'Realtime connecting');
    });

    this.client.on('disconnected', (ctx) => {
      if (this.intentionalDisconnect) {
        getStore().setConnectionState('disconnected');
        logInfo({}, 'Realtime disconnected intentionally');
        return;
      }
      logWarning(
        { code: ctx.code, reason: ctx.reason },
        'Realtime disconnected',
      );
      getStore().setConnectionState('disconnected');
    });

    this.client.on('error', (ctx) => {
      logError({ error: ctx.error }, 'Realtime error');
    });

    this.client.connect();
    return this.client;
  }

  connect() {
    this.intentionalDisconnect = false;
    getStore().resetReconnectAttempt();

    // Clean up previous session subscription
    this.removeSessionSubscriptions();

    this.ensureClient();

    logInfo({}, 'Realtime terminal connect');
  }

  subscribeToSession(sessionId: string) {
    if (!this.client) {
      logWarning({}, 'Cannot subscribe to session — client not connected');
      return;
    }

    // Unsubscribe from previous session
    this.removeSessionSubscriptions();

    // Output channel: agent → browsers (pty:output, session events)
    const outputChannel = `$terminal_output:${sessionId}`;
    this.outputSubscription = this.client.newSubscription(outputChannel, {
      getToken: () => fetchSubscriptionToken(outputChannel),
    });

    this.outputSubscription.on('publication', this.handlePublication);

    this.outputSubscription.on('subscribing', (ctx) => {
      logDebug(
        { sessionId, code: ctx.code, reason: ctx.reason },
        'Output subscription subscribing',
      );
    });

    this.outputSubscription.on('subscribed', () => {
      logInfo({ sessionId }, 'Subscribed to terminal output channel');
      // Dispatch a synthetic heartbeat:ping to trigger initialization in terminal-emulator
      this.dispatchMessage({ type: RT.HEARTBEAT_PING });
    });

    this.outputSubscription.on('error', (ctx) => {
      logError(
        {
          sessionId,
          error:
            ctx.error instanceof Error
              ? ctx.error.message
              : JSON.stringify(ctx.error),
        },
        'Output subscription error',
      );
    });

    this.outputSubscription.on('unsubscribed', (ctx) => {
      logWarning(
        { sessionId, code: ctx.code, reason: ctx.reason },
        'Output subscription unsubscribed',
      );
    });

    this.outputSubscription.subscribe();

    // Input channel: browsers → agent (pty:input, pty:resize, file:transfer)
    const inputChannel = `$terminal_input:${sessionId}`;
    this.inputSubscription = this.client.newSubscription(inputChannel, {
      getToken: () => fetchSubscriptionToken(inputChannel),
    });

    this.inputSubscription.subscribe();
  }

  subscribeToEvents(userId: string, organizationId: string) {
    if (!this.client) {
      logWarning({}, 'Cannot subscribe to events — client not connected');
      return;
    }

    this.removeEventsSubscription();

    const channel = `$events_user:${userId}#${organizationId}`;
    this.eventsSubscription = this.client.newSubscription(channel, {
      getToken: () => fetchSubscriptionToken(channel),
    });

    this.eventsSubscription.on('publication', this.handlePublication);

    this.eventsSubscription.on('subscribed', () => {
      logInfo({}, 'Subscribed to user events channel');
    });

    this.eventsSubscription.subscribe();
  }

  connectForEvents() {
    this.intentionalDisconnect = false;
    getStore().resetReconnectAttempt();

    // Clean up session subscription but keep client + events subscription
    this.removeSessionSubscriptions();

    this.ensureClient();
  }

  disconnect() {
    this.intentionalDisconnect = true;

    this.removeSessionSubscriptions();
    this.removeEventsSubscription();

    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }

    const store = getStore();
    store.setConnectionState('disconnected');
    store.setError(null);
    store.resetReconnectAttempt();
  }

  isAuthenticated() {
    return this.client?.state === 'connected';
  }

  send(message: WsMessage) {
    if (!this.inputSubscription) {
      logWarning(
        { messageType: message.type },
        'Cannot send — no session subscription',
      );
      return;
    }

    if (this.inputSubscription.state !== 'subscribed') {
      logDebug(
        {
          messageType: message.type,
          state: this.inputSubscription.state,
        },
        'Cannot publish — subscription not in subscribed state',
      );
      return;
    }

    this.inputSubscription.publish(message).catch((error: unknown) => {
      logError(
        {
          messageType: message.type,
          error:
            error instanceof Error
              ? error.message
              : JSON.stringify(error, null, 2),
        },
        'Failed to publish message to session channel',
      );
    });
  }

  onMessage<T extends WsMessageType>(
    type: T,
    handler: WsMessageHandler<Extract<WsMessage, { type: T }>>,
  ) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)?.add(handler as WsMessageHandler);

    return () => {
      const typeHandlers = this.handlers.get(type);
      if (typeHandlers) {
        typeHandlers.delete(handler as WsMessageHandler);
        if (typeHandlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }
}

export const terminalWsClient = new TerminalWsClient();
