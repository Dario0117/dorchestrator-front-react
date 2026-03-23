import type {
  EventsWsMessage,
  EventsWsMessageType,
} from '@domains/notifications/services/events/events-ws-messages.schema';
import { eventsWsMessageSchema } from '@domains/notifications/services/events/events-ws-messages.schema';
import { env } from '@lib/env.utils';
import { logDebug, logError, logInfo, logWarning } from '@lib/logger.utils';

type EventsWsMessageHandler<T extends EventsWsMessage = EventsWsMessage> = (
  message: T,
) => void;

const AUTH_FAILURE_CODES = [4001, 4003, 1008] as const;

const BACKOFF_INITIAL_MS = 1000;
const BACKOFF_MAX_MS = 30_000;
const BACKOFF_MULTIPLIER = 2;

function buildWsUrl() {
  const base = env.BACKEND_BASE_URL.replace('https://', 'wss://').replace(
    'http://',
    'ws://',
  );
  return `${base}/ws/events`;
}

function calculateBackoff(attempt: number) {
  const delay = BACKOFF_INITIAL_MS * BACKOFF_MULTIPLIER ** attempt;
  return Math.min(delay, BACKOFF_MAX_MS);
}

export class EventsWsClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalDisconnect = false;
  private authenticated = false;
  private reconnectAttempt = 0;
  private handlers = new Map<
    EventsWsMessageType,
    Set<EventsWsMessageHandler>
  >();

  private clearReconnectTimer() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect() {
    const delay = calculateBackoff(this.reconnectAttempt);

    logInfo(
      { attempt: this.reconnectAttempt + 1, delayMs: delay },
      'Scheduling events WS reconnect',
    );

    this.reconnectAttempt++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectInternal();
    }, delay);
  }

  private dispatchMessage(message: EventsWsMessage) {
    const typeHandlers = this.handlers.get(message.type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        handler(message);
      }
    }
  }

  private handleHeartbeat(message: EventsWsMessage) {
    if (message.type === 'heartbeat:ping') {
      logDebug({}, 'Events WS: heartbeat:ping received');

      if (!this.authenticated) {
        this.authenticated = true;
        logInfo({}, 'Events WS authenticated (first heartbeat received)');
      }

      this.send({ type: 'heartbeat:pong' });
    }
  }

  private handleMessage = (event: MessageEvent) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(event.data as string);
    } catch {
      logWarning({ rawData: event.data }, 'Events WS: failed to parse message');
      return;
    }

    const result = eventsWsMessageSchema.safeParse(parsed);
    if (!result.success) {
      logWarning(
        { rawData: parsed, error: result.error },
        'Events WS: invalid message',
      );
      return;
    }

    const message = result.data;
    this.handleHeartbeat(message);
    this.dispatchMessage(message);
  };

  private handleOpen = () => {
    this.reconnectAttempt = 0;
    logInfo({}, 'Events WS transport open — awaiting authentication');
  };

  private handleClose = (event: CloseEvent) => {
    this.ws = null;

    if (this.intentionalDisconnect) {
      logInfo({}, 'Events WS disconnected intentionally');
      return;
    }

    if (
      AUTH_FAILURE_CODES.includes(
        event.code as (typeof AUTH_FAILURE_CODES)[number],
      )
    ) {
      logError(
        { code: event.code, reason: event.reason },
        'Events WS auth failure — not reconnecting',
      );
      return;
    }

    logWarning(
      { code: event.code, reason: event.reason },
      'Events WS connection closed unexpectedly',
    );
    this.scheduleReconnect();
  };

  private handleError = () => {
    logError({}, 'Events WS connection error');
  };

  private connectInternal() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.CONNECTING ||
        this.ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.authenticated = false;

    const url = buildWsUrl();

    this.ws = new WebSocket(url);
    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
    this.ws.onerror = this.handleError;
  }

  connect() {
    this.intentionalDisconnect = false;
    this.reconnectAttempt = 0;
    this.connectInternal();
  }

  disconnect() {
    this.intentionalDisconnect = true;
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.reconnectAttempt = 0;
  }

  send(message: EventsWsMessage) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    if (!this.authenticated && message.type !== 'heartbeat:pong') {
      return;
    }

    this.ws.send(JSON.stringify(message));
  }

  onMessage<T extends EventsWsMessageType>(
    type: T,
    handler: EventsWsMessageHandler<Extract<EventsWsMessage, { type: T }>>,
  ) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)?.add(handler as EventsWsMessageHandler);

    return () => {
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
