import { Badge } from '@components/ds/atoms/badge';
import { terminalWsClient } from '@domains/terminal/services/terminal-ws.client';
import { badgeStyles } from '@lib/badge-styles';
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
      'viewer:join',
      handleViewerJoin,
    );
    const unsubLeave = terminalWsClient.onMessage(
      'viewer:leave',
      handleViewerLeave,
    );
    const unsubList = terminalWsClient.onMessage(
      'viewer:list',
      handleViewerList,
    );

    // Request current viewer list on mount
    terminalWsClient.send({
      type: 'viewer:list:request',
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
    <div className="flex items-center gap-1">
      <Badge
        variant="outline"
        className={badgeStyles.blue}
      >
        <Eye className="mr-1 h-3 w-3" />
        {viewers.length} {viewers.length === 1 ? 'viewer' : 'viewers'}
      </Badge>
    </div>
  );
}
