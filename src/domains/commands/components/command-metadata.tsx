import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ds/atoms/card';
import { CodeBlock } from '@components/ds/atoms/code-block';
import { CodeText } from '@components/ds/atoms/code-text';
import { Grid } from '@components/ds/atoms/grid';
import { HStack } from '@components/ds/atoms/hstack';
import { SmallText } from '@components/ds/atoms/small-text';
import { CommandStatusBadge } from '@domains/commands/components/command-status-badge';
import type { GetCommandDetail } from '@domains/commands/services/get-command.http-service';
import { formatDurationBetween } from '@lib/format-duration';
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

export function CommandMetadata({ command }: CommandMetadataProps) {
  const duration = formatDurationBetween(
    command.startedAt,
    command.completedAt,
  );

  return (
    <Card>
      <CardHeader>
        <HStack justify="between">
          <CardTitle>Command Details</CardTitle>
          <CommandStatusBadge status={command.status} />
        </HStack>
      </CardHeader>
      <CardContent gap="lg">
        <CodeBlock
          overflowAuto
          textSize="sm"
        >
          {command.command}
        </CodeBlock>

        <Grid
          cols={2}
          gap="lg"
        >
          <HStack
            gap="sm"
            textSize="sm"
          >
            <Monitor className="h-4 w-4 shrink-0 text-muted-foreground" />
            <SmallText color="muted">Device:</SmallText>
            <CodeText>{command.deviceName}</CodeText>
          </HStack>

          <HStack
            gap="sm"
            textSize="sm"
          >
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <SmallText color="muted">Submitted by:</SmallText>
            <SmallText color="muted">{command.submittedBy}</SmallText>
          </HStack>

          <HStack
            gap="sm"
            textSize="sm"
          >
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <SmallText color="muted">Created:</SmallText>
            <SmallText color="muted">
              {formatTimestamp(command.createdAt)}
            </SmallText>
          </HStack>

          {command.startedAt && (
            <HStack
              gap="sm"
              textSize="sm"
            >
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <SmallText color="muted">Started:</SmallText>
              <SmallText color="muted">
                {formatTimestamp(command.startedAt)}
              </SmallText>
            </HStack>
          )}

          {command.completedAt && (
            <HStack
              gap="sm"
              textSize="sm"
            >
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <SmallText color="muted">Completed:</SmallText>
              <SmallText color="muted">
                {formatTimestamp(command.completedAt)}
              </SmallText>
            </HStack>
          )}

          {duration && (
            <HStack
              gap="sm"
              textSize="sm"
            >
              <Timer className="h-4 w-4 shrink-0 text-muted-foreground" />
              <SmallText color="muted">Duration:</SmallText>
              <SmallText color="muted">{duration}</SmallText>
            </HStack>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
