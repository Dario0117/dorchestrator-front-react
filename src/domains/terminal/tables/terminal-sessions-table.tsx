import { Button } from '@components/ds/atoms/button';
import { SmallText } from '@components/ds/atoms/small-text';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ds/atoms/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ds/molecules/alert-dialog';
import { SessionStatusBadge } from '@domains/terminal/components/session-status-badge';
import type { TerminalSessionListItem } from '@domains/terminal/services/list-terminal-sessions.http-service';
import type { useTerminateTerminalSessionMutationType } from '@domains/terminal/services/terminate-terminal-session.http-service';
import { formatBytes } from '@lib/format-bytes';
import { formatDurationCompact } from '@lib/format-duration';
import { formatRelativeTime } from '@lib/format-relative-time';
import { X } from 'lucide-react';

interface TerminalSessionsTableProps {
  sessions: TerminalSessionListItem[];
  onRowClick: (sessionId: number) => void;
  onCloseSession: (sessionId: number) => void;
  terminateMutation: useTerminateTerminalSessionMutationType;
}

export function TerminalSessionsTable({
  sessions,
  onRowClick,
  onCloseSession,
  terminateMutation,
}: TerminalSessionsTableProps) {
  return (
    <>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Device</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Last Activity</TableHead>
          <TableHead>Terminated</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Recording</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow
            key={session.id}
            className="cursor-pointer"
            onClick={() => onRowClick(session.id)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRowClick(session.id);
              }
            }}
          >
            <TableCell>
              <div>
                <div className="font-medium">{session.userName}</div>
                <SmallText>{session.userEmail}</SmallText>
              </div>
            </TableCell>
            <TableCell className="font-medium">{session.deviceName}</TableCell>
            <TableCell>
              <SessionStatusBadge status={session.status} />
            </TableCell>
            <TableCell>
              {session.createdAt
                ? formatRelativeTime(session.createdAt)
                : 'Never'}
            </TableCell>
            <TableCell>
              {session.lastActivityAt
                ? formatRelativeTime(session.lastActivityAt)
                : 'Never'}
            </TableCell>
            <TableCell>
              {session.terminatedAt
                ? formatRelativeTime(session.terminatedAt)
                : '—'}
            </TableCell>
            <TableCell>
              {formatDurationCompact(session.durationSeconds * 1000)}
            </TableCell>
            <TableCell>{formatBytes(session.recordingSizeBytes)}</TableCell>
            <TableCell>
              {session.status !== 'terminated' && (
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Close session"
                        disabled={
                          terminateMutation.isPending &&
                          terminateMutation.variables?.params?.path
                            ?.sessionId === session.id
                        }
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    }
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close session</span>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Close terminal session?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will terminate the session on {session.deviceName}.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onCloseSession(session.id)}
                      >
                        Close Session
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
}
