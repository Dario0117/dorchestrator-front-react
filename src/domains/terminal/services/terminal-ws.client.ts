import type { WsMessageHandler } from '@domains/terminal/services/terminal-ws.client.types';
import type {
  WsMessage,
  WsMessageType,
} from '@domains/terminal/services/ws-messages.schema';
import { wsMessageSchema } from '@domains/terminal/services/ws-messages.schema';
import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';
import { env } from '@lib/env.utils';
import { logDebug, logError, logInfo, logWarning } from '@lib/logger.utils';

const AUTH_FAILURE_CODES = [4001, 4003, 1008] as const;

const BACKOFF_INITIAL_MS = 1000;
const BACKOFF_MAX_MS = 30_000;
const BACKOFF_MULTIPLIER = 2;

function buildWsUrl(shareToken?: string) {
  const base = env.BACKEND_BASE_URL.replace('https://', 'wss://').replace(
    'http://',
    'ws://',
  );
  const url = `${base}/ws/terminal`;
  if (shareToken) {
    return `${url}?shareToken=${encodeURIComponent(shareToken)}`;
  }
  return url;
}

function calculateBackoff(attempt: number) {
  const delay = BACKOFF_INITIAL_MS * BACKOFF_MULTIPLIER ** attempt;
  return Math.min(delay, BACKOFF_MAX_MS);
}

function getStore() {
  return useTerminalConnectionStore.getState();
}

export class TerminalWsClient {
  private ws: WebSocket | null = null;
  private currentShareToken: string | undefined;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalDisconnect = false;
  private authenticated = false;
  private handlers = new Map<WsMessageType, Set<WsMessageHandler>>();

  private clearReconnectTimer() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect() {
    const store = getStore();
    const delay = calculateBackoff(store.reconnectAttempt);

    logInfo(
      { attempt: store.reconnectAttempt + 1, delayMs: delay },
      'Scheduling WebSocket reconnect',
    );

    store.setConnectionState('reconnecting');
    store.incrementReconnectAttempt();

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectInternal();
    }, delay);
  }

  private dispatchMessage(message: WsMessage) {
    const typeHandlers = this.handlers.get(message.type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        handler(message);
      }
    }
  }

  private handleHeartbeat(message: WsMessage) {
    if (message.type === 'heartbeat:ping') {
      logDebug({}, 'Received heartbeat:ping, responding with pong');

      if (!this.authenticated) {
        this.authenticated = true;
        getStore().setConnectionState('connected');
        logInfo({}, 'WebSocket authenticated (first heartbeat received)');
      }

      this.send({ type: 'heartbeat:pong' });
    }
  }

  // Arrow functions to preserve `this` when assigned as WebSocket callbacks
  private handleMessage = (event: MessageEvent) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(event.data as string);
    } catch {
      logWarning(
        { rawData: event.data },
        'Failed to parse WebSocket message as JSON',
      );
      return;
    }

    const result = wsMessageSchema.safeParse(parsed);
    if (!result.success) {
      logWarning(
        { rawData: parsed, error: result.error },
        'Received invalid WebSocket message',
      );
      return;
    }

    const message = result.data;
    this.handleHeartbeat(message);
    this.dispatchMessage(message);
  };

  private handleOpen = () => {
    const store = getStore();
    store.setError(null);
    store.resetReconnectAttempt();
    logInfo({}, 'WebSocket transport open — awaiting authentication');
  };

  private handleClose = (event: CloseEvent) => {
    this.ws = null;

    if (this.intentionalDisconnect) {
      getStore().setConnectionState('disconnected');
      logInfo({}, 'WebSocket disconnected intentionally');
      return;
    }

    if (
      AUTH_FAILURE_CODES.includes(
        event.code as (typeof AUTH_FAILURE_CODES)[number],
      )
    ) {
      const store = getStore();
      store.setConnectionState('disconnected');
      store.setError(`Authentication failed (code: ${event.code})`);
      logError(
        { code: event.code, reason: event.reason },
        'WebSocket auth failure — not reconnecting',
      );
      return;
    }

    logWarning(
      { code: event.code, reason: event.reason },
      'WebSocket connection closed unexpectedly',
    );
    this.scheduleReconnect();
  };

  private handleError = () => {
    const store = getStore();
    logError(
      {
        connectionState: store.connectionState,
        reconnectAttempt: store.reconnectAttempt,
      },
      'WebSocket connection error',
    );
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

    const url = buildWsUrl(this.currentShareToken);
    getStore().setConnectionState('connecting');

    this.ws = new WebSocket(url);
    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
    this.ws.onerror = this.handleError;
  }

  connect(shareToken?: string) {
    if (this.ws) {
      const existingWs = this.ws;
      existingWs.onerror = null;
      existingWs.onclose = null;
      existingWs.close(1000, 'Switching to terminal mode');
      this.ws = null;
    }
    this.clearReconnectTimer();
    this.intentionalDisconnect = false;
    this.currentShareToken = shareToken;
    getStore().resetReconnectAttempt();
    this.connectInternal();
  }

  connectForEvents() {
    this.intentionalDisconnect = false;
    this.currentShareToken = undefined;
    getStore().resetReconnectAttempt();
    this.connectInternal();
  }

  disconnect() {
    this.intentionalDisconnect = true;
    this.currentShareToken = undefined;
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    const store = getStore();
    store.setConnectionState('disconnected');
    store.setError(null);
    store.resetReconnectAttempt();
  }

  isAuthenticated() {
    return this.authenticated;
  }

  send(message: WsMessage) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logWarning(
        { messageType: message.type },
        'Cannot send — WebSocket is not connected',
      );
      return;
    }

    if (!this.authenticated && message.type !== 'heartbeat:pong') {
      logDebug(
        { messageType: message.type },
        'Dropping message — not yet authenticated',
      );
      return;
    }

    this.ws.send(JSON.stringify(message));
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
