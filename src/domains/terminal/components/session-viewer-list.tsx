import { Badge } from '@components/ds/atoms/badge';
import { HStack } from '@components/ds/atoms/hstack';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { RT } from '@domains/terminal/services/ws-messages.schema';
import { Eye } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Viewer {
  userId: string;
  displayName: string;
}

export function SessionViewerList({ sessionId }: { sessionId: string }) {
  const [viewers, setViewers] = useState<Viewer[]>([]);

  const handleViewerJoin = useCallback(
    (msg: {
      sessionId: string;
      payload: { userId: string; displayName: string };
    }) => {
      if (msg.sessionId !== sessionId) {
        return;
      }
      setViewers((prev) => {
        if (prev.some((v) => v.userId === msg.payload.userId)) {
          return prev;
        }
        return [
          ...prev,
          { userId: msg.payload.userId, displayName: msg.payload.displayName },
        ];
      });
    },
    [sessionId],
  );

  const handleViewerLeave = useCallback(
    (msg: { sessionId: string; payload?: { userId: string } }) => {
      if (msg.sessionId !== sessionId || !msg.payload) {
        return;
      }
      setViewers((prev) =>
        prev.filter((v) => v.userId !== msg.payload?.userId),
      );
    },
    [sessionId],
  );

  const handleViewerList = useCallback(
    (msg: { sessionId: string; payload: { viewers: Viewer[] } }) => {
      if (msg.sessionId !== sessionId) {
        return;
      }
      setViewers(msg.payload.viewers);
    },
    [sessionId],
  );

  useEffect(() => {
    const unsubJoin = terminalWsClient.onMessage(
      RT.VIEWER_JOIN,
      handleViewerJoin,
    );
    const unsubLeave = terminalWsClient.onMessage(
      RT.VIEWER_LEAVE,
      handleViewerLeave,
    );
    const unsubList = terminalWsClient.onMessage(
      RT.VIEWER_LIST,
      handleViewerList,
    );

    // Request current viewer list on mount
    terminalWsClient.send({
      type: RT.VIEWER_LIST_REQUEST,
      sessionId,
    });

    return () => {
      unsubJoin();
      unsubLeave();
      unsubList();
    };
  }, [sessionId, handleViewerJoin, handleViewerLeave, handleViewerList]);

  if (viewers.length === 0) {
    return null;
  }

  return (
    <HStack gap="xs">
      <Badge
        variant="outline"
        colorScheme="info"
      >
        <Eye className="mr-1 h-3 w-3" />
        {viewers.length} {viewers.length === 1 ? 'viewer' : 'viewers'}
      </Badge>
    </HStack>
  );
}
