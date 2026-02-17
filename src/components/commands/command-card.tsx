import { CommandStatusBadge } from '@components/commands/command-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import type { ListCommandsCommand } from '@services/commands/list-commands.http-service';
import { Monitor } from 'lucide-react';

interface CommandCardProps {
  command: ListCommandsCommand;
  onClick?: () => void;
}

export function CommandCard({ command, onClick }: CommandCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

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
        <p
          className="truncate font-mono text-sm"
          title={command.command}
        >
          {command.command}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(command.createdAt)}
        </p>
      </CardContent>
    </Card>
  );
}
