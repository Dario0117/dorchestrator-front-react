import { CommandStatusBadge } from '@components/commands/command-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { formatRelativeTime } from '@lib/format-relative-time';
import type { ListCommandsCommand } from '@services/commands/list-commands.http-service';
import { Clock, Monitor, User } from 'lucide-react';

const MAX_COMMAND_LENGTH = 100;

interface CommandCardProps {
  command: ListCommandsCommand;
  onClick?: () => void;
}

export function CommandCard({ command, onClick }: CommandCardProps) {
  const displayCommand =
    command.command.length > MAX_COMMAND_LENGTH
      ? `${command.command.slice(0, MAX_COMMAND_LENGTH)}...`
      : command.command;

  return (
    <Card
      className={
        onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : undefined
      }
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground">
            #{command.id}
          </CardTitle>
          <CommandStatusBadge status={command.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Monitor className="h-4 w-4 shrink-0" />
          <span>{command.deviceName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4 shrink-0" />
          <span>Submitted by: {command.userEmail}</span>
        </div>
        <p
          className="truncate font-mono text-sm"
          title={command.command}
        >
          {displayCommand}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatRelativeTime(command.createdAt)}</span>
          {command.duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {command.duration}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
