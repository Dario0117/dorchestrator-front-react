import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { logDebug, logWarning } from '@lib/logger.utils';
import type { Subscription } from 'centrifuge';
import { useEffect, useRef, useState } from 'react';

export function useDevicesPresence(deviceIds: number[]) {
  const [presenceMap, setPresenceMap] = useState<Map<number, boolean>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const subscribedIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const currentIds = new Set(deviceIds);
    const subscriptions = new Map<number, Subscription>();

    // Unsubscribe from devices no longer visible
    for (const id of subscribedIds.current) {
      if (!currentIds.has(id)) {
        terminalWsClient.unsubscribeFromDevice(id);
      }
    }

    let pendingCount = deviceIds.length;
    const results = new Map<number, boolean>();

    const checkComplete = () => {
      if (pendingCount <= 0) {
        setPresenceMap(new Map(results));
        setIsLoading(false);
      }
    };

    if (deviceIds.length === 0) {
      setPresenceMap(new Map());
      setIsLoading(false);
      subscribedIds.current = new Set();
      return;
    }

    for (const deviceId of deviceIds) {
      const subscription = terminalWsClient.subscribeToDevice(deviceId);
      subscriptions.set(deviceId, subscription);

      const checkPresence = async () => {
        try {
          const result = await subscription.presence();
          const agentClients = Object.values(result.clients).filter(
            (client) => client.chanInfo?.subscriberType === 'agent',
          );
          const online = agentClients.length > 0;
          logDebug(
            {
              deviceId,
              totalClients: Object.keys(result.clients).length,
              agentClients: agentClients.length,
              online,
              state: subscription.state,
            },
            'Batch presence check result',
          );
          results.set(deviceId, online);
          setPresenceMap((prev) => {
            const next = new Map(prev);
            next.set(deviceId, online);
            return next;
          });
        } catch (err) {
          logWarning(
            {
              deviceId,
              state: subscription.state,
              error: JSON.stringify(err),
            },
            'Batch presence check failed',
          );
          results.set(deviceId, false);
          setPresenceMap((prev) => {
            const next = new Map(prev);
            next.set(deviceId, false);
            return next;
          });
        }
        pendingCount--;
        checkComplete();
      };

      logDebug(
        { deviceId, state: subscription.state },
        'Batch hook: attaching subscribed handler',
      );

      subscription.on('subscribed', () => {
        logDebug({ deviceId }, 'Batch hook: subscribed event fired');
        checkPresence();
      });

      if (subscription.state === 'subscribed') {
        logDebug({ deviceId }, 'Batch hook: already subscribed, checking now');
        checkPresence();
      }

      subscription.on('join', () => {
        logDebug({ deviceId }, 'Batch hook: join event');
        setPresenceMap((prev) => {
          const next = new Map(prev);
          next.set(deviceId, true);
          return next;
        });
      });

      subscription.on('leave', () => {
        logDebug({ deviceId }, 'Batch hook: leave event');
        checkPresence();
      });
    }

    subscribedIds.current = currentIds;

    return () => {
      for (const deviceId of currentIds) {
        terminalWsClient.unsubscribeFromDevice(deviceId);
      }
    };
  }, [deviceIds]);

  return { presenceMap, isLoading };
}
