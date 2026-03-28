import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { RT } from '@domains/terminal/services/ws-messages.schema';
import { useTerminalConnectionStore } from '@domains/terminal/stores/terminal-connection.store';
import { logInfo } from '@lib/logger.utils';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

const TERMINAL_STATUSES: readonly string[] = ['completed', 'failed'];

const COMMAND_QUERIES = [
  ['get', '/api/v1/{organizationId}/commands'],
  ['get', '/api/v1/{organizationId}/commands/{commandId}'],
] as const;

const SESSION_QUERIES = [
  ['get', '/api/v1/{organizationId}/terminal/sessions'],
  ['get', '/api/v1/{organizationId}/terminal/sessions/{sessionId}'],
] as const;

const NOTIFICATION_QUERIES = [
  ['get', '/api/v1/{organizationId}/notifications'],
  ['get', '/api/v1/{organizationId}/notifications/unread-count'],
] as const;

function invalidateAll(
  queryClient: ReturnType<typeof useQueryClient>,
  queries: readonly (readonly string[])[],
) {
  for (const queryKey of queries) {
    queryClient.invalidateQueries({ queryKey: [...queryKey] });
  }
}

export function useWebSocketEvents() {
  const queryClient = useQueryClient();
  const connectedRef = useRef(false);

  useEffect(() => {
    connectedRef.current = true;
    terminalWsClient.connectForEvents();
    logInfo({}, 'WebSocket event connection initiated');

    const unsubscribeCommand = terminalWsClient.onMessage(
      RT.COMMAND_DISPATCH,
      (message) => {
        invalidateAll(queryClient, COMMAND_QUERIES);

        if (TERMINAL_STATUSES.includes(message.payload.status)) {
          invalidateAll(queryClient, NOTIFICATION_QUERIES);
        }
      },
    );

    const unsubscribeSessionStatus = terminalWsClient.onMessage(
      RT.SESSION_STATUS,
      (message) => {
        invalidateAll(queryClient, SESSION_QUERIES);

        if (message.payload.status === 'created') {
          invalidateAll(queryClient, NOTIFICATION_QUERIES);
        }
      },
    );

    // Reconcile missed events on WS reconnection
    const unsubscribeReconnect = useTerminalConnectionStore.subscribe(
      (state, prevState) => {
        if (
          prevState.connectionState === 'reconnecting' &&
          state.connectionState === 'connected'
        ) {
          logInfo({}, 'WebSocket reconnected — reconciling session data');
          invalidateAll(queryClient, SESSION_QUERIES);
        }
      },
    );

    return () => {
      unsubscribeCommand();
      unsubscribeSessionStatus();
      unsubscribeReconnect();
      terminalWsClient.disconnect();
      connectedRef.current = false;
    };
  }, [queryClient]);
}
