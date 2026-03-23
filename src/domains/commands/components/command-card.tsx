import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { CodeBlock } from '@components/ds/atoms/code-block';
import { HStack } from '@components/ds/atoms/hstack';
import { SmallText } from '@components/ds/atoms/small-text';
import { CommandStatusBadge } from '@domains/commands/components/command-status-badge';
import type { ListCommandsCommand } from '@domains/commands/services/list-commands.http-service';
import { formatRelativeTime } from '@lib/format-relative-time';
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
      interactive={!!onClick}
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
        <HStack justify="between">
          <CardTitle
            size="sm"
            color="muted"
            mono
          >
            #{command.id}
          </CardTitle>
          <CommandStatusBadge status={command.status} />
        </HStack>
      </CardHeader>
      <CardContent gap="md">
        <HStack
          gap="sm"
          textSize="sm"
          minW0
        >
          <Monitor className="h-4 w-4 shrink-0" />
          <SmallText
            color="muted"
            size="sm"
            truncate
          >
            {command.deviceName}
          </SmallText>
        </HStack>
        <HStack
          gap="sm"
          textSize="sm"
          minW0
        >
          <User className="h-4 w-4 shrink-0" />
          <SmallText
            color="muted"
            size="sm"
            truncate
          >
            {command.userEmail}
          </SmallText>
        </HStack>
        <CodeBlock title={command.command}>{displayCommand}</CodeBlock>
        <HStack justify="between">
          <SmallText color="muted">
            {formatRelativeTime(command.createdAt)}
          </SmallText>
          {command.duration && (
            <HStack gap="xs">
              <Clock className="h-3 w-3" />
              <SmallText
                color="muted"
                mono
                tabularNums
              >
                {command.duration}
              </SmallText>
            </HStack>
          )}
        </HStack>
      </CardContent>
    </Card>
  );
}
