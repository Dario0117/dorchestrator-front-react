import { CommandStatusBadge } from '@components/commands/command-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import type { GetCommandDetail } from '@services/commands/get-command.http-service';
import { Clock, Monitor, Timer, User } from 'lucide-react';

interface CommandMetadataProps {
  command: GetCommandDetail;
}

function formatTimestamp(dateString: string | null) {
  if (!dateString) {
    return '—';
  }
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDuration(startedAt: string | null, completedAt: string | null) {
  if (!startedAt || !completedAt) {
    return null;
  }
  const durationMs =
    new Date(completedAt).getTime() - new Date(startedAt).getTime();
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }
  const seconds = Math.floor(durationMs / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function CommandMetadata({ command }: CommandMetadataProps) {
  const duration = formatDuration(command.startedAt, command.completedAt);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Command Details</CardTitle>
          <CommandStatusBadge status={command.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-sm whitespace-pre-wrap">
          {command.command}
        </pre>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Device:</span>
            <span className="font-mono">{command.deviceName}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Submitted by:</span>
            <span>{command.submittedBy}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span>{formatTimestamp(command.createdAt)}</span>
          </div>

          {command.startedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Started:</span>
              <span>{formatTimestamp(command.startedAt)}</span>
            </div>
          )}

          {command.completedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Completed:</span>
              <span>{formatTimestamp(command.completedAt)}</span>
            </div>
          )}

          {duration && (
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Duration:</span>
              <span>{duration}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
