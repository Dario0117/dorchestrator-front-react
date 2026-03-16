import { logInfo } from '@lib/logger.utils';
import { eventsWsClient } from '@services/events/events-ws.client';
import { getUnreadCountQueryOptions } from '@services/notifications/get-unread-count.http-service';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useEventsWebSocket(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    eventsWsClient.connect();
    logInfo({}, 'Events WS connection initiated');

    const unsubscribe = eventsWsClient.onMessage('notification:changed', () => {
      const queryOptions = getUnreadCountQueryOptions(organizationId);
      queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
    });

    return () => {
      unsubscribe();
      eventsWsClient.disconnect();
    };
  }, [queryClient, organizationId]);
}
