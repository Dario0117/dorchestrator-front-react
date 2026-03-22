import { CommandStatusBadge } from '@components/commands/command-status-badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { formatRelativeTime } from '@lib/format-relative-time';
import { cn } from '@lib/utils';
import type { ListCommandsCommand } from '@services/commands/list-commands.http-service';
import { Clock, Monitor, User } from 'lucide-react';

const MAX_COMMAND_LENGTH = 100;

const STATUS_BORDER: Record<string, string> = {
  failed: 'border-l-4 border-l-red-500',
  running: 'border-l-4 border-l-blue-500',
  pending: 'border-l-4 border-l-amber-500',
};

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
      className={cn(
        'transition-shadow',
        onClick && 'cursor-pointer hover:shadow-md',
        STATUS_BORDER[command.status],
      )}
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
      aria-label={onClick ? `View command #${command.id}` : undefined}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground font-mono">
            #{command.id}
          </CardTitle>
          <CommandStatusBadge status={command.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <Monitor className="h-4 w-4 shrink-0" />
          <span className="truncate">{command.deviceName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <User className="h-4 w-4 shrink-0" />
          <span className="truncate">{command.userEmail}</span>
        </div>
        <p
          className="break-words rounded-md bg-muted px-2.5 py-1.5 font-mono text-sm"
          title={command.command}
        >
          {displayCommand}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatRelativeTime(command.createdAt)}</span>
          {command.duration && (
            <span className="flex items-center gap-1 font-mono tabular-nums">
              <Clock className="h-3 w-3" />
              {command.duration}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
